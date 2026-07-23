<?php
/**
 * Field-type axis: CustomFields::sanitize_item_value() per type.
 *
 * Focuses on hostile and malformed inputs — script injection, invalid numbers,
 * disallowed URL schemes, and nested arrays for structured/multi types.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\Core\FieldType;

use Wpify\CustomFields\Tests\Support\Catalog;
use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * Sanitization behaviour for every field type.
 */
class SanitizationTest extends TestCase {

	/**
	 * Runs a value through the sanitizer for a given item.
	 *
	 * @param array $item  Field item.
	 * @param mixed $value Raw value.
	 *
	 * @return mixed
	 */
	private function sanitize( array $item, mixed $value ): mixed {
		return $this->cf->sanitize_item_value( $item )( $value );
	}

	/**
	 * Text-like fields strip tags and script payloads.
	 */
	public function test_text_strips_script(): void {
		$this->assertSame(
			'hello',
			$this->sanitize( $this->item( 'text' ), '<script>alert(1)</script>hello' )
		);
	}

	/**
	 * Textarea strips scripts but keeps plain text.
	 */
	public function test_textarea_strips_script(): void {
		$this->assertSame(
			'keep this',
			$this->sanitize( $this->item( 'textarea' ), '<script>evil()</script>keep this' )
		);
	}

	/**
	 * URL fields reject the javascript: scheme.
	 */
	public function test_url_rejects_javascript_scheme(): void {
		$this->assertSame( '', $this->sanitize( $this->item( 'url' ), 'javascript:alert(1)' ) );
		$this->assertSame(
			'https://example.com',
			$this->sanitize( $this->item( 'url' ), 'https://example.com' )
		);
	}

	/**
	 * Email fields drop clearly invalid addresses and keep valid ones.
	 */
	public function test_email_sanitization(): void {
		$this->assertSame( 'user@example.com', $this->sanitize( $this->item( 'email' ), 'user@example.com' ) );
		$this->assertSame( '', $this->sanitize( $this->item( 'email' ), 'not-an-email' ) );
	}

	/**
	 * Number/range coerce to float and reject non-numeric or non-scalar input.
	 *
	 * @dataProvider provide_number_types
	 *
	 * @param string $type number or range.
	 */
	public function test_number_coercion( string $type ): void {
		$this->assertSame( 12.5, $this->sanitize( $this->item( $type ), '12.5abc' ) );
		$this->assertSame( 0.0, $this->sanitize( $this->item( $type ), 'not-a-number' ) );
		$this->assertNull( $this->sanitize( $this->item( $type ), array( 'nested' ) ) );
	}

	/**
	 * Number type data provider.
	 *
	 * @return array<string,array{0:string}>
	 */
	public function provide_number_types(): array {
		return array(
			'number' => array( 'number' ),
			'range'  => array( 'range' ),
		);
	}

	/**
	 * Color fields accept valid hex and reject anything else.
	 */
	public function test_color_sanitization(): void {
		$this->assertSame( '#ff0000', $this->sanitize( $this->item( 'color' ), '#ff0000' ) );
		$this->assertNull( $this->sanitize( $this->item( 'color' ), 'red' ) );
		$this->assertNull( $this->sanitize( $this->item( 'color' ), '#zzzzzz' ) );
	}

	/**
	 * Reference fields (attachment/post/term) coerce to a positive integer.
	 *
	 * @dataProvider provide_reference_types
	 *
	 * @param string $type attachment, post or term.
	 */
	public function test_reference_absint( string $type ): void {
		$this->assertSame( 42, $this->sanitize( $this->item( $type ), '42abc' ) );
		$this->assertSame( 5, $this->sanitize( $this->item( $type ), '-5' ) );
		$this->assertSame( 0, $this->sanitize( $this->item( $type ), 'x' ) );
	}

	/**
	 * Reference type data provider.
	 *
	 * @return array<string,array{0:string}>
	 */
	public function provide_reference_types(): array {
		return array(
			'attachment' => array( 'attachment' ),
			'post'       => array( 'post' ),
			'term'       => array( 'term' ),
		);
	}

	/**
	 * Boolean fields coerce common truthy/falsy strings.
	 *
	 * @dataProvider provide_boolean_types
	 *
	 * @param string $type checkbox or toggle.
	 */
	public function test_boolean_coercion( string $type ): void {
		$this->assertTrue( $this->sanitize( $this->item( $type ), '1' ) );
		$this->assertTrue( $this->sanitize( $this->item( $type ), 'true' ) );
		$this->assertFalse( $this->sanitize( $this->item( $type ), '0' ) );
		$this->assertFalse( $this->sanitize( $this->item( $type ), '' ) );
	}

