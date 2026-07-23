<?php
/**
 * Field-type axis: wpifycf get_default_value() and its filter.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\Core\FieldType;

use stdClass;
use Wpify\CustomFields\Tests\Support\Catalog;
use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * Covers CustomFields::get_default_value() per wp_type, the date_range and
 * layout special-cases, explicit defaults, and the override filter.
 */
class DefaultValueTest extends TestCase {

	/**
	 * The computed default matches the wp_type for every field type.
	 *
	 * @dataProvider provide_types
	 *
	 * @param string $type    Field type.
	 * @param string $wp_type Expected wp_type (drives the expected default).
	 */
	public function test_default_value_per_type( string $type, string $wp_type ): void {
		$default = $this->cf->get_default_value( $this->item( $type ) );

		// Layout wrappers and date_range are explicit null special-cases.
		if ( in_array( $type, array( 'wrapper', 'columns', 'date_range' ), true ) ) {
			$this->assertNull( $default );
			return;
		}

		switch ( $wp_type ) {
			case 'integer':
				$this->assertSame( 0, $default );
				break;
			case 'number':
				$this->assertSame( 0.0, $default );
				break;
			case 'boolean':
				$this->assertFalse( $default );
				break;
			case 'array':
				$this->assertSame( array(), $default );
				break;
			case 'object':
				$this->assertEquals( new stdClass(), $default );
				break;
			default:
				$this->assertSame( '', $default );
		}
	}

	/**
	 * Data provider: type => wp_type.
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
	 * An explicit default on the item wins over the computed default.
	 */
	public function test_explicit_default_is_respected(): void {
		$this->assertSame(
			'hello',
			$this->cf->get_default_value( $this->item( 'text', array( 'default' => 'hello' ) ) )
		);
	}

	/**
	 * The wpifycf_default_value_{type} filter overrides the default.
	 */
	public function test_default_value_filter_overrides(): void {
		add_filter( 'wpifycf_default_value_number', static fn() => 42.5 );

		$this->assertSame( 42.5, $this->cf->get_default_value( $this->item( 'number' ) ) );
	}

	/**
	 * date_range defaults to null even when no explicit default is given.
	 */
	public function test_date_range_default_is_null(): void {
		$this->assertNull( $this->cf->get_default_value( $this->item( 'date_range' ) ) );
	}
}
