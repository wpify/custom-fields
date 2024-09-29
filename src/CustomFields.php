<?php

namespace Wpify\CustomFields;

use Wpify\CustomFields\exceptions\MissingArgumentException;
use Wpify\CustomFields\Integrations\Metabox;
use Wpify\CustomFields\Integrations\Options;
use Wpify\CustomFields\Integrations\ProductOptions;

class CustomFields {
	public readonly Helpers        $helpers;
	public readonly Api            $api;
	public readonly Sanitizers     $sanitizers;
	public readonly WordPressTypes $wordpress_types;

	public function __construct() {
		$this->helpers         = new Helpers();
		$this->api             = new Api( $this, $this->helpers );
		$this->sanitizers      = new Sanitizers();
		$this->wordpress_types = new WordPressTypes();

		add_filter( 'wpifycf_sanitize_option', array( $this->sanitizers, 'sanitize_option' ), 10, 2 );

		// Sanitizers for field types
		add_filter( 'wpifycf_sanitize_field_type_attachment', 'intval' );
		add_filter( 'wpifycf_sanitize_field_type_checkbox', array( $this->sanitizers, 'sanitize_boolean' ) );
		add_filter( 'wpifycf_sanitize_field_type_code', 'strval' );
		add_filter( 'wpifycf_sanitize_field_type_color', 'sanitize_hex_color' );
		add_filter( 'wpifycf_sanitize_field_type_date', 'sanitize_text_field' );
		add_filter( 'wpifycf_sanitize_field_type_datetime', 'sanitize_text_field' );
		add_filter( 'wpifycf_sanitize_field_type_email', 'sanitize_email' );
		add_filter( 'wpifycf_sanitize_field_type_group', array( $this->sanitizers, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_html', 'sanitize_text_field' );
		add_filter( 'wpifycf_sanitize_field_type_inner_blocks', array( $this->sanitizers, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_link', array( $this->sanitizers, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_mapycz', array( $this->sanitizers, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_month', 'sanitize_text_field' );
		add_filter( 'wpifycf_sanitize_field_type_multi_attachment', array( $this->sanitizers, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_checkbox', array( $this->sanitizers, 'sanitize_multi_checkbox' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_color', array( $this->sanitizers, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_date', array( $this->sanitizers, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_datetime', array( $this->sanitizers, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_email', array( $this->sanitizers, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_group', array( $this->sanitizers, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_link', array( $this->sanitizers, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_mapycz', array( $this->sanitizers, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_month', array( $this->sanitizers, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_number', array( $this->sanitizers, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_post', array( $this->sanitizers, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_select', array( $this->sanitizers, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_tel', array( $this->sanitizers, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_term', array( $this->sanitizers, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_text', array( $this->sanitizers, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_textarea', array( $this->sanitizers, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_time', array( $this->sanitizers, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_toggle', array( $this->sanitizers, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_url', array( $this->sanitizers, 'sanitize_multi_field' ), 10, 2 );
		add_filter( 'wpifycf_sanitize_field_type_multi_week', array( $this->sanitizers, 'sanitize_multi_field' ), 10, 2 );
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
		add_filter( 'wpifycf_sanitize_field_type_toggle', array( $this->sanitizers, 'sanitize_boolean' ) );
		add_filter( 'wpifycf_sanitize_field_type_url', 'sanitize_url' );
		add_filter( 'wpifycf_sanitize_field_type_week', 'sanitize_text_field' );
		add_filter( 'wpifycf_sanitize_field_type_wysiwyg', 'esc_html' );

		// WordPress types for field types
		add_filter( 'wpifycf_field_type_attachment', array( $this->wordpress_types, 'return_integer' ) );
		add_filter( 'wpifycf_field_type_checkbox', array( $this->wordpress_types, 'return_boolean' ) );
		add_filter( 'wpifycf_field_type_code', array( $this->wordpress_types, 'return_string' ) );
		add_filter( 'wpifycf_field_type_color', array( $this->wordpress_types, 'return_string' ) );
		add_filter( 'wpifycf_field_type_date', array( $this->wordpress_types, 'return_string' ) );
		add_filter( 'wpifycf_field_type_datetime', array( $this->wordpress_types, 'return_string' ) );
		add_filter( 'wpifycf_field_type_email', array( $this->wordpress_types, 'return_string' ) );
		add_filter( 'wpifycf_field_type_group', array( $this->wordpress_types, 'return_object' ) );
		add_filter( 'wpifycf_field_type_html', array( $this->wordpress_types, 'return_string' ) );
		add_filter( 'wpifycf_field_type_link', array( $this->wordpress_types, 'return_object' ) );
		add_filter( 'wpifycf_field_type_mapycz', array( $this->wordpress_types, 'return_object' ) );
		add_filter( 'wpifycf_field_type_month', array( $this->wordpress_types, 'return_string' ) );
		add_filter( 'wpifycf_field_type_multi_attachment', array( $this->wordpress_types, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_checkbox', array( $this->wordpress_types, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_color', array( $this->wordpress_types, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_date', array( $this->wordpress_types, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_datetime', array( $this->wordpress_types, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_email', array( $this->wordpress_types, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_group', array( $this->wordpress_types, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_link', array( $this->wordpress_types, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_mapycz', array( $this->wordpress_types, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_month', array( $this->wordpress_types, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_number', array( $this->wordpress_types, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_post', array( $this->wordpress_types, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_select', array( $this->wordpress_types, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_tel', array( $this->wordpress_types, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_term', array( $this->wordpress_types, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_text', array( $this->wordpress_types, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_textarea', array( $this->wordpress_types, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_time', array( $this->wordpress_types, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_toggle', array( $this->wordpress_types, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_url', array( $this->wordpress_types, 'return_array' ) );
		add_filter( 'wpifycf_field_type_multi_week', array( $this->wordpress_types, 'return_array' ) );
		add_filter( 'wpifycf_field_type_number', array( $this->wordpress_types, 'return_number' ) );
		add_filter( 'wpifycf_field_type_password', array( $this->wordpress_types, 'return_string' ) );
		add_filter( 'wpifycf_field_type_post', array( $this->wordpress_types, 'return_integer' ) );
		add_filter( 'wpifycf_field_type_range', array( $this->wordpress_types, 'return_number' ) );
		add_filter( 'wpifycf_field_type_select', array( $this->wordpress_types, 'return_string' ) );
		add_filter( 'wpifycf_field_type_tel', array( $this->wordpress_types, 'return_string' ) );
		add_filter( 'wpifycf_field_type_term', array( $this->wordpress_types, 'return_integer' ) );
		add_filter( 'wpifycf_field_type_text', array( $this->wordpress_types, 'return_string' ) );
		add_filter( 'wpifycf_field_type_textarea', array( $this->wordpress_types, 'return_string' ) );
		add_filter( 'wpifycf_field_type_time', array( $this->wordpress_types, 'return_string' ) );
		add_filter( 'wpifycf_field_type_toggle', array( $this->wordpress_types, 'return_boolean' ) );
		add_filter( 'wpifycf_field_type_url', array( $this->wordpress_types, 'return_string' ) );
		add_filter( 'wpifycf_field_type_week', array( $this->wordpress_types, 'return_string' ) );
		add_filter( 'wpifycf_field_type_wysiwyg', array( $this->wordpress_types, 'return_string' ) );
	}

	/**
	 * @throws MissingArgumentException
	 */
	public function create_options_page( array $args ): Options {
		return new Options( $args, $this );
	}

	public function create_metabox( array $args ): Metabox {
		return new Metabox( $args, $this );
	}

	/**
	 * @throws MissingArgumentException
	 */
	public function create_product_options( array $args ): ProductOptions {
		return new ProductOptions( $args, $this );
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

	public function get_plugin_basename() {
		$basename = plugin_basename( __FILE__ );

		return substr( $basename, 0, strpos( $basename, '/' ) );
	}
}
