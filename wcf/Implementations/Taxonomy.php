<?php

namespace WpifyCustomFields\Implementations;

use WP_Term;
use WpifyCustomFields\Parser;
use WpifyCustomFields\Sanitizer;

final class Taxonomy extends AbstractPostImplementation {
	/** @var Parser */
	private $parser;

	/** @var Sanitizer */
	private $sanitizer;

	/** @var int */
	private $term_id;

	/** @var string */
	private $taxonomy;

	/** @var array */
	private $items;

	public function __construct( array $args, Parser $parser, Sanitizer $sanitizer ) {
		$args = wp_parse_args( $args, array(
			'taxonomy' => null,
			'items'    => array(),
			'term_id'  => null,
		) );

		$this->taxonomy  = $args['taxonomy'];
		$this->items     = $this->prepare_items( $args['items'] );
		$this->term_id   = $args['term_id'];
		$this->parser    = $parser;
		$this->sanitizer = $sanitizer;

		add_action( $this->taxonomy . '_add_form_fields', array( $this, 'render_add_form' ) );
		add_action( $this->taxonomy . '_edit_form_fields', array( $this, 'render_edit_form' ) );
		add_action( 'created_' . $this->taxonomy, array( $this, 'save' ) );
		add_action( 'edited_' . $this->taxonomy, array( $this, 'save' ) );

		foreach ( $this->items as $item ) {
			$sanitizer = $this->sanitizer->get_sanitizer( $item );

			register_term_meta( $this->taxonomy, $item['id'], array(
				'single'            => true,
				'sanitize_callback' => $sanitizer,
			) );
		}
	}

	public function render_add_form( $taxonomy ) {
		$this->render_fields( 'add_taxonomy' );
	}

	public function get_data() {
		return array(
			'object_type' => 'taxonomy',
			'taxonomy'    => $this->taxonomy,
			'items'       => $this->items,
		);
	}

	public function render_edit_form( WP_Term $term ) {
		$this->set_post( $term->term_id );
		$this->render_fields( 'edit_taxonomy', 'tbody' );

	}

	public function set_post( $post_id ) {
		$this->term_id = $post_id;
	}

	public function get_field( $name ) {
		return get_term_meta( $this->term_id, $name, true );
	}

	public function save( $term_id ) {
		$this->set_post( $term_id );

		foreach ( $this->items as $item ) {
			$this->set_field( $item['name'], $_POST[ $item['name'] ] );
		}
	}

	public function set_field( $name, $value ) {
		return update_term_meta( $this->term_id, $name, $value );
	}
}
