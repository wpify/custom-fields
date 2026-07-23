<?php
/**
 * Field-type axis: BaseIntegration::normalize_items() behaviour.
 *
 * Covers id / global_id generation, alias resolution, key remapping, default
 * backfill, nested normalization, and MissingArgumentException fail-fast.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\Core\FieldType;

use Wpify\CustomFields\Exceptions\MissingArgumentException;
use Wpify\CustomFields\Tests\Support\Catalog;
use Wpify\CustomFields\Tests\Support\ProbeOptions;
use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * Normalization and constructor fail-fast.
 */
class NormalizeItemsTest extends TestCase {

	/**
	 * Builds a probe integration with the given id.
	 *
	 * @param string $id Instance id.
	 *
	 * @return ProbeOptions
	 */
	private function probe( string $id = 'inst1' ): ProbeOptions {
		return new ProbeOptions( array( 'id' => $id ), $this->cf );
	}

	/**
	 * A string array key becomes the item id when none is given.
	 */
	public function test_string_key_becomes_id(): void {
		$items = $this->probe()->normalize( array( 'my_field' => array( 'type' => 'text' ) ) );

		$this->assertSame( 'my_field', $items[0]['id'] );
	}

	/**
	 * A missing id with a numeric key is auto-generated and unique.
	 */
	public function test_missing_id_is_generated(): void {
		$items = $this->probe()->normalize(
			array(
				array( 'type' => 'text' ),
				array( 'type' => 'number' ),
			)
		);

		$this->assertNotEmpty( $items[0]['id'] );
		$this->assertNotEmpty( $items[1]['id'] );
		$this->assertNotSame( $items[0]['id'], $items[1]['id'] );
	}

	/**
	 * global_id is composed from the instance id and the item id.
	 */
	public function test_global_id_composition(): void {
		$items = $this->probe( 'inst42' )->normalize( array( 'foo' => array( 'type' => 'text' ) ) );

		$this->assertSame( 'inst42__foo', $items[0]['global_id'] );
	}

	/**
	 * Every backward-compat alias resolves to its canonical type.
	 *
	 * @dataProvider provide_aliases
	 *
	 * @param string $alias     Alias type.
	 * @param string $canonical Canonical type.
	 */
	public function test_alias_resolution( string $alias, string $canonical ): void {
		$items = $this->probe()->normalize( array( 'f' => array( 'type' => $alias ) ) );

		$this->assertSame( $canonical, $items[0]['type'] );
	}

	/**
	 * Alias data provider.
	 *
	 * @return array<string,array{0:string,1:string}>
	 */
	public function provide_aliases(): array {
		$cases = array();
		foreach ( Catalog::aliases() as $alias => $canonical ) {
			$cases[ $alias ] = array( $alias, $canonical );
		}
		return $cases;
	}

	/**
	 * A default value is backfilled when none is supplied.
	 */
	public function test_default_is_backfilled(): void {
		$items = $this->probe()->normalize( array( 'n' => array( 'type' => 'number' ) ) );

		$this->assertArrayHasKey( 'default', $items[0] );
		$this->assertSame( 0.0, $items[0]['default'] );
	}

	/**
	 * Legacy and alternate keys are remapped onto their canonical names.
	 */
	public function test_key_remapping(): void {
		$items = $this->probe()->normalize(
			array(
				'f' => array(
					'type'              => 'text',
					'title'             => 'My Title',
					'desc'              => 'My description',
					'classname'         => 'my-class',
					'custom_attributes' => array( 'data-x' => '1' ),
				),
			)
		);

		$item = $items[0];
		$this->assertSame( 'My Title', $item['label'] );
		$this->assertSame( 'My description', $item['description'] );
		$this->assertSame( 'my-class', $item['className'] );
		$this->assertSame( array( 'data-x' => '1' ), $item['attributes'] );
	}

	/**
	 * Group children are normalized and inherit the parent global_id prefix.
	 */
	public function test_nested_group_children_are_normalized(): void {
		$items = $this->probe( 'inst1' )->normalize(
			array(
				'grp' => array(
					'type'  => 'group',
					'items' => array(
						'child' => array( 'type' => 'text' ),
					),
				),
			)
		);

		$group = $items[0];
		$this->assertSame( 'inst1__grp', $group['global_id'] );
		$this->assertSame( 'child', $group['items'][0]['id'] );
		$this->assertSame( 'inst1__grp__child', $group['items'][0]['global_id'] );
	}

	/**
	 * Wrapper children keep the parent-level global_id (wrappers do not nest values).
	 */
	public function test_wrapper_children_keep_parent_global_id(): void {
		$items = $this->probe( 'inst1' )->normalize(
			array(
				'wrap' => array(
					'type'  => 'wrapper',
					'items' => array(
						'inner' => array( 'type' => 'text' ),
					),
				),
			)
		);

		$this->assertSame( 'inst1__inner', $items[0]['items'][0]['global_id'] );
	}

	/**
	 * A callable options list becomes an async options endpoint definition.
	 */
	public function test_callable_options_become_async(): void {
		$items = $this->probe()->normalize(
			array(
				'sel' => array(
					'type'    => 'select',
					'options' => static fn() => array(
						array(
							'label' => 'A',
							'value' => 'a',
						),
					),
				),
			)
		);

		$item = $items[0];
		$this->assertTrue( $item['async'] );
		$this->assertArrayHasKey( 'options_callback', $item );
		$this->assertNotEmpty( $item['options_key'] );
	}

	/**
	 * The wpifycf_items filter can post-process normalized items.
	 */
	public function test_items_filter_runs(): void {
		add_filter(
			'wpifycf_items',
			static function ( array $items ) {
				$items[0]['tagged'] = true;
				return $items;
			}
		);

		$items = $this->probe()->normalize( array( 'f' => array( 'type' => 'text' ) ) );

		$this->assertTrue( $items[0]['tagged'] );
	}

	/**
	 * Options fails fast when required page arguments are missing.
	 */
	public function test_options_missing_arguments_throws(): void {
		$this->expectException( MissingArgumentException::class );

		$this->cf->create_options_page( array( 'items' => array() ) );
	}

	/**
	 * Options rejects an invalid page type.
	 */
	public function test_options_invalid_type_throws(): void {
		$this->expectException( MissingArgumentException::class );

		$this->cf->create_options_page(
			array(
				'page_title' => 'X',
				'menu_title' => 'X',
				'menu_slug'  => 'x',
				'type'       => 'nonsense',
			)
		);
	}

	/**
	 * Taxonomy fails fast when the taxonomy argument is missing.
	 */
	public function test_taxonomy_missing_argument_throws(): void {
		$this->expectException( MissingArgumentException::class );

		$this->cf->create_taxonomy_options( array( 'items' => array() ) );
	}
}
