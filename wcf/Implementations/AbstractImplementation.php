<?php

namespace WpifyCustomFields\Implementations;

abstract class AbstractImplementation {
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

	abstract function get_field( $name );

	abstract function set_field( $name, $value );
}
