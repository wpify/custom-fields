<?php

namespace WpifyCustomFields\Implementations;

use WpifyCustomFields\WpifyCustomFields;

final class GutenbergBlock extends AbstractImplementation {
	private $name;
	private $title;
	private $category;
	private $parent;
	private $icon;
	private $description;
	private $keywords;
	private $textdomain;
	private $styles;
	private $supports;
	private $example;
	private $render_callback;
	private $attributes;
	private $uses_context;
	private $provides_context;
	private $editor_script;
	private $script;
	private $editor_style;
	private $style;
	private $items;

	/**
	 * GutenbergBlock constructor.
	 *
	 * @param array $args
	 * @param WpifyCustomFields $wcf
	 */
	public function __construct( array $args, WpifyCustomFields $wcf ) {
		parent::__construct( $args, $wcf );

		$defaults = array(
			'name'             => null, // string
			'title'            => null, // string
			'category'         => 'common', // string
			'parent'           => null, // string
			'icon'             => null, // string
			'description'      => null, // string
			'keywords'         => array(), // array
			'textdomain'       => null, // string
			'styles'           => array(), // array
			'supports'         => null, // array
			'example'          => null, // array
			'render_callback'  => null, // callable
			'attributes'       => array(), // array
			'uses_context'     => array(), // array
			'provides_context' => null, // array
			'editor_script'    => null, // string
			'script'           => null, // string
			'editor_style'     => null, // string
			'style'            => null, // string
			'items'            => array(), // array
		);

		$args = wp_parse_args( $args, $defaults );

		foreach ( $defaults as $key => $value ) {
			$this->{$key} = $args[ $key ];
		}

		add_action( 'init', array( $this, 'register_block' ) );
	}

	/**
	 * @return void
	 */
	public function register_block() {
		$args   = $this->get_args();
		$data   = array_merge( array( 'name' => $this->name, 'attributes' => $this->get_attributes() ), $args );
		$script = 'window.wcf_blocks=(window.wcf_blocks||[]);window.wcf_blocks.push(' . wp_json_encode( $data ) . ');';

		wp_add_inline_script( $args['editor_script'], $script, 'before' );
		register_block_type( $this->name, $args );

	}

	/**
	 * @return array
	 */
	public function get_args() {
		return array(
			'title'            => $this->title,
			'category'         => $this->category,
			'parent'           => $this->parent,
			'icon'             => $this->icon,
			'description'      => $this->description,
			'keywords'         => $this->keywords,
			'textdomain'       => $this->textdomain,
			'styles'           => $this->styles,
			'supports'         => $this->supports,
			'example'          => $this->example,
			'render_callback'  => $this->render_callback,
			'uses_context'     => $this->uses_context,
			'provides_context' => $this->provides_context,
			'editor_script'    => $this->get_editor_script(),
			'script'           => $this->script,
			'editor_style'     => $this->get_editor_style(),
			'style'            => $this->style,
		);
	}

	/**
	 * @return string|null
	 */
	public function get_editor_script() {
		if ( empty( $this->editor_script ) ) {
			return $this->wcf->get_assets()->register_script( 'wpify-custom-blocks.js' );
		}

		return null;
	}

	/**
	 * @return string|null
	 */
	public function get_editor_style() {
		if ( empty( $this->editor_style ) ) {
			return $this->wcf->get_assets()->register_style( 'wpify-custom-blocks.css' );
		}

		return null;
	}

	/**
	 * @return array
	 */
	public function get_attributes() {
		$attributes = array();

		foreach ( $this->get_items() as $item ) {
			$attributes[ $item['id'] ] = array(
				'type'    => $this->get_attribute_type( $item ),
				'default' => $item['default'],
			);
		}

		$attributes['wcf'] = array(
			'type'    => 'array',
			'default' => array_merge(
				$this->get_args(),
				array( 'items' => $this->get_items() ),
			)
		);

		return $attributes;
	}

	/**
	 * @return array
	 */
	public function get_items() {
		$items = apply_filters( 'wcf_gutenberg_block_items', $this->items, array_merge(
			array( 'name' => $this->name ),
			$this->get_args(),
		) );

		return $this->prepare_items( $items );
	}

	/**
	 * @param array $item
	 *
	 * @return string
	 */
	private function get_attribute_type( array $item ) {
		switch ( $item['type'] ) {
			case 'number':
			case 'attachment':
			case 'post':
				return 'number';
			case 'multi_attachment':
			case 'multi_group':
			case 'multi_post':
			case 'multi_select':
			case 'group':
				return 'array';
			case 'checkbox':
			case 'toggle':
				return 'boolean';
			default:
				return 'text';
		}
	}

	/**
	 * @param string $name
	 * @param string $value
	 *
	 * @return mixed
	 */
	public function set_field( $name, $value ) {
		// TODO: Implement set_field() method.
	}

	/**
	 * @return array
	 */
	public function get_data() {
		// TODO: Implement get_data() method.
	}

	/**
	 * @param string $name
	 *
	 * @return mixed
	 */
	public function get_field( $name ) {
		// TODO: Implement get_field() method.
	}

	public function set_wcf_shown() {
		// TODO: Implement set_wcf_shown() method.
	}
}
