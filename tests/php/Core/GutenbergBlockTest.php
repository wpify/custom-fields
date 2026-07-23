<?php
/**
 * Named exception (docs/adr/0002): Gutenberg controlled-state data path.
 *
 * A block has no $_POST save path — its values are block attributes. Coverage
 * targets the attribute schema (get_attributes) and the REST render path
 * (render_from_api), which is how the editor exchanges attribute values.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\Core;

use WP_REST_Request;
use Wpify\CustomFields\Exceptions\MissingArgumentException;
use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * Covers GutenbergBlock's controlled-mode surface.
 */
class GutenbergBlockTest extends TestCase {
	/**
	 * A block requires a name and a title.
	 */
	public function test_missing_name_and_title_throws(): void {
		$this->expectException( MissingArgumentException::class );

		$this->cf->create_gutenberg_block( array( 'items' => array() ) );
	}

	/**
	 * get_attributes() builds a WordPress attribute schema from the fields,
	 * with the type and default drawn from the wp_type mapping.
	 */
	public function test_get_attributes_builds_schema(): void {
		$block = $this->cf->create_gutenberg_block(
			array(
				'name'  => 'wpcf/test',
				'title' => 'Test Block',
				'items' => array(
					array(
						'id'   => 'heading',
						'type' => 'text',
					),
					array(
						'id'   => 'count',
						'type' => 'number',
					),
					array(
						'id'   => 'items',
						'type' => 'multi_text',
					),
				),
			)
		);

		$attributes = $block->get_attributes();

		$this->assertSame(
			array(
				'type'    => 'string',
				'default' => '',
			),
			$attributes['heading']
		);
		$this->assertSame(
			array(
				'type'    => 'number',
				'default' => 0.0,
			),
			$attributes['count']
		);
		$this->assertSame(
			array(
				'type'    => 'array',
				'default' => array(),
			),
			$attributes['items']
		);
	}

	/**
	 * render_from_api() passes the (normalized) attributes to the render callback
	 * rather than reading any form submission.
	 */
	public function test_render_from_api_passes_attributes_to_callback(): void {
		$editor = self::factory()->user->create( array( 'role' => 'editor' ) );
		wp_set_current_user( $editor );

		$block = $this->cf->create_gutenberg_block(
			array(
				'name'            => 'wpcf/render',
				'title'           => 'Render Block',
				'items'           => array(
					array(
						'id'   => 'heading',
						'type' => 'text',
					),
				),
				'render_callback' => static function ( array $attributes ) {
					return 'H:' . ( $attributes['heading'] ?? '' );
				},
			)
		);

		$request = new WP_REST_Request( 'POST', '/x' );
		$request->set_param( 'attributes', array( 'heading' => 'Hello Block' ) );

		$this->assertSame( 'H:Hello Block', $block->render_from_api( $request ) );
	}

	/**
	 * stdClass attribute values (object-typed fields) are normalized to arrays
	 * before reaching the render callback.
	 */
	public function test_render_from_api_normalizes_object_attributes(): void {
		$block = $this->cf->create_gutenberg_block(
			array(
				'name'            => 'wpcf/obj',
				'title'           => 'Obj Block',
				'items'           => array(
					array(
						'id'    => 'meta',
						'type'  => 'group',
						'items' => array(
							array(
								'id'   => 'k',
								'type' => 'text',
							),
						),
					),
				),
				'render_callback' => static function ( array $attributes ) {
					return is_array( $attributes['meta'] ) ? 'array' : 'other';
				},
			)
		);

		$request = new WP_REST_Request( 'POST', '/x' );
		$request->set_param( 'attributes', array( 'meta' => (object) array( 'k' => 'v' ) ) );

		$this->assertSame( 'array', $block->render_from_api( $request ) );
	}
}
