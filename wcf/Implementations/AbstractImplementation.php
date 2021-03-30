<?php

namespace WpifyCustomFields\Implementations;

abstract class AbstractImplementation {
	abstract public function set_field( $name, $value );

	public function render_fields( $object_type = '', $tag = 'div' ) {
		$data = $this->get_data();

		if ( ! empty( $object_type ) ) {
			$data['object_type'] = $object_type;
		}

		$data = $this->fill_values( $data );
		$json = wp_json_encode( $data );
		?>
		<<?php echo $tag ?> class="js-wcf" data-wcf="<?php echo esc_attr( $json ) ?>"></<?php echo $tag ?>>
		<?php
	}

	abstract public function get_data();

	private function fill_values( $definition, array $values = array() ) {
		foreach ( $definition['items'] as $key => $item ) {
			$value = isset( $values[ $item['id'] ] )
					? $values[ $item['id'] ]
					: $this->parse_value( $this->get_field( $item['id'] ), $item );

			if ( ! empty( $definition['items'][ $key ]['items'] ) ) {
				$definition['items'][ $key ]['items'] = array_map(
						array( $this, 'normalize_item' ),
						$definition['items'][ $key ]['items']
				);

				$definition['items'][ $key ] = $this->fill_values( $definition['items'][ $key ], $value );
			}

			if ( empty( $value ) ) {
				$definition['items'][ $key ]['value'] = '';
			} else {
				$definition['items'][ $key ]['value'] = $value;
			}
		}

		return $definition;
	}

	protected function parse_value( $value, $item = array() ) {
		return apply_filters( 'wcf_parse_' . $item['type'] . '_value', $value, $item );
	}

	abstract public function get_field( $name );

	protected function prepare_items( array $items = array() ) {
		foreach ( $items as $key => $item ) {
			$items[ $key ] = $this->normalize_item( $item );
		}

		return array_values( array_filter( $items ) );
	}

	private function normalize_item( array $args = array() ) {
		$args = wp_parse_args( $args, array(
				'type'              => '',
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

		return $args;
	}
}
