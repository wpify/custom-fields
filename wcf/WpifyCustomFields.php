<?php

namespace WpifyCustomFields;

use WpifyCustomFields\Implementations\Metabox;
use WpifyCustomFields\Implementations\Options;
use WpifyCustomFields\Implementations\ProductOptions;
use WpifyCustomFields\Implementations\Taxonomy;
use WpifyCustomFields\Implementations\WooCommerceSettings;

final class WpifyCustomFields {
	private $assets;

	public function __construct() {
		$assets_path  = realpath( __DIR__ . '/../build' );
		$this->assets = new Assets( $assets_path );
		$this->setup();
	}

	private function setup() {
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
	}

	public function admin_enqueue_scripts() {
		$this->assets->enqueue_script( 'wpify-custom-fields.js' );
		$this->assets->enqueue_style( 'wpify-custom-fields.css' );
	}

	public function add_options_page( $args = array() ) {
		return new Options( $args );
	}

	public function add_metabox( $args = array() ) {
		return new Metabox( $args );
	}

	public function add_product_options( $args = array() ) {
		return new ProductOptions( $args );
	}

	public function add_taxonomy_options( $args = array() ) {
		return new Taxonomy( $args );
	}

	public function add_woocommerce_settings( $args = array() ) {
		return new WooCommerceSettings( $args );
	}
}
