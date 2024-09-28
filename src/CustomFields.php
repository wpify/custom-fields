<?php

namespace Wpify\CustomFields;

use JsonException;
use Wpify\CustomFields\exceptions\MissingArgumentException;
use Wpify\CustomFields\Integrations\Options;

class CustomFields {
	public Helpers $helpers;
	public Api     $api;

	public function __construct() {
		$this->helpers = new Helpers();
		$this->api     = new Api( $this, $this->helpers );

		add_filter( 'wpifycf_sanitize_option', array( $this, 'sanitize_option' ), 10, 2 );

		// Sanitizers for field types
		add_filter( 'wpifycf_sanitize_field_type_attachment', 'intval' );
		add_filter( 'wpifycf_sanitize_field_type_checkbox', array( $this, 'sanitize_boolean' ) );
		add_filter( 'wpifycf_sanitize_field_type_code', 'strval' );
		add_filter( 'wpifycf_sanitize_field_type_color', 'sanitize_hex_color' );
		add_filter( 'wpifycf_sanitize_field_type_date', 'sanitize_text_field' );
		add_filter( 'wpifycf_sanitize_field_type_datetime', 'sanitize_text_field' );
		add_filter( 'wpifycf_sanitize_field_type_email', 'sanitize_email' );
		add_filter( 'wpifycf_sanitize_field_type_group', array( $this, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_html', 'sanitize_text_field' );
		add_filter( 'wpifycf_sanitize_field_type_inner_blocks', array( $this, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_link', array( $this, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_mapycz', array( $this, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_month', 'sanitize_text_field' );
		add_filter( 'wpifycf_sanitize_field_type_multi_attachment', array( $this, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_checkbox', array( $this, 'sanitize_multi_checkbox' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_color', array( $this, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_date', array( $this, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_datetime', array( $this, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_email', array( $this, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_group', array( $this, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_link', array( $this, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_mapycz', array( $this, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_month', array( $this, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_number', array( $this, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_post', array( $this, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_select', array( $this, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_tel', array( $this, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_term', array( $this, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_text', array( $this, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_textarea', array( $this, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_time', array( $this, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_toggle', array( $this, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_url', array( $this, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_week', array( $this, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_number', 'floatval' );
		add_filter( 'wpifycf_sanitize_field_type_password', 'strval' );
		add_filter( 'wpifycf_sanitize_field_type_post', 'intval' );
		add_filter( 'wpifycf_sanitize_field_type_range', 'floatval' );
		add_filter( 'wpifycf_sanitize_field_type_select', 'sanitize_text_field' );
		add_filter( 'wpifycf_sanitize_field_type_tel', 'sanitize_text_field' );
		add_filter( 'wpifycf_sanitize_field_type_term', 'intval' );
		add_filter( 'wpifycf_sanitize_field_type_text', 'sanitize_text_field' );
		add_filter( 'wpifycf_sanitize_field_type_textarea', 'sanitize_textarea_field' );
		add_filter( 'wpifycf_sanitize_field_type_time', 'sanitize_text_field' );
		add_filter( 'wpifycf_sanitize_field_type_toggle', array( $this, 'sanitize_boolean' ) );
		add_filter( 'wpifycf_sanitize_field_type_url', 'sanitize_url' );
		add_filter( 'wpifycf_sanitize_field_type_week', 'sanitize_text_field' );
		add_filter( 'wpifycf_sanitize_field_type_wysiwyg', 'esc_html' );

		// WordPress types for field types
		add_filter( 'wpifycf_field_type_attachment', array( $this, 'return_integer' ) );
		add_filter( 'wpifycf_field_type_checkbox', array( $this, 'return_boolean' ) );
		add_filter( 'wpifycf_field_type_code', array( $this, 'return_string' ) );
		add_filter( 'wpifycf_field_type_color', array( $this, 'return_string' ) );
		add_filter( 'wpifycf_field_type_date', array( $this, 'return_string' ) );
		add_filter( 'wpifycf_field_type_datetime', array( $this, 'return_string' ) );
		add_filter( 'wpifycf_field_type_email', array( $this, 'return_string' ) );
		add_filter( 'wpifycf_field_type_group', array( $this, 'return_object' ) );
		add_filter( 'wpifycf_field_type_html', array( $this, 'return_string' ) );
		add_filter( 'wpifycf_field_type_link', array( $this, 'return_object' ) );
		add_filter( 'wpifycf_field_type_mapycz', array( $this, 'return_object' ) );
		add_filter( 'wpifycf_field_type_month', array( $this, 'return_string' ) );
		add_filter( 'wpifycf_field_type_multi_attachment', array( $this, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_checkbox', array( $this, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_color', array( $this, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_date', array( $this, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_datetime', array( $this, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_email', array( $this, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_group', array( $this, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_link', array( $this, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_mapycz', array( $this, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_month', array( $this, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_number', array( $this, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_post', array( $this, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_select', array( $this, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_tel', array( $this, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_term', array( $this, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_text', array( $this, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_textarea', array( $this, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_time', array( $this, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_toggle', array( $this, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_url', array( $this, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_week', array( $this, 'return_array' ) );
		add_filter( 'wpifycf_field_type_number', array( $this, 'return_number' ) );
		add_filter( 'wpifycf_field_type_password', array( $this, 'return_string' ) );
		add_filter( 'wpifycf_field_type_post', array( $this, 'return_integer' ) );
		add_filter( 'wpifycf_field_type_range', array( $this, 'return_number' ) );
		add_filter( 'wpifycf_field_type_select', array( $this, 'return_string' ) );
		add_filter( 'wpifycf_field_type_tel', array( $this, 'return_string' ) );
		add_filter( 'wpifycf_field_type_term', array( $this, 'return_integer' ) );
		add_filter( 'wpifycf_field_type_text', array( $this, 'return_string' ) );
		add_filter( 'wpifycf_field_type_textarea', array( $this, 'return_string' ) );
		add_filter( 'wpifycf_field_type_time', array( $this, 'return_string' ) );
		add_filter( 'wpifycf_field_type_toggle', array( $this, 'return_boolean' ) );
		add_filter( 'wpifycf_field_type_url', array( $this, 'return_string' ) );
		add_filter( 'wpifycf_field_type_week', array( $this, 'return_string' ) );
		add_filter( 'wpifycf_field_type_wysiwyg', array( $this, 'return_string' ) );
	}

	/**
	 * @throws MissingArgumentException
	 */
	public function create_options_page( array $args ): Options {
		return new Options( $args, $this );
	}

	public function get_js_asset( string $item ): array {
		$build_path = plugin_dir_path( dirname( __FILE__ ) ) . 'build/';
		$asset_php  = $build_path . $item . '.asset.php';

		if ( file_exists( $asset_php ) ) {
			$asset = require $asset_php;
		} else {
			$asset = array( 'dependencies' => array(), 'version' => false );
		}

		$asset['src'] = plugin_dir_url( dirname( __FILE__ ) ) . 'build/' . $item . '.js';

		return $asset;
	}

	public function get_css_asset( string $item ): array|string {
		$build_path = plugin_dir_path( dirname( __FILE__ ) ) . 'build/';
		$asset_php  = $build_path . $item . '.asset.php';

		if ( file_exists( $asset_php ) ) {
			$asset = require $asset_php;
		}

		$src = add_query_arg(
			'ver',
			$asset['version'],
			plugin_dir_url( dirname( __FILE__ ) ) . 'build/' . $item . '.css',
		);

		if ( file_exists( $build_path . 'style-' . $item . '.css' ) ) {
			$src = array(
				$src,
				add_query_arg(
					'ver',
					$asset['version'],
					plugin_dir_url( dirname( __FILE__ ) ) . 'build/style-' . $item . '.css',
				),
			);
		}

		return $src;
	}

	public function return_string(): string {
		return 'string';
	}

	public function return_boolean(): string {
		return 'boolean';
	}

	public function return_integer(): string {
		return 'integer';
	}

	public function return_number(): string {
		return 'number';
	}

	public function return_array(): string {
		return 'array';
	}

	public function return_object(): string {
		return 'object';
	}

	public function sanitize_multi_field( $value ): array {
		if ( is_array( $value ) ) {
			return $value;
		}

		if ( is_object( $value ) ) {
			return (array) $value;
		}

		if ( is_string( $value ) ) {
			try {
				$value = json_decode( $value, true, 512, JSON_THROW_ON_ERROR );

				if ( is_array( $value ) ) {
					return $value;
				}
			} catch ( JsonException $e ) {
			}
		}

		return array();
	}

	public function sanitize_multi_checkbox( $value ) {
		if ( is_array( $value ) ) {
			return array_map( 'boolval', $value );
		}

		return array();
	}

	public function sanitize_boolean( $value ) {
		return filter_var( $value, FILTER_VALIDATE_BOOLEAN );
	}

	public function sanitize_option( mixed $value, array $items ) {
		$next_value = $value;

		if ( is_array( $next_value ) ) {
			foreach ( $items as $item ) {
				if ( empty( $item['type'] ) ) {
					continue;
				}

				if ( ! isset( $next_value[ $item['id'] ] ) ) {
					continue;
				}

				$item_value = $next_value[ $item['id'] ];
				$wp_type    = apply_filters( 'wpifycf_field_type_' . $item['type'], 'string' );

				if ( $wp_type !== 'string' && is_string( $item_value ) ) {
					try {
						$next_value[ $item['id'] ] = json_decode( $item_value, true, 512, JSON_THROW_ON_ERROR );
					} catch ( JsonException $e ) {
					}
				}
			}
		}

		return $next_value;
	}

	public function get_plugin_basename() {
		$basename = plugin_basename( __FILE__ );

		return substr( $basename, 0, strpos( $basename, '/' ) );
	}
}
