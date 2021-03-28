<?php // phpcs:disable PSR1.Files.SideEffects.FoundWithSymbols

/*
 * Plugin Name:       WPify Custom Fields
 * Description:       Plugin with theme by WPify
 * Version:           1.0
 * Requires PHP:      7.3.0
 * Requires at least: 5.3.0
 * Author:            WPify
 * Author URI:        https://www.wpify.io/
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       wpify-custom-fields
 * Domain Path: /languages
*/

use WpifyCustomFieldsPlugin\Plugin;
use WpifyCustomFieldsPluginDeps\Wpify\Core\Container;
use WpifyCustomFieldsPluginDeps\Wpify\Core\WebpackManifest;
use WpifyCustomFieldsPluginDeps\DI;

if ( ! defined( 'WPIFY_CUSTOM_FIELDS_MIN_PHP_VERSION' ) ) {
	define( 'WPIFY_CUSTOM_FIELDS_MIN_PHP_VERSION', '7.3.0' );
}

/**
 * Singleton instance function. We will not use a global at all as that defeats the purpose of a singleton
 * and is a bad design overall
 *
 * @SuppressWarnings(PHPMD.StaticAccess)
 * @return WpifyCustomFieldsPlugin\Plugin
 * @throws Exception
 */
function wpify_custom_fields(): Plugin {
	return wpify_custom_fields_container()->get( Plugin::class );
}

/**
 * This container singleton enables you to setup unit testing by passing an environment file to map classes in Dice
 *
 * @param string $env
 *
 * @return DI\Container
 * @throws Exception
 */
function wpify_custom_fields_container(): DI\Container {
	static $container;
	if ( empty( $container ) ) {
		$wpify_container = Container::getInstance();
		$container       = $wpify_container->add_container(
			'wpify_custom_fields',
			array(
				Plugin::class          => DI\autowire( Plugin::class ),
				WebpackManifest::class => DI\autowire()
					->constructor( 'build/assets-manifest.json', 'wpify-custom-fields~' )
			)
		);
	}

	return $container;
}

/**
 * Init function shortcut
 */
function wpify_custom_fields_init() {
	wpify_custom_fields()->init();
}

/**
 * Activate function shortcut
 */
function wpify_custom_fields_activate( $network_wide ) {
	register_uninstall_hook( __FILE__, 'wpify_custom_fields_uninstall' );
	wpify_custom_fields()->init();
	wpify_custom_fields()->activate( $network_wide );
}

/**
 * Deactivate function shortcut
 */
function wpify_custom_fields_deactivate( $network_wide ) {
	wpify_custom_fields()->deactivate( $network_wide );
}

/**
 * Uninstall function shortcut
 */
function wpify_custom_fields_uninstall() {
	wpify_custom_fields()->uninstall();
}

/**
 * Error for older php
 */
function wpify_custom_fields_php_upgrade_notice() {
	$info = get_plugin_data( __FILE__ );
	_e(
		sprintf(
			'
      <div class="error notice">
        <p>
          Opps! %s requires a minimum PHP version of ' . WPIFY_CUSTOM_FIELDS_MIN_PHP_VERSION . '. Your current version is: %s.
          Please contact your host to upgrade.
        </p>
      </div>
      ',
			$info['Name'],
			PHP_VERSION
		)
	);
}

/**
 * Error if vendors autoload is missing
 */
function wpify_custom_fields_php_vendor_missing() {
	$info = get_plugin_data( __FILE__ );
	_e(
		sprintf(
			'
      <div class="error notice">
        <p>Opps! %s is corrupted it seems, please re-install the plugin.</p>
      </div>
      ',
			$info['Name']
		)
	);
}

/*
 * We want to use a fairly modern php version, feel free to increase the minimum requirement
 */
if ( version_compare( PHP_VERSION, WPIFY_CUSTOM_FIELDS_MIN_PHP_VERSION ) < 0 ) {
	add_action( 'admin_notices', 'wpify_custom_fields_php_upgrade_notice' );
} else {
	if ( file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
		include_once __DIR__ . '/vendor/autoload.php';
		include_once __DIR__ . '/deps/scoper-autoload.php';
		include_once __DIR__ . '/wcf/functions.php';

		//add_action( 'plugins_loaded', 'wpify_custom_fields_init' );
		wpify_custom_fields_init();
		register_activation_hook( __FILE__, 'wpify_custom_fields_activate' );
		register_deactivation_hook( __FILE__, 'wpify_custom_fields_deactivate' );
	} else {
		add_action( 'admin_notices', 'wpify_custom_fields_php_vendor_missing' );
	}
}
