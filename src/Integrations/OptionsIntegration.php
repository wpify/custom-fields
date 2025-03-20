<?php
/**
 * Class OptionsIntegration.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Integrations;

use Wpify\CustomFields\CustomFields;

/**
 * Class OptionsIntegration
 *
 * This abstract class extends BaseIntegration, offering functionalities for handling custom fields.
 */
abstract class OptionsIntegration extends BaseIntegration {
	/**
	 * Prints the app container with specific data attributes.
	 *
	 * @param string $context The context in which the app is used.
	 * @param array  $tabs Tabs data to be used in the app.
	 * @param array  $data_attributes Optional. Additional data attributes.
	 */
	public function print_app( string $context, array $tabs, array $data_attributes = array() ): void {
		$loop           = $data_attributes['loop'] ?? '';
		$integration_id = isset( $data_attributes['loop'] ) ? $this->id . '__' . $loop : $this->id;
		?>
		<div class="wpifycf-app"
			data-loaded="false"
			data-integration-id="<?php echo esc_attr( $integration_id ); ?>"
			data-tabs="<?php echo esc_attr( $this->custom_fields->helpers->json_encode( $tabs ) ); ?>"
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
	 * @param array  $item Item data to print as field.
	 * @param array  $data_attributes Optional. Additional data attributes.
	 * @param string $tag Optional. HTML tag to use.
	 * @param string $class_name Optional. Additional CSS class for the field element.
	 */
	public function print_field( array $item, array $data_attributes = array(), string $tag = 'div', string $class_name = '' ): void {
		if ( empty( $this->option_name ) ) {
			$name = $item['id'];

			if ( isset( $data_attributes['loop'] ) ) {
				$name .= '[' . $data_attributes['loop'] . ']';
			}
		} else {
			$name = $this->option_name;

			if ( isset( $data_attributes['loop'] ) ) {
				$name .= '[' . $data_attributes['loop'] . ']';
			}

			$name .= '[' . $item['id'] . ']';
		}

		$item['name']   = $name;
		$item['value']  = $this->get_field( $item['id'], $item );
		$item['loop']   = $data_attributes['loop'] ?? '';
		$integration_id = isset( $data_attributes['loop'] ) ? $this->id . '__' . $data_attributes['loop'] : $this->id;
		?>
		<<?php echo esc_attr( $tag ); ?>
		data-item="<?php echo esc_attr( $this->custom_fields->helpers->json_encode( $item ) ); ?>"
		data-integration-id="<?php echo esc_attr( $integration_id ); ?>"
		class="wpifycf-field-parent<?php echo $class_name ? ' ' . esc_attr( $class_name ) : ''; ?>"
		<?php
		foreach ( $data_attributes as $key => $value ) {
			printf( ' data-%s="%s"', esc_attr( $key ), esc_attr( $value ) );
		}
		?>
		></<?php echo esc_attr( $tag ); ?>>
		<?php
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
	 * @param string $name Field name.
	 * @param mixed  $value Field value.
	 * @param array  $item Optional. Field item data.
	 */
	public function set_field( string $name, mixed $value, array $item = array() ): mixed {
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

	/**
	 * Sets fields for a given option name using sanitized values and item definitions.
	 *
	 * @param string $option_name The name of the option to set.
	 * @param array  $sanitized_values An array of sanitized values keyed by item IDs.
	 * @param array  $items An array of items where each item contains an 'id' and optionally a 'callback_set'.
	 *
	 * @return void
	 */
	public function set_fields( string $option_name, array $sanitized_values, array $items ): void {
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

	/**
	 * Retrieves the value of a given option.
	 *
	 * @param string $name The name of the option to retrieve.
	 * @param mixed  $default_value The default value to return if the option is not set.
	 *
	 * @return mixed The value of the option or the default value if not set.
	 */
	abstract public function get_option_value( string $name, mixed $default_value ): mixed;

	/**
	 * Sets the value of an option.
	 *
	 * @param string $name The name of the option to set.
	 * @param mixed  $value The value to assign to the option.
	 */
	abstract public function set_option_value( string $name, mixed $value );

	/**
	 * Set fields from $_POST request.
	 *
	 * @param array      $items An array of items where each item contains an 'id' and optionally a 'callback_set'.
	 * @param mixed|null $loop_id Optional. The loop ID to use for the fields.
	 */
	public function set_fields_from_post_request( array $items, mixed $loop_id = null ): void {
		// Sanitization is done via custom sanitizer.
		// phpcs:disable WordPress.Security.ValidatedSanitizedInput.InputNotSanitized

		// Nonce verification not needed here, is verified by caller.
		// phpcs:disable WordPress.Security.NonceVerification.Missing

		if ( ! empty( $this->option_name ) ) {
			if ( is_null( $loop_id ) ) {
				$post_data = isset( $_POST[ $this->option_name ] ) ? wp_unslash( $_POST[ $this->option_name ] ) : array();
			} else {
				$post_data = isset( $_POST[ $this->option_name ][ $loop_id ] ) ? wp_unslash( $_POST[ $this->option_name ][ $loop_id ] ) : array();
			}

			$this->set_fields(
				$this->option_name,
				$this->custom_fields->sanitize_option_value( $items )( $post_data ),
				$items
			);
		} else {
			foreach ( $items as $item ) {
				$wp_type = $this->custom_fields->get_wp_type( $item );

				if ( is_null( $loop_id ) ) {
					if ( ! isset( $_POST[ $item['id'] ] ) ) {
						continue;
					}

					$value = wp_unslash( $_POST[ $item['id'] ] );
				} else {
					if ( ! isset( $_POST[ $item['id'] ][ $loop_id ] ) ) {
						continue;
					}

					$value = wp_unslash( $_POST[ $item['id'] ][ $loop_id ] );
				}

				if ( 'string' !== $wp_type ) {
					$value = json_decode( $value, ARRAY_A );
				}

				$this->set_field(
					$item['id'],
					$this->custom_fields->sanitize_item_value( $item )( $value ),
					$item
				);
			}
		}
		// phpcs:enable
	}
}
