<?php

namespace WpifyCustomFields;

use WpifyCustomFields\Implementations\Metabox;
use WpifyCustomFields\Implementations\Options;
use WpifyCustomFields\Implementations\ProductOptions;
use WpifyCustomFields\Implementations\Taxonomy;
use WpifyCustomFields\Implementations\WooCommerceSettings;

final class WpifyCustomFields {
	/** @var Assets */
	private $assets;

	/** @var Sanitizer */
	private $sanitizer;

	/** @var Parser */
	private $parser;

	/**
	 * WpifyCustomFields constructor.
	 */
	public function __construct() {
		$assets_path     = realpath( __DIR__ . '/../build' );
		$this->assets    = new Assets( $assets_path );
		$this->sanitizer = new Sanitizer();
		$this->parser    = new Parser();

		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
	}

	/**
	 * @return void
	 */
	public function admin_enqueue_scripts() {
		$this->assets->enqueue_script( 'wpify-custom-fields.js' );
		$this->assets->enqueue_style( 'wpify-custom-fields.css' );
	}

	/**
	 * @param array $args
	 *
	 * @return Options
	 */
	public function add_options_page( $args = array() ) {
		return new Options( $args, $this->parser, $this->sanitizer );
	}

	/**
	 * @param array $args
	 *
	 * @return Metabox
	 */
	public function add_metabox( $args = array() ) {
		return new Metabox( $args, $this->parser, $this->sanitizer );
	}

	/**
	 * @param array $args
	 *
	 * @return ProductOptions
	 */
	public function add_product_options( $args = array() ) {
		return new ProductOptions( $args, $this->parser, $this->sanitizer );
	}

	/**
	 * @param array $args
	 *
	 * @return Taxonomy
	 */
	public function add_taxonomy_options( $args = array() ) {
		return new Taxonomy( $args, $this->parser, $this->sanitizer );
	}

	/**
	 * @param array $args
	 *
	 * @return WooCommerceSettings
	 */
	public function add_woocommerce_settings( $args = array() ) {
		return new WooCommerceSettings( $args, $this->parser, $this->sanitizer );
	}
}
