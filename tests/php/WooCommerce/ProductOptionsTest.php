<?php
/**
 * WooCommerce integration axis: ProductOptions save/load round-trip.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\WooCommerce;

use WC_Product_Simple;
use Wpify\CustomFields\Tests\Support\RepresentativeFieldSet;
use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * ProductOptions stores the representative field set as product meta.
 */
class ProductOptionsTest extends TestCase {
	use RepresentativeFieldSet;

	/**
	 * The representative fields round-trip through the product save path.
	 */
	public function test_product_options_round_trip(): void {
		$product = new WC_Product_Simple();
		$product->save();

		$integration = $this->cf->create_product_options(
			array(
				'tab'   => array(
					'id'    => 'wcf',
					'label' => 'WCF',
				),
				'items' => $this->representative_items(),
			)
		);

		$_POST = wp_slash( $this->representative_post_values() );

		$integration->save( $product->get_id() );

		$this->assert_representative_round_trip( $integration );

		// Cross-check the value landed on the WC product meta store.
		$reloaded = wc_get_product( $product->get_id() );
		$this->assertSame( 'Hello world', $reloaded->get_meta( 'rep_text' ) );
	}
}
