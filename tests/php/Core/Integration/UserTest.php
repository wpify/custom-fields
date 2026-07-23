<?php
/**
 * Integration axis: User (user meta) save/load round-trip.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\Core\Integration;

use Wpify\CustomFields\Tests\Support\RepresentativeFieldSet;
use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * User integration stores the representative field set as user meta.
 */
class UserTest extends TestCase {
	use RepresentativeFieldSet;

	/**
	 * The representative fields round-trip through the user save path.
	 */
	public function test_user_round_trip(): void {
		$user_id = self::factory()->user->create( array( 'role' => 'subscriber' ) );

		$user = $this->cf->create_user_options(
			array(
				'items' => $this->representative_items(),
			)
		);

		$_POST = wp_slash( $this->representative_post_values() );

		$user->save( $user_id );

		$this->assert_representative_round_trip( $user );

		$this->assertSame( 'Hello world', get_user_meta( $user_id, 'rep_text', true ) );
	}
}
