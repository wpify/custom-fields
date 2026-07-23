<?php
/**
 * WooCommerce integration axis: SubscriptionMetabox and WcMembershipPlanOptions.
 *
 * These integrations target paid WooCommerce extensions (WooCommerce
 * Subscriptions / Memberships) that are not part of the self-contained CI
 * dependency set, so their save/load round-trips are intentionally skipped.
 * The tests remain as explicit, discoverable placeholders.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\WooCommerce;

use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * Placeholder coverage for the paid-extension integrations.
 */
class PaidExtensionsTest extends TestCase {

	/**
	 * SubscriptionMetabox requires WooCommerce Subscriptions (paid).
	 */
	public function test_subscription_metabox_round_trip(): void {
		if ( ! class_exists( 'WC_Subscriptions' ) ) {
			$this->markTestSkipped( 'SubscriptionMetabox requires the paid WooCommerce Subscriptions plugin.' );
		}

		$this->fail( 'WooCommerce Subscriptions is present but this round-trip is not implemented.' );
	}

	/**
	 * WcMembershipPlanOptions requires WooCommerce Memberships (paid).
	 */
	public function test_membership_plan_options_round_trip(): void {
		if ( ! class_exists( 'WC_Memberships' ) ) {
			$this->markTestSkipped( 'WcMembershipPlanOptions requires the paid WooCommerce Memberships plugin.' );
		}

		$this->fail( 'WooCommerce Memberships is present but this round-trip is not implemented.' );
	}
}
