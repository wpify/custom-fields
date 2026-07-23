<?php
/**
 * WooCommerce integration axis: WooCommerceSettings save/load round-trip.
 *
 * WooCommerceSettings::save() ends in wp_safe_redirect()/exit, so the test
 * drives the shared persistence step directly (options-backed storage).
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\WooCommerce;

use Wpify\CustomFields\Tests\Support\RepresentativeFieldSet;
use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * WooCommerceSettings stores the representative field set as WordPress options.
 */
class WooCommerceSettingsTest extends TestCase {
	use RepresentativeFieldSet;

	/**
	 * The representative fields round-trip through the settings save path.
	 */
	public function test_woocommerce_settings_round_trip(): void {
		$integration = $this->cf->create_woocommerce_settings(
			array(
				'tab'     => array( 'id' => 'wcf' ),
				'section' => array( 'id' => 'main' ),
				'items'   => $this->representative_items(),
			)
		);

		$_POST = wp_slash( $this->representative_post_values() );

		// save() would exit; call the identical persistence step it performs.
		$integration->set_fields_from_post_request( $this->representative_items() );

		$this->assert_representative_round_trip( $integration );

		$this->assertSame( 'Hello world', get_option( 'rep_text' ) );
	}
}
