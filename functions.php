<?php

use WpifyCustomFields\WpifyCustomFields;

if ( ! function_exists( 'get_wpify_custom_fields' ) ) {
	/**
	 * Gets an instance of the WCF plugin
	 *
	 * @return WpifyCustomFields
	 */
	function get_wpify_custom_fields(): WpifyCustomFields {
		static $plugin;

		if ( empty( $plugin ) ) {
			$plugin = new WpifyCustomFields();
		}

		return $plugin;
	}
}
