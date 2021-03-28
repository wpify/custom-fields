<?php

namespace WpifyCustomFields\Implementations;

use WP_Term;

final class Taxonomy {
	private $taxonomy;
	private $items;

	public function __construct( array $args ) {
		$args = wp_parse_args( $args, array(
				'taxonomy' => null,
				'items'    => array(),
		) );

		$this->taxonomy = $args['taxonomy'];
		$this->items    = $args['items'];

		$this->setup();
	}

	public function setup() {
		add_action( $this->taxonomy . '_add_form_fields', array( $this, 'render_add_form' ) );
		add_action( $this->taxonomy . '_edit_form_fields', array( $this, 'render_edit_form' ), 10, 2 );
		add_action( 'created_' . $this->taxonomy, array( $this, 'save' ) );
		add_action( 'edited_' . $this->taxonomy, array( $this, 'save' ) );
	}

	public function render_add_form( $taxonomy ) {
		$data = $this->get_data();

		$data['object_type'] = 'add_' . $data['object_type'];

		$json = wp_json_encode( $data );
		?>
		<div class="js-wcf" data-wcf="<?php echo esc_attr( $json ) ?>"></div>
		<?php
	}

	public function get_data() {
		return array(
				'object_type' => 'taxonomy',
				'taxonomy'    => $this->taxonomy,
				'items'       => $this->items,
		);
	}

	public function render_edit_form( $term, $taxonomy ) {
		$data = $this->get_data();

		$data['object_type'] = 'edit_' . $data['object_type'];

		foreach ( $data['items'] as $key => $item ) {
			if ( empty( $data['items'][ $key ]['id'] ) ) {
				$data['items'][ $key ]['id'] = $data['items'][ $key ]['name'];
			}

			$value = $this->get_field( $term, $item['name'] );

			if ( empty( $value ) ) {
				$data['items'][ $key ]['value'] = '';
			} else {
				$data['items'][ $key ]['value'] = $value;
			}
		}

		$json = wp_json_encode( $data );
		?>
		<tbody class="js-wcf" data-wcf="<?php echo esc_attr( $json ) ?>"></tbody>
		<?php
	}

	public function get_field( WP_Term $term, $name ) {
		return get_term_meta( $term->term_id, $name, true );
	}

	public function save( $term_id ) {
		$term = get_term( $term_id, $this->taxonomy );

		foreach ( $this->items as $item ) {
			$this->set_field( $term, $item['name'], $_POST[ $item['name'] ] );
		}
	}

	public function set_field( WP_Term $term, $name, $value ) {
		// TODO: Sanitize input
		return update_term_meta( $term->term_id, $name, $value );
	}
}
