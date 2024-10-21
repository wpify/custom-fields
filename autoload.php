<?php
/**
 * Autoloaded functions.
 *
 * @package WPify Custom Fields
 */

use Wpify\CustomFields\CustomFields;

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
