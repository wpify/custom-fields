<?php

namespace WpifyCustomFields\Implementations;

use WP_Term;
use WpifyCustomFields\WpifyCustomFields;

/**
 * Class Taxonomy
 * @package WpifyCustomFields\Implementations
 */
final class Taxonomy extends AbstractPostImplementation {
	/** @var int */
	private $term_id;

	/** @var string */
	private $taxonomy;

	/** @var array */
	private $items;

	/**
	 * Taxonomy constructor.
	 *
	 * @param array $args
	 * @param WpifyCustomFields $wcf
	 */
	public function __construct( array $args, WpifyCustomFields $wcf ) {
		parent::__construct( $args, $wcf );

		$args = wp_parse_args( $args, array(
			'taxonomy' => null,
			'items'    => array(),
			'term_id'  => null,
		) );

		$this->taxonomy = $args['taxonomy'];
		$this->items    = $args['items'];
		$this->term_id  = $args['term_id'];

		add_action( $this->taxonomy . '_add_form_fields', array( $this, 'render_add_form' ) );
		add_action( $this->taxonomy . '_edit_form_fields', array( $this, 'render_edit_form' ) );
		add_action( 'created_' . $this->taxonomy, array( $this, 'save' ) );
		add_action( 'edited_' . $this->taxonomy, array( $this, 'save' ) );
		add_action( 'init', array( $this, 'register_meta' ) );
	}

	public function register_meta() {
		$items = $this->get_items();

		foreach ( $items as $item ) {
			register_term_meta( $this->taxonomy, $item['id'], array(
				'type'        => $this->get_item_type( $item ),
				'description' => $item['title'],
				'single'      => true,
				'default'     => $item['default'] ?? null,
			) );
		}
	}

	public function get_items() {
		$items = apply_filters( 'wcf_taxonomy_items', $this->items, array(
			'taxonomy' => $this->taxonomy,
		) );

		return $this->prepare_items( $items );
	}

	/**
	 * @return void
	 */
	public function set_wcf_shown() {
		$current_screen  = get_current_screen();
		$this->wcf_shown = ( $current_screen->taxonomy === $this->taxonomy );
	}

	/**
	 * @return void
	 */
	public function render_add_form() {
		$this->render_fields( 'add_taxonomy' );
	}

	/**
	 * @return array
	 */
	public function get_data() {
		return array(
			'object_type' => 'taxonomy',
			'taxonomy'    => $this->taxonomy,
			'items'       => $this->get_items(),
		);
	}

	/**
	 * @param WP_Term $term
	 */
	public function render_edit_form( WP_Term $term ) {
		$this->set_post( $term->term_id );
		$this->render_fields( 'edit_taxonomy', 'tbody' );

	}

	/**
	 * @param number $post_id
	 */
	public function set_post( $post_id ) {
		$this->term_id = $post_id;
	}

	/**
	 * @param string $name
	 *
	 * @return mixed
	 */
	public function get_field( $name ) {
		return get_term_meta( $this->term_id, $name, true );
	}

	/**
	 * @param number $term_id
	 */
	public function save( $term_id ) {
		$this->set_post( $term_id );

		foreach ( $this->get_items() as $item ) {
			if ( ! isset( $_POST[ $item['id'] ] ) ) {
				continue;
			}

			$sanitizer = $this->sanitizer->get_sanitizer( $item );
			$value     = $sanitizer( wp_unslash( $_POST[ $item['id'] ] ) );

			$this->set_field( $item['id'], $value );
		}
	}

	/**
	 * @param string $name
	 * @param string $value
	 *
	 * @return bool|int|\WP_Error
	 */
	public function set_field( $name, $value ) {
		return update_term_meta( $this->term_id, $name, $value );
	}
}
