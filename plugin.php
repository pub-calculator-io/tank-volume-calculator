<?php
/*
Plugin Name: CI Tank volume calculator
Plugin URI: https://www.calculator.io/tank-volume-calculator/
Description: The tank volume calculator finds the total volume of various tank shapes in gallons, liters, and cubic meters. It calculates the liquid volume of partially filled tanks.
Version: 1.0.0
Author: Calculator.io
Author URI: https://www.calculator.io/
License: GPLv2 or later
Text Domain: ci_tank_volume_calculator
*/

if (!defined('ABSPATH')) exit;

if (!function_exists('add_shortcode')) return "No direct call for Tank Volume Calculator by Calculator.iO";

function display_ci_tank_volume_calculator(){
    $page = 'index.html';
    return '<h2><img src="' . esc_url(plugins_url('assets/images/icon-48.png', __FILE__ )) . '" width="48" height="48">Tank Volume Calculator</h2><div><iframe style="background:transparent; overflow: scroll" src="' . esc_url(plugins_url($page, __FILE__ )) . '" width="100%" frameBorder="0" allowtransparency="true" onload="this.style.height = this.contentWindow.document.documentElement.scrollHeight + \'px\';" id="ci_tank_volume_calculator_iframe"></iframe></div>';
}

add_shortcode( 'ci_tank_volume_calculator', 'display_ci_tank_volume_calculator' );