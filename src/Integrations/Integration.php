<?php

namespace Wpify\CustomFields\Integrations;

use WP_REST_Request;
use WP_REST_Server;
use Wpify\CustomFields\CustomFields;

abstract class Integration {
	public readonly array $items;
	public readonly string $id;

	public function __construct(
		private readonly CustomFields $custom_fields,
	) {
		add_action( 'rest_api_init', array( $this, 'register_rest_options' ) );
	}

	protected function normalize_items( array $items, $global_id = '' ): array {
		$next_items = array();

		if ( empty( $global_id ) ) {
			$global_id = $this->id;
		}

		foreach ( $items as $key => $item ) {
			if ( empty( $item['id'] ) && is_string( $key ) ) {
				$item['id'] = $key;
			} elseif ( empty( $item['id'] ) ) {
				$item['id'] = uniqid();
			}

			$next_items[ $item['id'] ] = $this->normalize_item( $item, $global_id );
		}

		return array_values( $next_items );
	}

	protected function normalize_item( array $item, string $global_id ): array {
		$item['global_id'] = $global_id . '__' . $item['id'];

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
			$wp_type         = apply_filters( 'wpifycf_field_type_' . $item['type'], 'string', $item );
			$item['default'] = apply_filters( 'wpifycf_field_' . $wp_type . '_default_value', '', $item );
		}

		if ( isset( $item['items'] ) ) {
			$item['items'] = $this->normalize_items( $item['items'], $item['global_id'] );
		}

		if ( isset( $item['options'] ) ) {
			if ( is_callable( $item['options'] ) && empty( $item['async'] ) ) {
				$item['options'] = $this->normalize_options( $item['options']() );
			} elseif ( is_callable( $item['options'] ) ) {
				if ( empty( $item['options_key'] ) ) {
					$item['options_key'] = $item['global_id'];
				}

				$item['options_callback'] = $item['options'];
				$item['options']          = array();
			} elseif ( is_array( $item['options'] ) ) {
				$item['options'] = $this->normalize_options( $item['options'] );
			}
		}

		return $item;
	}

	public function normalize_options( array $options ): array {
		$next_options = array();

		foreach ( $options as $key => $value ) {
			if ( is_string( $key ) ) {
				$next_options[] = array(
					'label' => $value,
					'value' => $key,
				);
			} else {
				$next_options[] = $value;
			}
		}

		return $next_options;
	}

	public function enqueue(): void {
		if ( ! is_admin() ) {
			return;
		}

		$handle = 'wpifycf';
		$js     = $this->custom_fields->get_js_asset( 'wpify-custom-fields' );
		$data   = array(
			'stylesheet' => $this->custom_fields->get_css_asset( 'wpify-custom-fields' ),
			'api_path'   => $this->custom_fields->api->get_rest_namespace(),
		);

		// Dependencies for WYSIWYG field
		$js['dependencies'][] = 'wp-tinymce';
		$js['dependencies'][] = 'code-editor';

		wp_enqueue_editor();
		wp_enqueue_script( 'wp-block-library' );
		wp_tinymce_inline_scripts();

		// Dependencies for Toggle field
		wp_enqueue_style( 'wp-components' );

		// Dependencies for Attachment field
		wp_enqueue_media();

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
	}

	public function print_app( string $context, array $tabs, array $data_attributes = array() ): void {
		$loop           = $data_attributes['loop'] ?? '';
		$integration_id = isset( $data_attributes['loop'] ) ? $this->id . '__' . $loop : $this->id;
		?>
		<div class="wpifycf-app"
			data-loaded="false"
			data-integration-id="<?php echo esc_attr( $integration_id ); ?>"
			data-tabs="<?php echo esc_attr( wp_json_encode( $tabs ) ); ?>"
			data-context="<?php echo esc_attr( $context ); ?>"
			<?php
			foreach ( $data_attributes as $key => $value ) {
				printf( ' data-%s="%s"', esc_attr( $key ), esc_attr( $value ) );
			}
			?>
		></div>
		<?php
	}

	public function print_field( array $item, array $data_attributes = array(), string $tag = 'div', string $class = '' ): void {
		$item['name']   = empty( $this->option_name ) ? $item['id'] : $this->option_name . '[' . $item['id'] . ']';
		$item['value']  = $this->get_field( $item['id'], $item ) ?? $item['default'];
		$item['loop']   = $data_attributes['loop'] ?? '';
		$integration_id = isset( $data_attributes['loop'] ) ? $this->id . '__' . $data_attributes['loop'] : $this->id;

		if ( is_string( $item['value'] ) ) {
			$item['value'] = html_entity_decode( $item['value'] );
		}
		?>
		<<?php echo esc_attr( $tag ); ?> data-item="<?php echo esc_attr( wp_json_encode( $item ) ); ?>"
		data-integration-id="<?php echo esc_attr( $integration_id ); ?>"
		class="wpifycf-field wpifycf-field--type-<?php echo esc_attr( $item['id'] ); ?><?php echo $class ? ' ' . esc_attr( $class ) : ''; ?>"
		<?php
		foreach ( $data_attributes as $key => $value ) {
			printf( ' data-%s="%s"', esc_attr( $key ), esc_attr( $value ) );
		}
		?>
		></<?php echo esc_attr( $tag ); ?>>
		<?php
	}

	public function register_rest_options(): void {
		$items = $this->normalize_items( $this->items );

		$this->register_options_routes( $items );
	}

	public function register_options_routes( array $items = array() ): void {
		foreach ( $items as $item ) {
			$this->register_options_route( $item );
		}
	}

	public function register_options_route( array $item ): void {
		if ( ! empty( $item['options_key'] ) ) {
			$this->custom_fields->api->register_rest_route(
				'options/' . $item['options_key'],
				WP_REST_Server::READABLE,
				function ( WP_REST_Request $request ) use ( $item ) {
					$options = $item['options_callback']( $request->get_params() );

					if ( is_array( $options ) ) {
						return $this->normalize_options( $options );
					}

					return array();
				},
			);
		} elseif ( ! empty( $item['items'] ) ) {
			$this->register_options_routes( $item['items'] );
		}
	}

	public function get_sanitized_post_item_value( array $item ) {
		// Nonce should be verified by caller.
		// phpcs:ignore WordPress.Security.NonceVerification.Missing
		if ( isset( $_POST[ $item['id'] ] ) ) {
			$wp_type = apply_filters( 'wpifycf_field_type_' . $item['type'], 'string', $item );

			// Sanitization is done via a filter to allow for custom sanitization. Nonce should be verified by caller.
			// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized, WordPress.Security.NonceVerification.Missing
			$value = $wp_type === 'string' ? wp_unslash( $_POST[ $item['id'] ] ) : json_decode( wp_unslash( $_POST[ $item['id'] ] ), ARRAY_A );

			if ( $wp_type === 'string' ) {
				$value = html_entity_decode( $value );
			}

			return apply_filters( 'wpifycf_sanitize_field_type_' . $item['type'], $value, $item );
		}

		return null;
	}

	abstract public function get_field( string $name, $item = array() );

	abstract public function set_field( string $name, $value, $item = array() );
}
