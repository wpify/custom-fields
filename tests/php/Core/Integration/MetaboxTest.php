<?php
/**
 * Integration axis: Metabox (post meta) save/load round-trip.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\Core\Integration;

use Wpify\CustomFields\Tests\Support\RepresentativeFieldSet;
use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * Metabox stores the representative field set as post meta.
 */
class MetaboxTest extends TestCase {
	use RepresentativeFieldSet;

	/**
	 * The representative fields round-trip through the metabox save path.
	 */
	public function test_metabox_round_trip(): void {
		$admin = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin );

		$post_id = self::factory()->post->create( array( 'post_type' => 'post' ) );

		$metabox = $this->cf->create_metabox(
			array(
				'title'      => 'Test Metabox',
				'post_types' => array( 'post' ),
				'items'      => $this->representative_items(),
			)
		);

		$_POST = wp_slash(
			array_merge(
				$this->representative_post_values(),
				array(
					$metabox->nonce => wp_create_nonce( $metabox->id ),
					'post_type'     => 'post',
				)
			)
		);

		$metabox->save_meta_box( $post_id, get_post( $post_id ) );

		$this->assert_representative_round_trip( $metabox );
	}

	/**
	 * A missing/invalid nonce prevents any write.
	 */
	public function test_metabox_requires_nonce(): void {
		$admin = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin );

		$post_id = self::factory()->post->create( array( 'post_type' => 'post' ) );

		$metabox = $this->cf->create_metabox(
			array(
				'title'      => 'Test Metabox',
				'post_types' => array( 'post' ),
				'items'      => $this->representative_items(),
			)
		);

		$_POST = wp_slash(
			array_merge( $this->representative_post_values(), array( 'post_type' => 'post' ) )
		);

		$metabox->save_meta_box( $post_id, get_post( $post_id ) );

		$this->assertSame( '', get_post_meta( $post_id, 'rep_text', true ) );
	}
}
