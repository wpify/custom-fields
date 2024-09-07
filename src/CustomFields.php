<?php

namespace Wpify\CustomFields;

use Wpify\CustomFields\exceptions\MissingArgumentException;
use Wpify\CustomFields\Integrations\Options;

class CustomFields {
	public function __construct() {
		add_filter( 'wpifycf_option_field_type_text', array( $this, 'return_string' ) );
		add_filter( 'wpifycf_option_field_type_multi_text', array( $this, 'return_array' ) );

		add_filter( 'wpifycf_option_field_type_group', array( $this, 'return_object' ) );
		add_filter( 'wpifycf_option_field_type_multi_group', array( $this, 'return_array' ) );

		// Sanitizers for field types
		add_filter( 'wpifycf_sanitize_field_type_attachment', 'intval' );
		add_filter( 'wpifycf_sanitize_field_type_button', 'sanitize_text_field' );
		add_filter( 'wpifycf_sanitize_field_type_checkbox', 'boolval' );
		add_filter( 'wpifycf_sanitize_field_type_code', 'strval' );
		add_filter( 'wpifycf_sanitize_field_type_color', 'sanitize_hex_color' );
		add_filter( 'wpifycf_sanitize_field_type_date', 'sanitize_text_field' );
		add_filter( 'wpifycf_sanitize_field_type_datetime', 'sanitize_text_field' );
		add_filter( 'wpifycf_sanitize_field_type_email', 'sanitize_email' );
		add_filter( 'wpifycf_sanitize_field_type_group', 'json_decode' );
		add_filter( 'wpifycf_sanitize_field_type_hidden', 'sanitize_text_field' );
		add_filter( 'wpifycf_sanitize_field_type_html', 'sanitize_text_field' );
		add_filter( 'wpifycf_sanitize_field_type_inner_blocks', 'json_decode' );
		add_filter( 'wpifycf_sanitize_field_type_link', 'json_decode' );
		add_filter( 'wpifycf_sanitize_field_type_mapycz', 'json_decode' );
		add_filter( 'wpifycf_sanitize_field_type_month', 'sanitize_text_field' );
		add_filter( 'wpifycf_sanitize_field_type_multi_attachment', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_multi_button', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_multi_checkbox', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_multi_code', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_multi_color', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_multi_date', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_multi_datetime', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_multi_email', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_multi_group', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_multi_link', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_multi_mapycz', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_multi_month', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_multi_number', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_multi_password', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_multi_post', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_multi_select', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_multi_tel', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_multi_term', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_multi_text', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_multi_textarea', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_multi_time', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_multi_toggle', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_multi_url', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_multi_week', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_multi_wysiwyg', array( $this, 'sanitize_multi_field' ) );
		add_filter( 'wpifycf_sanitize_field_type_number', 'floatval' );
		add_filter( 'wpifycf_sanitize_field_type_password', 'strval' );
		add_filter( 'wpifycf_sanitize_field_type_post', 'intval' );
		add_filter( 'wpifycf_sanitize_field_type_select', 'sanitize_text_field' );
		add_filter( 'wpifycf_sanitize_field_type_tel', 'sanitize_text_field' );
		add_filter( 'wpifycf_sanitize_field_type_term', 'intval' );
		add_filter( 'wpifycf_sanitize_field_type_textarea', 'sanitize_textarea_field' );
		add_filter( 'wpifycf_sanitize_field_type_time', 'sanitize_text_field' );
		add_filter( 'wpifycf_sanitize_field_type_toggle', 'boolval' );
		add_filter( 'wpifycf_sanitize_field_type_url', 'sanitize_url' );
		add_filter( 'wpifycf_sanitize_field_type_week', 'sanitize_text_field' );
		add_filter( 'wpifycf_sanitize_field_type_wysiwyg', 'sanitize_text_field' );
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

	public function get_css_asset( string $item ): string {
		$build_path = plugin_dir_path( dirname( __FILE__ ) ) . 'build/';
		$asset_php  = $build_path . $item . '.asset.php';

		if ( file_exists( $asset_php ) ) {
			$asset = require $asset_php;
		}

		$src = plugin_dir_url( dirname( __FILE__ ) ) . 'build/' . $item . '.css';

		if ( ! empty( $asset['version'] ) ) {
			$src = add_query_arg( 'ver', $asset['version'], $src );
		}

		return $src;
	}

	public function return_string(): string {
		return 'string';
	}

	public function return_object(): string {
		return 'object';
	}

	public function return_array(): string {
		return 'array';
	}

	public function sanitize_multi_field( $value ): array {
		if ( is_array( $value ) ) {
			return $value;
		}

		if ( is_string( $value ) ) {
			return json_decode( $value, true );
		}

		return array();
	}
}
