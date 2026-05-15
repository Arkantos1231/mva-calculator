<?php
if (!defined('ABSPATH')) {
    exit;
}

use Elementor\Widget_Base;
use Elementor\Controls_Manager;

class MVA_Elementor_Widget extends Widget_Base
{
    public function get_name()
    {
        return 'mva_calculator';
    }

    public function get_title()
    {
        return __('MVA Settlement Calculator', 'mva-calculator');
    }

    public function get_icon()
    {
        return 'eicon-calculator';
    }

    public function get_categories()
    {
        return ['general'];
    }

    public function get_keywords()
    {
        return ['calculator', 'mva', 'settlement', 'accident'];
    }

    public function get_style_depends()
    {
        return ['mva-calculator-css'];
    }

    public function get_script_depends()
    {
        return ['mva-calculator-js'];
    }

    protected function render()
    {
        echo do_shortcode('[mva_calculator]');
    }
}
