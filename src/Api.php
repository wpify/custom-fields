<?php

namespace WpifyCustomFields;

use WP_Post;
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

		register_rest_route( $this->get_namespace(), '/posts', array(
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'get_posts' ),
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

	/**
	 * @param WP_REST_Request $request
	 *
	 * @return WP_REST_Response
	 */
	public function get_posts( WP_REST_Request $request ): WP_REST_Response {
		$params = $request->get_params();

		$query_args = ( ! empty( $params['query_args'] ) && is_array( $params['query_args'] ) )
			? array()
			: $params['query_args'];

		$query_args = wp_parse_args( $query_args, array(
			'post_type'      => $params['post_type'],
			'posts_per_page' => 20,
			's'              => $params['search'],
		) );

		$current_posts = ! empty( $params['current_value'] ) ? get_posts( array(
			'post_type'      => $query_args['post_type'],
			'include'        => $params['current_value'],
			'posts_per_page' => - 1,
		) ) : array();

		$query_args['exclude'] = array_map( function ( WP_Post $post ) {
			return $post->ID;
		}, $current_posts );

		$query_args = apply_filters(
			'wcf_get_posts_args',
			$query_args,
			$params,
		);

		$posts = array_merge( $current_posts, get_posts( $query_args ) );

		$response = array_map( array( $this, 'transform_post_for_select' ), $posts );

		return new WP_REST_Response( $response, 200 );
	}

	/**
	 * @param WP_Post $post
	 *
	 * @return array
	 */
	private function transform_post_for_select( WP_Post $post ): array {
		return array(
			'value'     => $post->ID,
			'label'     => get_the_title( $post ) . ' [ID ' . $post->ID . ']',
			'excerpt'   => get_the_excerpt( $post ),
			'thumbnail' => get_the_post_thumbnail_url( $post ),
		);
	}
}
