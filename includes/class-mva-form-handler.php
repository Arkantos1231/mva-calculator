<?php

if (!defined('ABSPATH')) {
    exit;
}

class MVA_Form_Handler
{
    public static function init()
    {
        add_action('wp_ajax_mva_calculate',        array(__CLASS__, 'handle_calculation'));
        add_action('wp_ajax_nopriv_mva_calculate', array(__CLASS__, 'handle_calculation'));
    }

    public static function handle_calculation()
    {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'mva_calculator_nonce')) {
            wp_send_json_error(array('message' => 'Security check failed.'));
            return;
        }

        // Parse form data (JSON string)
        $form_data_raw  = isset($_POST['formData'])   ? stripslashes($_POST['formData'])   : '{}';
        $math_result_raw = isset($_POST['mathResult']) ? stripslashes($_POST['mathResult']) : '{}';

        $form_data   = json_decode($form_data_raw,   true);
        $math_result = json_decode($math_result_raw, true);

        if (!is_array($form_data)) {
            wp_send_json_error(array('message' => 'Invalid form data.'));
            return;
        }

        // Sanitize lead fields
        $name  = sanitize_text_field($_POST['name']  ?? '');
        $email = sanitize_email($_POST['email']       ?? '');
        $phone = self::format_phone(sanitize_text_field($_POST['phone'] ?? ''));

        // Sanitize form_data fields
        $form_data = array_map('sanitize_textarea_field', array_map('strval', $form_data));

        // AI Range Calculation
        $ai_engine = new MVA_AI_Engine();
        $ai_range  = $ai_engine->calculate_range($form_data, $math_result);

        // GHL Lead Submission
        $ghl_api_key     = get_option('wcc_ghl_api_key');
        $ghl_location_id = get_option('wcc_ghl_location_id');

        if ($ghl_api_key && $ghl_location_id && $name && $email) {
            self::send_to_ghl(
                $ghl_api_key,
                $ghl_location_id,
                $name,
                $email,
                $phone,
                $form_data,
                $ai_range ?: $math_result
            );
        }

        $disclaimer = get_option('mva_disclaimer', MVA_Settings::get_default_disclaimer());

        if ($ai_range) {
            wp_send_json_success(array(
                'range'       => array('low' => $ai_range['low'], 'mid' => $ai_range['mid'], 'high' => $ai_range['high']),
                'prompt'      => $ai_range['prompt']      ?? '',
                'explanation' => $ai_range['explanation'] ?? '',
                'disclaimer'  => $disclaimer,
            ));
        } else {
            // Fall back to JS math result if AI failed
            wp_send_json_success(array('range' => $math_result, 'prompt' => '', 'explanation' => '', 'disclaimer' => $disclaimer));
        }
    }

    private static function send_to_ghl($api_key, $location_id, $name, $email, $phone, $form_data, $math)
    {
        $log_file = MVA_PLUGIN_DIR . 'ghl_debug.log';

        // Build note content
        $low  = isset($math['low'])  ? '$' . number_format($math['low'])  : 'N/A';
        $mid  = isset($math['mid'])  ? '$' . number_format($math['mid'])  : 'N/A';
        $high = isset($math['high']) ? '$' . number_format($math['high']) : 'N/A';

        $note = "=== MVA SETTLEMENT CALCULATOR LEAD ===\n";
        $note .= "State: "          . ($form_data['state']        ?? '') . "\n";
        $note .= "Accident Date: "  . ($form_data['accidentDate'] ?? '') . "\n";
        $note .= "Injuries: "       . ($form_data['injuries']     ?? '') . "\n";
        $note .= "Medical Bills: $" . ($form_data['totalMedBills'] ?? '0') . "\n";
        $note .= "Lost Income: $"   . ($form_data['lostIncome']   ?? '0') . "\n";
        $note .= "\nSettlement Range:\n";
        $note .= "  Conservative: " . $low  . "\n";
        $note .= "  Probable:     " . $mid  . "\n";
        $note .= "  Strong Case:  " . $high . "\n";

        // Split name
        $name_parts = explode(' ', trim($name), 2);
        $first_name = $name_parts[0];
        $last_name  = $name_parts[1] ?? '';

        $payload = array(
            'locationId' => $location_id,
            'firstName'  => $first_name,
            'lastName'   => $last_name,
            'email'      => $email,
            'phone'      => $phone,
            'tags'       => array('web-calculator-mva-lead'),
            'source'     => 'MVA Settlement Calculator',
        );

        // Log payload
        $log_entry  = "---MVA---\n";
        $log_entry .= "Time: " . date('Y-m-d H:i:s') . "\n";
        $log_entry .= "Payload: " . json_encode($payload, JSON_PRETTY_PRINT) . "\n";
        file_put_contents($log_file, $log_entry, FILE_APPEND);

        $api_url = 'https://services.leadconnectorhq.com/contacts/';
        $headers = array(
            'Authorization' => 'Bearer ' . $api_key,
            'Version'       => '2021-07-28',
            'Content-Type'  => 'application/json',
        );

        // Create/update contact
        $resp        = wp_remote_post($api_url, array(
            'body'     => json_encode($payload),
            'headers'  => $headers,
            'blocking' => true,
            'timeout'  => 15,
        ));
        $resp_code   = wp_remote_retrieve_response_code($resp);
        $resp_body   = json_decode(wp_remote_retrieve_body($resp), true);
        $contact_id  = null;

        if (!is_wp_error($resp) && $resp_code < 300 && isset($resp_body['contact']['id'])) {
            $contact_id = $resp_body['contact']['id'];
            file_put_contents($log_file, "Response: $resp_code | ContactID: $contact_id\n", FILE_APPEND);
        } elseif ($resp_code === 400 && isset($resp_body['meta']['contactId'])) {
            $contact_id = $resp_body['meta']['contactId'];
            file_put_contents($log_file, "Response: $resp_code (duplicate) | ContactID: $contact_id\n", FILE_APPEND);

            // Update existing contact
            $put_payload = $payload;
            unset($put_payload['locationId']);
            $put_resp      = wp_remote_request($api_url . $contact_id, array(
                'method'   => 'PUT',
                'body'     => json_encode($put_payload),
                'headers'  => $headers,
                'blocking' => true,
                'timeout'  => 15,
            ));
            $put_code = wp_remote_retrieve_response_code($put_resp);
            file_put_contents($log_file, "PUT Update: $put_code\n", FILE_APPEND);
        } else {
            file_put_contents($log_file, "Response: $resp_code | ERROR: " . wp_remote_retrieve_body($resp) . "\n", FILE_APPEND);
        }

        // Add note to contact
        if ($contact_id) {
            $note_resp = wp_remote_post("https://services.leadconnectorhq.com/contacts/{$contact_id}/notes", array(
                'body'     => json_encode(array('body' => $note)),
                'headers'  => $headers,
                'blocking' => true,
                'timeout'  => 15,
            ));
            $note_code = wp_remote_retrieve_response_code($note_resp);
            file_put_contents($log_file, "Note: $note_code\n", FILE_APPEND);
        }
    }

    /**
     * Normalise a phone number to E.164 (+1XXXXXXXXXX) for US/CA numbers.
     * Non-US numbers that already start with '+' are left unchanged.
     */
    private static function format_phone($phone)
    {
        // Strip everything except digits and leading +
        $digits = preg_replace('/[^\d]/', '', $phone);

        if (empty($digits)) {
            return $phone;
        }

        // Already has country code: 11 digits starting with 1
        if (strlen($digits) === 11 && $digits[0] === '1') {
            return '+' . $digits;
        }

        // 10-digit US/CA number — prepend +1
        if (strlen($digits) === 10) {
            return '+1' . $digits;
        }

        // Already had a leading + (international) or unusual length — return as-is
        if ($phone[0] === '+') {
            return $phone;
        }

        return '+' . $digits;
    }
}

// Initialize
MVA_Form_Handler::init();
