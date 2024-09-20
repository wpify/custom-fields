<?php

namespace Wpify\CustomFields;

use DOMDocument;

class Helpers {
	public function get_url_title( string $url ): string {
		$response = wp_remote_get( $url );

		if ( is_wp_error( $response ) ) {
			return '';
		}

		$body = wp_remote_retrieve_body( $response );

		if ( ! $body ) {
			return '';
		}

		$dom = new DOMDocument();
		@$dom->loadHTML( $body );

		$title = $dom->getElementsByTagName( 'title' );

		if ( ! $title->length ) {
			return '';
		}

		return $title->item( 0 )->textContent;
	}

	public function get_posts_for_options( array $args = array() ) {
		if ( empty( $args['numberposts'] ) ) {
			$args['numberposts'] = 50;
		}

		if ( empty( $args['post_status'] ) ) {
			$args['post_status'] = 'any';
		}

		$posts = array();

		if ( ! empty( $args['ensure'] ) ) {
			$posts = get_posts(
				array(
					...$args,
					'include' => $args['ensure'],
				),
			);
		}

		$posts = array_merge(
			$posts,
			get_posts(
				array(
					...$args,
					'exclude' => $args['ensure'] ?? array(),
				),
			),
		);

		return array_map(
			fn( \WP_Post $post ) => array(
				'value' => $post->ID,
				'label' => $post->post_title,
			),
			$posts,
		);
	}

	public function get_post( int $post_id ) {
		$post = get_post( $post_id );

		if ( ! $post ) {
			return array();
		}

		return array(
			'id'                => $post->ID,
			'title'             => $post->post_title,
			'post_type'         => $post->post_type,
			'post_status'       => $post->post_status,
			'post_status_label' => get_post_status_object( $post->post_status )->label,
			'permalink'         => get_permalink( $post ),
		);
	}
}
