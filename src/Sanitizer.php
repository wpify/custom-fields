<?php

namespace Wpify\CustomFields;

/**
 * Class Sanitizer
 * @package CustomFields
 */
final class Sanitizer {
	/** @var string[] */
	private $sanitizers = array(
		'group'    => 'sanitize_group_value',
		'link'     => 'sanitize_group_value',
		'text'     => 'sanitize_text_field',
		'email'    => 'sanitize_email',
		'color'    => 'sanitize_text_field',
		'textarea' => 'sanitize_textarea_field',
		'tel'      => 'sanitize_text_field',
		'date'     => 'sanitize_text_field',
		'datetime' => 'sanitize_text_field',
		'month'    => 'sanitize_text_field',
		'number'   => 'sanitize_number_value',
		'password' => 'sanitize_text_field',
		'time'     => 'sanitize_text_field',
		'url'      => 'esc_url_raw',
		'week'     => 'sanitize_text_field',
	);

	/**
	 * Sanitizer constructor.
	 */
	public function __construct() {
		foreach ( $this->sanitizers as $type => $function_name ) {
			add_filter( 'wcf_sanitize_' . $type . '_value_callback', function ( $callable ) use ( $function_name, $type ) {
				if ( method_exists( $this, $function_name ) ) {
					return array( $this, $function_name );
				} elseif ( function_exists( $function_name ) ) {
					return $function_name;
				}

				return $callable;
			} );
		}
	}

	/**
	 * @param $value
	 *
	 * @return mixed
	 */
	public function no_sanitizer( $value ) {
		return $value;
	}

	/**
	 * @param $value
	 *
	 * @return array|mixed
	 */
	public function sanitize_group_value( $value ) {
		if ( is_string( $value ) ) {
			$value = json_decode( $value, true );
		}

		if ( is_array( $value ) ) {
			return $value;
		}

		return array();
	}

	/**
	 * @param $value
	 *
	 * @return float|null
	 */
	public function sanitize_number_value( $value ) {
		if ( is_numeric( $value ) ) {
			return floatval( $value );
		}

		return null;
	}

	/**
	 * @param $item
	 *
	 * @return mixed|void
	 */
	public function get_sanitizer( $item ) {
		return apply_filters( 'wcf_sanitize_' . $item['type'] . '_value_callback', 'sanitize_text_field' );
	}
}
