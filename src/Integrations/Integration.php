<?php

namespace Wpify\CustomFields\Integrations;

use Wpify\CustomFields\CustomFields;

abstract class Integration {
	public readonly array $items;

	public function __construct(
		private readonly CustomFields $custom_fields,
	) {
		add_action( 'rest_api_init', array( $this, 'register_options_api' ) );
	}

	protected function normalize_items( array $items ): array {
		$next_items = array();

		foreach ( $items as $key => $item ) {
			if ( empty( $item['id'] ) && is_string( $key ) ) {
				$item['id'] = $key;
			} elseif ( empty( $item['id'] ) ) {
				$item['id'] = uniqid();
			}

			$next_items[ $item['id'] ] = $this->normalize_item( $item );
		}

		return array_values( $next_items );
	}

	protected function normalize_item( array $item ): array {
		if ( isset( $item['custom_attributes'] ) ) {
			$item['props'] = $item['custom_attributes'];
			unset( $item['custom_attributes'] );
		}

		if ( isset( $item['title'] ) ) {
			$item['label'] = $item['title'];
			unset( $item['title'] );
		}

		if ( isset( $item['desc'] ) ) {
			$item['description'] = $item['desc'];
			unset( $item['desc'] );
		}

		if ( ! isset( $item['default'] ) ) {
			$item['default'] = apply_filters( "wpifycf_field_{$item['type']}_default_value", '', $item );
		}

		if ( isset( $item['items'] ) ) {
			$item['items'] = $this->normalize_items( $item['items'] );
		}

		if ( isset( $item['options'] ) ) {
			if ( is_callable( $item['options'] ) ) {
				// TODO: Add support for callable options
			} elseif ( is_array( $item['options'] ) ) {
				$options = array();

				foreach ( $item['options'] as $key => $value ) {
					if ( is_array( $value ) ) {
						$options[] = $value;
					} else {
						$options[] = array( 'label' => $value, 'value' => $key );
					}
				}

				$item['options'] = $options;
			}
		}

		return $item;
	}

	public function enqueue() {
		$handle = 'wpifycf_custom_fields';
		$js     = $this->custom_fields->get_js_asset( 'wpify-custom-fields' );
		$data   = array(
			'stylesheet' => $this->custom_fields->get_css_asset( 'wpify-custom-fields' ),
		);

		wp_enqueue_script(
			$handle,
			$js['src'],
			$js['dependencies'],
			$js['version'],
			array( 'in_footer' => true ),
		);

		wp_add_inline_script(
			$handle,
			'window.' . $handle . '=' . wp_json_encode( $data ) . ';',
			'before',
		);

		if ( $this->has_field_type( $this->items, 'attachment' ) ) {
			wp_enqueue_media();
		}
	}

	public function has_field_type( array $items, string $type ): bool {
		foreach ( $items as $item ) {
			if ( $item['type'] === $type ) {
				return true;
			}

			if ( ! empty( $item['items'] ) ) {
				if ( $this->has_field_type( $item['items'], $type ) ) {
					return true;
				}
			}
		}

		return false;
	}

	public function register_options_api() {
		// TODO: Api musí mít v názvu slug pluginu, id integrace a id pole
	}
}
