<?php
/**
 * PHPUnit bootstrap for the WPify Custom Fields integration tests.
 *
 * Boots a real WordPress test environment via wp-phpunit against the database
 * described in tests/php/wp-tests-config.php. The WooCommerce plugin is loaded
 * and installed only when WPCF_WITH_WOOCOMMERCE=1 (the "woocommerce" suite);
 * the "core" suite runs with WooCommerce entirely absent so the tests can
 * assert graceful degradation.
 *
 * @package WPify Custom Fields
 */

// Composer autoloader — also defines wpify_custom_fields() via the files
// autoload of custom-fields.php.
require_once dirname( __DIR__, 2 ) . '/vendor/autoload.php';

// Point wp-phpunit at our config (absolute path so the install.php subprocess
// resolves it too), and locate the wp-phpunit test library.
if ( ! getenv( 'WP_PHPUNIT__TESTS_CONFIG' ) ) {
	putenv( 'WP_PHPUNIT__TESTS_CONFIG=' . __DIR__ . '/wp-tests-config.php' );
}

$_tests_dir = getenv( 'WP_PHPUNIT__DIR' );
if ( ! $_tests_dir ) {
	$_tests_dir = dirname( __DIR__, 2 ) . '/vendor/wp-phpunit/wp-phpunit';
	putenv( 'WP_PHPUNIT__DIR=' . $_tests_dir );
}

if ( ! file_exists( $_tests_dir . '/includes/functions.php' ) ) {
	echo 'Could not find wp-phpunit. Did you run `composer install`?' . PHP_EOL;
	exit( 1 );
}

require_once $_tests_dir . '/includes/functions.php';

$wpcf_with_woocommerce = '1' === getenv( 'WPCF_WITH_WOOCOMMERCE' );

/**
 * Loads WooCommerce (when requested) and boots the plugin so its hooks register.
 */
tests_add_filter(
	'muplugins_loaded',
	static function () use ( $wpcf_with_woocommerce ) {
		if ( $wpcf_with_woocommerce ) {
			require WP_CONTENT_DIR . '/plugins/woocommerce/woocommerce.php';
		}

		// Instantiate the plugin so Api routes and integration hooks register,
		// exactly as they would on a real request.
		wpify_custom_fields();
	}
);

// The core WP installer runs in a subprocess that is unaware of WooCommerce, so
// WooCommerce's own tables must be created in-process. setup_theme fires after
// WooCommerce is loaded but before `init` (where WooCommerce first queries its
// tables), so install there to avoid missing-table errors during bootstrap.
if ( $wpcf_with_woocommerce ) {
	tests_add_filter(
		'setup_theme',
		static function () {
			if ( ! class_exists( 'WC_Install' ) ) {
				return;
			}

			WC_Install::install();

			// Re-hydrate roles/capabilities that WooCommerce adds during install.
			$GLOBALS['wp_roles'] = null;
			wp_roles();
		}
	);
}

require $_tests_dir . '/includes/bootstrap.php';
