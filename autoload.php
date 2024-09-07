<?php

use Wpify\CustomFields\CustomFields;

if ( ! function_exists( 'wpify_custom_fields' ) ) {
	/**
	 * Gets an instance of the WCF plugin
	 *
	 * @param string $wcf_url
	 *
	 * @return CustomFields
	 */
	function wpify_custom_fields( string $wcf_url = '' ): CustomFields {
		static $plugin;

		if ( empty( $plugin ) ) {
			$plugin = new CustomFields( $wcf_url );
		}

		return $plugin;
	}
}
