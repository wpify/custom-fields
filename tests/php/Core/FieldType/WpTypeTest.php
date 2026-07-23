<?php
/**
 * Field-type axis: wpifycf get_wp_type() mapping and its filter.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\Core\FieldType;

use Wpify\CustomFields\Tests\Support\Catalog;
use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * Covers CustomFields::get_wp_type() for every field type plus the
 * wpifycf_wp_type_{type} override filter.
 */
class WpTypeTest extends TestCase {

	/**
	 * Every field type maps to its documented WordPress data type.
	 *
	 * @dataProvider provide_types
	 *
	 * @param string $type     Field type.
	 * @param string $expected Expected wp_type.
	 */
	public function test_wp_type_mapping( string $type, string $expected ): void {
		$this->assertSame( $expected, $this->cf->get_wp_type( $this->item( $type ) ) );
	}

	/**
	 * Data provider: type => expected wp_type.
	 *
	 * @return array<string,array{0:string,1:string}>
	 */
	public function provide_types(): array {
		$cases = array();
		foreach ( Catalog::wp_types() as $type => $wp_type ) {
			$cases[ $type ] = array( $type, $wp_type );
		}
		return $cases;
	}

	/**
	 * The wpifycf_wp_type_{type} filter overrides the computed type.
	 */
	public function test_wp_type_filter_overrides(): void {
		add_filter( 'wpifycf_wp_type_text', static fn() => 'integer' );

		$this->assertSame( 'integer', $this->cf->get_wp_type( $this->item( 'text' ) ) );
	}

	/**
	 * An unknown/custom field type falls back to string.
	 */
	public function test_unknown_type_defaults_to_string(): void {
		$this->assertSame( 'string', $this->cf->get_wp_type( $this->item( 'totally_custom_type' ) ) );
	}
}
