<?php

namespace WpifyCustomFields;

final class Parser {
	private $parsers = array(
		'group' => 'parse_group_value',
	);

	public function __construct() {
		foreach ( $this->parsers as $type => $parser ) {
			$this->parsers[ $type ] = array( $this, $parser );
			add_filter( 'wcf_parse_' . $type . '_value', array( $this, 'parse_group_value' ), 10, 2 );
		}
	}

	public function no_parser( $value ) {
		return $value;
	}

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

	public function get_parser( $item ) {
		return apply_filters(
			'wcf_parse_' . $item['type'] . '_value',
			array( $this, 'no_parser' )
		);
	}
}
