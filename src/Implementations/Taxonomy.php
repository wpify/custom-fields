<?php

namespace Wpify\CustomFields\Implementations;

use WP_Screen;
use WP_Term;
use Wpify\CustomFields\CustomFields;

/**
 * Class Taxonomy
 * @package CustomFields\Implementations
 */
final class Taxonomy extends AbstractPostImplementation {
	/** @var int */
	private $term_id;

	/** @var string */
	private $taxonomy;

	/** @var array */
	private $items;

	/** @var callable */
	private $display;

	/**
	 * Taxonomy constructor.
	 *
	 * @param array        $args
	 * @param CustomFields $wcf
	 */
	public function __construct( array $args, CustomFields $wcf ) {
		parent::__construct( $args, $wcf );

		$args = wp_parse_args( $args, array(
			'taxonomy'      => null,
			'items'         => array(),
			'term_id'       => null,
			'init_priority' => 10,
			'display'       => function () {
				return true;
			},
		) );

		$this->taxonomy = $args['taxonomy'];
		$this->items    = $args['items'];
		$this->term_id  = $args['term_id'];

		if ( is_callable( $args['display'] ) ) {
			$this->display = $args['display'];
		} else {
			$this->display = function () use ( $args ) {
				return $args['display'];
			};
		}

		add_action( $this->taxonomy . '_add_form_fields', array( $this, 'render_add_form' ) );
		add_action( $this->taxonomy . '_edit_form_fields', array( $this, 'render_edit_form' ) );
		add_action( 'created_' . $this->taxonomy, array( $this, 'save' ) );
		add_action( 'edited_' . $this->taxonomy, array( $this, 'save' ) );
		add_action( 'init', array( $this, 'register_meta' ), $args['init_priority'] );
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
	public function set_wcf_shown( WP_Screen $current_screen ) {
		$this->wcf_shown = ( $current_screen->taxonomy === $this->taxonomy );
	}

	/**
	 * @return void
	 */
	public function render_add_form() {
		$display_callback = $this->display;

		if ( ! boolval( $display_callback() ) ) {
			return;
		}

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
		$display_callback = $this->display;

		if ( ! boolval( $display_callback() ) ) {
			return;
		}

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
	 * @param array  $item
	 *
	 * @return mixed
	 */
	public function get_field( string $name, array $item ) {
		if ( ! empty( $item['callback_get'] ) ) {
			return call_user_func( $item['callback_get'], $item, $this->term_id );
		} else {
			return get_term_meta( $this->term_id, $name, true );
		}
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

			$this->set_field( $item['id'], $value, $item );
		}
	}

	/**
	 * @param string $name
	 * @param string $value
	 * @param array  $item
	 *
	 * @return bool|int|\WP_Error
	 */
	public function set_field( $name, $value, $item ) {
		if ( ! empty( $item['callback_set'] ) ) {
			return call_user_func( $item['callback_set'], $item, $this->term_id, $value );
		} else {
			return update_term_meta( $this->term_id, $name, wp_slash( $value ) );
		}
	}
}
