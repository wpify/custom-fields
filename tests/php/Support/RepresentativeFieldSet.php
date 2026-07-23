<?php
/**
 * Shared representative field set for the integration-axis tests.
 *
 * Per docs/adr/0002 the integration axis is exercised with a small set of
 * fields per surface rather than every type: a scalar (text), a choice
 * (select), and a nested repeater (multi_group). Each surface test sets up its
 * host object, submits these values, and asserts they round-trip.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\Support;

/**
 * Provides the representative items, submitted values, and expected results.
 */
trait RepresentativeFieldSet {
	/**
	 * Field definitions passed to the integration under test.
	 *
	 * @return array<int,array>
	 */
	protected function representative_items(): array {
		return array(
			array(
				'id'   => 'rep_text',
				'type' => 'text',
			),
			array(
				'id'      => 'rep_select',
				'type'    => 'select',
				'options' => array(
					'a' => 'A',
					'b' => 'B',
				),
			),
			array(
				'id'    => 'rep_mg',
				'type'  => 'multi_group',
				'items' => array(
					array(
						'id'   => 'child',
						'type' => 'text',
					),
				),
			),
		);
	}

	/**
	 * Values as they would arrive in $_POST (before slashing).
	 *
	 * @return array<string,string>
	 */
	protected function representative_post_values(): array {
		return array(
			'rep_text'   => 'Hello world',
			'rep_select' => 'b',
			'rep_mg'     => wp_json_encode(
				array(
					array( 'child' => 'A' ),
					array( 'child' => 'B' ),
				)
			),
		);
	}

	/**
	 * Expected stored values after a round-trip.
	 *
	 * @return array<string,mixed>
	 */
	protected function representative_expected(): array {
		return array(
			'rep_text'   => 'Hello world',
			'rep_select' => 'b',
			'rep_mg'     => array(
				array( 'child' => 'A' ),
				array( 'child' => 'B' ),
			),
		);
	}

	/**
	 * Returns the item definition for a given id.
	 *
	 * @param string $id Field id.
	 *
	 * @return array
	 */
	protected function representative_item( string $id ): array {
		foreach ( $this->representative_items() as $item ) {
			if ( $item['id'] === $id ) {
				return $item;
			}
		}
		return array();
	}

	/**
	 * Asserts every representative field round-tripped through the integration.
	 *
	 * @param object $integration Integration exposing get_field().
	 */
	protected function assert_representative_round_trip( object $integration ): void {
		foreach ( $this->representative_expected() as $id => $expected ) {
			$this->assertEquals(
				$expected,
				$integration->get_field( $id, $this->representative_item( $id ) ),
				sprintf( 'Field "%s" did not round-trip.', $id )
			);
		}
	}
}
