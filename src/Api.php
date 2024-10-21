<?php
/**
 * Class Api.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields;

use WP_REST_Request;
use WP_REST_Server;

/**
 * The Api class handles the registration of custom REST API routes
 * for interactions with the CustomFields and Helpers services.
 *
 * It initializes the routes and their respective callbacks to interact
 * with various endpoints, such as url-title, posts, terms, and mapycz-api-key.
 */
class Api {
	/**
	 * Constructor method.
	 *
	 * @param CustomFields $custom_fields An instance of the CustomFields class.
	 * @param Helpers      $helpers An instance of the Helpers class.
	 *
	 * @return void
	 */
	public function __construct(
		private readonly CustomFields $custom_fields,
		private readonly Helpers $helpers,
	) {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Registers the custom REST API routes.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		$this->register_rest_route(
			'url-title',
			WP_REST_Server::READABLE,
			fn( WP_REST_Request $request ) => $this->helpers->get_url_title( $request->get_param( 'url' ) ),
			array(
				'url' => array( 'required' => true ),
			),
		);

		$this->register_rest_route(
			'posts',
			WP_REST_Server::READABLE,
			fn( WP_REST_Request $request ) => $this->helpers->get_posts( $request->get_params() ),
			array(
				'post_type' => array( 'required' => true ),
			),
		);

		$this->register_rest_route(
			'terms',
			WP_REST_Server::READABLE,
			fn( WP_REST_Request $request ) => $this->helpers->get_terms( $request->get_params() ),
			array(
				'taxonomy' => array( 'required' => true ),
			),
		);

		$this->register_rest_route(
			'mapycz-api-key',
			WP_REST_Server::EDITABLE,
			fn( WP_REST_Request $request ) => update_option( 'wpifycf_mapycz_api_key', $request->get_param( 'api_key' ) ),
			array( 'api_key' => array( 'required' => true ) ),
		);

		$this->register_rest_route(
			'mapycz-api-key',
			WP_REST_Server::READABLE,
			fn() => get_option( 'wpifycf_mapycz_api_key' ),
		);
	}

	/**
	 * Registers a REST API route with specified parameters.
	 *
	 * @param string   $route The endpoint route.
	 * @param string   $method The HTTP method (GET, POST, etc.) for this route.
	 * @param callable $callback The callback function to handle the request.
	 * @param array    $args Optional. Array of arguments for the route.
	 *
	 * @return void
	 */
	public function register_rest_route( string $route, string $method, callable $callback, array $args = array() ): void {
		register_rest_route(
			$this->get_rest_namespace(),
			$route,
			array(
				'methods'             => $method,
				'callback'            => $callback,
				'permission_callback' => array( $this, 'permissions_callback' ),
				'args'                => $args,
			),
		);
	}

	/**
	 * Retrieves the REST namespace for the plugin.
	 *
	 * @return string The REST namespace string constructed from the plugin's basename.
	 */
	public function get_rest_namespace(): string {
		return $this->custom_fields->get_plugin_basename() . '/wpifycf/v1';
	}

	/**
	 * Checks if the current user has permission to edit posts.
	 *
	 * @return bool True if the current user can edit posts, false otherwise.
	 */
	public function permissions_callback(): bool {
		return current_user_can( 'edit_posts' );
	}
}
