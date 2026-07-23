<?php
/**
 * Canonical field-type axis: save/load round-trip through the Options integration.
 *
 * Per the two-axis strategy (docs/adr/0002), the field-type axis is exercised
 * once through the Options surface: a POST payload is sanitized and stored via
 * set_fields_from_post_request(), then read back via get_field() and compared.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\Core\Integration;

use Wpify\CustomFields\Integrations\Options;
use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * Options round-trip for every value-bearing field type.
 */
class OptionsRoundTripTest extends TestCase {

	private const OPTION_NAME = 'wpcf_rt';

	/**
	 * Cleans POST state after each test.
	 */
	public function tear_down(): void {
		unset( $_POST[ self::OPTION_NAME ] );
		parent::tear_down();
	}

	/**
	 * Builds a single-field Options page storing into one option array.
	 *
	 * @param array $item Field definition (must contain id + type).
	 *
	 * @return Options
	 */
	private function options_page( array $item ): Options {
		return $this->cf->create_options_page(
			array(
				'page_title'  => 'RT',
				'menu_title'  => 'RT',
				'menu_slug'   => 'wpcf-rt',
				'option_name' => self::OPTION_NAME,
				'items'       => array( $item ),
			)
		);
	}

	/**
	 * Simulates a form submission for one field and returns the reloaded value.
	 *
	 * @param array $item      Field definition.
	 * @param mixed $submitted The value as it would arrive in $_POST.
	 *
	 * @return mixed The value read back through get_field().
	 */
	private function round_trip( array $item, mixed $submitted ): mixed {
		$options = $this->options_page( $item );

		// WordPress populates superglobals slashed; set_fields_from_post_request
		// calls wp_unslash, so mirror the real request by slashing here.
		$_POST[ self::OPTION_NAME ] = wp_slash( array( $item['id'] => $submitted ) );

		$options->set_fields_from_post_request( array( $item ) );

		return $options->get_field( $item['id'], $item );
	}

	/**
	 * Scalar and structured single field types round-trip intact.
	 *
	 * @dataProvider provide_single_types
	 *
	 * @param array $item      Field definition.
	 * @param mixed $submitted Submitted (form) value.
	 * @param mixed $expected  Expected stored value.
	 */
	public function test_single_type_round_trip( array $item, mixed $submitted, mixed $expected ): void {
		$this->assertEquals( $expected, $this->round_trip( $item, $submitted ) );
	}

	/**
	 * Single-type cases.
	 *
	 * @return array<string,array{0:array,1:mixed,2:mixed}>
	 */
	public function provide_single_types(): array {
		$field = static fn( string $type, array $extra = array() ) => array_merge(
			array(
				'id'   => $type . '_f',
				'type' => $type,
			),
			$extra
		);

		return array(
			'text'       => array( $field( 'text' ), 'Hello world', 'Hello world' ),
			'textarea'   => array( $field( 'textarea' ), "a\nb", "a\nb" ),
			'email'      => array( $field( 'email' ), 'user@example.com', 'user@example.com' ),
			'url'        => array( $field( 'url' ), 'https://example.com', 'https://example.com' ),
			'tel'        => array( $field( 'tel' ), '+420123456789', '+420123456789' ),
			'password'   => array( $field( 'password' ), 's3cret', 's3cret' ),
			'select'     => array( $field( 'select' ), 'opt1', 'opt1' ),
			'radio'      => array( $field( 'radio' ), 'r2', 'r2' ),
			'date'       => array( $field( 'date' ), '2024-05-01', '2024-05-01' ),
			'datetime'   => array( $field( 'datetime' ), '2024-05-01T10:00', '2024-05-01T10:00' ),
			'month'      => array( $field( 'month' ), '2024-05', '2024-05' ),
			'week'       => array( $field( 'week' ), '2024-W20', '2024-W20' ),
			'time'       => array( $field( 'time' ), '10:30', '10:30' ),
			'color'      => array( $field( 'color' ), '#00ff00', '#00ff00' ),
			'hidden'     => array( $field( 'hidden' ), 'hv', 'hv' ),
			'code'       => array( $field( 'code' ), "func(){ return '<x>'; }", "func(){ return '<x>'; }" ),
			'richtext'   => array( $field( 'richtext' ), '<p>ok</p>', '<p>ok</p>' ),
			'wysiwyg'    => array( $field( 'wysiwyg' ), '<p>rich</p>', '<p>rich</p>' ),
			'number'     => array( $field( 'number' ), '42', 42.0 ),
			'range'      => array( $field( 'range' ), '3', 3.0 ),
			'checkbox'   => array( $field( 'checkbox' ), '1', true ),
			'toggle'     => array( $field( 'toggle' ), '', false ),
			'attachment' => array( $field( 'attachment' ), '5', 5 ),
			'post'       => array( $field( 'post' ), '7', 7 ),
			'term'       => array( $field( 'term' ), '9', 9 ),
			'group'      => array(
				$field(
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
				),
				wp_json_encode(
					array(
						'name'  => 'Jane',
						'count' => '5',
					)
				),
				array(
					'name'  => 'Jane',
					'count' => 5.0,
				),
			),
			'link'       => array(
				$field( 'link' ),
				wp_json_encode(
					array(
						'post'      => '15',
						'label'     => 'Home',
						'url'       => 'https://example.com',
						'target'    => '_blank',
						'post_type' => 'page',
					)
				),
				array(
					'post'      => 15,
					'label'     => 'Home',
					'url'       => 'https://example.com',
					'target'    => '_blank',
					'post_type' => 'page',
				),
			),
			'mapycz'     => array(
				$field( 'mapycz' ),
				wp_json_encode(
					array(
						'latitude'  => '50.08',
						'longitude' => '14.42',
						'zoom'      => '12',
						'street'    => 'Karlova',
						'number'    => '1',
						'zip'       => '11000',
						'city'      => 'Praha',
						'cityPart'  => 'Stare Mesto',
						'country'   => 'CZ',
					)
				),
				array(
					'latitude'  => 50.08,
					'longitude' => 14.42,
					'zoom'      => 12.0,
					'street'    => 'Karlova',
					'number'    => '1',
					'zip'       => '11000',
					'city'      => 'Praha',
					'cityPart'  => 'Stare Mesto',
					'country'   => 'CZ',
				),
			),
			'date_range' => array(
				$field( 'date_range' ),
				wp_json_encode( array( '2024-01-01', '2024-12-31' ) ),
				array( '2024-01-01', '2024-12-31' ),
			),
		);
	}

