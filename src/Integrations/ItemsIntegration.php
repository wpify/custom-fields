<?php

namespace Wpify\CustomFields\Integrations;

use Wpify\CustomFields\CustomFields;

abstract class ItemsIntegration extends OptionsIntegration {
	public function __construct(
		private readonly CustomFields $custom_fields,
	) {
		parent::__construct( $custom_fields );
	}

	abstract function get_item_id(): int;

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
