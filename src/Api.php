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
			array( $this, 'cap_edit_posts' ),
		);

		$this->register_rest_route(
			'posts',
			WP_REST_Server::READABLE,
			fn( WP_REST_Request $request ) => $this->helpers->get_posts( $request->get_params() ),
			array(
				'post_type' => array( 'required' => true ),
			),
			array( $this, 'cap_edit_posts' ),
		);

		$this->register_rest_route(
			'terms',
			WP_REST_Server::READABLE,
			fn( WP_REST_Request $request ) => $this->helpers->get_terms( $request->get_params() ),
			array(
				'taxonomy' => array( 'required' => true ),
			),
			array( $this, 'cap_edit_posts' ),
		);

		$this->register_rest_route(
			'mapycz-api-key',
			WP_REST_Server::EDITABLE,
			fn( WP_REST_Request $request ) => update_option( 'mapy_cz_api_key', $request->get_param( 'api_key' ) ),
			array( 'api_key' => array( 'required' => true ) ),
			array( $this, 'cap_manage_options' ),
		);

		$this->register_rest_route(
			'mapycz-api-key',
			WP_REST_Server::READABLE,
			fn() => get_option( 'mapy_cz_api_key' ),
			array(),
			array( $this, 'cap_edit_posts' ),
		);

		$this->register_rest_route(
			'direct-file-upload',
			WP_REST_Server::CREATABLE,
			array( $this, 'handle_direct_file_upload' ),
			array(
				'field_id' => array( 'required' => false ),
			),
			array( $this, 'cap_upload_files' ),
		);

		$this->register_rest_route(
			'direct-file-info',
			WP_REST_Server::READABLE,
			array( $this, 'handle_direct_file_info' ),
			array(
				'file_path' => array( 'required' => true ),
			),
			array( $this, 'cap_edit_posts' ),
		);

		$this->register_rest_route(
			'cloudflare/zones',
			WP_REST_Server::CREATABLE,
			array( $this, 'handle_cloudflare_zones' ),
			array(
				'email'   => array( 'required' => true ),
				'api_key' => array( 'required' => true ),
				'page'    => array( 'required' => false ),
			),
			array( $this, 'cap_manage_options' ),
		);
	}

	/**
	 * Registers a REST API route with specified parameters.
	 *
	 * @param string   $route The endpoint route.
	 * @param string   $method The HTTP method (GET, POST, etc.) for this route.
	 * @param callable $callback The callback function to handle the request.
	 * @param array    $args Array of arguments for the route.
	 * @param callable $permission_callback The callback to check permissions for this route.
	 *
	 * @return void
	 */
	public function register_rest_route(
		string $route,
		string $method,
		callable $callback,
		array $args,
		callable $permission_callback,
	): void {
		register_rest_route(
			$this->get_rest_namespace(),
			$route,
			array(
				'methods'             => $method,
				'callback'            => $callback,
				'permission_callback' => $permission_callback,
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
	 * Checks if the current user can edit posts.
	 *
	 * @return bool
	 */
	public function cap_edit_posts(): bool {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Checks if the current user can upload files.
	 *
	 * @return bool
	 */
	public function cap_upload_files(): bool {
		return current_user_can( 'upload_files' );
	}

	/**
	 * Checks if the current user can manage options.
	 *
	 * @return bool
	 */
	public function cap_manage_options(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Handles direct file upload to temporary directory.
	 *
	 * Uses wp_handle_upload() so WordPress's built-in MIME allowlist is enforced,
	 * blocking dangerous file types (.php, .phtml, .phar, etc.).
	 *
	 * @return array|\WP_Error Response array with temp_path, filename, size, type or WP_Error on failure.
	 */
	public function handle_direct_file_upload() {
		if ( empty( $_FILES['file'] ) ) { // phpcs:ignore
			return new \WP_Error( 'no_file', __( 'No file was uploaded.', 'wpify-custom-fields' ), array( 'status' => 400 ) );
		}

		$file = $_FILES['file']; // phpcs:ignore

		if ( UPLOAD_ERR_OK !== $file['error'] ) {
			return new \WP_Error( 'upload_error', __( 'File upload failed.', 'wpify-custom-fields' ), array( 'status' => 400 ) );
		}

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

		$temp_dir = $this->helpers->get_direct_file_temp_dir();

		if ( ! file_exists( $temp_dir ) ) {
			if ( ! wp_mkdir_p( $temp_dir ) ) {
				return new \WP_Error( 'directory_creation_failed', __( 'Failed to create temporary directory.', 'wpify-custom-fields' ), array( 'status' => 500 ) );
			}
		}

		$this->helpers->harden_directory( $temp_dir );

		require_once ABSPATH . 'wp-admin/includes/file.php';

		$upload_dir_info = wp_upload_dir();
		$temp_url        = trailingslashit( $upload_dir_info['baseurl'] ) . 'wpifycf-temp';

		$upload_dir_filter = static function ( array $dirs ) use ( $temp_dir, $temp_url ): array {
			$dirs['path']    = $temp_dir;
			$dirs['url']     = $temp_url;
			$dirs['subdir']  = '';
			$dirs['basedir'] = $temp_dir;
			$dirs['baseurl'] = $temp_url;
			return $dirs;
		};

		add_filter( 'upload_dir', $upload_dir_filter, 99 );

		try {
			$result = wp_handle_upload(
				$_FILES['file'], // phpcs:ignore
				array(
					'test_form' => false,
					'mimes'     => null,
				)
			);
		} finally {
			remove_filter( 'upload_dir', $upload_dir_filter, 99 );
		}

		if ( isset( $result['error'] ) ) {
			return new \WP_Error( 'upload_rejected', $result['error'], array( 'status' => 400 ) );
		}

		return array(
			'temp_path' => $result['file'],
			'filename'  => basename( $result['file'] ),
			'size'      => $file['size'],
			'type'      => $result['type'],
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
		$file_path = sanitize_text_field( $request->get_param( 'file_path' ) );

		if ( '' === $file_path ) {
			return new \WP_Error( 'no_file_path', __( 'No file path provided.', 'wpify-custom-fields' ), array( 'status' => 400 ) );
		}

		$real = realpath( $file_path );
		if ( false === $real ) {
			return new \WP_Error( 'file_not_found', __( 'File not found.', 'wpify-custom-fields' ), array( 'status' => 404 ) );
		}

		$allowed_prefix = realpath( WP_CONTENT_DIR );
		if ( false === $allowed_prefix || ! str_starts_with( $real . DIRECTORY_SEPARATOR, $allowed_prefix . DIRECTORY_SEPARATOR ) ) {
			return new \WP_Error( 'forbidden', __( 'File path is not allowed.', 'wpify-custom-fields' ), array( 'status' => 403 ) );
		}

		$filesize = filesize( $real );
		if ( false === $filesize ) {
			return new \WP_Error( 'file_read_failed', __( 'Unable to read file.', 'wpify-custom-fields' ), array( 'status' => 500 ) );
		}
		$filetype = wp_check_filetype( $real );

		return array(
			'size'     => $filesize,
			'type'     => $filetype['type'],
			'filename' => basename( $real ),
		);
	}

	/**
	 * Handles fetching Cloudflare zones for the given credentials.
	 *
	 * @param WP_REST_Request $request The REST API request object.
	 *
	 * @return array|\WP_Error Zones list or error.
	 */
	public function handle_cloudflare_zones( WP_REST_Request $request ) {
		$email   = sanitize_email( $request->get_param( 'email' ) );
		$api_key = sanitize_text_field( $request->get_param( 'api_key' ) );
		$page    = absint( $request->get_param( 'page' ) ? $request->get_param( 'page' ) : 1 );

		$response = wp_remote_get(
			add_query_arg(
				array(
					'per_page' => 50,
					'page'     => $page,
				),
				'https://api.cloudflare.com/client/v4/zones',
			),
			array(
				'headers' => array(
					'X-Auth-Email' => $email,
					'X-Auth-Key'   => $api_key,
					'Content-Type' => 'application/json',
				),
			),
		);

		if ( is_wp_error( $response ) ) {
			return new \WP_Error(
				'cloudflare_request_failed',
				$response->get_error_message(),
				array( 'status' => 502 ),
			);
		}

		$status_code = wp_remote_retrieve_response_code( $response );
		$body        = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( 200 !== $status_code || empty( $body['success'] ) ) {
			$message = __( 'Cloudflare API error.', 'wpify-custom-fields' );

			if ( ! empty( $body['errors'] ) && is_array( $body['errors'] ) ) {
				$message = sanitize_text_field( $body['errors'][0]['message'] ?? $message );
			}

			return new \WP_Error(
				'cloudflare_api_error',
				$message,
				array( 'status' => $status_code ? $status_code : 502 ),
			);
		}

		$zones = array();

		foreach ( $body['result'] ?? array() as $zone ) {
			$zones[] = array(
				'zone_id'      => sanitize_text_field( $zone['id'] ?? '' ),
				'zone_name'    => sanitize_text_field( $zone['name'] ?? '' ),
				'account_id'   => sanitize_text_field( $zone['account']['id'] ?? '' ),
				'account_name' => sanitize_text_field( $zone['account']['name'] ?? '' ),
			);
		}

		$result_info = $body['result_info'] ?? array();

		return array(
			'zones'       => $zones,
			'page'        => intval( $result_info['page'] ?? $page ),
			'total_pages' => intval( $result_info['total_pages'] ?? 1 ),
			'total_count' => intval( $result_info['total_count'] ?? count( $zones ) ),
		);
	}
}
