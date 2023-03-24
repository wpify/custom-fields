<?php

namespace Wpify\CustomFields;

use WP_Post;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

final class Api extends WP_REST_Controller {
	protected $rest_base = 'wcf';
	/**
	 * @var CustomFields
	 */
	private $wcf;

	private $rest_url;
	/**
	 * Api constructor.
	 */
	public function __construct( CustomFields $wcf ) {
		$this->wcf = $wcf;

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

		register_rest_route( $this->get_namespace(), '/options', array(
			array(
				'methods'             => WP_REST_Server::ALLMETHODS,
				'callback'            => array( $this, 'get_options' ),
				'permission_callback' => function () {
					return current_user_can( 'read' );
				},
			)
		) );
	}

	/**
	 * @return string
	 */
	private function get_namespace(): string {
		return $this->rest_base . '/' . substr( md5( __FILE__ ), 0, 10 );
	}

	/**
	 * @return string
	 */
	public function get_rest_url(): string {
		if (!$this->rest_url) {
			$this->rest_url = rest_url( $this->get_namespace() );
		}
		return $this->rest_url;
	}

	/**
	 * @return string
	 */
	public function get_rest_path(): string {
		return '/' . $this->get_namespace();
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
		$params = wp_parse_args( $request->get_params(), array(
			'list_type' => 'empty',
		) );

		$response = apply_filters( 'wcf_list_' . $params['list_type'], array(), $params );

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
			'post_status'    => 'any',
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

	public function register_fields_options() {
		foreach ( $this->wcf->registered as $registered ) {
			$data = $registered->get_data();
			$registered->fill_selects( $data['items'], null, false );
		}
	}

	public function get_options( WP_REST_Request $request ): WP_REST_Response {
		$this->register_fields_options();

		$args     = $request->get_params();
		$callback = $this->wcf->get_api_callback( $args['options'] );
		$items    = array();

		if ( is_callable( $callback ) ) {
			$items = $callback( $args );

			if ( empty( $args['search'] )
			     && ! empty( $args['value'] )
			     && ( empty( $args['type'] ) || ! in_array( $args['type'], array( 'post', 'multi_post' ) ) )
			) {
				$default_args          = $args;
				$default_args['value'] = array();
				$set_values            = array_map( function ( $option ) {
					return $option['value'];
				}, $items );

				foreach ( $callback( $default_args ) as $default_option ) {
					if ( ! in_array( $default_option['value'], $set_values ) ) {
						$items[] = $default_option;
					}
				}
			}
		}

		return rest_ensure_response( array_values( $items ) );
	}
}
