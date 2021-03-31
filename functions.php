<?php

use WpifyCustomFields\WpifyCustomFields;

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
