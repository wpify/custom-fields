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
 * License: GPLv3 or later
 *
 * @package WPify Custom Fields
 */

use Wpify\CustomFields\CustomFields;

if ( file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
	require_once __DIR__ . '/vendor/autoload.php';
}

if ( ! function_exists( 'wpify_custom_fields' ) ) {
	/**
	 * Gets an instance of the WCF plugin
	 *
	 * @return CustomFields
	 *
	 * phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedFunctionFound
	 */
	function wpify_custom_fields(): CustomFields {
		static $plugin;

		if ( empty( $plugin ) ) {
			$plugin = new CustomFields();
		}

		return $plugin;
	}
}

/**
 * Plugin deactivation hook.
 *
 * Clears the scheduled cron event for temp file cleanup.
 * Only runs when the standalone plugin is deactivated,
 * not when the library is used as a Composer dependency.
 */
if ( function_exists( 'register_deactivation_hook' ) ) {
	register_deactivation_hook( __FILE__, function () {
		wp_clear_scheduled_hook( 'wpifycf_cleanup_temp_files' );
	} );
}