	/**
	 * Multi field types round-trip as arrays with per-entry sanitization.
	 *
	 * @dataProvider provide_multi_types
	 *
	 * @param array $item      Field definition.
	 * @param mixed $submitted Submitted (JSON) value.
	 * @param mixed $expected  Expected stored value.
	 */
	public function test_multi_type_round_trip( array $item, mixed $submitted, mixed $expected ): void {
		$this->assertEquals( $expected, $this->round_trip( $item, $submitted ) );
	}

	/**
	 * Multi-type cases.
	 *
	 * @return array<string,array{0:array,1:mixed,2:mixed}>
	 */
	public function provide_multi_types(): array {
		$field = static fn( string $type, array $extra = array() ) => array_merge(
			array(
				'id'   => $type . '_f',
				'type' => $type,
			),
			$extra
		);

		return array(
			'multi_text'       => array( $field( 'multi_text' ), wp_json_encode( array( 'a', 'b' ) ), array( 'a', 'b' ) ),
			'multi_textarea'   => array( $field( 'multi_textarea' ), wp_json_encode( array( "x\ny" ) ), array( "x\ny" ) ),
			'multi_email'      => array( $field( 'multi_email' ), wp_json_encode( array( 'a@b.com', 'c@d.com' ) ), array( 'a@b.com', 'c@d.com' ) ),
			'multi_url'        => array( $field( 'multi_url' ), wp_json_encode( array( 'https://a.test' ) ), array( 'https://a.test' ) ),
			'multi_tel'        => array( $field( 'multi_tel' ), wp_json_encode( array( '+420' ) ), array( '+420' ) ),
			'multi_select'     => array( $field( 'multi_select' ), wp_json_encode( array( 'x', 'y' ) ), array( 'x', 'y' ) ),
			'multi_checkbox'   => array( $field( 'multi_checkbox' ), wp_json_encode( array( 'a', 'b' ) ), array( 'a', 'b' ) ),
			'multi_toggle'     => array( $field( 'multi_toggle' ), wp_json_encode( array( 'on' ) ), array( 'on' ) ),
			'multi_number'     => array( $field( 'multi_number' ), wp_json_encode( array( '1.5', '2' ) ), array( 1.5, 2.0 ) ),
			'multi_date'       => array( $field( 'multi_date' ), wp_json_encode( array( '2024-01-01' ) ), array( '2024-01-01' ) ),
			'multi_datetime'   => array( $field( 'multi_datetime' ), wp_json_encode( array( '2024-01-01T09:00' ) ), array( '2024-01-01T09:00' ) ),
			'multi_month'      => array( $field( 'multi_month' ), wp_json_encode( array( '2024-01' ) ), array( '2024-01' ) ),
			'multi_week'       => array( $field( 'multi_week' ), wp_json_encode( array( '2024-W01' ) ), array( '2024-W01' ) ),
			'multi_time'       => array( $field( 'multi_time' ), wp_json_encode( array( '08:15' ) ), array( '08:15' ) ),
			'multi_post'       => array( $field( 'multi_post' ), wp_json_encode( array( '3', '4' ) ), array( 3, 4 ) ),
			'multi_term'       => array( $field( 'multi_term' ), wp_json_encode( array( '5', '6' ) ), array( 5, 6 ) ),
			'multi_attachment' => array( $field( 'multi_attachment' ), wp_json_encode( array( '7' ) ), array( 7 ) ),
			'multi_richtext'   => array( $field( 'multi_richtext' ), wp_json_encode( array( '<p>a</p>' ) ), array( '<p>a</p>' ) ),
			'multi_date_range' => array(
				$field( 'multi_date_range' ),
				wp_json_encode( array( array( '2024-01-01', '2024-02-01' ) ) ),
				array( array( '2024-01-01', '2024-02-01' ) ),
			),
			'multi_link'       => array(
				$field( 'multi_link' ),
				wp_json_encode(
					array(
						array(
							'post'  => '2',
							'label' => 'L',
							'url'   => 'https://x.test',
						),
					)
				),
				array(
					array(
						'post'      => 2,
						'label'     => 'L',
						'url'       => 'https://x.test',
						'target'    => '',
						'post_type' => '',
					),
				),
			),
			'multi_group'      => array(
				$field(
					'multi_group',
					array(
						'items' => array(
							array(
								'id'   => 'name',
								'type' => 'text',
							),
						),
					)
				),
				wp_json_encode(
					array(
						array( 'name' => 'A' ),
						array( 'name' => 'B' ),
					)
				),
				array(
					array( 'name' => 'A' ),
					array( 'name' => 'B' ),
				),
			),
		);
	}
}
