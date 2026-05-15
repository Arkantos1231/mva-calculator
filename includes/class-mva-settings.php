<?php

if (!defined('ABSPATH')) {
    exit;
}

class MVA_Settings
{
    public static function init()
    {
        add_action('admin_menu',   array(__CLASS__, 'add_admin_menu'));
        add_action('admin_init',   array(__CLASS__, 'register_settings'));
        add_action('admin_enqueue_scripts', array(__CLASS__, 'enqueue_admin_assets'));
    }

    public static function enqueue_admin_assets($hook)
    {
        if (strpos($hook, 'mva_') === false) {
            return;
        }
        wp_enqueue_media();
    }

    public static function add_admin_menu()
    {
        add_menu_page(
            'MVA Settlement Calculator',
            'MVA Calculator',
            'manage_options',
            'mva_settings',
            array(__CLASS__, 'render_settings_page'),
            'dashicons-car',
            21
        );

        add_submenu_page(
            'mva_settings',
            'General Settings',
            'Settings',
            'manage_options',
            'mva_settings',
            array(__CLASS__, 'render_settings_page')
        );

        add_submenu_page(
            'mva_settings',
            'AI Prompt & Disclaimer',
            'AI Prompt',
            'manage_options',
            'mva_ai_prompt',
            array(__CLASS__, 'render_ai_prompt_page')
        );
    }

    public static function register_settings()
    {
        // General
        register_setting('mva_options_group', 'wcc_openai_api_key');
        register_setting('mva_options_group', 'wcc_openai_model');
        register_setting('mva_options_group', 'wcc_ghl_api_key');
        register_setting('mva_options_group', 'wcc_ghl_location_id');

        // Language
        register_setting('mva_options_group', 'mva_language');

        // AI Prompt & Disclaimer
        register_setting('mva_prompt_group', 'mva_system_prompt');
        register_setting('mva_prompt_group', 'mva_disclaimer');
    }

    // -------------------------------------------------------------------------
    // Settings Page — API keys, GHL
    // -------------------------------------------------------------------------

    public static function render_settings_page()
    {
        ?>
        <div class="wrap">
            <h1>MVA Settlement Calculator — Settings</h1>
            <form method="post" action="options.php">
                <?php settings_fields('mva_options_group'); ?>
                <?php do_settings_sections('mva_options_group'); ?>

                <table class="form-table">

                    <tr valign="top">
                        <th scope="row"><label for="wcc_openai_api_key">OpenAI API Key</label></th>
                        <td>
                            <input type="password" name="wcc_openai_api_key" id="wcc_openai_api_key"
                                value="<?php echo esc_attr(get_option('wcc_openai_api_key')); ?>" class="regular-text" />
                            <p class="description">Your OpenAI secret key (sk-...). Used for AI case analysis.</p>
                        </td>
                    </tr>

                    <tr valign="top">
                        <th scope="row"><label for="wcc_openai_model">OpenAI Model</label></th>
                        <td>
                            <select name="wcc_openai_model" id="wcc_openai_model">
                                <?php
                                $current = get_option('wcc_openai_model', 'gpt-4o');
                                $models  = array(
                                    'gpt-4o'       => 'GPT-4o',
                                    'gpt-4o-mini'  => 'GPT-4o Mini',
                                    'gpt-4.1'      => 'GPT-4.1',
                                    'gpt-4.1-mini' => 'GPT-4.1 Mini',
                                    'gpt-4.1-nano' => 'GPT-4.1 Nano',
                                    'o3'           => 'o3',
                                    'o3-mini'      => 'o3 Mini',
                                    'o4-mini'      => 'o4 Mini',
                                    'gpt-5'        => 'GPT-5',
                                );
                                foreach ($models as $val => $label) {
                                    printf(
                                        '<option value="%s" %s>%s</option>',
                                        esc_attr($val),
                                        selected($current, $val, false),
                                        esc_html($label)
                                    );
                                }
                                ?>
                            </select>
                        </td>
                    </tr>

                    <tr valign="top">
                        <th scope="row">GoHighLevel Integration</th>
                        <td>
                            <p class="description" style="margin-bottom:10px;">Leads submitted through the calculator will be created/updated in GHL.</p>

                            <label style="display:block;margin-bottom:5px;"><strong>API Key (Private Integration Token)</strong></label>
                            <input type="password" name="wcc_ghl_api_key"
                                value="<?php echo esc_attr(get_option('wcc_ghl_api_key')); ?>"
                                class="regular-text" placeholder="pit-..." /><br><br>

                            <label style="display:block;margin-bottom:5px;"><strong>Location ID</strong></label>
                            <input type="text" name="wcc_ghl_location_id"
                                value="<?php echo esc_attr(get_option('wcc_ghl_location_id')); ?>"
                                class="regular-text" placeholder="ZZu..." />
                        </td>
                    </tr>

                    <tr valign="top">
                        <th scope="row"><label for="mva_language">Calculator Language</label></th>
                        <td>
                            <select name="mva_language" id="mva_language">
                                <option value="en" <?php selected(get_option('mva_language', 'en'), 'en'); ?>>English</option>
                                <option value="es" <?php selected(get_option('mva_language', 'en'), 'es'); ?>>Español</option>
                            </select>
                            <p class="description">Language displayed to users in the front-end calculator.</p>
                        </td>
                    </tr>

                </table>

                <?php submit_button('Save Settings'); ?>
            </form>
        </div>
        <?php
    }

    // -------------------------------------------------------------------------
    // AI Prompt page — Jason edits here
    // -------------------------------------------------------------------------

    public static function render_ai_prompt_page()
    {
        ?>
        <div class="wrap">
            <h1>MVA Calculator — AI Prompt &amp; Disclaimer</h1>
            <p class="description" style="margin-bottom:20px;">
                Edit the system prompt sent to OpenAI for every case analysis. Changes take effect immediately.
            </p>

            <form method="post" action="options.php">
                <?php settings_fields('mva_prompt_group'); ?>
                <?php do_settings_sections('mva_prompt_group'); ?>

                <table class="form-table">

                    <tr valign="top">
                        <th scope="row"><label for="mva_system_prompt">AI System Prompt</label></th>
                        <td>
                            <textarea name="mva_system_prompt" id="mva_system_prompt"
                                rows="24" class="large-text code"><?php
                                echo esc_textarea(get_option('mva_system_prompt', MVA_AI_Engine::get_default_prompt()));
                            ?></textarea>
                            <p class="description">This is the instruction set the AI receives before analyzing each case.</p>
                        </td>
                    </tr>

                    <tr valign="top">
                        <th scope="row"><label for="mva_disclaimer">Results Disclaimer</label></th>
                        <td>
                            <textarea name="mva_disclaimer" id="mva_disclaimer"
                                rows="5" class="large-text"><?php
                                echo esc_textarea(get_option('mva_disclaimer', self::get_default_disclaimer()));
                            ?></textarea>
                            <p class="description">Shown to the user below their settlement results.</p>
                        </td>
                    </tr>

                </table>

                <?php submit_button('Save AI Settings'); ?>
            </form>
        </div>
        <?php
    }

    public static function get_default_disclaimer()
    {
        return 'This analysis provides informational estimates only and does not establish an attorney-client relationship or privilege. Results are subject to significant variation based on available insurance limits, state-specific rules like contributory or comparative negligence, and the quality of medical evidence. For a formal legal evaluation, you may opt to have a licensed attorney in your state contact you directly.';
    }
}
