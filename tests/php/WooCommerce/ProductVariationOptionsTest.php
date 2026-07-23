<?php
/**
 * WooCommerce named exception (docs/adr/0002): variation options use
 * index-suffixed input names (the variation loop index), so the submitted
 * values are nested under that index.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\WooCommerce;

use WC_Product_Variable;
use WC_Product_Variation;
use Wpify\CustomFields\Tests\Support\RepresentativeFieldSet;
use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * ProductVariationOptions stores per-variation meta from index-suffixed names.
 */
class ProductVariationOptionsTest extends TestCase {
	use RepresentativeFieldSet;

	/**
	 * Creates a variation and returns its id.
	 *
	 * @return int
	 */
	private function make_variation(): int {
		$parent = new WC_Product_Variable();
		$parent->save();

		$variation = new WC_Product_Variation();
		$variation->set_parent_id( $parent->get_id() );
		$variation->save();

		return $variation->get_id();
	}

	/**
	 * Values submitted under the variation loop index round-trip to the variation.
	 */
	public function test_variation_round_trip_with_loop_index(): void {
		$variation_id = $this->make_variation();
		$loop         = 3;

		$integration = $this->cf->create_product_variation_options(
			array(
				'tab'   => array( 'label' => 'WCF' ),
				'items' => $this->representative_items(),
			)
		);

		// Names are index-suffixed: $_POST[ field_id ][ loop ].
		$nested = array();
		foreach ( $this->representative_post_values() as $id => $value ) {
			$nested[ $id ] = array( $loop => $value );
		}
		$_POST = wp_slash( $nested );

		$integration->save( $variation_id, $loop );

		$this->assert_representative_round_trip( $integration );
	}

	/**
	 * A value submitted under one loop index does not leak into another — proving
	 * the names are genuinely scoped by the variation index.
	 */
	public function test_values_are_scoped_by_loop_index(): void {
		$variation_id = $this->make_variation();

		$integration = $this->cf->create_product_variation_options(
			array(
				'tab'   => array( 'label' => 'WCF' ),
				'items' => $this->representative_items(),
			)
		);

		// Submitted under loop index 1, but saved for loop index 4.
		$_POST = wp_slash( array( 'rep_text' => array( 1 => 'Value for row 1' ) ) );

		$integration->save( $variation_id, 4 );

		$this->assertSame( '', $integration->get_field( 'rep_text', $this->representative_item( 'rep_text' ) ) );
	}
}
