<?php

namespace WpifyCustomFields\Interfaces;

interface CustomFieldsObjectInterface {
	public function get_field( $key );

	public function set_field( $key, $value );
}
