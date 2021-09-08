<?php

namespace Wpify\CustomFields;

use Wpify\CustomFields\Implementations\GutenbergBlock;
use Wpify\CustomFields\Implementations\Metabox;
use Wpify\CustomFields\Implementations\Options;
use Wpify\CustomFields\Implementations\ProductOptions;
use Wpify\CustomFields\Implementations\Taxonomy;
use Wpify\CustomFields\Implementations\User;
use Wpify\CustomFields\Implementations\WooCommerceSettings;

/**
 * Class CustomFields
 * @package CustomFields
 */
final class CustomFields {
	/** @var Assets */
	private $assets;

	/** @var Sanitizer */
	private $sanitizer;

	/** @var Parser */
	private $parser;

	/** @var Api */
	private $api;

	/**
	 * CustomFields constructor.
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
	public function create_options_page( $args = array() ) {
		return new Options( $args, $this );
	}

	/**
	 * @param array $args
	 *
	 * @return Metabox
	 */
	public function create_metabox( $args = array() ) {
		return new Metabox( $args, $this );
	}

	/**
	 * @param array $args
	 *
	 * @return ProductOptions
	 */
	public function create_product_options( $args = array() ) {
		return new ProductOptions( $args, $this );
	}

	/**
	 * @param array $args
	 *
	 * @return Taxonomy
	 */
	public function create_taxonomy_options( $args = array() ) {
		return new Taxonomy( $args, $this );
	}

	/**
	 * @param array $args
	 *
	 * @return User
	 */
	public function create_user_options( $args = array() ) {
		return new User( $args, $this );
	}

	/**
	 * @param array $args
	 *
	 * @return WooCommerceSettings
	 */
	public function create_woocommerce_settings( $args = array() ) {
		return new WooCommerceSettings( $args, $this );
	}

	/**
	 * @param array $args
	 *
	 * @return GutenbergBlock
	 */
	public function create_gutenberg_block( $args = array() ) {
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
