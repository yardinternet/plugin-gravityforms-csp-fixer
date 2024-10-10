<?php

/**
 * Plugin Name:       GravityForms CSP Fixer
 * Description:       Fixes GravityForms plugin so it is CSP compliant.
 * Version:           0.0.6
 * Requires at least: 5.9
 * Requires PHP:      7.4
 * Author:            Yard | Digital Agency
 * Author URI:        https://www.yard.nl/
 */

/**
 * If this file is called directly, abort.
 */
if (! defined('WPINC')) {
    die;
}

define('YCSP_VERSION', '0.0.6');
define('YCSP_DIR', basename(__DIR__));
define('YCSP_ROOT_PATH', __DIR__);

/**
 * Manual loaded file: the autoloader.
 */
require_once __DIR__ . '/autoloader.php';
$autoloader = new Yard\CSP\Autoloader();

/**
 * Begin execution of the plugin
 *
 * This hook is called once any activated plugins have been loaded. Is generally used for immediate filter setup, or
 * plugin overrides. The plugins_loaded action hook fires early, and precedes the setup_theme, after_setup_theme, init
 * and wp_loaded action hooks.
 */
\add_action('plugins_loaded', function () {
    $plugin = (new \Yard\CSP\Foundation\Plugin(__DIR__))->boot();
}, 10);
