<?php
/**
 * Path resolution: build asset URLs and the API basename across OS path styles.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\Core;

use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * Covers CustomFields::relative_to_content_dir() and its callers.
 */
class PathResolutionTest extends TestCase {

	/**
	 * Provides path / content dir pairs and the expected relative path.
	 *
	 * @return array
	 */
	public function provide_paths(): array {
		return array(
			'posix'                       => array( '/var/www/wp-content/plugins/x/build/a.js', '/var/www/wp-content', 'plugins/x/build/a.js' ),
			'posix trailing slash'        => array( '/var/www/wp-content/plugins/x/build/a.js', '/var/www/wp-content/', 'plugins/x/build/a.js' ),
			'windows mixed separators'    => array( 'C:\\xampp\\htdocs\\wp-content\\plugins\\x\\build\\a.js', 'C:\\xampp\\htdocs/wp-content', 'plugins/x/build/a.js' ),
			'windows backslashes only'    => array( 'C:\\xampp\\htdocs\\wp-content\\plugins\\x\\src', 'C:\\xampp\\htdocs\\wp-content', 'plugins/x/src' ),
			'windows drive letter case'   => array( 'c:\\xampp\\htdocs\\wp-content\\plugins\\x\\src', 'C:/xampp/htdocs/wp-content', 'plugins/x/src' ),
			'sibling dir is not stripped' => array( '/var/www/wp-content-old/plugins/x', '/var/www/wp-content', 'var/www/wp-content-old/plugins/x' ),
		);
	}

	/**
	 * The path is made relative to the content dir regardless of separators.
	 *
	 * @dataProvider provide_paths
	 *
	 * @param string $path        The absolute path.
	 * @param string $content_dir The content directory.
	 * @param string $expected    The expected relative path.
	 */
	public function test_relative_to_content_dir( string $path, string $content_dir, string $expected ): void {
		$this->assertSame( $expected, wpify_custom_fields()->relative_to_content_dir( $path, $content_dir ) );
	}

	/**
	 * Build URLs live under the content URL, not on a filesystem path.
	 */
	public function test_build_url_is_under_content_url(): void {
		$url = wpify_custom_fields()->get_build_url( 'custom-fields.js' );

		$this->assertStringStartsWith( content_url() . '/', $url );
		$this->assertStringEndsWith( '/build/custom-fields.js', $url );
	}

	/**
	 * The API basename is a slash-separated path ending in the plugin dir.
	 */
	public function test_api_basename_is_relative_plugin_dir(): void {
		$basename = wpify_custom_fields()->get_api_basename();

		$this->assertStringEndsWith( '/' . basename( dirname( __DIR__, 3 ) ), $basename );
		$this->assertStringStartsNotWith( '/', $basename );
		$this->assertStringNotContainsString( '\\', $basename );
	}
}
