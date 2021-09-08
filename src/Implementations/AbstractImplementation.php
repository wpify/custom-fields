<?php

namespace Wpify\CustomFields\Implementations;

use Wpify\CustomFields\Api;
use Wpify\CustomFields\Parser;
use Wpify\CustomFields\Sanitizer;
use Wpify\CustomFields\CustomFields;

/**
 * Class AbstractImplementation
 * @package CustomFields\Implementations
 */
abstract class AbstractImplementation {
	/** @var Parser */
	protected $parser;

	/** @var Sanitizer */
	protected $sanitizer;

	/** @var Api */
	protected $api;

	/** @var CustomFields */
	protected $wcf;

	/** @var bool */
	protected $wcf_shown = false;

	/** @var string */
	protected $script_handle = '';

	public function __construct( array $args, CustomFields $wcf ) {
		$this->wcf       = $wcf;
		$this->parser    = $wcf->get_parser();
		$this->sanitizer = $wcf->get_sanitizer();
		$this->api       = $wcf->get_api();

		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
		add_action( 'current_screen', array( $this, 'set_wcf_shown' ) );
	}

	/**
	 * @return void
	 */
	public function admin_enqueue_scripts() {
		if ( $this->wcf_shown ) {
			wp_enqueue_code_editor( array() );
			wp_enqueue_media();

			$this->wcf->get_assets()->enqueue_style(
				'wpify-custom-fields.css',
				array( 'wp-components' )
			);

			$this->script_handle = $this->wcf->get_assets()->enqueue_script(
				'wpify-custom-fields.js',
				array(),
				true,
				array(
					'wcf_code_editor_settings' => $this->wcf->get_assets()->get_code_editor_settings(),
					'wcf_build_url'            => $this->get_build_url(),
				)
			);
		}
	}

	public function get_build_url() {
		return $this->wcf->get_assets()->path_to_url( $this->wcf->get_assets()->get_assets_path() );
	}

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
	 * @param array $attributes
	 */
	public function render_fields( string $object_type = '', string $tag = 'div', array $attributes = array() ) {
		$data = $this->get_data();

		if ( ! empty( $object_type ) ) {
			$data['object_type'] = $object_type;
		}

		$data        = $this->fill_values( $data );
		$data['api'] = array(
			'url'   => $this->api->get_rest_url(),
			'nonce' => $this->api->get_rest_nonce(),
		);

		$class = empty( $attributes['class'] ) ? 'js-wcf' : 'js-wcf ' . $attributes['class'];

		$json = wp_json_encode( $data );
		$hash = 'd' . md5( $json );

		do_action( 'wcf_before_fields', $data );
		$script = 'try{window.wcf_data=(window.wcf_data||{});window.wcf_data.' . $hash . '=' . $json . ';}catch(e){console.error(e);}';
		echo '<script type="text/javascript">' . $script . '</script>';
		echo '<' . $tag . ' class="' . esc_attr( $class ) . '" data-hash="' . esc_attr( $hash ) . '"></' . $tag . '>';
		do_action( 'wcf_after_fields', $data );
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
	protected function fill_values( array $definition ) {
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

	abstract public function set_wcf_shown();

	/**
	 * @param array $item
	 *
	 * @return string
	 */
	public function get_item_type( array $item ) {
		switch ( $item['type'] ) {
			case 'number':
				return 'number';
			case 'attachment':
			case 'post':
				return 'integer';
			case 'multi_attachment':
			case 'multi_group':
			case 'multi_post':
			case 'multi_select':
				return 'array';
			case 'group':
				return 'object';
			case 'checkbox':
			case 'toggle':
				return 'boolean';
			default:
				return 'string';
		}
	}

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

		$args['id'] = str_replace( '-', '_', sanitize_title( $args['id'] ) );

		/* Compatibility with WPify Woo */
		$type_aliases = array(
			'multiswitch'     => 'multi_toggle',
			'switch'          => 'toggle',
			'multiselect'     => 'multi_select',
			'colorpicker'     => 'color',
			'react_component' => 'react',
		);

		foreach ( $type_aliases as $alias => $correct ) {
			if ( $args['type'] === $alias ) {
				$args['type'] = $correct;
			}
		}

		$args_aliases = array(
			'label'           => 'title',
			'desc'            => 'description',
			'async_list_type' => 'list_type',
		);

		foreach ( $args_aliases as $alias => $correct ) {
			if ( empty( $args[ $correct ] ) && ! empty( $args[ $alias ] ) ) {
				$args[ $correct ] = $args[ $alias ];
			}
		}

		if ( $args['type'] === 'group' && isset( $args['multi'] ) && $args['multi'] === true ) {
			$args['type'] = 'multi_group';
			unset( $args['multi'] );
		}

		if ( ! empty( $args['items'] ) && is_array( $args['items'] ) ) {
			foreach ( $args['items'] as $key => $item ) {
				$args['items'][ $key ] = $this->normalize_item( $item );
			}
		}

		return $args;
	}
}
