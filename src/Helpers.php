<?php

namespace Wpify\CustomFields;

class Helpers {
	public static function normalize_options( $input ) {
		if ( is_array( $input ) ) {
			$first_element = reset( $input );

			if ( is_array( $first_element ) && isset( $first_element['value'] ) && isset( $first_element['label'] ) ) {
				return array_map( function ( $option ) {
					$option['value'] = strval( $option['value'] );
					$option['label'] = strval( $option['label'] );

					return $option;
				}, $input );
			}

			if ( is_string( $first_element ) ) {
				$result = array();

				foreach ( $input as $key => $value ) {
					$result[] = array(
						'value' => strval( $key ),
						'label' => $value
					);
				}

				return $result;
			}
		}

		return $input;
	}
}
