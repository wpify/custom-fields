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
	 * Constructs a new instance of the class.
	 *
	 * @param CustomFields $custom_fields An instance of the CustomFields class.
	 *
	 * @return void
	 */
	public function __construct( // phpcs:ignore Generic.CodeAnalysis.UselessOverridingMethod.Found
		private readonly CustomFields $custom_fields,
	) {
		parent::__construct( $custom_fields );
	}

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
	 * @param array  $item Item data to print as field.
	 * @param array  $data_attributes Optional. Additional data attributes.
	 * @param string $tag Optional. HTML tag to use.
	 * @param string $class_name Optional. Additional CSS class for the field element.
	 */
	public function print_field( array $item, array $data_attributes = array(), string $tag = 'div', string $class_name = '' ): void {
		$item['name']   = empty( $this->option_name ) ? $item['id'] : $this->option_name . '[' . $item['id'] . ']';
		$item['value']  = $this->get_field( $item['id'], $item );
		$item['loop']   = $data_attributes['loop'] ?? '';
		$integration_id = isset( $data_attributes['loop'] ) ? $this->id . '__' . $data_attributes['loop'] : $this->id;
		?>
		<<?php echo esc_attr( $tag ); ?> data-item="<?php echo esc_attr( htmlentities( wp_json_encode( $item ) ) ); ?>"
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
	 * Retrieves and sanitizes the value of a POST item based on the provided item definition and optional index.
	 *
	 * Nonce is verified by the caller.
	 * phpcs:disable WordPress.Security.NonceVerification.Missing
	 *
	 * Sanitization is handled by method \Wpify\CustomFields\CustomFields::sanitize_item_value().
	 * phpcs:disable WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
	 *
	 * @param array    $item The definition of the item, including its ID.
	 * @param int|null $index Optional index to retrieve a specific value if the item is an array.
	 *
	 * @return mixed The sanitized value of the POST item, or null if not set.
	 */
	public function get_sanitized_post_item_value( array $item, ?int $index = null ): mixed {
		/**
		 * Nonce is verified by the caller.
		 * phpcs:disable WordPress.Security.NonceVerification.Missing
		 *
		 * Sanitization is handled by method \Wpify\CustomFields\CustomFields::sanitize_item_value().
		 * phpcs:disable WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		 */
		if ( ( null === $index && isset( $_POST[ $item['id'] ] ) ) || isset( $_POST[ $item['id'] ][ $index ] ) ) {
			$wp_type = $this->custom_fields->get_wp_type( $item );
			$value   = wp_unslash( null === $index ? $_POST[ $item['id'] ] : $_POST[ $item['id'] ][ $index ] );

			if ( 'string' !== $wp_type ) {
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
}
