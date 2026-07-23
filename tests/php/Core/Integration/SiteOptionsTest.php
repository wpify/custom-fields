<?php
/**
 * Integration axis: SiteOptions save/load round-trip.
 *
 * SiteOptions::save_site_options() ends in wp_safe_redirect()/exit, so the test
 * drives the shared set_fields_from_post_request() path directly (the same call
 * the save handler makes) and reads back through get_field().
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\Core\Integration;

use Wpify\CustomFields\Tests\Support\RepresentativeFieldSet;
use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * SiteOptions integration stores the representative field set as blog options.
 */
class SiteOptionsTest extends TestCase {
	use RepresentativeFieldSet;

	/**
	 * The representative fields round-trip through the site-options save path.
	 */
	public function test_site_options_round_trip(): void {
		if ( ! is_multisite() ) {
			$this->markTestSkipped( 'SiteOptions stores blog options and requires a multisite install (run with WP_MULTISITE=1).' );
		}

		$_REQUEST['id'] = get_current_blog_id();

		$site_options = $this->cf->create_site_options(
			array(
				'page_title' => 'Site Opts',
				'menu_title' => 'Site Opts',
				'menu_slug'  => 'wpcf-site-opts',
				'items'      => $this->representative_items(),
			)
		);

		$_POST = wp_slash( $this->representative_post_values() );

		// save_site_options() would exit; call the identical persistence step.
		$site_options->set_fields_from_post_request( $this->representative_items() );

		$this->assert_representative_round_trip( $site_options );

		unset( $_REQUEST['id'] );
	}
}
