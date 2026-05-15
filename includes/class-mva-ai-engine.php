<?php

if (!defined('ABSPATH')) {
    exit;
}

class MVA_AI_Engine
{
    private $api_key;
    private $model;

    public function __construct()
    {
        $this->api_key = get_option('wcc_openai_api_key');
        $this->model   = get_option('wcc_openai_model', 'gpt-4o');
    }

    /**
     * Ask OpenAI to calculate the settlement range for this case.
     * Returns array with keys 'low', 'mid', 'high' (integers) or false on failure.
     *
     * @param array      $form_data  All form fields from the MVA calculator
     * @param array|null $math       JS pre-calculated math result (low, mid, high) — used as anchor
     * @return array|false
     */
    public function calculate_range($form_data, $math = null)
    {
        if (empty($this->api_key)) {
            return false;
        }

        $system_prompt = get_option('mva_system_prompt', self::get_default_prompt());
        $case_summary  = $this->build_case_summary($form_data, $math);

        $body = array(
            'model'    => $this->model,
            'messages' => array(
                array(
                    'role'    => 'system',
                    'content' => $system_prompt,
                ),
                array(
                    'role'    => 'user',
                    'content' => $case_summary,
                ),
            ),
            'temperature' => 0.3,
            'max_tokens'  => 600,
        );

        $response = wp_remote_post('https://api.openai.com/v1/chat/completions', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type'  => 'application/json',
            ),
            'body'    => json_encode($body),
            'timeout' => 45,
        ));

        if (is_wp_error($response)) {
            error_log('MVA AI Engine Error: ' . $response->get_error_message());
            return false;
        }

        $code = wp_remote_retrieve_response_code($response);
        if ($code !== 200) {
            error_log('MVA AI Engine HTTP ' . $code . ': ' . wp_remote_retrieve_body($response));
            return false;
        }

        $decoded = json_decode(wp_remote_retrieve_body($response), true);

        if (!isset($decoded['choices'][0]['message']['content'])) {
            return false;
        }

        $content = $decoded['choices'][0]['message']['content'];

        // Parse "$X to $Y" from the response
        if (preg_match('/\$([0-9,]+)\s+to\s+\$([0-9,]+)/i', $content, $matches)) {
            $low  = (int) str_replace(',', '', $matches[1]);
            $high = (int) str_replace(',', '', $matches[2]);
            $mid  = (int) (round(($low + $high) / 2 / 500) * 500);

            // Parse explanation from the "### 💡 Why This Range" section
            $explanation = '';
            if (preg_match('/###\s*💡\s*Why This Range\s*\n+([\s\S]+)/i', $content, $expMatches)) {
                $explanation = trim($expMatches[1]);
            }

            return array(
                'low'         => $low,
                'mid'         => $mid,
                'high'        => $high,
                'prompt'      => $case_summary,
                'explanation' => $explanation,
            );
        }

        error_log('MVA AI Engine: could not parse range from response: ' . $content);
        return false;
    }

    /**
     * Builds a structured case summary string for the AI user message.
     */
    private function build_case_summary($d, $math = null)
    {
        $lines = array(
            "=== MVA CASE DATA ===",
            "",
            "State: "            . ($d['state']           ?? 'Unknown'),
            "Date of Accident: " . ($d['accidentDate']    ?? 'Unknown'),
            "",
            "--- Accident ---",
            "Description: "      . ($d['faultDesc']       ?? ''),
            "Fault Disputed: "   . ($d['faultDisputed']   ?? ''),
            "Police Report: "    . ($d['policeReport']    ?? ''),
            "",
            "--- Property Damage ---",
            "Description: "      . ($d['propDamageDesc']  ?? ''),
            "Severity: "         . ($d['propDamageLevel'] ?? ''),
            "Outcome: "          . ($d['repairOrTotal']   ?? ''),
            "Amount: $"          . ($d['propDamageAmount'] ?? '0'),
            "",
            "--- Injuries ---",
            "Injuries: "         . ($d['injuries']             ?? ''),
            "Surgeries Done: "   . ($d['surgeriesPerformed']   ?? ''),
            "Surgeries Rec.: "   . ($d['surgeriesRecommended'] ?? ''),
            "",
            "--- MMI Status ---",
            "At MMI: "           . ($d['atMMI']            ?? ''),
            "MMI Date: "         . ($d['mmiDate']          ?? ''),
            "Permanent Rating: " . ($d['permanentRating']  ?? ''),
            "Ongoing Treatment: ". ($d['ongoingTreatment'] ?? ''),
            "",
            "--- Medical Bills ---",
            "Total Bills (Gross): $" . ($d['totalMedBills']    ?? '0'),
            "Future Medical: "       . ($d['futureMedExpected'] ?? 'no'),
            "Future Med Amount: $"   . ($d['futureMedDesc']     ?? '0'),
            "",
            "--- Lost Wages ---",
            "Missed Work: "         . ($d['missedWork']             ?? ''),
            "Occupation: "          . ($d['occupation']             ?? ''),
            "Lost Income: $"        . ($d['lostIncome']             ?? '0'),
            "Loss of Earning Cap: " . ($d['lossOfEarningCapacity']  ?? ''),
            "",
            "--- Life Impact ---",
            "Life Impact: "         . ($d['lifeImpact']           ?? ''),
            "Psychological: "       . ($d['psychologicalEffects']  ?? ''),
            "Permanent Limits: "    . ($d['permanentLimitations']  ?? ''),
            "",
            "--- Prior History ---",
            "Pre-Existing: "        . ($d['preExisting']      ?? ''),
            "Prior Claims: "        . ($d['priorClaims']      ?? ''),
        );

        if ($math && isset($math['low'], $math['mid'], $math['high'])) {
            $lines[] = "";
            $lines[] = "=== PRE-CALCULATED MATH RESULT ===";
            $lines[] = "Conservative (−30%): $" . number_format($math['low']);
            $lines[] = "Probable (mid):      $" . number_format($math['mid']);
            $lines[] = "Strong Case (+30%):  $" . number_format($math['high']);
        }

        return implode("\n", $lines);
    }

    /**
     * Default system prompt — editable in WP Admin under MVA Calculator > AI Prompt.
     */
    public static function get_default_prompt()
    {
        return 'You are an expert personal injury legal analyst specializing in motor vehicle accident (MVA) settlement valuation. Your role is to review case facts, apply state-specific tort law internally, and produce a concise settlement value analysis.

You are not an attorney and this is not legal advice. You are an analytical tool to help estimate fair settlement ranges.

INSTRUCTIONS:
1. Internally identify the state\'s tort system (Contributory Negligence, Modified Comparative, Pure Comparative, No-Fault). Apply the correct fault reduction or bar — but DO NOT display a tort classification table or system name to the user.
2. Review all case facts provided.
3. Apply the multiplier method to gross medical bills to estimate pain & suffering.

Case Profile: Minor / Nuisance
Property Damage: Low (< $4,000)
Injury Type: Soft tissue, bruising
Treatment Duration: < 4 weeks
Medical Bill Total: Low (< $8,000)
Multiplier Range: 1.0x – 1.25x

Case Profile: Moderate
Property Damage: Moderate ($4k – $10k)
Injury Type: Whiplash, sprains, PT
Treatment Duration: 2 – 6 months
Medical Bill Total: Moderate ($8k – $25k)
Multiplier Range: 1.5x – 3.0x

Case Profile: Significant
Property Damage: High (Airbag deploy/Total)
Injury Type: Fractures, concussions
Treatment Duration: 6+ months
Medical Bill Total: High ($25k – $100k)
Multiplier Range: 3.25x – 4.5x

Case Profile: Catastrophic
Property Damage: Extreme/Fatal
Injury Type: Permanent disability/Scars
Treatment Duration: MMI with "Ongoing"
Medical Bill Total: Extreme (> $100k or ongoing/future care)
Multiplier Range: 5.0x – 10.0x+

4. Factor in surgery, permanent impairment, psychological impact, property damage severity, pre-existing conditions, and claimant fault when applying the multiplier method to estimate pain & suffering.
5. The pre-calculated math result (Conservative/Probable/Strong) is already a ±30% range around the midpoint. Use it as your anchor. Discount the results in Maryland by 25%
6. Flag key risks: disputed liability, contributory negligence state, pre-existing conditions, statute of limitations, minor property damage, pending surgery.

OUTPUT FORMAT — respond only with this structure:

### 💰 Settlement Range Assessment
$[amount] to $[amount]

### 💡 Why This Range
[2-4 sentences explaining: (1) which case profile/multiplier range was applied and why, (2) any key facts that drove the value up or down (surgeries, permanent impairment, psychological impact, pre-existing conditions, disputed fault, state tort rule), and (3) any significant risk factors that affected the final number.]';
    }
}
