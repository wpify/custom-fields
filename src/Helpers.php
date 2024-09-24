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

	public function get_posts( array $args = array() ) {
		if ( empty( $args['numberposts'] ) ) {
			$args['numberposts'] = 50;
		}

		if ( empty( $args['post_status'] ) ) {
			$args['post_status'] = 'any';
		}

		$posts = array();

		$exclude = $args['exclude'] ?? array();
		$ensure  = $args['ensure'] ?? array();

		if ( ! empty( $ensure ) ) {
			$posts = get_posts(
				array(
					...$args,
					'include' => $ensure,
					'exclude' => array(),
				),
			);
		}

		$posts = array_merge(
			$posts,
			get_posts(
				array(
					...$args,
					'exclude' => array_merge( $exclude, $ensure ),
				),
			),
		);

		$placeholder = plugin_dir_url( dirname( __FILE__ ) ) . 'assets/images/placeholder-image.svg';

		return array_map(
			fn( \WP_Post $post ) => array(
				'id'                => $post->ID,
				'title'             => $post->post_title,
				'post_type'         => $post->post_type,
				'post_status'       => $post->post_status,
				'post_status_label' => get_post_status_object( $post->post_status )->label,
				'permalink'         => get_permalink( $post ),
				'thumbnail'         => get_the_post_thumbnail_url( $post ) ?: $placeholder,
				'excerpt'           => get_the_excerpt( $post ),
			),
			$posts,
		);
	}

	public function get_terms( $args ) {
		$terms = get_terms(
			array(
				'hide_empty' => false,
				...$args,
			),
		);

		if ( is_wp_error( $terms ) || empty( $terms ) ) {
			return array();
		}

		$terms_by_id = array();

		foreach ( $terms as $term ) {
			$terms_by_id[ $term->term_id ] = array(
				'id'     => $term->term_id,
				'name'   => $term->name,
				'parent' => $term->parent,
			);
		}

		$tree = array();

		foreach ( $terms_by_id as $id => &$term ) {
			if ( $term['parent'] !== 0 && isset( $terms_by_id[ $term['parent'] ] ) ) {
				$parent =& $terms_by_id[ $term['parent'] ];

				if ( ! isset( $parent['children'] ) ) {
					$parent['children'] = array();
				}

				$parent['children'][] =& $term;
			} else {
				$tree[] =& $term;
			}
		}

		unset( $term );

		return $tree;
	}
}
