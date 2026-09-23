<?php
/**
 * Field-type axis: wpifycf collect_async_values() value-scope handling across
 * group, multi_group and layout wrappers (wrapper, columns).
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\Core\FieldType;

use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * Covers CustomFields::collect_async_values(): the per-options_key map of
 * selected values that feeds data-preresolved-options. Layout wrappers have no
 * id or value, so the enclosing value scope must pass through them unchanged.
 */
class CollectAsyncValuesTest extends TestCase {

	/**
	 * Builds an async leaf field using a callback that never returns options,
	 * so nothing but the collected values can make a test pass.
	 *
	 * @param string $id          Field id.
	 * @param string $options_key Options key.
	 * @param string $type        Field type.
	 * @param array  $extra       Extra keys to merge.
	 *
	 * @return array
	 */
	private function leaf( string $id, string $options_key, string $type = 'multi_select', array $extra = array() ): array {
		return array_merge(
			array(
				'id'               => $id,
				'type'             => $type,
				'options_key'      => $options_key,
				'options_callback' => '__return_empty_array',
			),
			$extra
		);
	}

	/**
	 * Wraps items in a layout container.
	 *
	 * @param string $type  `wrapper` or `columns`.
	 * @param array  $items Child items.
	 *
	 * @return array
	 */
	private function layout( string $type, array $items ): array {
		$item = array(
			'type'  => $type,
			'items' => $items,
		);

		if ( 'columns' === $type ) {
			$item['columns'] = 2;
		}

		return $item;
	}

	/**
	 * Baseline: an async field directly inside a multi_group collects each row.
	 */
	public function test_multi_group_direct_child(): void {
		$items = array(
			array(
				'id'    => 'group',
				'type'  => 'multi_group',
				'value' => array(
					array( 'terms' => array( '69' ) ),
					array( 'terms' => array( '70', '71' ) ),
				),
				'items' => array( $this->leaf( 'terms', 'direct' ) ),
			),
		);

		$this->assertSame(
			array( 'direct' => array( '69', '70', '71' ) ),
			$this->cf->collect_async_values( $items, array() )
		);
	}

	/**
	 * The reported bug: the same field wrapped in a layout container inside a
	 * multi_group must still see the row values.
	 *
	 * @dataProvider provide_layout_types
	 *
	 * @param string $layout Layout wrapper type.
	 */
	public function test_multi_group_child_inside_layout( string $layout ): void {
		$items = array(
			array(
				'id'    => 'group',
				'type'  => 'multi_group',
				'value' => array(
					array( 'terms' => array( '69' ) ),
					array( 'terms' => array( '70' ) ),
				),
				'items' => array(
					$this->layout( $layout, array( $this->leaf( 'terms', 'in_layout' ) ) ),
				),
			),
		);

		$this->assertSame(
			array( 'in_layout' => array( '69', '70' ) ),
			$this->cf->collect_async_values( $items, array() )
		);
	}

	/**
	 * A single-value select wrapped in a layout container inside a multi_group.
	 */
	public function test_multi_group_single_select_inside_wrapper(): void {
		$items = array(
			array(
				'id'    => 'group',
				'type'  => 'multi_group',
				'value' => array(
					array( 'term' => '5' ),
					array( 'term' => '' ),
				),
				'items' => array(
					$this->layout( 'wrapper', array( $this->leaf( 'term', 'single', 'select' ) ) ),
				),
			),
		);

		$this->assertSame(
			array( 'single' => array( '5' ) ),
			$this->cf->collect_async_values( $items, array() )
		);
	}

	/**
	 * Double nesting: multi_group > group > columns > leaf.
	 */
	public function test_multi_group_group_columns_leaf(): void {
		$items = array(
			array(
				'id'    => 'rows',
				'type'  => 'multi_group',
				'value' => array(
					array( 'inner' => array( 'terms' => array( '1', '2' ) ) ),
				),
				'items' => array(
					array(
						'id'    => 'inner',
						'type'  => 'group',
						'items' => array(
							$this->layout( 'columns', array( $this->leaf( 'terms', 'deep' ) ) ),
						),
					),
				),
			),
		);

		$this->assertSame(
			array( 'deep' => array( '1', '2' ) ),
			$this->cf->collect_async_values( $items, array() )
		);
	}

	/**
	 * A group whose value arrives via $values (not item['value']) passes its
	 * object scope through a nested wrapper.
	 */
	public function test_group_wrapper_leaf_from_values_argument(): void {
		$items = array(
			array(
				'id'    => 'settings',
				'type'  => 'group',
				'items' => array(
					$this->layout( 'wrapper', array( $this->leaf( 'terms', 'grouped' ) ) ),
				),
			),
		);

		$values = array( 'settings' => array( 'terms' => array( '9' ) ) );

		$this->assertSame(
			array( 'grouped' => array( '9' ) ),
			$this->cf->collect_async_values( $items, $values )
		);
	}

	/**
	 * Top-level layout wrappers keep working with prepared items that carry
	 * their own value.
	 *
	 * @dataProvider provide_layout_types
	 *
	 * @param string $layout Layout wrapper type.
	 */
	public function test_top_level_layout_with_prepared_values( string $layout ): void {
		$items = array(
			$this->layout(
				$layout,
				array(
					$this->leaf( 'a', 'top', 'select', array( 'value' => '3' ) ),
					$this->leaf( 'b', 'top', 'multi_select', array( 'value' => array( '4', '' ) ) ),
				)
			),
		);

		$this->assertSame(
			array( 'top' => array( '3', '4' ) ),
			$this->cf->collect_async_values( $items, array() )
		);
	}

	/**
	 * Fields with cache_options=false are collected too: their saved values
	 * still need labels even though the browse list is per-field.
	 */
	public function test_cache_options_false_inside_columns_is_collected(): void {
		$items = array(
			array(
				'id'    => 'group',
				'type'  => 'multi_group',
				'value' => array( array( 'terms' => array( '69' ) ) ),
				'items' => array(
					$this->layout(
						'columns',
						array( $this->leaf( 'terms', 'dependent', 'multi_select', array( 'cache_options' => false ) ) )
					),
				),
			),
		);

		$this->assertSame( array( 'dependent' => array( '69' ) ), $this->cf->collect_async_values( $items, array() ) );
	}

	/**
	 * Layout wrapper types.
	 *
	 * @return array<string, array{0: string}>
	 */
	public function provide_layout_types(): array {
		return array(
			'wrapper' => array( 'wrapper' ),
			'columns' => array( 'columns' ),
		);
	}
}
