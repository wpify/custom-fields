<?php

use WpifyCustomFields\WpifyCustomFields;

/**
 * Gets an instance of the plugin
 * @return WpifyCustomFields
 */
function get_wpify_custom_fields(): WpifyCustomFields {
	static $plugin;

	if ( empty( $plugin ) ) {
		$assets_path = realpath( __DIR__ . '/../build' );

		$plugin = new WpifyCustomFields( $assets_path );
	}

	return $plugin;
}
