<?php

namespace Wpify\CustomFields;

class WordPressTypes {
	public function return_string(): string {
		return 'string';
	}

	public function string_default_value(): string {
		return '';
	}

	public function return_boolean(): string {
		return 'boolean';
	}

	public function boolean_default_value(): bool {
		return false;
	}

	public function return_integer(): string {
		return 'integer';
	}

	public function integer_default_value(): int {
		return 0;
	}

	public function return_number(): string {
		return 'number';
	}

	public function number_default_value(): float {
		return 0.0;
	}

	public function return_array(): string {
		return 'array';
	}

	public function array_default_value(): array {
		return array();
	}

	public function return_object(): string {
		return 'object';
	}

	public function object_default_value(): object {
		return new \stdClass();
	}
}
