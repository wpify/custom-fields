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
			fn( WP_REST_Request $request ) => update_option( 'mapy_cz_api_key', $request->get_param( 'api_key' ) ),
			array( 'api_key' => array( 'required' => true ) ),
		);

		$this->register_rest_route(
			'mapycz-api-key',
			WP_REST_Server::READABLE,
			fn() => get_option( 'mapy_cz_api_key' ),
		);

		$this->register_rest_route(
			'direct-file-upload',
			WP_REST_Server::CREATABLE,
			array( $this, 'handle_direct_file_upload' ),
			array(
				'field_id' => array( 'required' => false ),
			),
		);

		$this->register_rest_route(
			'direct-file-info',
			WP_REST_Server::READABLE,
			array( $this, 'handle_direct_file_info' ),
			array(
				'file_path' => array( 'required' => true ),
			),
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
		return $this->custom_fields->get_api_basename() . '/wpifycf/v1';
	}

	/**
	 * Checks if the current user has permission to edit posts.
	 *
	 * @return bool True if the current user can edit posts, false otherwise.
	 */
	public function permissions_callback(): bool {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Handles direct file upload to temporary directory.
	 *
	 * @return array|\WP_Error Response array with temp_path or WP_Error on failure.
	 */
	public function handle_direct_file_upload() {
		// Check if file was uploaded.
		if ( empty( $_FILES['file'] ) ) { // phpcs:ignore
			return new \WP_Error( 'no_file', __( 'No file was uploaded.', 'wpify-custom-fields' ), array( 'status' => 400 ) );
		}

		$file = $_FILES['file']; // phpcs:ignore

		// Check for upload errors.
		if ( UPLOAD_ERR_OK !== $file['error'] ) {
			return new \WP_Error( 'upload_error', __( 'File upload failed.', 'wpify-custom-fields' ), array( 'status' => 400 ) );
		}

		// Validate file size.
		$max_upload_size = wp_max_upload_size();
		if ( $file['size'] > $max_upload_size ) {
			return new \WP_Error(
				'file_too_large',
				sprintf(
					/* translators: %s: maximum file size */
					__( 'File size exceeds maximum allowed size of %s.', 'wpify-custom-fields' ),
					size_format( $max_upload_size )
				),
				array( 'status' => 400 )
			);
		}

		// Sanitize filename.
		$filename = sanitize_file_name( $file['name'] );

		// Get temp directory.
		$temp_dir = $this->helpers->get_direct_file_temp_dir();

		// Ensure temp directory exists.
		if ( ! file_exists( $temp_dir ) ) {
			if ( ! wp_mkdir_p( $temp_dir ) ) {
				return new \WP_Error( 'directory_creation_failed', __( 'Failed to create temporary directory.', 'wpify-custom-fields' ), array( 'status' => 500 ) );
			}
		}

		// Generate unique filename to prevent conflicts.
		$unique_filename = wp_unique_filename( $temp_dir, $filename );
		$temp_path       = trailingslashit( $temp_dir ) . $unique_filename;

		// Move uploaded file to temp directory.
		if ( ! move_uploaded_file( $file['tmp_name'], $temp_path ) ) {
			return new \WP_Error( 'move_failed', __( 'Failed to save uploaded file.', 'wpify-custom-fields' ), array( 'status' => 500 ) );
		}

		// Return temp path and metadata.
		return array(
			'temp_path' => $temp_path,
			'filename'  => $unique_filename,
			'size'      => $file['size'],
			'type'      => $file['type'],
		);
	}

	/**
	 * Handles retrieving file information for a direct file.
	 *
	 * @param WP_REST_Request $request The REST API request object.
	 *
	 * @return array|\WP_Error File information or error.
	 */
	public function handle_direct_file_info( WP_REST_Request $request ) {
		$file_path = $request->get_param( 'file_path' );

		if ( empty( $file_path ) ) {
			return new \WP_Error( 'no_file_path', __( 'No file path provided.', 'wpify-custom-fields' ), array( 'status' => 400 ) );
		}

		// Sanitize the file path.
		$file_path = sanitize_text_field( $file_path );

		// Check if file exists.
		if ( ! file_exists( $file_path ) ) {
			return new \WP_Error( 'file_not_found', __( 'File not found.', 'wpify-custom-fields' ), array( 'status' => 404 ) );
		}

		// Get file information.
		$filesize = filesize( $file_path );
		$filetype = wp_check_filetype( $file_path );

		return array(
			'size'     => $filesize,
			'type'     => $filetype['type'],
			'filename' => basename( $file_path ),
		);
	}
}
