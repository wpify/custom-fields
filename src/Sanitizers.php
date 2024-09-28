<?php

namespace Wpify\CustomFields;

use JsonException;

class Sanitizers {
	public function sanitize_multi_field( $value ): array {
		if ( is_array( $value ) ) {
			return $value;
		}

		if ( is_object( $value ) ) {
			return (array) $value;
		}

		if ( is_string( $value ) ) {
			try {
				$value = json_decode( $value, true, 512, JSON_THROW_ON_ERROR );

				if ( is_array( $value ) ) {
					return $value;
				}
			} catch ( JsonException $e ) {
			}
		}

		return array();
	}

	public function sanitize_multi_checkbox( $value ) {
		if ( is_array( $value ) ) {
			return array_map( 'boolval', $value );
		}

		return array();
	}

	public function sanitize_boolean( $value ) {
		return filter_var( $value, FILTER_VALIDATE_BOOLEAN );
	}

	public function sanitize_option( mixed $value, array $items ) {
		$next_value = $value;

		if ( is_array( $next_value ) ) {
			foreach ( $items as $item ) {
				if ( empty( $item['type'] ) ) {
					continue;
				}

				if ( ! isset( $next_value[ $item['id'] ] ) ) {
					continue;
				}

				$item_value = $next_value[ $item['id'] ];
				$wp_type    = apply_filters( 'wpifycf_field_type_' . $item['type'], 'string' );

				if ( $wp_type !== 'string' && is_string( $item_value ) ) {
					try {
						$next_value[ $item['id'] ] = json_decode( $item_value, true, 512, JSON_THROW_ON_ERROR );
					} catch ( JsonException $e ) {
					}
				}
			}
		}

		return $next_value;
	}
}
