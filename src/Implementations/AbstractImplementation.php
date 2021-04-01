<?php

namespace WpifyCustomFields\Implementations;

use WpifyCustomFields\Api;
use WpifyCustomFields\Parser;
use WpifyCustomFields\Sanitizer;

/**
 * Class AbstractImplementation
 * @package WpifyCustomFields\Implementations
 */
abstract class AbstractImplementation {
	/** @var Parser */
	protected $parser;

	/** @var Sanitizer */
	protected $sanitizer;

	/** @var Api */
	protected $api;

	abstract public function __construct( array $args, Parser $parser, Sanitizer $sanitizer, Api $api );

	/**
	 * @param string $name
	 * @param string $value
	 *
	 * @return mixed
	 */
	abstract public function set_field( $name, $value );

	/**
	 * @param string $object_type
	 * @param string $tag
	 */
	public function render_fields( $object_type = '', $tag = 'div' ) {
		$data = $this->get_data();

		if ( ! empty( $object_type ) ) {
			$data['object_type'] = $object_type;
		}

		$data        = $this->fill_values( $data );
		$data['api'] = array(
				'url'   => $this->api->get_rest_url(),
				'nonce' => $this->api->get_rest_nonce(),
		);

		$json = wp_json_encode( $data );
		?>
		<<?php echo $tag ?> class="js-wcf" data-wcf="<?php echo esc_attr( $json ) ?>"></<?php echo $tag ?>>
		<?php
	}

	/**
	 * @return array
	 */
	abstract public function get_data();

	/**
	 * @param array $definition
	 *
	 * @return array
	 */
	private function fill_values( array $definition ) {
		foreach ( $definition['items'] as $key => $item ) {
			$value = $this->parse_value( $this->get_field( $item['id'] ), $item );

			if ( ! empty( $definition['items'][ $key ]['items'] ) ) {
				$definition['items'][ $key ]['items'] = array_map(
						array( $this, 'normalize_item' ),
						$definition['items'][ $key ]['items']
				);
			}

			if ( empty( $value ) ) {
				$definition['items'][ $key ]['value'] = '';
			} else {
				$definition['items'][ $key ]['value'] = $value;
			}
		}

		return $definition;
	}

	/**
	 * @param string $value
	 * @param array $item
	 *
	 * @return mixed|void
	 */
	protected function parse_value( $value, $item = array() ) {
		$parser = $this->parser->get_parser( $item );

		return $parser( $value );
	}

	/**
	 * @param string $name
	 *
	 * @return mixed
	 */
	abstract public function get_field( $name );

	/**
	 * @param array $items
	 *
	 * @return array
	 */
	protected function prepare_items( array $items = array() ) {
		foreach ( $items as $key => $item ) {
			$items[ $key ] = $this->normalize_item( $item );
		}

		return array_values( array_filter( $items ) );
	}

	/**
	 * @param array $args
	 *
	 * @return array
	 */
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
