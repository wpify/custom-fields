<?php
/**
 * Integration axis: Comment (comment meta) save/load round-trip.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\Core\Integration;

use Wpify\CustomFields\Tests\Support\RepresentativeFieldSet;
use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * Comment integration stores the representative field set as comment meta.
 */
class CommentTest extends TestCase {
	use RepresentativeFieldSet;

	/**
	 * The representative fields round-trip through the comment save path.
	 */
	public function test_comment_round_trip(): void {
		$admin = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin );

		$comment_id = self::factory()->comment->create();

		$comment = $this->cf->create_comment_metabox(
			array(
				'items' => $this->representative_items(),
			)
		);

		$_POST = wp_slash(
			array_merge(
				$this->representative_post_values(),
				array( $comment->nonce => wp_create_nonce( $comment->id ) )
			)
		);

		$comment->save_meta_box( $comment_id );

		$this->assert_representative_round_trip( $comment );
	}
}
