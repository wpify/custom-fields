<?php
/**
 * Class DirectFileField.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Fields;

use Wpify\CustomFields\CustomFields;
use Wpify\CustomFields\Helpers;

/**
 * Class DirectFileField handles the direct_file field type functionality.
 *
 * This class manages file uploads directly to the filesystem without WordPress media library.
 */
class DirectFileField {
	/**
	 * CustomFields instance.
	 *
	 * @var CustomFields
	 */
	private CustomFields $custom_fields;

	/**
	 * Helpers instance.
	 *
	 * @var Helpers
	 */
	private Helpers $helpers;

	/**
	 * Constructor.
	 *
	 * @param CustomFields $custom_fields CustomFields instance.
	 */
	public function __construct( CustomFields $custom_fields ) {
		$this->custom_fields = $custom_fields;
		$this->helpers       = $custom_fields->helpers;

		$this->init_hooks();
	}

	/**
	 * Initialize WordPress hooks.
	 *
	 * @return void
	 */
	private function init_hooks(): void {
		add_filter( 'wpifycf_sanitize_direct_file', array( $this, 'sanitize_direct_file' ), 10, 3 );
		add_filter( 'wpifycf_sanitize_multi_direct_file', array( $this, 'sanitize_multi_direct_file' ), 10, 3 );
		add_filter( 'wpifycf_wp_type_direct_file', array( $this, 'get_wp_type' ), 10, 2 );
		add_filter( 'wpifycf_wp_type_multi_direct_file', array( $this, 'get_wp_type_multi' ), 10, 2 );
		add_filter( 'wpifycf_default_value_direct_file', array( $this, 'get_default_value' ), 10, 2 );
		add_filter( 'wpifycf_default_value_multi_direct_file', array( $this, 'get_default_value_multi' ), 10, 2 );
	}

	/**
	 * Sanitizes the direct_file field value.
	 *
	 * @param mixed $value The sanitized value.
	 * @param mixed $original_value The original value.
	 * @param array $item The field definition.
	 *
	 * @return string The absolute file path or empty string.
	 */
	public function sanitize_direct_file( $value, $original_value, array $item ): string {
		// If value is empty, handle deletion if needed.
		if ( empty( $value ) ) {
			$this->maybe_delete_old_file( $original_value, $item );
			return '';
		}

		// If value is the same as original, no change needed.
		if ( $value === $original_value ) {
			return sanitize_text_field( $value );
		}

		// Check if this is a temp file that needs to be moved.
		$temp_dir = $this->helpers->get_direct_file_temp_dir();
		if ( strpos( $value, $temp_dir ) === 0 ) {
			// This is a temp file, move it to the target directory.
			$target_directory = $this->get_target_directory( $item );
			$filename         = $this->helpers->get_filename_from_path( $value );
			$replace_existing = $item['replace_existing'] ?? false;

			$moved_path = $this->helpers->move_temp_to_directory(
				$value,
				$target_directory,
				$filename,
				$replace_existing
			);

			if ( $moved_path ) {
				// Delete old file if it exists and is different.
				if ( ! empty( $original_value ) && $original_value !== $moved_path ) {
					$this->maybe_delete_old_file( $original_value, $item );
				}

				return $moved_path;
			}

			// If move failed, return empty string.
			return '';
		}

		// Value is already a final path (e.g., editing existing record).
		// Validate it exists.
		if ( file_exists( $value ) ) {
			return sanitize_text_field( $value );
		}

		return '';
	}

	/**
	 * Sanitizes the multi_direct_file field value.
	 *
	 * @param mixed $value The sanitized value.
	 * @param mixed $original_value The original value.
	 * @param array $item The field definition.
	 *
	 * @return array Array of file paths.
	 */
	public function sanitize_multi_direct_file( $value, $original_value, array $item ): array {
		// Decode JSON or convert to array, handling edge cases.
		if ( is_string( $value ) ) {
			$decoded = json_decode( $value, true );
			$value   = is_array( $decoded ) ? $decoded : array( $value );
		} else {
			$value = (array) $value;
		}

		if ( is_string( $original_value ) ) {
			$decoded        = json_decode( $original_value, true );
			$original_value = is_array( $decoded ) ? $decoded : array( $original_value );
		} else {
			$original_value = (array) $original_value;
		}

		$sanitized_value = array();

		if ( ! is_array( $value ) ) {
			return array();
		}

		// Track which original files are still present.
		$original_files = is_array( $original_value ) ? $original_value : array();
		$kept_files     = array();

		foreach ( $value as $single_value ) {
			$sanitized = $this->sanitize_direct_file( $single_value, '', $item );
			if ( ! empty( $sanitized ) ) {
				$sanitized_value[] = $sanitized;
				$kept_files[]      = $sanitized;
			}
		}

		// Delete files that were removed.
		foreach ( $original_files as $original_file ) {
			if ( ! in_array( $original_file, $kept_files, true ) ) {
				$this->maybe_delete_old_file( $original_file, $item );
			}
		}

		return $sanitized_value;
	}

	/**
	 * Gets the target directory for the field.
	 *
	 * @param array $item The field definition.
	 *
	 * @return string The absolute target directory path.
	 */
	private function get_target_directory( array $item ): string {
		$directory = $item['directory'] ?? 'wp-content/uploads/direct-files/';
		return $this->helpers->sanitize_directory_path( $directory );
	}

	/**
	 * Maybe deletes the old file based on the field's on_delete setting.
	 *
	 * @param string $file_path The file path to delete.
	 * @param array  $item The field definition.
	 *
	 * @return void
	 */
	private function maybe_delete_old_file( string $file_path, array $item ): void {
		if ( empty( $file_path ) || ! file_exists( $file_path ) ) {
			return;
		}

		$on_delete = $item['on_delete'] ?? 'keep';

		if ( 'delete' === $on_delete ) {
			$this->helpers->delete_direct_file( $file_path );
		}
	}

	/**
	 * Returns the WordPress data type for direct_file field.
	 *
	 * @param string $type The current type.
	 * @param array  $item The field definition.
	 *
	 * @return string The WordPress data type.
	 */
	public function get_wp_type( string $type, array $item ): string {
		return 'string';
	}

	/**
	 * Returns the WordPress data type for multi_direct_file field.
	 *
	 * @param string $type The current type.
	 * @param array  $item The field definition.
	 *
	 * @return string The WordPress data type.
	 */
	public function get_wp_type_multi( string $type, array $item ): string {
		return 'array';
	}

	/**
	 * Returns the default value for direct_file field.
	 *
	 * @param mixed $default_value The current default value.
	 * @param array $item The field definition.
	 *
	 * @return string Empty string as default.
	 */
	public function get_default_value( $default_value, array $item ): string {
		return '';
	}

	/**
	 * Returns the default value for multi_direct_file field.
	 *
	 * @param mixed $default_value The current default value.
	 * @param array $item The field definition.
	 *
	 * @return array Empty array as default.
	 */
	public function get_default_value_multi( $default_value, array $item ): array {
		return array();
	}
}
