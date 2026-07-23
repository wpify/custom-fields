<?php
/**
 * WooCommerce integration axis: OrderMetabox save/load round-trip (HPOS-aware
 * order data store).
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\WooCommerce;

use WC_Order;
use Wpify\CustomFields\Tests\Support\RepresentativeFieldSet;
use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * OrderMetabox stores the representative field set as order meta.
 */
class OrderMetaboxTest extends TestCase {
	use RepresentativeFieldSet;

	/**
	 * The representative fields round-trip through the order save path.
	 */
	public function test_order_metabox_round_trip(): void {
		$admin = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin );

		$order = new WC_Order();
		$order->save();

		$integration = $this->cf->create_order_metabox(
			array(
				'title' => 'Order Fields',
				'items' => $this->representative_items(),
			)
		);

		$_POST = wp_slash(
			array_merge(
				$this->representative_post_values(),
				array( $integration->nonce => wp_create_nonce( $integration->id ) )
			)
		);

		$integration->save( $order->get_id() );

		$this->assert_representative_round_trip( $integration );

		$reloaded = wc_get_order( $order->get_id() );
		$this->assertSame( 'Hello world', $reloaded->get_meta( 'rep_text' ) );
	}

	/**
	 * A missing nonce prevents any write.
	 */
	public function test_order_metabox_requires_nonce(): void {
		$admin = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin );

		$order = new WC_Order();
		$order->save();

		$integration = $this->cf->create_order_metabox(
			array(
				'title' => 'Order Fields',
				'items' => $this->representative_items(),
			)
		);

		$_POST = wp_slash( $this->representative_post_values() );

		$integration->save( $order->get_id() );

		$reloaded = wc_get_order( $order->get_id() );
		$this->assertSame( '', $reloaded->get_meta( 'rep_text' ) );
	}
}
