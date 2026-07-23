<?php
/**
 * WordPress test-suite configuration for the WPify Custom Fields PHP tests.
 *
 * Loaded by wp-phpunit through the WP_PHPUNIT__TESTS_CONFIG environment
 * variable (see tests/php/bootstrap.php). Every value is overridable from the
 * environment so the same file drives both the local DDEV run and CI.
 *
 * @package WPify Custom Fields
 */

// Default database credentials to DDEV's MariaDB service when running inside a
// DDEV container, otherwise to a plain localhost server (the CI layout).
$wpcf_in_ddev = 'true' === getenv( 'IS_DDEV_PROJECT' );

define( 'DB_NAME', getenv( 'WPCF_DB_NAME' ) ?: 'wpcf_tests' );
define( 'DB_USER', getenv( 'WPCF_DB_USER' ) ?: ( $wpcf_in_ddev ? 'db' : 'root' ) );
define( 'DB_PASSWORD', getenv( 'WPCF_DB_PASSWORD' ) ?: ( $wpcf_in_ddev ? 'db' : 'root' ) );
define( 'DB_HOST', getenv( 'WPCF_DB_HOST' ) ?: ( $wpcf_in_ddev ? 'db' : '127.0.0.1' ) );
define( 'DB_CHARSET', 'utf8' );
define( 'DB_COLLATE', '' );

// WordPress core lives in the Composer-managed install directory.
define( 'ABSPATH', dirname( __DIR__, 2 ) . '/vendor/wordpress/' );

define( 'WP_DEFAULT_THEME', 'default' );

$table_prefix = getenv( 'WP_PHPUNIT__TABLE_PREFIX' ) ?: 'wptests_';

define( 'WP_TESTS_DOMAIN', 'example.org' );
define( 'WP_TESTS_EMAIL', 'admin@example.org' );
define( 'WP_TESTS_TITLE', 'WPify Custom Fields Test Suite' );

define( 'WP_PHP_BINARY', getenv( 'WP_PHP_BINARY' ) ?: 'php' );

define( 'WP_DEBUG', true );
define( 'WP_DEBUG_DISPLAY', false );
