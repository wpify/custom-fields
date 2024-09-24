<?php

namespace Wpify\CustomFields;

use WP_REST_Request;
use WP_REST_Server;

class Api {
	public function __construct(
		private CustomFields $custom_fields,
		private Helpers $helpers,
	) {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes() {
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
	}

	public function register_rest_route( string $route, string $method, callable $callback, array $args = array() ) {
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

	public function get_rest_namespace() {
		return $this->custom_fields->get_plugin_basename() . '/wpifycf/v1';
	}

	public function permissions_callback() {
		return current_user_can( 'edit_posts' );
	}
}
