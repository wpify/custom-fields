<?php
/**
 * Named exception: the post/multi_post field types search and expose the
 * WooCommerce SKU when they target products.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\WooCommerce;

use WC_Product_Simple;
use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * Helpers::get_posts() is SKU-aware for product post types.
 */
class PostSkuSearchTest extends TestCase {
	/**
	 * Creates a published simple product.
	 *
	 * @param string $name Product name.
	 * @param string $sku  Product SKU.
	 *
	 * @return int The product ID.
	 */
	private function product( string $name, string $sku = '' ): int {
		$product = new WC_Product_Simple();
		$product->set_name( $name );
		$product->set_status( 'publish' );

		if ( '' !== $sku ) {
			$product->set_sku( $sku );
		}

		return $product->save();
	}

	/**
	 * Extracts the IDs from a get_posts() result.
	 *
	 * @param array $results Result of Helpers::get_posts().
	 *
	 * @return int[]
	 */
	private function ids( array $results ): array {
		return array_map( static fn( array $post ) => (int) $post['id'], $results );
	}

	/**
	 * A product is found by a fragment of its SKU even when its title does not match.
	 */
	public function test_partial_sku_matches_product_with_unrelated_title(): void {
		$found = $this->product( 'Blue Shirt', 'ZX-9000-BLUE' );
		$this->product( 'Red Shirt', 'QQ-1111-RED' );

		$results = $this->cf->helpers->get_posts(
			array(
				'post_type' => 'product',
				's'         => '9000',
			)
		);

		$this->assertContains( $found, $this->ids( $results ) );
		$this->assertCount( 1, $results );
	}

	/**
	 * An exact SKU match outranks a product that merely matches by title.
	 */
	public function test_exact_sku_match_ranks_first(): void {
		$title_match = $this->product( 'ZX-9000 Poster', 'PS-0001' );
		$sku_match   = $this->product( 'Blue Shirt', 'ZX-9000' );

		$results = $this->cf->helpers->get_posts(
			array(
				'post_type' => 'product',
				's'         => 'ZX-9000',
			)
		);

		$ids = $this->ids( $results );

		$this->assertContains( $title_match, $ids );
		$this->assertSame( $sku_match, $ids[0] );
	}

	/**
	 * The SKU is exposed on the payload of every product.
	 */
	public function test_payload_contains_sku(): void {
		$id = $this->product( 'Blue Shirt', 'ZX-9000-BLUE' );

		$results = $this->cf->helpers->get_posts(
			array(
				'post_type' => 'product',
				'include'   => array( $id ),
			)
		);

		$this->assertSame( 'ZX-9000-BLUE', $results[0]['sku'] );
	}

	/**
	 * A product without a SKU still reports the key, as an empty string.
	 */
	public function test_payload_sku_is_empty_string_without_sku(): void {
		$id = $this->product( 'No Code Product' );

		$results = $this->cf->helpers->get_posts(
			array(
				'post_type' => 'product',
				'include'   => array( $id ),
			)
		);

		$this->assertSame( '', $results[0]['sku'] );
	}

	/**
	 * Excluded products stay excluded when the match came from the SKU.
	 */
	public function test_exclude_applies_to_sku_matches(): void {
		$excluded = $this->product( 'Blue Shirt', 'ZX-9000-BLUE' );
		$kept     = $this->product( 'Red Shirt', 'ZX-9000-RED' );

		$results = $this->cf->helpers->get_posts(
			array(
				'post_type' => 'product',
				's'         => 'ZX-9000',
				'exclude'   => array( $excluded ),
			)
		);

		$this->assertSame( array( $kept ), $this->ids( $results ) );
	}

	/**
	 * Ensured products are returned alongside the SKU matches.
	 */
	public function test_ensure_applies_to_sku_matches(): void {
		$ensured = $this->product( 'Blue Shirt', 'ZX-9000-BLUE' );

		$results = $this->cf->helpers->get_posts(
			array(
				'post_type' => 'product',
				's'         => 'ZX-9000',
				'ensure'    => array( $ensured ),
			)
		);

		$this->assertSame( array( $ensured ), $this->ids( $results ) );
	}

	/**
	 * In a mixed post type request, products match by SKU and posts by title only.
	 */
	public function test_mixed_post_types_search_products_by_sku(): void {
		$product = $this->product( 'Blue Shirt', 'ZX-9000-BLUE' );
		$post    = self::factory()->post->create( array( 'post_title' => 'ZX-9000 announcement' ) );

		$results = $this->cf->helpers->get_posts(
			array(
				'post_type' => array( 'post', 'product' ),
				's'         => 'ZX-9000',
			)
		);

		$ids = $this->ids( $results );

		$this->assertContains( $product, $ids );
		$this->assertContains( $post, $ids );
	}

	/**
	 * A non-product post type is never searched by SKU.
	 */
	public function test_non_product_post_type_is_not_sku_searched(): void {
		$this->product( 'Blue Shirt', 'ZX-9000-BLUE' );

		$results = $this->cf->helpers->get_posts(
			array(
				'post_type' => 'post',
				's'         => 'ZX-9000',
			)
		);

		$this->assertSame( array(), $results );
	}

	/**
	 * The wpifycf_search_posts_by_sku filter can switch the behaviour off.
	 */
	public function test_filter_can_disable_sku_search(): void {
		$this->product( 'Blue Shirt', 'ZX-9000-BLUE' );

		add_filter( 'wpifycf_search_posts_by_sku', '__return_false' );

		$results = $this->cf->helpers->get_posts(
			array(
				'post_type' => 'product',
				's'         => 'ZX-9000',
			)
		);

		remove_filter( 'wpifycf_search_posts_by_sku', '__return_false' );

		$this->assertSame( array(), $results );
	}

	/**
	 * The wpifycf_post_data filter can add data to every returned post.
	 */
	public function test_post_data_filter_applies(): void {
		$id = $this->product( 'Blue Shirt', 'ZX-9000-BLUE' );

		$callback = static function ( array $data ): array {
			$data['extra'] = 'added';

			return $data;
		};

		add_filter( 'wpifycf_post_data', $callback );

		$results = $this->cf->helpers->get_posts(
			array(
				'post_type' => 'product',
				'include'   => array( $id ),
			)
		);

		remove_filter( 'wpifycf_post_data', $callback );

		$this->assertSame( 'added', $results[0]['extra'] );
	}
}
