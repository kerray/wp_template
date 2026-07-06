<?php
/**
 * Plugin Name: Headless API (loader)
 * Description: Loader stub for the generic Headless API mu-plugin. WordPress does
 *              NOT autoload mu-plugins from subdirectories, so this single file
 *              (which IS autoloaded) boots the headless-api/ plugin directory.
 * Version:     1.0.0
 * Author:      wp_template / astro-core
 *
 * Install: copy BOTH this file and the sibling headless-api/ directory into
 * wp-content/mu-plugins/ (see astro-core/wp/README.md — `just astro-wp-plugin`).
 */

if (!defined('ABSPATH')) {
    exit;
}

$headless_api_bootstrap = __DIR__ . '/headless-api/plugin.php';

if (is_readable($headless_api_bootstrap)) {
    require_once $headless_api_bootstrap;
}

unset($headless_api_bootstrap);
