<?php
/**
 * Class Helpers.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields;

use WP_Post;

/**
 * Class Helpers provides utility functions for interacting with URLs, posts, and terms within WordPress.
 */
class Helpers {
	/**
	 * Retrieves the title of the webpage specified by the given URL.
	 *
	 * @param string $url The URL of the webpage to retrieve the title from.
	 *
	 * @return string The title of the webpage, or an empty string if the title cannot be retrieved.
	 */
	public function get_url_title( string $url ): string {
		$response = wp_remote_get( $url );

		if ( is_wp_error( $response ) ) {
			return '';
		}

		$body = wp_remote_retrieve_body( $response );

		if ( ! $body ) {
			return '';
		}

		preg_match( '/<title>(.*?)<\/title>/is', $body, $matches );

		if ( isset( $matches[1] ) ) {
			return trim( $matches[1] );
		}

		return '';
	}

	/**
	 * Retrieves posts based on specified arguments, ensuring some posts are included and others excluded.
	 *
	 * @param array $args Arguments for get_posts.
	 *
	 * @return array An array of post data arrays.
	 */
	public function get_posts( array $args = array() ): array {
		if ( empty( $args['numberposts'] ) ) {
			$args['numberposts'] = 50;
		}

		if ( empty( $args['post_status'] ) ) {
			$args['post_status'] = 'any';
		}

		$posts         = array();
		$exclude       = $args['exclude'] ?? array();
		$ensure        = $args['ensure'] ?? array();
		$ensured_posts = array();
		$added_posts   = array();

		if ( ! is_array( $exclude ) ) {
			$exclude = array();
		}

		if ( ! empty( $ensure ) ) {
			$ensured_posts = get_posts(
				array(
					...$args,
					'include' => $ensure,
				),
			);
		}

		$raw_posts = get_posts(
			array(
				...$args,
				'limit' => $args['numberposts'] + count( $ensured_posts ) + count( $exclude ),
			),
		);

		foreach ( $ensured_posts as $post ) {
			$posts[]       = $post;
			$added_posts[] = $post->ID;
		}

		foreach ( $raw_posts as $post ) {
			if ( in_array( $post->ID, $exclude, true ) || in_array( $post->ID, $added_posts, true ) || count( $posts ) >= $args['numberposts'] ) {
				continue;
			}

			$posts[] = $post;
		}

		$placeholder = plugin_dir_url( __DIR__ ) . 'assets/images/placeholder-image.svg';

		return array_map(
			fn( WP_Post $post ) => array(
				'id'                => $post->ID,
				'title'             => $post->post_title,
				'post_type'         => $post->post_type,
				'post_status'       => $post->post_status,
				'post_status_label' => get_post_status_object( $post->post_status )->label,
				'permalink'         => get_permalink( $post ),
				'thumbnail'         => get_the_post_thumbnail_url( $post ) ?? $placeholder,
				'excerpt'           => get_the_excerpt( $post ),
			),
			$posts,
		);
	}

	/**
	 * Retrieves terms based on the given arguments and arranges them into a hierarchical tree structure.
	 *
	 * @param array $args Arguments to be passed to the get_terms function.
	 *
	 * @return array An array representing the hierarchical tree of terms.
	 */
	public function get_terms( array $args ): array {
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

		foreach ( $terms_by_id as &$term ) {
			if ( 0 !== $term['parent'] && isset( $terms_by_id[ $term['parent'] ] ) ) {
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
