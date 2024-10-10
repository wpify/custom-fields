<?php
/**
 * Plugin Name: WPify Custom Fields
 * Plugin URI: https://wpify.io
 * Description: Modern custom fields for WordPress
 * Version: 1.0.0
 * Author: WPify
 * Author URI: https://wpify.io
 * Text Domain: wpify-custom-fields
 * Domain Path: /languages/
 * Requires at least: 6.2
 * Requires PHP: 8.1
 * License: GPLv2 or later
 *
 * @package WPify
 */

use Tracy\Debugger;
use Wpify\Tracy\Tracy;

require_once __DIR__ . '/vendor/autoload.php';

if ( class_exists( 'Tracy\Debugger' ) ) {
	define( 'WPIFY_TRACY_ENABLE', true );
	Debugger::$dumpTheme = 'dark';
	Debugger::$editor    = 'phpstorm://open?file=%file&line=%line';

	if ( defined( 'DEV_LOCAL_PATH' ) ) {
		Debugger::$editorMapping = array(
			'/var/www/html' => DEV_LOCAL_PATH,
		);
	}

	new Tracy();
}
