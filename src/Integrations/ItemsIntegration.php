<?php
/**
 * Abstract class ItemsIntegration.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Integrations;

use Wpify\CustomFields\CustomFields;

/**
 * Abstract class for integrating custom fields with items.
 */
abstract class ItemsIntegration extends OptionsIntegration {
	/**
	 * Constructor method for initializing the object with CustomFields.
	 *
	 * @param CustomFields $custom_fields An instance of CustomFields to initialize.
	 *
	 * @return void
	 */
	public function __construct( // phpcs:ignore Generic.CodeAnalysis.UselessOverridingMethod.Found
		private readonly CustomFields $custom_fields,
	) {
		parent::__construct( $custom_fields );
	}

	/**
	 * Abstract method to retrieve the item ID.
	 *
	 * @return int The ID of the item.
	 */
	abstract public function get_item_id(): int;

	/**
	 * Retrieves the value of a specified field.
	 *
	 * @param string $name The name of the field to retrieve.
	 * @param array  $item Optional. An array of item data which may include a 'callback_get' callable.
	 *
	 * @return mixed The value of the specified field.
	 */
	public function get_field( string $name, array $item = array() ): mixed {
		if ( ! empty( $item['callback_get'] ) ) {
			return call_user_func( $item['callback_get'], $item, $this->get_item_id() );
		} elseif ( ! empty( $this->option_name ) ) {
			$meta_value = $this->get_option_value( $this->option_name, array() );

			return $meta_value[ $name ] ?? $this->custom_fields->get_default_value( $item );
		} else {
			return $this->get_option_value( $name, $this->custom_fields->get_default_value( $item ) );
		}
	}

	/**
	 * Sets the value of a specified field.
	 *
	 * @param string $name The name of the field to set.
	 * @param mixed  $value The value to set for the specified field.
	 * @param array  $item Optional. An array of item data which may include a 'callback_set' callable.
	 *
	 * @return mixed The result of setting the specified field.
	 */
	public function set_field( string $name, mixed $value, array $item = array() ) {
		if ( ! empty( $item['callback_set'] ) ) {
			return call_user_func( $item['callback_set'], $item, $this->get_item_id(), $value );
		} elseif ( ! empty( $this->option_name ) ) {
			$meta_value          = $this->get_option_value( $this->option_name, array() );
			$meta_value[ $name ] = $value;

			return $this->set_option_value( $this->option_name, $meta_value );
		} else {
			return $this->set_option_value( $name, $value );
		}
	}
}
