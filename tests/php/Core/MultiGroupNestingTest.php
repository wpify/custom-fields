<?php
/**
 * Named exception (docs/adr/0002): multi_group nested value shape at the PHP
 * save level, including a multi_group nested inside a multi_group.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\Core;

use Wpify\CustomFields\Tests\Support\RepresentativeFieldSet;
use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * Deep sanitization and storage of nested repeater values.
 */
class MultiGroupNestingTest extends TestCase {
	use RepresentativeFieldSet;

	/**
	 * A multi_group of a multi_group sanitizes recursively, coercing leaf types
	 * while preserving the row-array-of-object shape at every level.
	 */
	public function test_nested_multi_group_sanitization(): void {
		$item = array(
			'id'    => 'outer',
			'type'  => 'multi_group',
			'items' => array(
				array(
					'id'   => 'label',
					'type' => 'text',
				),
				array(
					'id'    => 'rows',
					'type'  => 'multi_group',
					'items' => array(
						array(
							'id'   => 'v',
							'type' => 'number',
						),
					),
				),
			),
		);

		$value = array(
			array(
				'label' => '<script>x</script>A',
				'rows'  => array(
					array( 'v' => '1' ),
					array( 'v' => '2abc' ),
				),
			),
			array(
				'label' => 'B',
				'rows'  => array(
					array( 'v' => '3' ),
				),
			),
		);

		$result = $this->cf->sanitize_item_value( $item )( $value );

		$this->assertSame( 'A', $result[0]['label'] );
		$this->assertSame( 1.0, $result[0]['rows'][0]['v'] );
		$this->assertSame( 2.0, $result[0]['rows'][1]['v'] );
		$this->assertSame( 'B', $result[1]['label'] );
		$this->assertSame( 3.0, $result[1]['rows'][0]['v'] );
	}

	/**
	 * A nested multi_group round-trips through post-meta storage intact.
	 */
	public function test_nested_multi_group_round_trip_through_metabox(): void {
		$admin = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin );
		$post_id = self::factory()->post->create( array( 'post_type' => 'post' ) );

		$items = array(
			array(
				'id'    => 'outer',
				'type'  => 'multi_group',
				'items' => array(
					array(
						'id'   => 'label',
						'type' => 'text',
					),
					array(
						'id'    => 'rows',
						'type'  => 'multi_group',
						'items' => array(
							array(
								'id'   => 'v',
								'type' => 'text',
							),
						),
					),
				),
			),
		);

		$metabox = $this->cf->create_metabox(
			array(
				'title'      => 'Nested',
				'post_types' => array( 'post' ),
				'items'      => $items,
			)
		);

		$submitted = array(
			array(
				'label' => 'A',
				'rows'  => array( array( 'v' => 'x' ), array( 'v' => 'y' ) ),
			),
		);

		$_POST = wp_slash(
			array(
				'outer'         => wp_json_encode( $submitted ),
				$metabox->nonce => wp_create_nonce( $metabox->id ),
				'post_type'     => 'post',
			)
		);

		$metabox->save_meta_box( $post_id, get_post( $post_id ) );

		$stored = get_post_meta( $post_id, 'outer', true );

		$this->assertSame( 'A', $stored[0]['label'] );
		$this->assertSame( array( array( 'v' => 'x' ), array( 'v' => 'y' ) ), $stored[0]['rows'] );
	}
}