	/**
	 * Boolean type data provider.
	 *
	 * @return array<string,array{0:string}>
	 */
	public function provide_boolean_types(): array {
		return array(
			'checkbox' => array( 'checkbox' ),
			'toggle'   => array( 'toggle' ),
		);
	}

	/**
	 * WYSIWYG/richtext allow post markup but strip scripts.
	 *
	 * @dataProvider provide_richtext_types
	 *
	 * @param string $type wysiwyg or richtext.
	 */
	public function test_richtext_kses( string $type ): void {
		$result = $this->sanitize( $this->item( $type ), '<script>bad()</script><p>ok</p>' );

		$this->assertStringNotContainsString( '<script', $result );
		$this->assertStringContainsString( '<p>ok</p>', $result );
	}

	/**
	 * Richtext type data provider.
	 *
	 * @return array<string,array{0:string}>
	 */
	public function provide_richtext_types(): array {
		return array(
			'wysiwyg'  => array( 'wysiwyg' ),
			'richtext' => array( 'richtext' ),
		);
	}

	/**
	 * Code fields pass through unchanged (raw code is preserved).
	 */
	public function test_code_is_preserved(): void {
		$code = "<?php echo '<script>'; // keep verbatim";
		$this->assertSame( $code, $this->sanitize( $this->item( 'code' ), $code ) );
	}

	/**
	 * The unfiltered flag bypasses sanitization entirely.
	 */
	public function test_unfiltered_flag_bypasses_sanitization(): void {
		$raw = '<script>keep()</script>';
		$this->assertSame(
			$raw,
			$this->sanitize( $this->item( 'text', array( 'unfiltered' => true ) ), $raw )
		);
	}

	/**
	 * Group fields sanitize each child by its own type, from an array value.
	 */
	public function test_group_sanitizes_children_from_array(): void {
		$item = $this->item(
			'group',
			array(
				'items' => array(
					array(
						'id'   => 'name',
						'type' => 'text',
					),
					array(
						'id'   => 'count',
						'type' => 'number',
					),
				),
			)
		);

		$result = $this->sanitize(
			$item,
			array(
				'name'  => '<script>x</script>Jane',
				'count' => '7abc',
			)
		);

		$this->assertSame( 'Jane', $result['name'] );
		$this->assertSame( 7.0, $result['count'] );
	}

	/**
	 * Group fields also accept a JSON-encoded string (the real submitted shape).
	 */
	public function test_group_sanitizes_children_from_json_string(): void {
		$item = $this->item(
			'group',
			array(
				'items' => array(
					array(
						'id'   => 'name',
						'type' => 'text',
					),
				),
			)
		);

		$result = $this->sanitize( $item, wp_json_encode( array( 'name' => 'Bob<script>' ) ) );

		$this->assertSame( 'Bob', $result['name'] );
	}

	/**
	 * Link fields produce a fixed, typed shape.
	 */
	public function test_link_structured_shape(): void {
		$result = $this->sanitize(
			$this->item( 'link' ),
			array(
				'post'      => '15abc',
				'label'     => '<b>Click</b>',
				'url'       => 'https://example.com/x',
				'target'    => '_blank',
				'post_type' => 'page',
			)
		);

		$this->assertSame( 15, $result['post'] );
		$this->assertSame( 'Click', $result['label'] );
		$this->assertSame( 'https://example.com/x', $result['url'] );
		$this->assertSame( '_blank', $result['target'] );
		$this->assertSame( 'page', $result['post_type'] );
	}

	/**
	 * Mapy.cz fields coerce coordinates to float and sanitize address parts.
	 */
	public function test_mapycz_structured_shape(): void {
		$result = $this->sanitize(
			$this->item( 'mapycz' ),
			array(
				'latitude'  => '50.08',
				'longitude' => '14.42',
				'zoom'      => '12',
				'street'    => 'Karlova<script>',
			)
		);

		$this->assertSame( 50.08, $result['latitude'] );
		$this->assertSame( 14.42, $result['longitude'] );
		$this->assertSame( 12.0, $result['zoom'] );
		$this->assertSame( 'Karlova', $result['street'] );
	}

