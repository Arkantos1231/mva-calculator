<?php
/**
 * Plugin Name: MVA Settlement Calculator
 * Plugin URI: https://pinderplotkin.com
 * Description: Multi-step Motor Vehicle Accident Settlement Calculator with AI-powered case analysis and GHL lead integration.
 * Version: 1.3.23.2
 * Author: Julian Obando and Pinder Plotkin
 * Author URI: https://pinderplotkin.com
 * License: GPL v2 or later
 * Text Domain: mva-calculator
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Plugin constants  (MVA_ prefix only — no conflict with WCC plugin)
define('MVA_VERSION',         '1.3.23.2');
define('MVA_PLUGIN_DIR',      plugin_dir_path(__FILE__));
define('MVA_PLUGIN_URL',      plugin_dir_url(__FILE__));
define('MVA_PLUGIN_BASENAME', plugin_basename(__FILE__));

// Auto-updates from GitHub via Plugin Update Checker
if ( file_exists( MVA_PLUGIN_DIR . 'plugin-update-checker/plugin-update-checker.php' ) ) {
    require_once MVA_PLUGIN_DIR . 'plugin-update-checker/plugin-update-checker.php';
    $mva_update_checker = \YahnisElsts\PluginUpdateChecker\v5\PucFactory::buildUpdateChecker(
        'https://github.com/Arkantos1231/mva-calculator',
        __FILE__,
        'mva-calculator'
    );
    $mva_update_checker->setBranch('main');
}

/**
 * Main plugin class
 */
class MVA_Settlement_Calculator
{
    private static $instance = null;

    public static function get_instance()
    {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct()
    {
        $this->load_dependencies();
        $this->init();
    }

    private function load_dependencies()
    {
        require_once MVA_PLUGIN_DIR . 'includes/class-mva-ai-engine.php';
        require_once MVA_PLUGIN_DIR . 'includes/class-mva-form-handler.php';
        require_once MVA_PLUGIN_DIR . 'includes/class-mva-settings.php';
    }

    private function init()
    {
        if (is_admin()) {
            MVA_Settings::init();
        }

        add_action('init',               array($this, 'register_shortcode'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_assets'));
        add_action('elementor/widgets/register', array($this, 'register_elementor_widget'));
    }

    public function register_elementor_widget($widgets_manager)
    {
        require_once MVA_PLUGIN_DIR . 'includes/class-mva-elementor-widget.php';
        $widgets_manager->register(new MVA_Elementor_Widget());
    }

    public function register_shortcode()
    {
        add_shortcode('mva_calculator', array($this, 'render_calculator'));
    }

    public function render_calculator()
    {
        ob_start();
        include MVA_PLUGIN_DIR . 'templates/mva-calculator-template.php';
        return ob_get_clean();
    }

    public function enqueue_assets()
    {
        global $post;

        // Always register so Elementor widget can declare them as dependencies
        wp_register_style(
            'mva-calculator-css',
            MVA_PLUGIN_URL . 'assets/css/mva-calculator.css',
            array(),
            MVA_VERSION
        );

        wp_register_script(
            'mva-calculator-js',
            MVA_PLUGIN_URL . 'assets/js/mva-calculator.js',
            array(),
            MVA_VERSION,
            true
        );

        // Attach localized data to the handle (works whether enqueued by us or by Elementor)
        wp_localize_script('mva-calculator-js', 'mvaAjax', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce'   => wp_create_nonce('mva_calculator_nonce'),
            'lang'    => get_option('mva_language', 'en'),
        ));

        // Enqueue only on pages that use the shortcode directly
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'mva_calculator')) {
            wp_enqueue_style('mva-calculator-css');
            wp_enqueue_script('mva-calculator-js');
        }
    }
}

// Boot
MVA_Settlement_Calculator::get_instance();
