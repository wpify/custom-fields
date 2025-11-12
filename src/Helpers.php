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
		unset( $args['_locale'] );

		if ( empty( $args['numberposts'] ) ) {
			$args['numberposts'] = 50;
		}

		if ( empty( $args['post_status'] ) ) {
			$args['post_status'] = 'any';
		}

		$posts         = array();
		$ensured_posts = array();
		$added_posts   = array();

		if ( ! empty( $args['exclude'] ) && is_array( $args['exclude'] ) ) {
			$exclude = array_values( array_filter( array_map( 'intval', $args['exclude'] ) ) );
		} else {
			$exclude = array();
		}

		unset( $args['exclude'] );

		if ( ! empty( $args['ensure'] ) && is_array( $args['ensure'] ) ) {
			$ensured_posts = get_posts(
				array(
					...$args,
					'include' => array_values( array_filter( array_map( 'intval', $args['ensure'] ) ) ),
				),
			);
		}

		unset( $args['ensure'] );

		if ( ! empty( $args['s'] ) ) {
			$args['orderby'] = 'relevance';
			$args['order']   = 'DESC';
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

	/**
	 * Encodes data as JSON, ensuring that all characters are properly escaped.
	 *
	 * This function is a wrapper around wp_json_encode with additional flags. The following flags are used:
	 * - JSON_HEX_TAG
	 * - JSON_HEX_APOS
	 * - JSON_HEX_QUOT
	 * - JSON_HEX_AMP
	 * - JSON_UNESCAPED_UNICODE
	 *
	 * @param mixed $data The data to encode as JSON.
	 *
	 * @return string
	 */
	public function json_encode( $data ): string {
		$json = wp_json_encode( $data, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE );

		return $json ? $json : '';
	}

	/**
	 * Gets the temporary directory for direct file uploads.
	 *
	 * @return string The absolute path to the temp directory.
	 */
	public function get_direct_file_temp_dir(): string {
		$upload_dir = wp_upload_dir();
		return trailingslashit( $upload_dir['basedir'] ) . 'wpifycf-temp';
	}

	/**
	 * Sanitizes and resolves directory path (relative or absolute).
	 *
	 * @param string $directory The directory path from field definition.
	 *
	 * @return string The absolute, sanitized directory path.
	 */
	public function sanitize_directory_path( string $directory ): string {
		// Remove any traversal attempts.
		$directory = str_replace( array( '../', '..' ), '', $directory );

		// If path is absolute, use it as-is.
		if ( path_is_absolute( $directory ) ) {
			return trailingslashit( $directory );
		}

		// Otherwise, treat as relative to ABSPATH.
		return trailingslashit( ABSPATH ) . trailingslashit( $directory );
	}

	/**
	 * Generates a unique filename by appending -n if file exists and replace is false.
	 *
	 * @param string $directory The target directory.
	 * @param string $filename The desired filename.
	 * @param bool   $replace Whether to replace existing files.
	 *
	 * @return string The final filename (unique if replace is false).
	 */
	public function generate_unique_filename( string $directory, string $filename, bool $replace = false ): string {
		if ( $replace ) {
			return $filename;
		}

		return wp_unique_filename( $directory, $filename );
	}

	/**
	 * Moves a file from temp directory to target directory.
	 *
	 * @param string $temp_path The temporary file path.
	 * @param string $target_directory The target directory.
	 * @param string $filename The desired filename.
	 * @param bool   $replace_existing Whether to replace existing files.
	 *
	 * @return string|false The absolute path to the moved file, or false on failure.
	 */
	public function move_temp_to_directory( string $temp_path, string $target_directory, string $filename, bool $replace_existing = false ) {
		// Ensure target directory exists.
		if ( ! file_exists( $target_directory ) ) {
			if ( ! wp_mkdir_p( $target_directory ) ) {
				return false;
			}
		}

		// Check if temp file exists.
		if ( ! file_exists( $temp_path ) ) {
			return false;
		}

		// Generate final filename.
		$final_filename = $this->generate_unique_filename( $target_directory, $filename, $replace_existing );
		$target_path    = trailingslashit( $target_directory ) . $final_filename;

		// If replacing and file exists, delete it first.
		if ( $replace_existing && file_exists( $target_path ) ) {
			wp_delete_file( $target_path );
		}

		// Move file from temp to target.
		if ( rename( $temp_path, $target_path ) ) { // phpcs:ignore
			return $target_path;
		}

		return false;
	}

	/**
	 * Deletes a direct file from the filesystem.
	 *
	 * @param string $file_path The absolute path to the file.
	 *
	 * @return bool True on success, false on failure.
	 */
	public function delete_direct_file( string $file_path ): bool {
		if ( ! file_exists( $file_path ) ) {
			return false;
		}

		return wp_delete_file( $file_path );
	}

	/**
	 * Extracts filename from a file path.
	 *
	 * @param string $file_path The file path.
	 *
	 * @return string The filename.
	 */
	public function get_filename_from_path( string $file_path ): string {
		return basename( $file_path );
	}

	/**
	 * Cleans up old temporary files from the temp directory.
	 *
	 * Deletes files older than the age threshold (default 24 hours).
	 * The age threshold can be filtered using 'wpifycf_temp_file_age_threshold'.
	 *
	 * @return int Number of files deleted.
	 */
	public function cleanup_temp_files(): int {
		$temp_dir = $this->get_direct_file_temp_dir();

		// Skip if directory doesn't exist.
		if ( ! is_dir( $temp_dir ) ) {
			return 0;
		}

		// Get age threshold in seconds (default 24 hours).
		$age_threshold = apply_filters( 'wpifycf_temp_file_age_threshold', DAY_IN_SECONDS );
		$cutoff_time   = time() - $age_threshold;
		$deleted_count = 0;

		// Get all files in temp directory.
		$files = glob( trailingslashit( $temp_dir ) . '*' );

		if ( ! is_array( $files ) ) {
			return 0;
		}

		foreach ( $files as $file ) {
			// Skip if not a file.
			if ( ! is_file( $file ) ) {
				continue;
			}

			// Get file modification time.
			$file_mtime = filemtime( $file );

			if ( false === $file_mtime ) {
				continue;
			}

			// Delete if older than threshold.
			if ( $file_mtime < $cutoff_time ) {
				if ( wp_delete_file( $file ) ) {
					++$deleted_count;
				} else {
					// Log error but continue processing.
					error_log( sprintf( '[wpify-custom-fields] Failed to delete temp file: %s', $file ) ); // phpcs:ignore
				}
			}
		}

		return $deleted_count;
	}
}
