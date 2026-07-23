<?php
/**
 * REST API: route registration, permissions, and the async options endpoint.
 *
 * The REST namespace is derived dynamically from the plugin path, so the tests
 * resolve it via Api::get_rest_namespace() rather than hard-coding it.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\Core;

use WP_REST_Request;
use WP_REST_Server;
use Wpify\CustomFields\Tests\Support\ProbeOptions;
use Wpify\CustomFields\Tests\Support\TestCase;

/**
 * Covers src/Api.php and the per-field async options route.
 */
class ApiTest extends TestCase {
	/**
	 * The REST server used for dispatch.
	 *
	 * @var WP_REST_Server
	 */
	private WP_REST_Server $server;

	/**
	 * Boots a fresh REST server and fires rest_api_init.
	 */
	public function set_up(): void {
		parent::set_up();

		global $wp_rest_server;
		$wp_rest_server = new WP_REST_Server();
		$this->server   = $wp_rest_server;
		do_action( 'rest_api_init', $this->server );
	}

	/**
	 * Tears down the REST server.
	 */
	public function tear_down(): void {
		global $wp_rest_server;
		$wp_rest_server = null;
		parent::tear_down();
	}

	/**
	 * The plugin's namespace and its core routes are registered.
	 */
	public function test_core_routes_registered(): void {
		$namespace = $this->cf->api->get_rest_namespace();
		$routes    = $this->server->get_routes();

		foreach ( array( 'url-title', 'posts', 'terms', 'mapycz-api-key', 'direct-file-upload', 'direct-file-info', 'cloudflare/zones' ) as $route ) {
			$this->assertArrayHasKey(
				'/' . $namespace . '/' . $route,
				$routes,
				sprintf( 'Route %s should be registered.', $route )
			);
		}
	}

	/**
	 * The posts endpoint is forbidden without the edit_posts capability.
	 */
	public function test_posts_endpoint_requires_capability(): void {
		wp_set_current_user( 0 );

		$request = new WP_REST_Request( 'GET', '/' . $this->cf->api->get_rest_namespace() . '/posts' );
		$request->set_param( 'post_type', 'post' );
		$response = $this->server->dispatch( $request );

		$this->assertSame( 401, $response->get_status() );
	}

	/**
	 * An editor can query the posts endpoint and receives an array.
	 */
	public function test_posts_endpoint_returns_data_for_editor(): void {
		$editor = self::factory()->user->create( array( 'role' => 'editor' ) );
		wp_set_current_user( $editor );
		self::factory()->post->create( array( 'post_title' => 'Findable' ) );

		$request = new WP_REST_Request( 'GET', '/' . $this->cf->api->get_rest_namespace() . '/posts' );
		$request->set_param( 'post_type', 'post' );
		$response = $this->server->dispatch( $request );

		$this->assertSame( 200, $response->get_status() );
		$this->assertIsArray( $response->get_data() );
	}

	/**
	 * A field with a callable options list registers a per-key options route
	 * that returns normalized options.
	 */
	public function test_async_options_route(): void {
		$editor = self::factory()->user->create( array( 'role' => 'editor' ) );
		wp_set_current_user( $editor );

		// Register the integration BEFORE (re)firing rest_api_init so its route
		// is picked up by the server.
		new ProbeOptions(
			array(
				'id'    => 'api_probe',
				'items' => array(
					array(
						'id'          => 'country',
						'type'        => 'select',
						'options_key' => 'wpcf_countries',
						'options'     => static fn() => array(
							array(
								'label' => 'Czechia',
								'value' => 'cz',
							),
							array(
								'label' => 'Slovakia',
								'value' => 'sk',
							),
						),
					),
				),
			),
			$this->cf
		);

		global $wp_rest_server;
		$wp_rest_server = new WP_REST_Server();
		$this->server   = $wp_rest_server;
		do_action( 'rest_api_init', $this->server );

		$namespace = $this->cf->api->get_rest_namespace();
		$this->assertArrayHasKey(
			'/' . $namespace . '/options/wpcf_countries',
			$this->server->get_routes()
		);

		$request  = new WP_REST_Request( 'GET', '/' . $namespace . '/options/wpcf_countries' );
		$response = $this->server->dispatch( $request );

		$this->assertSame( 200, $response->get_status() );
		$data = $response->get_data();
		$this->assertSame( 'cz', $data[0]['value'] );
		$this->assertSame( 'Czechia', $data[0]['label'] );
	}
}