	/**
	 * date_range sanitizes both endpoints, and collapses an empty range to null.
	 */
	public function test_date_range_sanitization(): void {
		$this->assertSame(
			array( '2024-01-01', '2024-12-31' ),
			$this->sanitize( $this->item( 'date_range' ), array( '2024-01-01', '2024-12-31' ) )
		);
		$this->assertNull( $this->sanitize( $this->item( 'date_range' ), array() ) );
		$this->assertNull( $this->sanitize( $this->item( 'date_range' ), array( '', '' ) ) );
	}

	/**
	 * multi_checkbox/multi_toggle sanitize each entry as text.
	 *
	 * @dataProvider provide_multi_scalar_choice_types
	 *
	 * @param string $type multi_checkbox or multi_toggle.
	 */
	public function test_multi_choice_sanitization( string $type ): void {
		$result = $this->sanitize( $this->item( $type ), array( 'a', '<script>x</script>b' ) );

		$this->assertSame( array( 'a', 'b' ), $result );
	}

	/**
	 * Multi choice type data provider.
	 *
	 * @return array<string,array{0:string}>
	 */
	public function provide_multi_scalar_choice_types(): array {
		return array(
			'multi_checkbox' => array( 'multi_checkbox' ),
			'multi_toggle'   => array( 'multi_toggle' ),
		);
	}

	/**
	 * Generic multi_ types sanitize each entry by the underlying single type.
	 */
	public function test_generic_multi_text_sanitizes_each_entry(): void {
		$result = $this->sanitize( $this->item( 'multi_text' ), array( 'hi', '<script>x</script>bye' ) );

		$this->assertSame( array( 'hi', 'bye' ), $result );
	}

	/**
	 * multi_number coerces every entry to float.
	 */
	public function test_multi_number_sanitizes_each_entry(): void {
		$result = $this->sanitize( $this->item( 'multi_number' ), array( '1.5', '2abc', 'x' ) );

		$this->assertSame( array( 1.5, 2.0, 0.0 ), $result );
	}

	/**
	 * multi_post coerces every entry via absint.
	 */
	public function test_multi_post_sanitizes_each_entry(): void {
		$result = $this->sanitize( $this->item( 'multi_post' ), array( '3', '10abc', '-4' ) );

		$this->assertSame( array( 3, 10, 4 ), $result );
	}

	/**
	 * A custom wpifycf_sanitize_{type} filter can post-process the value.
	 */
	public function test_custom_sanitize_filter_runs_last(): void {
		add_filter( 'wpifycf_sanitize_text', static fn( $value ) => strtoupper( $value ) );

		$this->assertSame( 'ABC', $this->sanitize( $this->item( 'text' ), 'abc' ) );
	}

	/**
	 * Every field type sanitizes a representative value without fatal error,
	 * returning null, a scalar, or an array — never throwing.
	 *
	 * @dataProvider provide_all_types
	 *
	 * @param string $type Field type.
	 */
	public function test_all_types_sanitize_without_error( string $type ): void {
		$item  = $this->item( $type );
		$value = $this->sample_value_for( $type, $item );

		$result = $this->sanitize( $item, $value );

		$this->assertTrue(
			null === $result || is_scalar( $result ) || is_array( $result ),
			sprintf( 'Sanitizing type "%s" returned an unexpected shape.', $type )
		);
	}

	/**
	 * Provides every canonical field type.
	 *
	 * @return array<string,array{0:string}>
	 */
	public function provide_all_types(): array {
		$cases = array();
		foreach ( Catalog::all_types() as $type ) {
			$cases[ $type ] = array( $type );
		}
		return $cases;
	}

	/**
	 * Builds a representative value for the sweep, mutating $item by reference
	 * so structured types get the child definitions they require.
	 *
	 * @param string $type Field type.
	 * @param array  $item Item (passed by reference to attach group children).
	 *
	 * @return mixed
	 */
	private function sample_value_for( string $type, array &$item ): mixed {
		if ( 'group' === $type || 'multi_group' === $type ) {
			$item['items'] = array(
				array(
					'id'   => 'child',
					'type' => 'text',
				),
			);
			return 'group' === $type
				? array( 'child' => 'x' )
				: array( array( 'child' => 'x' ) );
		}

		$wp_type = Catalog::wp_types()[ $type ];

		return match ( $wp_type ) {
			'integer' => '7',
			'number'  => '7',
			'boolean' => '1',
			'array'   => array( 'x' ),
			'object'  => array(),
			default   => 'sample',
		};
	}
}
