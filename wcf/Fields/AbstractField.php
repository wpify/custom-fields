<?php

namespace WpifyCustomFields\Fields;

abstract class AbstractField {
	protected $type;
	protected $id;
	protected $title;
	protected $class;
	protected $css;
	protected $default;
	protected $desc;
	protected $desc_tip;
	protected $placeholder;
	protected $suffix;
	protected $value;
	protected $custom_attributes;
	protected $description;
	protected $tooltip_html;

	public function __construct( $args ) {
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

		foreach ( $args as $key => $value ) {
			$this->{$key} = $value;
		}
	}

	public function get_array() {
		return array(
			'type'              => $this->type,
			'id'                => $this->id,
			'title'             => $this->title,
			'class'             => $this->class,
			'css'               => $this->css,
			'default'           => $this->default,
			'desc'              => $this->desc,
			'desc_tip'          => $this->desc_tip,
			'placeholder'       => $this->placeholder,
			'suffix'            => $this->suffix,
			'value'             => $this->value,
			'custom_attributes' => $this->custom_attributes,
			'description'       => $this->description,
			'tooltip_html'      => $this->tooltip_html,
		);
	}
}
