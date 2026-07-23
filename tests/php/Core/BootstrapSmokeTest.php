<?php
/**
 * Smoke test: the WordPress test environment and the plugin boot correctly.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\Core;

use WP_UnitTestCase;
use Wpify\CustomFields\CustomFields;

/**
 * Verifies the harness itself before the real coverage runs.
 */
class BootstrapSmokeTest extends WP_UnitTestCase {

	/**
	 * The plugin singleton resolves to a CustomFields instance.
	 */
	public function test_plugin_boots(): void {
		$this->assertInstanceOf( CustomFields::class, wpify_custom_fields() );
	}

	/**
	 * The core suite runs with WooCommerce absent.
	 */
	public function test_woocommerce_is_not_loaded(): void {
		$this->assertFalse( class_exists( 'WooCommerce', false ), 'WooCommerce must not be loaded in the core suite.' );
	}
}
