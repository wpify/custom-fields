<?php

namespace Wpify\CustomFields\Integrations;

use WP_REST_Request;
use WP_REST_Server;
use Wpify\CustomFields\CustomFields;

/**
 * Abstract class Integration
 *
 * Provides a foundation for custom field integrations in WordPress,
 * including REST API registration and item normalization.
 */
abstract class BaseIntegration {
	public readonly array  $items;
	public readonly string $id;

	/**
	 * Constructor.
	 *
	 * Registers the REST API options on initialization.
	 *
	 * @param CustomFields $custom_fields The custom fields object.
	 */
	public function __construct(
		private readonly CustomFields $custom_fields,
	) {
		add_action( 'rest_api_init', array( $this, 'register_rest_options' ) );
	}

	/**
	 * Normalizes an array of items.
	 *
	 * @param array  $items     Items to normalize.
	 * @param string $global_id Optional. A global identifier for items.
	 *
	 * @return array Normalized items.
	 */
	protected function normalize_items( array $items, string $global_id = '' ): array {
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

	/**
	 * Normalizes a single item.
	 *
	 * @param array  $item      Item to normalize.
	 * @param string $global_id A global identifier for the item.
	 *
	 * @return array Normalized item.
	 */
	protected function normalize_item( array $item, string $global_id ): array {
		$item['global_id'] = $global_id . '__' . $item['id'];

		if ( isset( $item['custom_attributes'] ) ) {
			$item['props'] = $item['custom_attributes'];
			unset( $item['custom_attributes'] );
		}

		if ( isset( $item['title'] ) && ! empty( $item['label'] ) ) {
			$item['label'] = $item['title'];
		}

		if ( isset( $item['desc'] ) ) {
			$item['description'] = $item['desc'];
			unset( $item['desc'] );
		}

		if ( ! isset( $item['default'] ) ) {
			$item['default'] = $this->custom_fields->get_default_value( $item );
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

	/**
	 * Normalizes an array of options.
	 *
	 * @param array $options Options to normalize.
	 *
	 * @return array Normalized options.
	 */
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

	/**
	 * Enqueues scripts and styles necessary for the integration.
	 *
	 * Only enqueues on the admin side.
	 */
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

	/**
	 * Registers REST API for options recursively.
	 */
	public function register_rest_options(): void {
		$items = $this->normalize_items( $this->items );

		$this->register_options_routes( $items );
	}

	/**
	 * Registers option routes for an array of items.
	 *
	 * @param array $items Array of items to register routes for.
	 */
	public function register_options_routes( array $items = array() ): void {
		foreach ( $items as $item ) {
			$this->register_options_route( $item );
		}
	}

	/**
	 * Registers a REST API route for a single item.
	 *
	 * @param array $item Item for which to register the route.
	 */
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
}