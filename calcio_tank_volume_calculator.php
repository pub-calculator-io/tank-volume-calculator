<?php
/*
Plugin Name: Tank Volume Calculator by Calculator.iO
Plugin URI: https://www.calculator.io/tank-volume-calculator/
Description: Calculate total and partially filled tank volumes instantly with our Tank Volume Calculator. Supports water and oil tanks in gallons, liters, and cubic meters.
Version: 1.0.0
Author: www.calculator.io / Tank Volume Calculator
Author URI: https://www.calculator.io/
License: GPLv2 or later
Text Domain: calcio_tank_volume_calculator
*/

if (!defined('ABSPATH')) exit;

if (!function_exists('add_shortcode')) return "No direct call for Tank Volume Calculator by www.calculator.io";

function calcio_tank_volume_calculator_shortcode(){
    $page = 'index.html';
    return '<h2><img src="' . esc_url(plugins_url('assets/images/icon-48.png', __FILE__ )) . '" width="48" height="48">Tank Volume Calculator</h2><div><iframe style="background:transparent; overflow: scroll" src="' . esc_url(plugins_url($page, __FILE__ )) . '" width="100%" frameBorder="0" allowtransparency="true" onload="this.style.height = this.contentWindow.document.documentElement.scrollHeight + \'px\';" id="calcio_tank_volume_calculator_iframe"></iframe></div>';
}


add_shortcode( 'calcio_tank_volume_calculator', 'calcio_tank_volume_calculator_shortcode' );