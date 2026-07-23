<?php
/**
 * Meta registration: registered post/term meta types match the wp_type mapping,
 * and the wpifycf_register_{post,term}_meta actions fire.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\Core;

use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * Covers Metabox::register_meta() and Taxonomy::register_meta().
 */
class MetaRegistrationTest extends TestCase {
	/**
	 * A representative set spanning every wp_type bucket.
	 *
	 * @return array<int,array>
	 */
	private function mixed_items(): array {
		return array(
			array(
				'id'   => 'a_text',
				'type' => 'text',
			),
			array(
				'id'   => 'a_number',
				'type' => 'number',
			),
			array(
				'id'   => 'a_toggle',
				'type' => 'toggle',
			),
			array(
				'id'   => 'a_post',
				'type' => 'post',
			),
			array(
				'id'   => 'a_multi',
				'type' => 'multi_text',
			),
			array(
				'id'    => 'a_group',
				'type'  => 'group',
				'items' => array(
					array(
						'id'   => 'inner',
						'type' => 'text',
					),
				),
			),
		);
	}

	/**
	 * Registered post meta types match CustomFields::get_wp_type() per field.
	 */
	public function test_post_meta_types_match_wp_type(): void {
		$metabox = $this->cf->create_metabox(
			array(
				'title'      => 'Meta',
				'post_types' => array( 'post' ),
				'items'      => $this->mixed_items(),
			)
		);

		$metabox->register_meta();

		$registered = get_registered_meta_keys( 'post', 'post' );

		$expected = array(
			'a_text'   => 'string',
			'a_number' => 'number',
			'a_toggle' => 'boolean',
			'a_post'   => 'integer',
			'a_multi'  => 'array',
			'a_group'  => 'object',
		);

		foreach ( $expected as $key => $type ) {
			$this->assertArrayHasKey( $key, $registered, sprintf( 'Meta key %s should be registered.', $key ) );
			$this->assertSame( $type, $registered[ $key ]['type'], sprintf( 'Meta key %s type.', $key ) );
		}
	}

	/**
	 * The wpifycf_register_post_meta action fires with items and the post type.
	 */
	public function test_register_post_meta_action_fires(): void {
		$captured = array();
		add_action(
			'wpifycf_register_post_meta',
			static function ( $items, $post_type ) use ( &$captured ) {
				$captured = array(
					'items'     => $items,
					'post_type' => $post_type,
				);
			},
			10,
			2
		);

		$metabox = $this->cf->create_metabox(
			array(
				'title'      => 'Meta',
				'post_types' => array( 'post' ),
				'items'      => $this->mixed_items(),
			)
		);
		$metabox->register_meta();

		$this->assertSame( 'post', $captured['post_type'] );
		$this->assertNotEmpty( $captured['items'] );
	}

	/**
	 * Registered term meta types match the wp_type mapping.
	 */
	public function test_term_meta_types_match_wp_type(): void {
		$taxonomy = $this->cf->create_taxonomy_options(
			array(
				'taxonomy' => 'category',
				'items'    => $this->mixed_items(),
			)
		);

		$taxonomy->register_meta();

		$registered = get_registered_meta_keys( 'term', 'category' );

		$this->assertSame( 'string', $registered['a_text']['type'] );
		$this->assertSame( 'number', $registered['a_number']['type'] );
		$this->assertSame( 'array', $registered['a_multi']['type'] );
	}

	/**
	 * The wpifycf_register_term_meta action fires with items and the taxonomy.
	 */
	public function test_register_term_meta_action_fires(): void {
		$captured = array();
		add_action(
			'wpifycf_register_term_meta',
			static function ( $items, $taxonomy ) use ( &$captured ) {
				$captured = array(
					'items'    => $items,
					'taxonomy' => $taxonomy,
				);
			},
			10,
			2
		);

		$taxonomy = $this->cf->create_taxonomy_options(
			array(
				'taxonomy' => 'category',
				'items'    => $this->mixed_items(),
			)
		);
		$taxonomy->register_meta();

		$this->assertSame( 'category', $captured['taxonomy'] );
		$this->assertNotEmpty( $captured['items'] );
	}
}
