<?php

namespace WpifyCustomFields;

/**
 * Class Parser
 * @package WpifyCustomFields
 */
final class Parser {
	/** @var string[] */
	private $parsers = array(
		'group'       => 'parse_group_value',
		'multi_group' => 'parse_multi_group_value',
		'multi_select' => 'parse_multi_select_value',
	);

	/**
	 * Parser constructor.
	 */
	public function __construct() {
		foreach ( $this->parsers as $type => $function_name ) {
			add_filter( 'wcf_parse_' . $type . '_value_callback', function ( $callable ) use ( $function_name, $type ) {
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
	public function no_parser( $value ) {
		return $value;
	}

	/**
	 * @param $value
	 *
	 * @return array
	 */
	public function parse_group_value( $value ) {
		if ( is_serialized_string( $value ) ) {
			$value = maybe_unserialize( $value );
		} else if ( is_string( $value ) ) {
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
	 * @return array
	 */
	public function parse_multi_group_value( $values ) {
		if ( is_serialized_string( $values ) ) {
			$values = maybe_unserialize( $values );
		} else if ( is_string( $values ) ) {
			$values = json_decode( $values, true );
		}

		if ( is_array( $values ) ) {
			return array_values( array_filter( $values, function ( $value ) {
				return is_array( $value );
			} ) );
		}

		return array();
	}

	/**
	 * @param $value
	 *
	 * @return array
	 */
	public function parse_multi_select_value( $values ) {
		if ( is_serialized_string( $values ) ) {
			$values = maybe_unserialize( $values );
		} else if ( is_string( $values ) ) {
			$values = json_decode( $values, true );
		}

		if ( is_array( $values ) ) {
			return array_values( array_filter( $values, function ( $value ) {
				return ! is_array( $value );
			} ) );
		}

		return array();
	}

	/**
	 * @param $item
	 *
	 * @return mixed|void
	 */
	public function get_parser( $item ) {
		return apply_filters( 'wcf_parse_' . $item['type'] . '_value_callback', array( $this, 'no_parser' ) );
	}
}
