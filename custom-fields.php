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
 * @package WPify Custom Fields
 */

use Wpify\CustomFields\CustomFields;

require_once __DIR__ . '/vendor/autoload.php';

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
			$plugin = new CustomFields;
		}

		return $plugin;
	}
}
