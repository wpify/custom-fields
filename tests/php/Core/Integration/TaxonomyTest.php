<?php
/**
 * Integration axis: Taxonomy (term meta) save/load round-trip.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\Core\Integration;

use Wpify\CustomFields\Tests\Support\RepresentativeFieldSet;
use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * Taxonomy stores the representative field set as term meta.
 */
class TaxonomyTest extends TestCase {
	use RepresentativeFieldSet;

	/**
	 * The representative fields round-trip through the taxonomy save path.
	 */
	public function test_taxonomy_round_trip(): void {
		$term_id = self::factory()->term->create( array( 'taxonomy' => 'category' ) );

		$taxonomy = $this->cf->create_taxonomy_options(
			array(
				'taxonomy' => 'category',
				'items'    => $this->representative_items(),
			)
		);

		$_POST = wp_slash( $this->representative_post_values() );

		$taxonomy->save( $term_id );

		$this->assert_representative_round_trip( $taxonomy );

		// Cross-check the raw term meta store as well.
		$this->assertEquals(
			$this->representative_expected()['rep_mg'],
			get_term_meta( $term_id, 'rep_mg', true )
		);
	}
}
