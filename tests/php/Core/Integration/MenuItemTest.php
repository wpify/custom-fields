<?php
/**
 * Integration axis: MenuItem (nav-menu-item meta) save/load round-trip.
 *
 * MenuItem is index-suffixed by the menu-item id (it passes the db id as the
 * loop id), so the submitted names are nested under that id.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\Core\Integration;

use Wpify\CustomFields\Tests\Support\RepresentativeFieldSet;
use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * MenuItem integration stores the representative field set as post meta.
 */
class MenuItemTest extends TestCase {
	use RepresentativeFieldSet;

	/**
	 * The representative fields round-trip through the menu-item save path,
	 * with the field names nested under the menu-item id (loop id).
	 */
	public function test_menu_item_round_trip(): void {
		// A nav_menu_item is just a post; any post id works as the storage id.
		$menu_item_db_id = self::factory()->post->create( array( 'post_type' => 'nav_menu_item' ) );

		$menu_item = $this->cf->create_menu_item_options(
			array(
				'items' => $this->representative_items(),
			)
		);

		$nested = array();
		foreach ( $this->representative_post_values() as $id => $value ) {
			$nested[ $id ] = array( $menu_item_db_id => $value );
		}
		$_POST = wp_slash( $nested );

		$menu_item->save( 0, $menu_item_db_id );

		$this->assert_representative_round_trip( $menu_item );
	}
}
