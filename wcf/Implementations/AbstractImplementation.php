<?php

namespace WpifyCustomFields\Implementations;

abstract class AbstractImplementation {
	abstract public function get_field( $name );

	abstract public function set_field( $name, $value );

	abstract public function get_data();

	protected function prepare_items( array $items = array() ) {
		foreach ( $items as $key => $item ) {
			$items[ $key ] = $this->normalize_item( $item );
		}

		return array_values( array_filter( $items ) );
	}

	private function normalize_item( array $args = array() ) {
		$args = wp_parse_args( $args, array(
				'type'              => '',
				'name'              => '',
				'id'                => '',
				'title'             => '',
				'class'             => '',
				'css'               => '',
				'default'           => '',
				'desc'              => '',
				'desc_tip'          => '',
				'placeholder'       => '',
				'suffix'            => '',
				'value'             => '',
				'custom_attributes' => array(),
				'description'       => '',
				'tooltip_html'      => '',
		) );

		if ( empty( $args['id'] ) ) {
			$args['id'] = $args['name'];
		}

		return $args;
	}

	public function render_fields( $object_type = '' ) {
		$data = $this->get_data();

		if ( ! empty( $object_type ) ) {
			$data['object_type'] = $object_type;
		}

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
		<div class="js-wcf" data-wcf="<?php echo esc_attr( $json ) ?>"></div>
		<?php
	}
}
