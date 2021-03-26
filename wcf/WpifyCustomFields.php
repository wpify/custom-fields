<?php

namespace WpifyCustomFields;

final class WpifyCustomFields {
	private $assets;

	public function __construct( string $assets_path ) {
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
		return new OptionsPage( $args );
	}
}
