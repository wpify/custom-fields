<?php

namespace WpifyCustomFields;

use WpifyCustomFields\Implementations\GutenbergBlock;
use WpifyCustomFields\Implementations\Metabox;
use WpifyCustomFields\Implementations\Options;
use WpifyCustomFields\Implementations\ProductOptions;
use WpifyCustomFields\Implementations\Taxonomy;
use WpifyCustomFields\Implementations\WooCommerceSettings;
use WpifyCustomFields\Implementations\User;

/**
 * Class WpifyCustomFields
 * @package WpifyCustomFields
 */
final class WpifyCustomFields {
	/** @var Assets */
	private $assets;

	/** @var Sanitizer */
	private $sanitizer;

	/** @var Parser */
	private $parser;

	/** @var Api */
	private $api;

	/**
	 * WpifyCustomFields constructor.
	 */
	public function __construct( string $wcf_url = '' ) {
		$assets_path     = realpath( __DIR__ . '/../build' );
		$this->assets    = new Assets( $assets_path, $wcf_url );
		$this->sanitizer = new Sanitizer();
		$this->parser    = new Parser();
		$this->api       = new Api();
	}

	/**
	 * @param array $args
	 *
	 * @return Options
	 */
	public function add_options_page( $args = array() ) {
		return new Options( $args, $this );
	}

	/**
	 * @param array $args
	 *
	 * @return Metabox
	 */
	public function add_metabox( $args = array() ) {
		return new Metabox( $args, $this );
	}

	/**
	 * @param array $args
	 *
	 * @return ProductOptions
	 */
	public function add_product_options( $args = array() ) {
		return new ProductOptions( $args, $this );
	}

	/**
	 * @param array $args
	 *
	 * @return Taxonomy
	 */
	public function add_taxonomy_options( $args = array() ) {
		return new Taxonomy( $args, $this );
	}

	/**
	 * @param array $args
	 *
	 * @return User
	 */
	public function add_user_options( $args = array() ) {
		return new User( $args, $this );
	}

	/**
	 * @param array $args
	 *
	 * @return WooCommerceSettings
	 */
	public function add_woocommerce_settings( $args = array() ) {
		return new WooCommerceSettings( $args, $this );
	}

	public function add_gutenberg_block( $args = array() ) {
		return new GutenbergBlock( $args, $this );
	}

	/**
	 * @return Parser
	 */
	public function get_parser(): Parser {
		return $this->parser;
	}

	/**
	 * @return Sanitizer
	 */
	public function get_sanitizer(): Sanitizer {
		return $this->sanitizer;
	}

	/**
	 * @return Api
	 */
	public function get_api(): Api {
		return $this->api;
	}

	/**
	 * @return Assets
	 */
	public function get_assets(): Assets {
		return $this->assets;
	}
}
