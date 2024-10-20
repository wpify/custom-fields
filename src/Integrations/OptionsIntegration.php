<?php

namespace Wpify\CustomFields\Integrations;

use Wpify\CustomFields\CustomFields;

abstract class OptionsIntegration extends BaseIntegration {
	public function __construct(
		private readonly CustomFields $custom_fields,
	) {
		parent::__construct( $custom_fields );
	}

	/**
	 * Prints the app container with specific data attributes.
	 *
	 * @param string $context         The context in which the app is used.
	 * @param array  $tabs            Tabs data to be used in the app.
	 * @param array  $data_attributes Optional. Additional data attributes.
	 */
	public function print_app( string $context, array $tabs, array $data_attributes = array() ): void {
		$loop           = $data_attributes['loop'] ?? '';
		$integration_id = isset( $data_attributes['loop'] ) ? $this->id . '__' . $loop : $this->id;
		?>
		<div class="wpifycf-app"
		     data-loaded="false"
		     data-integration-id="<?php echo esc_attr( $integration_id ); ?>"
		     data-tabs="<?php echo esc_attr( htmlentities( wp_json_encode( $tabs ) ) ); ?>"
		     data-context="<?php echo esc_attr( $context ); ?>"
			<?php
			foreach ( $data_attributes as $key => $value ) {
				printf( ' data-%s="%s"', esc_attr( $key ), esc_attr( $value ) );
			}
			?>
		></div>
		<?php
	}

	/**
	 * Prints a field element with specific data attributes.
	 *
	 * @param array  $item            Item data to print as field.
	 * @param array  $data_attributes Optional. Additional data attributes.
	 * @param string $tag             Optional. HTML tag to use.
	 * @param string $class           Optional. Additional CSS class for the field element.
	 */
	public function print_field( array $item, array $data_attributes = array(), string $tag = 'div', string $class = '' ): void {
		$item['name']  = empty( $this->option_name ) ? $item['id'] : $this->option_name . '[' . $item['id'] . ']';
		$item['value'] = $this->get_field( $item['id'], $item );

		bdump( $item['value'] );

		$item['loop']   = $data_attributes['loop'] ?? '';
		$integration_id = isset( $data_attributes['loop'] ) ? $this->id . '__' . $data_attributes['loop'] : $this->id;
		?>
		<<?php echo esc_attr( $tag ); ?> data-item="<?php echo esc_attr( htmlentities( wp_json_encode( $item ) ) ); ?>"
		data-integration-id="<?php echo esc_attr( $integration_id ); ?>"
		class="wpifycf-field-parent<?php echo $class ? ' ' . esc_attr( $class ) : ''; ?>"
		<?php
		foreach ( $data_attributes as $key => $value ) {
			printf( ' data-%s="%s"', esc_attr( $key ), esc_attr( $value ) );
		}
		?>
		></<?php echo esc_attr( $tag ); ?>>
		<?php
	}

	/**
	 * Retrieves the sanitized value from a POST request for a given item.
	 *
	 * @param array $item The item to retrieve the value for.
	 *
	 * @return mixed|null The sanitized value or null if not set.
	 */
	public function get_sanitized_post_item_value( array $item, ?int $index = null ): mixed {
		/**
		 * Nonce is verified by the caller.
		 * phpcs:disable WordPress.Security.NonceVerification.Missing
		 *
		 * Sanitization is handled by method \Wpify\CustomFields\CustomFields::sanitize_item_value().
		 * phpcs:disable WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		 */
		if ( ( $index === null && isset( $_POST[ $item['id'] ] ) ) || isset( $_POST[ $item['id'] ][ $index ] ) ) {
			$wp_type = $this->custom_fields->get_wp_type( $item );
			$value   = wp_unslash( $index === null ? $_POST[ $item['id'] ] : $_POST[ $item['id'] ][ $index ] );

			if ( $wp_type !== 'string' ) {
				$value = json_decode( $value, ARRAY_A );
			}

			return $this->custom_fields->sanitize_item_value( $item )( $value );
		}

		// phpcs:enable

		return null;
	}

	/**
	 * Gets the field value for a given name and item.
	 *
	 * @param string $name Field name.
	 * @param array  $item Optional. Field item data.
	 *
	 * @return mixed Field value.
	 */
	public function get_field( string $name, array $item = array() ): mixed {
		if ( isset( $item['callback_get'] ) && is_callable( $item['callback_get'] ) ) {
			return call_user_func( $item['callback_get'], $item );
		} elseif ( ! empty( $this->option_name ) ) {
			$data = $this->get_option_value( $this->option_name, array() );

			return $data[ $name ] ?? $this->custom_fields->get_default_value( $item );
		} else {
			return $this->get_option_value( $name, $this->custom_fields->get_default_value( $item ) );
		}
	}

	/**
	 * Sets the field value for a given name and item.
	 *
	 * @param string $name  Field name.
	 * @param mixed  $value Field value.
	 * @param array  $item  Optional. Field item data.
	 */
	public function set_field( string $name, mixed $value, array $item = array() ) {
		if ( isset( $item['callback_set'] ) && is_callable( $item['callback_set'] ) ) {
			return call_user_func( $item['callback_set'], $item, $value );
		} elseif ( ! empty( $this->option_name ) ) {
			$data          = $this->get_option_value( $this->option_name, array() );
			$data[ $name ] = $value;

			return $this->set_option_value( $this->option_name, $data );
		} else {
			return $this->set_option_value( $name, $value );
		}
	}

	public function set_fields( string $option_name, array $sanitized_values, array $items ) {
		$data = array();

		foreach ( $items as $item ) {
			if ( isset( $sanitized_values[ $item['id'] ] ) ) {
				if ( isset( $item['callback_set'] ) && is_callable( $item['callback_set'] ) ) {
					$data[ $item['id'] ] = call_user_func( $item['callback_set'], $item, $sanitized_values[ $item['id'] ] );
				} else {
					$data[ $item['id'] ] = $sanitized_values[ $item['id'] ];
				}
			}
		}

		$this->set_option_value( $option_name, $data );
	}

	abstract public function get_option_value( string $name, mixed $default_value );

	abstract public function set_option_value( string $name, mixed $value );
}
