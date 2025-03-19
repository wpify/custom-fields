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

if ( ! function_exists( 'wpify_custom_fields_json_encode' ) ) {
	/**
	 * Encodes data as JSON, ensuring that all characters are properly escaped.
	 *
	 * This function is a wrapper around wp_json_encode with additional flags. The following flags are used:
	 * - JSON_HEX_TAG
	 * - JSON_HEX_APOS
	 * - JSON_HEX_QUOT
	 * - JSON_HEX_AMP
	 * - JSON_UNESCAPED_UNICODE
	 *
	 * @param $data
	 *
	 * @return string
	 */
	function wpify_custom_fields_json_encode( $data ): string {
		return wp_json_encode( $data, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE ) ?: '';
	}
}
