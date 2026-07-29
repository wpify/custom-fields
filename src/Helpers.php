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
	 * Post types whose posts carry a WooCommerce SKU.
	 *
	 * @var string[]
	 */
	private const SKU_POST_TYPES = array( 'product', 'product_variation' );

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

		if ( $this->should_search_by_sku( $args ) ) {
			$args['wpifycf_search_sku'] = (string) $args['s'];

			// get_posts() suppresses the posts_* clause filters by default, and the
			// SKU search is implemented through them.
			$args['suppress_filters'] = false;
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

		if ( ! empty( $args['wpifycf_search_sku'] ) ) {
			add_filter( 'posts_search', array( $this, 'sku_search_where' ), 10, 2 );
			add_filter( 'posts_join', array( $this, 'sku_search_join' ), 10, 2 );
			add_filter( 'posts_orderby', array( $this, 'sku_search_orderby' ), 10, 2 );
		}

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

		if ( ! empty( $args['wpifycf_search_sku'] ) ) {
			remove_filter( 'posts_search', array( $this, 'sku_search_where' ), 10 );
			remove_filter( 'posts_join', array( $this, 'sku_search_join' ), 10 );
			remove_filter( 'posts_orderby', array( $this, 'sku_search_orderby' ), 10 );
		}

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
		$skus        = $this->get_skus( $posts );

		return array_map(
			/**
			 * Filters the data of a single post returned by the posts REST endpoint.
			 *
			 * @param array   $data The post data sent to the JavaScript field components.
			 * @param WP_Post $post The post the data was built from.
			 * @param array   $args The arguments the posts were queried with.
			 */
			fn( WP_Post $post ) => apply_filters(
				'wpifycf_post_data',
				array(
					'id'                => $post->ID,
					'title'             => $post->post_title,
					'post_type'         => $post->post_type,
					'post_status'       => $post->post_status,
					'post_status_label' => get_post_status_object( $post->post_status )->label,
					'permalink'         => get_permalink( $post ),
					'thumbnail'         => get_the_post_thumbnail_url( $post ) ?? $placeholder,
					'excerpt'           => get_the_excerpt( $post ),
					'sku'               => $skus[ $post->ID ] ?? '',
				),
				$post,
				$args,
			),
			$posts,
		);
	}

	/**
	 * Checks whether the WooCommerce product lookup table is available.
	 *
	 * The table is registered on $wpdb by WooCommerce itself, so its presence
	 * doubles as the "is WooCommerce loaded" guard.
	 *
	 * @return bool
	 */
	private function has_product_lookup_table(): bool {
		global $wpdb;

		return ! empty( $wpdb->wc_product_meta_lookup );
	}

	/**
	 * Decides whether the given query should search WooCommerce SKUs as well as titles.
	 *
	 * @param array $args Arguments the posts are queried with.
	 *
	 * @return bool
	 */
	private function should_search_by_sku( array $args ): bool {
		$post_types = array_filter( (array) ( $args['post_type'] ?? array() ), 'is_string' );
		$enabled    = ! empty( $args['s'] )
			&& $this->has_product_lookup_table()
			&& count( array_intersect( $post_types, self::SKU_POST_TYPES ) ) > 0;

		/**
		 * Filters whether a posts query searches WooCommerce SKUs in addition to titles.
		 *
		 * @param bool     $enabled    Whether the SKU search applies.
		 * @param string[] $post_types The post types being queried.
		 * @param array    $args       The arguments the posts are queried with.
		 */
		return (bool) apply_filters( 'wpifycf_search_posts_by_sku', $enabled, $post_types, $args );
	}

	/**
	 * Retrieves the SKUs of the given posts, keyed by post ID.
	 *
	 * @param WP_Post[] $posts Posts to retrieve the SKUs for.
	 *
	 * @return array<int, string>
	 */
	private function get_skus( array $posts ): array {
		global $wpdb;

		if ( ! $this->has_product_lookup_table() ) {
			return array();
		}

		$product_ids = array();

		foreach ( $posts as $post ) {
			if ( in_array( $post->post_type, self::SKU_POST_TYPES, true ) ) {
				$product_ids[] = (int) $post->ID;
			}
		}

		if ( empty( $product_ids ) ) {
			return array();
		}

		$ids = implode( ', ', array_map( 'absint', $product_ids ) );

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results(
			"SELECT product_id, sku FROM {$wpdb->wc_product_meta_lookup} WHERE product_id IN ( {$ids} )",
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching

		$skus = array();

		foreach ( $rows as $row ) {
			$skus[ (int) $row->product_id ] = (string) $row->sku;
		}

		return $skus;
	}

	/**
	 * Adds the SKU condition to the search clause of a SKU-aware posts query.
	 *
	 * @param string    $search The search clause, already prefixed with AND.
	 * @param \WP_Query $query  The query being filtered.
	 *
	 * @return string
	 */
	public function sku_search_where( string $search, $query ): string {
		global $wpdb;

		$term = $query->get( 'wpifycf_search_sku' );

		if ( empty( $term ) || empty( $search ) ) {
			return $search;
		}

		// The search clause is already prepared SQL containing literal % characters,
		// so only the SKU condition may be passed through prepare().
		$sku_where = $wpdb->prepare(
			' OR ( wpifycf_sku_lookup.sku LIKE %s )',
			'%' . $wpdb->esc_like( $term ) . '%',
		);

		return ' AND ( ( 1 = 1 ' . $search . ' ) ' . $sku_where . ' )';
	}

	/**
	 * Joins the WooCommerce product lookup table into a SKU-aware posts query.
	 *
	 * @param string    $join  The join clause.
	 * @param \WP_Query $query The query being filtered.
	 *
	 * @return string
	 */
	public function sku_search_join( string $join, $query ): string {
		global $wpdb;

		if ( empty( $query->get( 'wpifycf_search_sku' ) ) ) {
			return $join;
		}

		return $join . " LEFT JOIN {$wpdb->wc_product_meta_lookup} wpifycf_sku_lookup ON wpifycf_sku_lookup.product_id = {$wpdb->posts}.ID ";
	}

	/**
	 * Ranks exact SKU matches first, then partial SKU matches, then WordPress relevance.
	 *
	 * @param string    $orderby The order by clause.
	 * @param \WP_Query $query   The query being filtered.
	 *
	 * @return string
	 */
	public function sku_search_orderby( string $orderby, $query ): string {
		global $wpdb;

		$term = $query->get( 'wpifycf_search_sku' );

		if ( empty( $term ) ) {
			return $orderby;
		}

		$rank = $wpdb->prepare(
			'CASE WHEN wpifycf_sku_lookup.sku = %s THEN 0 WHEN wpifycf_sku_lookup.sku LIKE %s THEN 1 ELSE 2 END ASC',
			$term,
			'%' . $wpdb->esc_like( $term ) . '%',
		);

		return empty( $orderby ) ? $rank : $rank . ', ' . $orderby;
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
	 * Writes hardening files (.htaccess, web.config) into the directory if they are missing.
	 *
	 * Idempotent and self-healing: runs every call, only writes files that don't exist.
	 * If the directory is not writable, logs and continues — the WP allowlist via
	 * wp_handle_upload() is the primary defense against executable uploads; hardening
	 * files are defense in depth.
	 *
	 * @param string $dir Absolute path to the directory to harden.
	 *
	 * @return void
	 */
	public function harden_directory( string $dir ): void {
		static $hardened = array();

		if ( isset( $hardened[ $dir ] ) ) {
			return;
		}

		if ( ! is_dir( $dir ) || ! wp_is_writable( $dir ) ) {
			return;
		}

		$hardened[ $dir ] = true;

		$htaccess  = trailingslashit( $dir ) . '.htaccess';
		$webconfig = trailingslashit( $dir ) . 'web.config';

		if ( ! file_exists( $htaccess ) ) {
			$contents = <<<'HTACCESS'
# Disable parsing of any code by Apache.
<IfModule mod_php.c>
  php_flag engine off
</IfModule>
<IfModule mod_php7.c>
  php_flag engine off
</IfModule>
<IfModule mod_php8.c>
  php_flag engine off
</IfModule>
<FilesMatch "\.(?i:php|phtml|phar|php\d|pl|py|cgi|rb|sh|jsp)$">
  <IfModule mod_authz_core.c>
    Require all denied
  </IfModule>
  <IfModule !mod_authz_core.c>
    Order allow,deny
    Deny from all
  </IfModule>
</FilesMatch>
Options -Indexes
HTACCESS;

			if ( false === @file_put_contents( $htaccess, $contents, LOCK_EX ) ) { // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged, WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
				error_log( sprintf( 'wpify/custom-fields: failed to write hardening .htaccess to %s', $dir ) ); // phpcs:ignore
			}
		}

		if ( ! file_exists( $webconfig ) ) {
			$contents = <<<'WEBCONFIG'
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <handlers accessPolicy="Read" />
    <staticContent>
      <clear />
      <mimeMap fileExtension=".*" mimeType="application/octet-stream" />
    </staticContent>
  </system.webServer>
</configuration>
WEBCONFIG;

			if ( false === @file_put_contents( $webconfig, $contents, LOCK_EX ) ) { // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged, WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
				error_log( sprintf( 'wpify/custom-fields: failed to write hardening web.config to %s', $dir ) ); // phpcs:ignore
			}
		}
	}

	/**
	 * Resolves and validates a directory path supplied via a field definition.
	 *
	 * Restricts writes to under WP_CONTENT_DIR by default. Symlink-safe via realpath()
	 * on whatever ancestor of the path exists on disk. Throws on rejection because
	 * misconfigured `directory` values come from PHP code, not user input — this is
	 * a developer error and should surface loudly during development.
	 *
	 * The `wpifycf_direct_file_directory_allowed` filter lets developers extend the
	 * allowed prefix for legitimate exotic cases (CDN sync mounts, etc.).
	 *
	 * @param string $directory The directory path from the field definition.
	 *
	 * @return string The absolute, canonical, validated directory path with trailing slash.
	 *
	 * @throws \Wpify\CustomFields\Exceptions\CustomFieldsException When the path resolves outside the allowed prefix.
	 */
	public function sanitize_directory_path( string $directory ): string {
		$resolved = path_is_absolute( $directory )
			? $directory
			: ABSPATH . ltrim( $directory, '/\\' );

		$resolved          = wp_normalize_path( $resolved );
		$resolved          = $this->collapse_path_segments( $resolved );
		$canonical         = $this->realpath_with_unresolved_tail( $resolved );
		$wp_content_real   = realpath( WP_CONTENT_DIR );
		$wp_content_anchor = false !== $wp_content_real ? $wp_content_real : WP_CONTENT_DIR;
		$allowed_prefix    = wp_normalize_path( trailingslashit( $wp_content_anchor ) );

		$allowed = str_starts_with( trailingslashit( $canonical ), $allowed_prefix );
		$allowed = (bool) apply_filters(
			'wpifycf_direct_file_directory_allowed',
			$allowed,
			$canonical,
			$directory,
		);

		if ( ! $allowed ) {
			throw new \Wpify\CustomFields\Exceptions\CustomFieldsException(
				esc_html(
					sprintf(
						'wpify/custom-fields: direct_file `directory` must resolve under WP_CONTENT_DIR. Got input %s, resolved to %s.',
						$directory,
						$canonical,
					)
				),
			);
		}

		return trailingslashit( $canonical );
	}

	/**
	 * Collapses `.` and `..` segments in a path string without touching the filesystem.
	 *
	 * @param string $path Forward-slash-normalized path.
	 *
	 * @return string
	 */
	private function collapse_path_segments( string $path ): string {
		$is_absolute = str_starts_with( $path, '/' );
		$segments    = array_filter( explode( '/', $path ), static fn( string $s ) => '' !== $s && '.' !== $s );
		$result      = array();

		foreach ( $segments as $segment ) {
			if ( '..' === $segment ) {
				array_pop( $result );
			} else {
				$result[] = $segment;
			}
		}

		$joined = implode( '/', $result );
		return $is_absolute ? '/' . $joined : $joined;
	}

	/**
	 * Resolves symlinks on whatever ancestor of $path exists; re-appends the unresolved tail.
	 *
	 * Lets us canonicalize directories that don't yet exist on disk while still defeating
	 * symlink escapes in any existing portion of the path.
	 *
	 * @param string $path Forward-slash-normalized, already-collapsed path.
	 *
	 * @return string
	 */
	private function realpath_with_unresolved_tail( string $path ): string {
		$parts = explode( '/', $path );
		$tail  = array();

		while ( ! empty( $parts ) ) {
			$candidate = implode( '/', $parts );
			if ( '' !== $candidate ) {
				$real = realpath( $candidate );
				if ( false !== $real ) {
					$real = wp_normalize_path( $real );
					return empty( $tail )
						? $real
						: $real . '/' . implode( '/', array_reverse( $tail ) );
				}
			}
			$tail[] = array_pop( $parts );
		}

		return $path;
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

		$this->harden_directory( $target_directory );

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
