<?php
/**
 * WooCommerce integration axis: CouponOptions save/load round-trip.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\WooCommerce;

use WC_Coupon;
use Wpify\CustomFields\Tests\Support\RepresentativeFieldSet;
use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * CouponOptions stores the representative field set as coupon meta.
 */
class CouponOptionsTest extends TestCase {
	use RepresentativeFieldSet;

	/**
	 * The representative fields round-trip through the coupon save path.
	 */
	public function test_coupon_options_round_trip(): void {
		$coupon = new WC_Coupon();
		$coupon->set_code( 'wcftest' );
		$coupon->save();

		$integration = $this->cf->create_coupon_options(
			array(
				'tab'   => array(
					'id'    => 'wcf',
					'label' => 'WCF',
				),
				'items' => $this->representative_items(),
			)
		);

		$_POST = wp_slash( $this->representative_post_values() );

		$integration->save( $coupon->get_id() );

		$this->assert_representative_round_trip( $integration );
	}
}
