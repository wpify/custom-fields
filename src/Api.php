<?php

namespace WpifyCustomFields;

use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

final class Api extends WP_REST_Controller {
	protected $rest_base = 'wcf';

	/**
	 * Api constructor.
	 */
	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * @return void
	 */
	public function register_routes() {
		register_rest_route( $this->get_namespace(), '/list', array(
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'get_list' ),
				'permission_callback' => function () {
					return current_user_can( 'read' );
				},
			)
		) );
	}

	/**
	 * @param int $version
	 *
	 * @return string
	 */
	private function get_namespace( $version = 1 ): string {
		return $this->rest_base . '/v' . $version;
	}

	/**
	 * @param int $version
	 *
	 * @return string
	 */
	public function get_rest_url( $version = 1 ): string {
		return rest_url( $this->get_namespace( $version ) );
	}

	/**
	 * @return false|string
	 */
	public function get_rest_nonce() {
		return wp_create_nonce( 'wp_rest' );
	}

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return WP_REST_Response
	 */
	public function get_list( WP_REST_Request $request ): WP_REST_Response {
		$response = apply_filters( 'wcf_get_list', array(), $request->get_params() );

		return new WP_REST_Response( $response, 200 );
	}
}
