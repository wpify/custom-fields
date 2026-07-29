<?php
/**
 * Graceful degradation: with WooCommerce absent the plugin must not fatal and
 * WooCommerce-dependent integrations must still be constructable (they only
 * touch WooCommerce at hook time).
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\Core;

use Wpify\CustomFields\Integrations\CouponOptions;
use Wpify\CustomFields\Integrations\OrderMetabox;
use Wpify\CustomFields\Integrations\ProductOptions;
use Wpify\CustomFields\Integrations\ProductVariationOptions;
use Wpify\CustomFields\Integrations\WooCommerceSettings;
use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * Asserts the plugin behaves when WooCommerce is not loaded.
 */
class WithoutWooCommerceTest extends TestCase {
	/**
	 * WooCommerce is genuinely absent in the core suite.
	 */
	public function test_woocommerce_absent(): void {
		$this->assertFalse( class_exists( 'WooCommerce', false ) );
		$this->assertFalse( function_exists( 'wc_get_product' ) );
	}

	/**
	 * Core (non-WooCommerce) functionality still works without WooCommerce.
	 */
	public function test_core_functionality_intact(): void {
		$this->assertSame( 'number', $this->cf->get_wp_type( array( 'type' => 'number' ) ) );
		$this->assertSame(
			'Safe',
			$this->cf->sanitize_item_value( array( 'type' => 'text' ) )( '<script>x</script>Safe' )
		);
	}

	/**
	 * Post search stays title-only and adds no SKU join when WooCommerce is absent.
	 */
	public function test_post_search_without_woocommerce(): void {
		global $wpdb;

		$this->assertEmpty( $wpdb->wc_product_meta_lookup ?? null );

		$match = self::factory()->post->create( array( 'post_title' => 'Findable headline' ) );
		self::factory()->post->create( array( 'post_title' => 'Unrelated' ) );

		$enabled = null;

		$capture = static function ( $value ) use ( &$enabled ) {
			$enabled = $value;

			return $value;
		};

		add_filter( 'wpifycf_search_posts_by_sku', $capture );

		$results = $this->cf->helpers->get_posts(
			array(
				'post_type' => 'product',
				's'         => 'Findable',
			)
		);

		remove_filter( 'wpifycf_search_posts_by_sku', $capture );

		// Even for the product post type, the SKU search never switches on.
		$this->assertFalse( $enabled );

		// 'product' does not exist without WooCommerce, so nothing matches.
		$this->assertSame( array(), $results );

		// The same search against a real post type still works and reports an empty SKU.
		$posts = $this->cf->helpers->get_posts(
			array(
				'post_type' => 'post',
				's'         => 'Findable',
			)
		);

		$this->assertSame( array( $match ), array_map( static fn( $post ) => (int) $post['id'], $posts ) );
		$this->assertSame( '', $posts[0]['sku'] );
	}

	/**
	 * The WooCommerce product options integration constructs without fatal.
	 */
	public function test_product_options_constructs(): void {
		$integration = $this->cf->create_product_options(
			array(
				'tab'   => array(
					'id'    => 'wcf',
					'label' => 'WCF',
				),
				'items' => array(
					array(
						'id'   => 'f',
						'type' => 'text',
					),
				),
			)
		);

		$this->assertInstanceOf( ProductOptions::class, $integration );
	}

	/**
	 * The WooCommerce product variation options integration constructs without fatal.
	 */
	public function test_product_variation_options_constructs(): void {
		$integration = $this->cf->create_product_variation_options(
			array(
				'tab'   => array( 'label' => 'WCF' ),
				'items' => array(
					array(
						'id'   => 'f',
						'type' => 'text',
					),
				),
			)
		);

		$this->assertInstanceOf( ProductVariationOptions::class, $integration );
	}

	/**
	 * The WooCommerce coupon options integration constructs without fatal.
	 */
	public function test_coupon_options_constructs(): void {
		$integration = $this->cf->create_coupon_options(
			array(
				'tab'   => array(
					'id'    => 'wcf',
					'label' => 'WCF',
				),
				'items' => array(
					array(
						'id'   => 'f',
						'type' => 'text',
					),
				),
			)
		);

		$this->assertInstanceOf( CouponOptions::class, $integration );
	}

	/**
	 * The WooCommerce order metabox integration constructs without fatal.
	 */
	public function test_order_metabox_constructs(): void {
		$integration = $this->cf->create_order_metabox(
			array(
				'title' => 'Order Fields',
				'items' => array(
					array(
						'id'   => 'f',
						'type' => 'text',
					),
				),
			)
		);

		$this->assertInstanceOf( OrderMetabox::class, $integration );
	}

	/**
	 * The WooCommerce settings integration constructs without fatal.
	 */
	public function test_woocommerce_settings_constructs(): void {
		$integration = $this->cf->create_woocommerce_settings(
			array(
				'tab'     => array( 'id' => 'wcf' ),
				'section' => array( 'id' => 'main' ),
				'items'   => array(
					array(
						'id'   => 'f',
						'type' => 'text',
					),
				),
			)
		);

		$this->assertInstanceOf( WooCommerceSettings::class, $integration );
	}
}
