<?php
/**
 * Canonical catalogue of field types and their expected PHP mappings.
 *
 * Mirrors CustomFields::get_wp_type() / get_default_value() and the alias map in
 * BaseIntegration::normalize_item(). Kept in one place so the field-type-axis
 * tests can iterate every type. If a field type is added, this list should grow
 * with it — that is intentional: the tests then force a decision about its
 * sanitization, wp_type and default.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Tests\Support;

/**
 * Static field-type reference data.
 */
final class Catalog {
	/**
	 * Every field type => expected wp_type from CustomFields::get_wp_type().
	 *
	 * @return array<string,string>
	 */
	public static function wp_types(): array {
		return array(
			// Integer-backed references.
			'attachment'        => 'integer',
			'post'              => 'integer',
			'term'              => 'integer',
			// Numbers.
			'number'            => 'number',
			'range'             => 'number',
			// Booleans.
			'checkbox'          => 'boolean',
			'toggle'            => 'boolean',
			// Objects.
			'cloudflare'        => 'object',
			'group'             => 'object',
			'link'              => 'object',
			'mapycz'            => 'object',
			// Arrays.
			'date_range'        => 'array',
			// Strings (scalar text-ish and presentational).
			'button'            => 'string',
			'code'              => 'string',
			'color'             => 'string',
			'date'              => 'string',
			'datetime'          => 'string',
			'direct_file'       => 'string',
			'email'             => 'string',
			'hidden'            => 'string',
			'html'              => 'string',
			'inner_blocks'      => 'string',
			'month'             => 'string',
			'password'          => 'string',
			'radio'             => 'string',
			'richtext'          => 'string',
			'select'            => 'string',
			'tel'               => 'string',
			'text'              => 'string',
			'textarea'          => 'string',
			'time'              => 'string',
			'title'             => 'string',
			'url'               => 'string',
			'week'              => 'string',
			'wysiwyg'           => 'string',
			// Layout wrappers.
			'columns'           => 'string',
			'wrapper'           => 'string',
			// Every multi_* type maps to array.
			'multi_attachment'  => 'array',
			'multi_button'      => 'array',
			'multi_checkbox'    => 'array',
			'multi_date'        => 'array',
			'multi_date_range'  => 'array',
			'multi_datetime'    => 'array',
			'multi_direct_file' => 'array',
			'multi_email'       => 'array',
			'multi_group'       => 'array',
			'multi_link'        => 'array',
			'multi_mapycz'      => 'array',
			'multi_month'       => 'array',
			'multi_number'      => 'array',
			'multi_post'        => 'array',
			'multi_richtext'    => 'array',
			'multi_select'      => 'array',
			'multi_tel'         => 'array',
			'multi_term'        => 'array',
			'multi_text'        => 'array',
			'multi_textarea'    => 'array',
			'multi_time'        => 'array',
			'multi_toggle'      => 'array',
			'multi_url'         => 'array',
			'multi_week'        => 'array',
		);
	}

	/**
	 * All canonical field types.
	 *
	 * @return string[]
	 */
	public static function all_types(): array {
		return array_keys( self::wp_types() );
	}

	/**
	 * Backward-compatibility type aliases => canonical type.
	 *
	 * @return array<string,string>
	 */
	public static function aliases(): array {
		return array(
			'switch'      => 'toggle',
			'multiswitch' => 'multi_toggle',
			'multiselect' => 'multi_select',
			'colorpicker' => 'color',
			'gallery'     => 'multi_attachment',
			'repeater'    => 'multi_group',
		);
	}
}
