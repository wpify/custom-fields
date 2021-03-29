<?php

namespace WpifyCustomFields\Implementations;

use WP_Term;

final class Taxonomy extends AbstractPostImplementation {
	private $term_id;
	private $taxonomy;
	private $items;

	public function __construct( array $args ) {
		$args = wp_parse_args( $args, array(
				'taxonomy' => null,
				'items'    => array(),
				'term_id'  => null,
		) );

		$this->taxonomy = $args['taxonomy'];
		$this->items    = $this->prepare_items( $args['items'] );
		$this->term_id  = $args['term_id'];

		$this->setup();
	}

	public function setup() {
		add_action( $this->taxonomy . '_add_form_fields', array( $this, 'render_add_form' ) );
		add_action( $this->taxonomy . '_edit_form_fields', array( $this, 'render_edit_form' ) );
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

	public function render_edit_form( WP_Term $term ) {
		$data = $this->get_data();
		$this->set_post( $term->term_id );

		$data['object_type'] = 'edit_' . $data['object_type'];

		foreach ( $data['items'] as $key => $item ) {
			if ( empty( $data['items'][ $key ]['id'] ) ) {
				$data['items'][ $key ]['id'] = $data['items'][ $key ]['name'];
			}

			$value = $this->get_field( $item['name'] );

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
		// TODO: Sanitize input
		return update_term_meta( $this->term_id, $name, $value );
	}
}
