<?php
/**
 * Class FieldFactory.
 *
 * Provides a fluent, IDE-friendly API for building field definition arrays.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields;

/**
 * Class FieldFactory
 *
 * Stateless helper that exposes one method per field type.
 * Each method returns a plain array compatible with the existing items structure.
 */
class FieldFactory {

	/**
	 * Sentinel value used to distinguish "default not passed" from "default is null".
	 *
	 * @var string
	 */
	private const UNSET = '__wpifycf_unset__';

	/**
	 * Assembles a field definition array from its type, type-specific args and common args.
	 *
	 * Null values are filtered out so the resulting array only contains explicitly set keys.
	 * The special UNSET sentinel is used for the `default` parameter.
	 *
	 * @param string $type        The field type identifier.
	 * @param array  $type_args   Type-specific parameters (e.g. options, min, max).
	 * @param array  $common_args Common parameters shared by all field types.
	 *
	 * @return array The field definition array.
	 */
	private function build_field( string $type, array $type_args, array $common_args ): array {
		$field = array( 'type' => $type );

		foreach ( $type_args as $key => $value ) {
			if ( null !== $value ) {
				$field[ $key ] = $value;
			}
		}

		foreach ( $common_args as $key => $value ) {
			if ( 'default' === $key ) {
				if ( self::UNSET !== $value ) {
					$field['default'] = $value;
				}
			} elseif ( null !== $value ) {
				$field[ $key ] = $value;
			}
		}

		return $field;
	}

	/**
	 * Extracts common parameters by removing type-specific keys from all variables.
	 *
	 * @param array $all_vars The result of get_defined_vars() inside a field method.
	 * @param array $exclude  Keys to exclude (type-specific parameter names).
	 *
	 * @return array The remaining common parameters.
	 */
	private function extract_common( array $all_vars, array $exclude = array() ): array {
		foreach ( $exclude as $key ) {
			unset( $all_vars[ $key ] );
		}

		// Remap snake_case PHP parameters to camelCase keys expected by JS.
		$remap = array(
			'class_name'  => 'className',
			'force_modal' => 'forceModal',
		);

		foreach ( $remap as $snake => $camel ) {
			if ( array_key_exists( $snake, $all_vars ) ) {
				$all_vars[ $camel ] = $all_vars[ $snake ];
				unset( $all_vars[ $snake ] );
			}
		}

		return $all_vars;
	}

	/**
	 * Creates a text field definition.
	 *
	 * @param bool|null   $counter        Whether to show a character counter.
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function text(
		?bool $counter = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'text',
			array( 'counter' => $counter ),
			$this->extract_common( get_defined_vars(), array( 'counter' ) ),
		);
	}

	/**
	 * Creates a textarea field definition.
	 *
	 * @param bool|null   $counter        Whether to show a character counter.
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function textarea(
		?bool $counter = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'textarea',
			array( 'counter' => $counter ),
			$this->extract_common( get_defined_vars(), array( 'counter' ) ),
		);
	}

	/**
	 * Creates an email field definition.
	 *
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function email(
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'email',
			array(),
			$this->extract_common( get_defined_vars() ),
		);
	}

	/**
	 * Creates a password field definition.
	 *
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function password(
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'password',
			array(),
			$this->extract_common( get_defined_vars() ),
		);
	}

	/**
	 * Creates a tel field definition.
	 *
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function tel(
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'tel',
			array(),
			$this->extract_common( get_defined_vars() ),
		);
	}

	/**
	 * Creates a url field definition.
	 *
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function url(
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'url',
			array(),
			$this->extract_common( get_defined_vars() ),
		);
	}

	/**
	 * Creates a number field definition.
	 *
	 * @param float|null  $min            Minimum value.
	 * @param float|null  $max            Maximum value.
	 * @param float|null  $step           Step increment.
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function number(
		?float $min = null,
		?float $max = null,
		?float $step = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'number',
			array(
				'min'  => $min,
				'max'  => $max,
				'step' => $step,
			),
			$this->extract_common( get_defined_vars(), array( 'min', 'max', 'step' ) ),
		);
	}

	/**
	 * Creates a range field definition.
	 *
	 * @param float|null  $min            Minimum value.
	 * @param float|null  $max            Maximum value.
	 * @param float|null  $step           Step increment.
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function range(
		?float $min = null,
		?float $max = null,
		?float $step = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'range',
			array(
				'min'  => $min,
				'max'  => $max,
				'step' => $step,
			),
			$this->extract_common( get_defined_vars(), array( 'min', 'max', 'step' ) ),
		);
	}

	/**
	 * Creates a date field definition.
	 *
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function date(
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'date',
			array(),
			$this->extract_common( get_defined_vars() ),
		);
	}

	/**
	 * Creates a datetime field definition.
	 *
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function datetime(
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'datetime',
			array(),
			$this->extract_common( get_defined_vars() ),
		);
	}

	/**
	 * Creates a time field definition.
	 *
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function time(
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'time',
			array(),
			$this->extract_common( get_defined_vars() ),
		);
	}

	/**
	 * Creates a month field definition.
	 *
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function month(
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'month',
			array(),
			$this->extract_common( get_defined_vars() ),
		);
	}

	/**
	 * Creates a week field definition.
	 *
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function week(
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'week',
			array(),
			$this->extract_common( get_defined_vars() ),
		);
	}

	/**
	 * Creates a color field definition.
	 *
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function color(
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'color',
			array(),
			$this->extract_common( get_defined_vars() ),
		);
	}

	/**
	 * Creates a checkbox field definition.
	 *
	 * @param string|null $title          Checkbox title text.
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function checkbox(
		?string $title = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'checkbox',
			array( 'title' => $title ),
			$this->extract_common( get_defined_vars(), array( 'title' ) ),
		);
	}

	/**
	 * Creates a toggle field definition.
	 *
	 * @param string|null $title          Toggle title text.
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function toggle(
		?string $title = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'toggle',
			array( 'title' => $title ),
			$this->extract_common( get_defined_vars(), array( 'title' ) ),
		);
	}

	/**
	 * Creates a hidden field definition.
	 *
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function hidden(
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'hidden',
			array(),
			$this->extract_common( get_defined_vars() ),
		);
	}

	/**
	 * Creates a select field definition.
	 *
	 * @param array|null  $options        Select options.
	 * @param string|null $options_key    Options key for dynamic options.
	 * @param array|null  $async_params   Async loading parameters.
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function select(
		?array $options = null,
		?string $options_key = null,
		?array $async_params = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'select',
			array(
				'options'      => $options,
				'options_key'  => $options_key,
				'async_params' => $async_params,
			),
			$this->extract_common( get_defined_vars(), array( 'options', 'options_key', 'async_params' ) ),
		);
	}

	/**
	 * Creates a radio field definition.
	 *
	 * @param array|null  $options        Radio options.
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function radio(
		?array $options = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'radio',
			array( 'options' => $options ),
			$this->extract_common( get_defined_vars(), array( 'options' ) ),
		);
	}

	/**
	 * Creates a code editor field definition.
	 *
	 * @param string|null $language       Code language for syntax highlighting.
	 * @param int|null    $height         Editor height in pixels.
	 * @param string|null $theme          Editor theme.
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function code(
		?string $language = null,
		?int $height = null,
		?string $theme = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'code',
			array(
				'language' => $language,
				'height'   => $height,
				'theme'    => $theme,
			),
			$this->extract_common( get_defined_vars(), array( 'language', 'height', 'theme' ) ),
		);
	}

	/**
	 * Creates a WYSIWYG editor field definition.
	 *
	 * @param int|null    $height         Editor height in pixels.
	 * @param string|null $toolbar        Toolbar configuration.
	 * @param bool|null   $delay          Whether to delay initialization.
	 * @param string|null $tabs           Visible tabs configuration.
	 * @param bool|null   $force_modal     Whether to force modal editing.
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function wysiwyg(
		?int $height = null,
		?string $toolbar = null,
		?bool $delay = null,
		?string $tabs = null,
		?bool $force_modal = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'wysiwyg',
			array(
				'height'     => $height,
				'toolbar'    => $toolbar,
				'delay'      => $delay,
				'tabs'       => $tabs,
				'forceModal' => $force_modal,
			),
			$this->extract_common( get_defined_vars(), array( 'height', 'toolbar', 'delay', 'tabs', 'force_modal' ) ),
		);
	}

	/**
	 * Creates an attachment field definition.
	 *
	 * @param string|null $attachment_type Allowed attachment type (e.g. image, video).
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function attachment(
		?string $attachment_type = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'attachment',
			array( 'attachment_type' => $attachment_type ),
			$this->extract_common( get_defined_vars(), array( 'attachment_type' ) ),
		);
	}

	/**
	 * Creates a direct file upload field definition.
	 *
	 * @param array|null  $allowed_types  Allowed MIME types.
	 * @param int|null    $max_size       Maximum file size in bytes.
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function direct_file(
		?array $allowed_types = null,
		?int $max_size = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'direct_file',
			array(
				'allowed_types' => $allowed_types,
				'max_size'      => $max_size,
			),
			$this->extract_common( get_defined_vars(), array( 'allowed_types', 'max_size' ) ),
		);
	}

	/**
	 * Creates a post field definition.
	 *
	 * @param string|array|null $post_type      Post type(s) to query.
	 * @param string|null       $label          Field label.
	 * @param string|null       $description    Field description.
	 * @param bool|null         $required       Whether the field is required.
	 * @param mixed             $default        Default value.
	 * @param bool|null         $disabled       Whether the field is disabled.
	 * @param string|null       $tab            Tab identifier.
	 * @param string|null       $class_name      CSS class name.
	 * @param array|null        $conditions     Conditional display rules.
	 * @param array|null        $attributes     HTML attributes.
	 * @param bool|null         $unfiltered     Whether to skip sanitization.
	 * @param array|null        $render_options Render options.
	 * @param string|null       $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function post(
		string|array|null $post_type = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'post',
			array( 'post_type' => $post_type ),
			$this->extract_common( get_defined_vars(), array( 'post_type' ) ),
		);
	}

	/**
	 * Creates a term field definition.
	 *
	 * @param string|null $taxonomy       Taxonomy to query.
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function term(
		?string $taxonomy = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'term',
			array( 'taxonomy' => $taxonomy ),
			$this->extract_common( get_defined_vars(), array( 'taxonomy' ) ),
		);
	}

	/**
	 * Creates a link field definition.
	 *
	 * @param string|array|null $post_type      Post type(s) for post picker.
	 * @param string|null       $label          Field label.
	 * @param string|null       $description    Field description.
	 * @param bool|null         $required       Whether the field is required.
	 * @param mixed             $default        Default value.
	 * @param bool|null         $disabled       Whether the field is disabled.
	 * @param string|null       $tab            Tab identifier.
	 * @param string|null       $class_name      CSS class name.
	 * @param array|null        $conditions     Conditional display rules.
	 * @param array|null        $attributes     HTML attributes.
	 * @param bool|null         $unfiltered     Whether to skip sanitization.
	 * @param array|null        $render_options Render options.
	 * @param string|null       $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function link(
		string|array|null $post_type = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'link',
			array( 'post_type' => $post_type ),
			$this->extract_common( get_defined_vars(), array( 'post_type' ) ),
		);
	}

	/**
	 * Creates a Mapy.cz map field definition.
	 *
	 * @param string|null $lang           Map language.
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function mapycz(
		?string $lang = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'mapycz',
			array( 'lang' => $lang ),
			$this->extract_common( get_defined_vars(), array( 'lang' ) ),
		);
	}

	/**
	 * Creates an HTML field definition.
	 *
	 * @param string|null $content        HTML content to display.
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function html(
		?string $content = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'html',
			array( 'content' => $content ),
			$this->extract_common( get_defined_vars(), array( 'content' ) ),
		);
	}

	/**
	 * Creates a title field definition.
	 *
	 * @param string|null $title          Title text to display.
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function title(
		?string $title = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'title',
			array( 'title' => $title ),
			$this->extract_common( get_defined_vars(), array( 'title' ) ),
		);
	}

	/**
	 * Creates a button field definition.
	 *
	 * @param string|null $title          Button text.
	 * @param string|null $action         Button action identifier.
	 * @param string|null $url            Button URL.
	 * @param string|null $target         Link target attribute.
	 * @param bool|null   $primary        Whether the button is a primary button.
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function button(
		?string $title = null,
		?string $action = null,
		?string $url = null,
		?string $target = null,
		?bool $primary = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'button',
			array(
				'title'   => $title,
				'action'  => $action,
				'url'     => $url,
				'target'  => $target,
				'primary' => $primary,
			),
			$this->extract_common( get_defined_vars(), array( 'title', 'action', 'url', 'target', 'primary' ) ),
		);
	}

	/**
	 * Creates a multi-button field definition.
	 *
	 * @param array|null  $buttons        Array of button definitions.
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function multi_button(
		?array $buttons = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'multi_button',
			array( 'buttons' => $buttons ),
			$this->extract_common( get_defined_vars(), array( 'buttons' ) ),
		);
	}

	/**
	 * Creates a group field definition.
	 *
	 * @param array       $items          Child field definitions.
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function group(
		array $items = array(),
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'group',
			array( 'items' => $items ),
			$this->extract_common( get_defined_vars(), array( 'items' ) ),
		);
	}

	/**
	 * Creates a wrapper field definition.
	 *
	 * @param array       $items          Child field definitions.
	 * @param string|null $tag            HTML tag for the wrapper.
	 * @param string|null $classname      CSS class for the wrapper element.
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function wrapper(
		array $items = array(),
		?string $tag = null,
		?string $classname = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'wrapper',
			array(
				'items'     => $items,
				'tag'       => $tag,
				'classname' => $classname,
			),
			$this->extract_common( get_defined_vars(), array( 'items', 'tag', 'classname' ) ),
		);
	}

	/**
	 * Creates an inner blocks field definition for Gutenberg.
	 *
	 * @param array|null  $allowed_blocks Allowed block types.
	 * @param array|null  $template       Block template.
	 * @param string|null $template_lock  Template lock mode.
	 * @param string|null $orientation    Block orientation.
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function inner_blocks(
		?array $allowed_blocks = null,
		?array $template = null,
		?string $template_lock = null,
		?string $orientation = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'inner_blocks',
			array(
				'allowed_blocks' => $allowed_blocks,
				'template'       => $template,
				'template_lock'  => $template_lock,
				'orientation'    => $orientation,
			),
			$this->extract_common( get_defined_vars(), array( 'allowed_blocks', 'template', 'template_lock', 'orientation' ) ),
		);
	}

	/**
	 * Creates a date range field definition.
	 *
	 * @param string|null $min            Minimum date.
	 * @param string|null $max            Maximum date.
	 * @param string|null $label          Field label.
	 * @param string|null $description    Field description.
	 * @param bool|null   $required       Whether the field is required.
	 * @param mixed       $default        Default value.
	 * @param bool|null   $disabled       Whether the field is disabled.
	 * @param string|null $tab            Tab identifier.
	 * @param string|null $class_name      CSS class name.
	 * @param array|null  $conditions     Conditional display rules.
	 * @param array|null  $attributes     HTML attributes.
	 * @param bool|null   $unfiltered     Whether to skip sanitization.
	 * @param array|null  $render_options Render options.
	 * @param string|null $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function date_range(
		?string $min = null,
		?string $max = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'date_range',
			array(
				'min' => $min,
				'max' => $max,
			),
			$this->extract_common( get_defined_vars(), array( 'min', 'max' ) ),
		);
	}

	// -------------------------------------------------------------------------
	// Multi-field variants
	// -------------------------------------------------------------------------

	/**
	 * Creates a multi-text field definition.
	 *
	 * @param bool|null   $counter           Whether to show a character counter.
	 * @param int|null    $min               Minimum number of items.
	 * @param int|null    $max               Maximum number of items.
	 * @param array|null  $buttons           Custom buttons for the multi-field.
	 * @param array|null  $disabled_buttons  Buttons to disable.
	 * @param string|null $label             Field label.
	 * @param string|null $description       Field description.
	 * @param bool|null   $required          Whether the field is required.
	 * @param mixed       $default           Default value.
	 * @param bool|null   $disabled          Whether the field is disabled.
	 * @param string|null $tab               Tab identifier.
	 * @param string|null $class_name         CSS class name.
	 * @param array|null  $conditions        Conditional display rules.
	 * @param array|null  $attributes        HTML attributes.
	 * @param bool|null   $unfiltered        Whether to skip sanitization.
	 * @param array|null  $render_options    Render options.
	 * @param string|null $generator         Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function multi_text(
		?bool $counter = null,
		?int $min = null,
		?int $max = null,
		?array $buttons = null,
		?array $disabled_buttons = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'multi_text',
			array(
				'counter'          => $counter,
				'min'              => $min,
				'max'              => $max,
				'buttons'          => $buttons,
				'disabled_buttons' => $disabled_buttons,
			),
			$this->extract_common( get_defined_vars(), array( 'counter', 'min', 'max', 'buttons', 'disabled_buttons' ) ),
		);
	}

	/**
	 * Creates a multi-textarea field definition.
	 *
	 * @param bool|null   $counter           Whether to show a character counter.
	 * @param int|null    $min               Minimum number of items.
	 * @param int|null    $max               Maximum number of items.
	 * @param array|null  $buttons           Custom buttons for the multi-field.
	 * @param array|null  $disabled_buttons  Buttons to disable.
	 * @param string|null $label             Field label.
	 * @param string|null $description       Field description.
	 * @param bool|null   $required          Whether the field is required.
	 * @param mixed       $default           Default value.
	 * @param bool|null   $disabled          Whether the field is disabled.
	 * @param string|null $tab               Tab identifier.
	 * @param string|null $class_name         CSS class name.
	 * @param array|null  $conditions        Conditional display rules.
	 * @param array|null  $attributes        HTML attributes.
	 * @param bool|null   $unfiltered        Whether to skip sanitization.
	 * @param array|null  $render_options    Render options.
	 * @param string|null $generator         Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function multi_textarea(
		?bool $counter = null,
		?int $min = null,
		?int $max = null,
		?array $buttons = null,
		?array $disabled_buttons = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'multi_textarea',
			array(
				'counter'          => $counter,
				'min'              => $min,
				'max'              => $max,
				'buttons'          => $buttons,
				'disabled_buttons' => $disabled_buttons,
			),
			$this->extract_common( get_defined_vars(), array( 'counter', 'min', 'max', 'buttons', 'disabled_buttons' ) ),
		);
	}

	/**
	 * Creates a multi-email field definition.
	 *
	 * @param int|null    $min               Minimum number of items.
	 * @param int|null    $max               Maximum number of items.
	 * @param array|null  $buttons           Custom buttons for the multi-field.
	 * @param array|null  $disabled_buttons  Buttons to disable.
	 * @param string|null $label             Field label.
	 * @param string|null $description       Field description.
	 * @param bool|null   $required          Whether the field is required.
	 * @param mixed       $default           Default value.
	 * @param bool|null   $disabled          Whether the field is disabled.
	 * @param string|null $tab               Tab identifier.
	 * @param string|null $class_name         CSS class name.
	 * @param array|null  $conditions        Conditional display rules.
	 * @param array|null  $attributes        HTML attributes.
	 * @param bool|null   $unfiltered        Whether to skip sanitization.
	 * @param array|null  $render_options    Render options.
	 * @param string|null $generator         Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function multi_email(
		?int $min = null,
		?int $max = null,
		?array $buttons = null,
		?array $disabled_buttons = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'multi_email',
			array(
				'min'              => $min,
				'max'              => $max,
				'buttons'          => $buttons,
				'disabled_buttons' => $disabled_buttons,
			),
			$this->extract_common( get_defined_vars(), array( 'min', 'max', 'buttons', 'disabled_buttons' ) ),
		);
	}

	/**
	 * Creates a multi-tel field definition.
	 *
	 * @param int|null    $min               Minimum number of items.
	 * @param int|null    $max               Maximum number of items.
	 * @param array|null  $buttons           Custom buttons for the multi-field.
	 * @param array|null  $disabled_buttons  Buttons to disable.
	 * @param string|null $label             Field label.
	 * @param string|null $description       Field description.
	 * @param bool|null   $required          Whether the field is required.
	 * @param mixed       $default           Default value.
	 * @param bool|null   $disabled          Whether the field is disabled.
	 * @param string|null $tab               Tab identifier.
	 * @param string|null $class_name         CSS class name.
	 * @param array|null  $conditions        Conditional display rules.
	 * @param array|null  $attributes        HTML attributes.
	 * @param bool|null   $unfiltered        Whether to skip sanitization.
	 * @param array|null  $render_options    Render options.
	 * @param string|null $generator         Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function multi_tel(
		?int $min = null,
		?int $max = null,
		?array $buttons = null,
		?array $disabled_buttons = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'multi_tel',
			array(
				'min'              => $min,
				'max'              => $max,
				'buttons'          => $buttons,
				'disabled_buttons' => $disabled_buttons,
			),
			$this->extract_common( get_defined_vars(), array( 'min', 'max', 'buttons', 'disabled_buttons' ) ),
		);
	}

	/**
	 * Creates a multi-url field definition.
	 *
	 * @param int|null    $min               Minimum number of items.
	 * @param int|null    $max               Maximum number of items.
	 * @param array|null  $buttons           Custom buttons for the multi-field.
	 * @param array|null  $disabled_buttons  Buttons to disable.
	 * @param string|null $label             Field label.
	 * @param string|null $description       Field description.
	 * @param bool|null   $required          Whether the field is required.
	 * @param mixed       $default           Default value.
	 * @param bool|null   $disabled          Whether the field is disabled.
	 * @param string|null $tab               Tab identifier.
	 * @param string|null $class_name         CSS class name.
	 * @param array|null  $conditions        Conditional display rules.
	 * @param array|null  $attributes        HTML attributes.
	 * @param bool|null   $unfiltered        Whether to skip sanitization.
	 * @param array|null  $render_options    Render options.
	 * @param string|null $generator         Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function multi_url(
		?int $min = null,
		?int $max = null,
		?array $buttons = null,
		?array $disabled_buttons = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'multi_url',
			array(
				'min'              => $min,
				'max'              => $max,
				'buttons'          => $buttons,
				'disabled_buttons' => $disabled_buttons,
			),
			$this->extract_common( get_defined_vars(), array( 'min', 'max', 'buttons', 'disabled_buttons' ) ),
		);
	}

	/**
	 * Creates a multi-number field definition.
	 *
	 * @param float|null  $step              Step increment for each number field.
	 * @param int|null    $min               Minimum number of items.
	 * @param int|null    $max               Maximum number of items.
	 * @param array|null  $buttons           Custom buttons for the multi-field.
	 * @param array|null  $disabled_buttons  Buttons to disable.
	 * @param string|null $label             Field label.
	 * @param string|null $description       Field description.
	 * @param bool|null   $required          Whether the field is required.
	 * @param mixed       $default           Default value.
	 * @param bool|null   $disabled          Whether the field is disabled.
	 * @param string|null $tab               Tab identifier.
	 * @param string|null $class_name         CSS class name.
	 * @param array|null  $conditions        Conditional display rules.
	 * @param array|null  $attributes        HTML attributes.
	 * @param bool|null   $unfiltered        Whether to skip sanitization.
	 * @param array|null  $render_options    Render options.
	 * @param string|null $generator         Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function multi_number(
		?float $step = null,
		?int $min = null,
		?int $max = null,
		?array $buttons = null,
		?array $disabled_buttons = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'multi_number',
			array(
				'step'             => $step,
				'min'              => $min,
				'max'              => $max,
				'buttons'          => $buttons,
				'disabled_buttons' => $disabled_buttons,
			),
			$this->extract_common( get_defined_vars(), array( 'step', 'min', 'max', 'buttons', 'disabled_buttons' ) ),
		);
	}

	/**
	 * Creates a multi-date field definition.
	 *
	 * @param int|null    $min               Minimum number of items.
	 * @param int|null    $max               Maximum number of items.
	 * @param array|null  $buttons           Custom buttons for the multi-field.
	 * @param array|null  $disabled_buttons  Buttons to disable.
	 * @param string|null $label             Field label.
	 * @param string|null $description       Field description.
	 * @param bool|null   $required          Whether the field is required.
	 * @param mixed       $default           Default value.
	 * @param bool|null   $disabled          Whether the field is disabled.
	 * @param string|null $tab               Tab identifier.
	 * @param string|null $class_name         CSS class name.
	 * @param array|null  $conditions        Conditional display rules.
	 * @param array|null  $attributes        HTML attributes.
	 * @param bool|null   $unfiltered        Whether to skip sanitization.
	 * @param array|null  $render_options    Render options.
	 * @param string|null $generator         Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function multi_date(
		?int $min = null,
		?int $max = null,
		?array $buttons = null,
		?array $disabled_buttons = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'multi_date',
			array(
				'min'              => $min,
				'max'              => $max,
				'buttons'          => $buttons,
				'disabled_buttons' => $disabled_buttons,
			),
			$this->extract_common( get_defined_vars(), array( 'min', 'max', 'buttons', 'disabled_buttons' ) ),
		);
	}

	/**
	 * Creates a multi-datetime field definition.
	 *
	 * @param int|null    $min               Minimum number of items.
	 * @param int|null    $max               Maximum number of items.
	 * @param array|null  $buttons           Custom buttons for the multi-field.
	 * @param array|null  $disabled_buttons  Buttons to disable.
	 * @param string|null $label             Field label.
	 * @param string|null $description       Field description.
	 * @param bool|null   $required          Whether the field is required.
	 * @param mixed       $default           Default value.
	 * @param bool|null   $disabled          Whether the field is disabled.
	 * @param string|null $tab               Tab identifier.
	 * @param string|null $class_name         CSS class name.
	 * @param array|null  $conditions        Conditional display rules.
	 * @param array|null  $attributes        HTML attributes.
	 * @param bool|null   $unfiltered        Whether to skip sanitization.
	 * @param array|null  $render_options    Render options.
	 * @param string|null $generator         Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function multi_datetime(
		?int $min = null,
		?int $max = null,
		?array $buttons = null,
		?array $disabled_buttons = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'multi_datetime',
			array(
				'min'              => $min,
				'max'              => $max,
				'buttons'          => $buttons,
				'disabled_buttons' => $disabled_buttons,
			),
			$this->extract_common( get_defined_vars(), array( 'min', 'max', 'buttons', 'disabled_buttons' ) ),
		);
	}

	/**
	 * Creates a multi-time field definition.
	 *
	 * @param int|null    $min               Minimum number of items.
	 * @param int|null    $max               Maximum number of items.
	 * @param array|null  $buttons           Custom buttons for the multi-field.
	 * @param array|null  $disabled_buttons  Buttons to disable.
	 * @param string|null $label             Field label.
	 * @param string|null $description       Field description.
	 * @param bool|null   $required          Whether the field is required.
	 * @param mixed       $default           Default value.
	 * @param bool|null   $disabled          Whether the field is disabled.
	 * @param string|null $tab               Tab identifier.
	 * @param string|null $class_name         CSS class name.
	 * @param array|null  $conditions        Conditional display rules.
	 * @param array|null  $attributes        HTML attributes.
	 * @param bool|null   $unfiltered        Whether to skip sanitization.
	 * @param array|null  $render_options    Render options.
	 * @param string|null $generator         Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function multi_time(
		?int $min = null,
		?int $max = null,
		?array $buttons = null,
		?array $disabled_buttons = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'multi_time',
			array(
				'min'              => $min,
				'max'              => $max,
				'buttons'          => $buttons,
				'disabled_buttons' => $disabled_buttons,
			),
			$this->extract_common( get_defined_vars(), array( 'min', 'max', 'buttons', 'disabled_buttons' ) ),
		);
	}

	/**
	 * Creates a multi-month field definition.
	 *
	 * @param int|null    $min               Minimum number of items.
	 * @param int|null    $max               Maximum number of items.
	 * @param array|null  $buttons           Custom buttons for the multi-field.
	 * @param array|null  $disabled_buttons  Buttons to disable.
	 * @param string|null $label             Field label.
	 * @param string|null $description       Field description.
	 * @param bool|null   $required          Whether the field is required.
	 * @param mixed       $default           Default value.
	 * @param bool|null   $disabled          Whether the field is disabled.
	 * @param string|null $tab               Tab identifier.
	 * @param string|null $class_name         CSS class name.
	 * @param array|null  $conditions        Conditional display rules.
	 * @param array|null  $attributes        HTML attributes.
	 * @param bool|null   $unfiltered        Whether to skip sanitization.
	 * @param array|null  $render_options    Render options.
	 * @param string|null $generator         Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function multi_month(
		?int $min = null,
		?int $max = null,
		?array $buttons = null,
		?array $disabled_buttons = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'multi_month',
			array(
				'min'              => $min,
				'max'              => $max,
				'buttons'          => $buttons,
				'disabled_buttons' => $disabled_buttons,
			),
			$this->extract_common( get_defined_vars(), array( 'min', 'max', 'buttons', 'disabled_buttons' ) ),
		);
	}

	/**
	 * Creates a multi-week field definition.
	 *
	 * @param int|null    $min               Minimum number of items.
	 * @param int|null    $max               Maximum number of items.
	 * @param array|null  $buttons           Custom buttons for the multi-field.
	 * @param array|null  $disabled_buttons  Buttons to disable.
	 * @param string|null $label             Field label.
	 * @param string|null $description       Field description.
	 * @param bool|null   $required          Whether the field is required.
	 * @param mixed       $default           Default value.
	 * @param bool|null   $disabled          Whether the field is disabled.
	 * @param string|null $tab               Tab identifier.
	 * @param string|null $class_name         CSS class name.
	 * @param array|null  $conditions        Conditional display rules.
	 * @param array|null  $attributes        HTML attributes.
	 * @param bool|null   $unfiltered        Whether to skip sanitization.
	 * @param array|null  $render_options    Render options.
	 * @param string|null $generator         Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function multi_week(
		?int $min = null,
		?int $max = null,
		?array $buttons = null,
		?array $disabled_buttons = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'multi_week',
			array(
				'min'              => $min,
				'max'              => $max,
				'buttons'          => $buttons,
				'disabled_buttons' => $disabled_buttons,
			),
			$this->extract_common( get_defined_vars(), array( 'min', 'max', 'buttons', 'disabled_buttons' ) ),
		);
	}

	/**
	 * Creates a multi-select field definition.
	 *
	 * @param array|null  $options           Select options.
	 * @param string|null $options_key       Options key for dynamic options.
	 * @param array|null  $async_params      Async loading parameters.
	 * @param int|null    $min               Minimum number of items.
	 * @param int|null    $max               Maximum number of items.
	 * @param array|null  $buttons           Custom buttons for the multi-field.
	 * @param array|null  $disabled_buttons  Buttons to disable.
	 * @param string|null $label             Field label.
	 * @param string|null $description       Field description.
	 * @param bool|null   $required          Whether the field is required.
	 * @param mixed       $default           Default value.
	 * @param bool|null   $disabled          Whether the field is disabled.
	 * @param string|null $tab               Tab identifier.
	 * @param string|null $class_name         CSS class name.
	 * @param array|null  $conditions        Conditional display rules.
	 * @param array|null  $attributes        HTML attributes.
	 * @param bool|null   $unfiltered        Whether to skip sanitization.
	 * @param array|null  $render_options    Render options.
	 * @param string|null $generator         Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function multi_select(
		?array $options = null,
		?string $options_key = null,
		?array $async_params = null,
		?int $min = null,
		?int $max = null,
		?array $buttons = null,
		?array $disabled_buttons = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'multi_select',
			array(
				'options'          => $options,
				'options_key'      => $options_key,
				'async_params'     => $async_params,
				'min'              => $min,
				'max'              => $max,
				'buttons'          => $buttons,
				'disabled_buttons' => $disabled_buttons,
			),
			$this->extract_common( get_defined_vars(), array( 'options', 'options_key', 'async_params', 'min', 'max', 'buttons', 'disabled_buttons' ) ),
		);
	}

	/**
	 * Creates a multi-checkbox field definition.
	 *
	 * @param string|null $title             Checkbox title text.
	 * @param int|null    $min               Minimum number of items.
	 * @param int|null    $max               Maximum number of items.
	 * @param array|null  $buttons           Custom buttons for the multi-field.
	 * @param array|null  $disabled_buttons  Buttons to disable.
	 * @param string|null $label             Field label.
	 * @param string|null $description       Field description.
	 * @param bool|null   $required          Whether the field is required.
	 * @param mixed       $default           Default value.
	 * @param bool|null   $disabled          Whether the field is disabled.
	 * @param string|null $tab               Tab identifier.
	 * @param string|null $class_name         CSS class name.
	 * @param array|null  $conditions        Conditional display rules.
	 * @param array|null  $attributes        HTML attributes.
	 * @param bool|null   $unfiltered        Whether to skip sanitization.
	 * @param array|null  $render_options    Render options.
	 * @param string|null $generator         Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function multi_checkbox(
		?string $title = null,
		?int $min = null,
		?int $max = null,
		?array $buttons = null,
		?array $disabled_buttons = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'multi_checkbox',
			array(
				'title'            => $title,
				'min'              => $min,
				'max'              => $max,
				'buttons'          => $buttons,
				'disabled_buttons' => $disabled_buttons,
			),
			$this->extract_common( get_defined_vars(), array( 'title', 'min', 'max', 'buttons', 'disabled_buttons' ) ),
		);
	}

	/**
	 * Creates a multi-toggle field definition.
	 *
	 * @param string|null $title             Toggle title text.
	 * @param int|null    $min               Minimum number of items.
	 * @param int|null    $max               Maximum number of items.
	 * @param array|null  $buttons           Custom buttons for the multi-field.
	 * @param array|null  $disabled_buttons  Buttons to disable.
	 * @param string|null $label             Field label.
	 * @param string|null $description       Field description.
	 * @param bool|null   $required          Whether the field is required.
	 * @param mixed       $default           Default value.
	 * @param bool|null   $disabled          Whether the field is disabled.
	 * @param string|null $tab               Tab identifier.
	 * @param string|null $class_name         CSS class name.
	 * @param array|null  $conditions        Conditional display rules.
	 * @param array|null  $attributes        HTML attributes.
	 * @param bool|null   $unfiltered        Whether to skip sanitization.
	 * @param array|null  $render_options    Render options.
	 * @param string|null $generator         Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function multi_toggle(
		?string $title = null,
		?int $min = null,
		?int $max = null,
		?array $buttons = null,
		?array $disabled_buttons = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'multi_toggle',
			array(
				'title'            => $title,
				'min'              => $min,
				'max'              => $max,
				'buttons'          => $buttons,
				'disabled_buttons' => $disabled_buttons,
			),
			$this->extract_common( get_defined_vars(), array( 'title', 'min', 'max', 'buttons', 'disabled_buttons' ) ),
		);
	}

	/**
	 * Creates a multi-post field definition.
	 *
	 * @param string|array|null $post_type         Post type(s) to query.
	 * @param int|null          $min               Minimum number of items.
	 * @param int|null          $max               Maximum number of items.
	 * @param array|null        $buttons           Custom buttons for the multi-field.
	 * @param array|null        $disabled_buttons  Buttons to disable.
	 * @param string|null       $label             Field label.
	 * @param string|null       $description       Field description.
	 * @param bool|null         $required          Whether the field is required.
	 * @param mixed             $default           Default value.
	 * @param bool|null         $disabled          Whether the field is disabled.
	 * @param string|null       $tab               Tab identifier.
	 * @param string|null       $class_name         CSS class name.
	 * @param array|null        $conditions        Conditional display rules.
	 * @param array|null        $attributes        HTML attributes.
	 * @param bool|null         $unfiltered        Whether to skip sanitization.
	 * @param array|null        $render_options    Render options.
	 * @param string|null       $generator         Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function multi_post(
		string|array|null $post_type = null,
		?int $min = null,
		?int $max = null,
		?array $buttons = null,
		?array $disabled_buttons = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'multi_post',
			array(
				'post_type'        => $post_type,
				'min'              => $min,
				'max'              => $max,
				'buttons'          => $buttons,
				'disabled_buttons' => $disabled_buttons,
			),
			$this->extract_common( get_defined_vars(), array( 'post_type', 'min', 'max', 'buttons', 'disabled_buttons' ) ),
		);
	}

	/**
	 * Creates a multi-term field definition.
	 *
	 * @param string|null $taxonomy          Taxonomy to query.
	 * @param int|null    $min               Minimum number of items.
	 * @param int|null    $max               Maximum number of items.
	 * @param array|null  $buttons           Custom buttons for the multi-field.
	 * @param array|null  $disabled_buttons  Buttons to disable.
	 * @param string|null $label             Field label.
	 * @param string|null $description       Field description.
	 * @param bool|null   $required          Whether the field is required.
	 * @param mixed       $default           Default value.
	 * @param bool|null   $disabled          Whether the field is disabled.
	 * @param string|null $tab               Tab identifier.
	 * @param string|null $class_name         CSS class name.
	 * @param array|null  $conditions        Conditional display rules.
	 * @param array|null  $attributes        HTML attributes.
	 * @param bool|null   $unfiltered        Whether to skip sanitization.
	 * @param array|null  $render_options    Render options.
	 * @param string|null $generator         Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function multi_term(
		?string $taxonomy = null,
		?int $min = null,
		?int $max = null,
		?array $buttons = null,
		?array $disabled_buttons = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'multi_term',
			array(
				'taxonomy'         => $taxonomy,
				'min'              => $min,
				'max'              => $max,
				'buttons'          => $buttons,
				'disabled_buttons' => $disabled_buttons,
			),
			$this->extract_common( get_defined_vars(), array( 'taxonomy', 'min', 'max', 'buttons', 'disabled_buttons' ) ),
		);
	}

	/**
	 * Creates a multi-attachment field definition.
	 *
	 * @param string|null $attachment_type    Allowed attachment type.
	 * @param int|null    $min               Minimum number of items.
	 * @param int|null    $max               Maximum number of items.
	 * @param array|null  $buttons           Custom buttons for the multi-field.
	 * @param array|null  $disabled_buttons  Buttons to disable.
	 * @param string|null $label             Field label.
	 * @param string|null $description       Field description.
	 * @param bool|null   $required          Whether the field is required.
	 * @param mixed       $default           Default value.
	 * @param bool|null   $disabled          Whether the field is disabled.
	 * @param string|null $tab               Tab identifier.
	 * @param string|null $class_name         CSS class name.
	 * @param array|null  $conditions        Conditional display rules.
	 * @param array|null  $attributes        HTML attributes.
	 * @param bool|null   $unfiltered        Whether to skip sanitization.
	 * @param array|null  $render_options    Render options.
	 * @param string|null $generator         Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function multi_attachment(
		?string $attachment_type = null,
		?int $min = null,
		?int $max = null,
		?array $buttons = null,
		?array $disabled_buttons = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'multi_attachment',
			array(
				'attachment_type'  => $attachment_type,
				'min'              => $min,
				'max'              => $max,
				'buttons'          => $buttons,
				'disabled_buttons' => $disabled_buttons,
			),
			$this->extract_common( get_defined_vars(), array( 'attachment_type', 'min', 'max', 'buttons', 'disabled_buttons' ) ),
		);
	}

	/**
	 * Creates a multi-direct-file field definition.
	 *
	 * @param array|null  $allowed_types     Allowed MIME types.
	 * @param int|null    $max_size          Maximum file size in bytes.
	 * @param int|null    $min               Minimum number of items.
	 * @param int|null    $max               Maximum number of items.
	 * @param array|null  $buttons           Custom buttons for the multi-field.
	 * @param array|null  $disabled_buttons  Buttons to disable.
	 * @param string|null $label             Field label.
	 * @param string|null $description       Field description.
	 * @param bool|null   $required          Whether the field is required.
	 * @param mixed       $default           Default value.
	 * @param bool|null   $disabled          Whether the field is disabled.
	 * @param string|null $tab               Tab identifier.
	 * @param string|null $class_name         CSS class name.
	 * @param array|null  $conditions        Conditional display rules.
	 * @param array|null  $attributes        HTML attributes.
	 * @param bool|null   $unfiltered        Whether to skip sanitization.
	 * @param array|null  $render_options    Render options.
	 * @param string|null $generator         Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function multi_direct_file(
		?array $allowed_types = null,
		?int $max_size = null,
		?int $min = null,
		?int $max = null,
		?array $buttons = null,
		?array $disabled_buttons = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'multi_direct_file',
			array(
				'allowed_types'    => $allowed_types,
				'max_size'         => $max_size,
				'min'              => $min,
				'max'              => $max,
				'buttons'          => $buttons,
				'disabled_buttons' => $disabled_buttons,
			),
			$this->extract_common( get_defined_vars(), array( 'allowed_types', 'max_size', 'min', 'max', 'buttons', 'disabled_buttons' ) ),
		);
	}

	/**
	 * Creates a multi-link field definition.
	 *
	 * @param string|array|null $post_type         Post type(s) for post picker.
	 * @param int|null          $min               Minimum number of items.
	 * @param int|null          $max               Maximum number of items.
	 * @param array|null        $buttons           Custom buttons for the multi-field.
	 * @param array|null        $disabled_buttons  Buttons to disable.
	 * @param string|null       $label             Field label.
	 * @param string|null       $description       Field description.
	 * @param bool|null         $required          Whether the field is required.
	 * @param mixed             $default           Default value.
	 * @param bool|null         $disabled          Whether the field is disabled.
	 * @param string|null       $tab               Tab identifier.
	 * @param string|null       $class_name         CSS class name.
	 * @param array|null        $conditions        Conditional display rules.
	 * @param array|null        $attributes        HTML attributes.
	 * @param bool|null         $unfiltered        Whether to skip sanitization.
	 * @param array|null        $render_options    Render options.
	 * @param string|null       $generator         Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function multi_link(
		string|array|null $post_type = null,
		?int $min = null,
		?int $max = null,
		?array $buttons = null,
		?array $disabled_buttons = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'multi_link',
			array(
				'post_type'        => $post_type,
				'min'              => $min,
				'max'              => $max,
				'buttons'          => $buttons,
				'disabled_buttons' => $disabled_buttons,
			),
			$this->extract_common( get_defined_vars(), array( 'post_type', 'min', 'max', 'buttons', 'disabled_buttons' ) ),
		);
	}

	/**
	 * Creates a multi-mapycz field definition.
	 *
	 * @param string|null $lang              Map language.
	 * @param int|null    $min               Minimum number of items.
	 * @param int|null    $max               Maximum number of items.
	 * @param array|null  $buttons           Custom buttons for the multi-field.
	 * @param array|null  $disabled_buttons  Buttons to disable.
	 * @param string|null $label             Field label.
	 * @param string|null $description       Field description.
	 * @param bool|null   $required          Whether the field is required.
	 * @param mixed       $default           Default value.
	 * @param bool|null   $disabled          Whether the field is disabled.
	 * @param string|null $tab               Tab identifier.
	 * @param string|null $class_name         CSS class name.
	 * @param array|null  $conditions        Conditional display rules.
	 * @param array|null  $attributes        HTML attributes.
	 * @param bool|null   $unfiltered        Whether to skip sanitization.
	 * @param array|null  $render_options    Render options.
	 * @param string|null $generator         Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function multi_mapycz(
		?string $lang = null,
		?int $min = null,
		?int $max = null,
		?array $buttons = null,
		?array $disabled_buttons = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'multi_mapycz',
			array(
				'lang'             => $lang,
				'min'              => $min,
				'max'              => $max,
				'buttons'          => $buttons,
				'disabled_buttons' => $disabled_buttons,
			),
			$this->extract_common( get_defined_vars(), array( 'lang', 'min', 'max', 'buttons', 'disabled_buttons' ) ),
		);
	}

	/**
	 * Creates a multi-date-range field definition.
	 *
	 * @param int|null    $min               Minimum number of items.
	 * @param int|null    $max               Maximum number of items.
	 * @param array|null  $buttons           Custom buttons for the multi-field.
	 * @param array|null  $disabled_buttons  Buttons to disable.
	 * @param string|null $label             Field label.
	 * @param string|null $description       Field description.
	 * @param bool|null   $required          Whether the field is required.
	 * @param mixed       $default           Default value.
	 * @param bool|null   $disabled          Whether the field is disabled.
	 * @param string|null $tab               Tab identifier.
	 * @param string|null $class_name         CSS class name.
	 * @param array|null  $conditions        Conditional display rules.
	 * @param array|null  $attributes        HTML attributes.
	 * @param bool|null   $unfiltered        Whether to skip sanitization.
	 * @param array|null  $render_options    Render options.
	 * @param string|null $generator         Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function multi_date_range(
		?int $min = null,
		?int $max = null,
		?array $buttons = null,
		?array $disabled_buttons = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'multi_date_range',
			array(
				'min'              => $min,
				'max'              => $max,
				'buttons'          => $buttons,
				'disabled_buttons' => $disabled_buttons,
			),
			$this->extract_common( get_defined_vars(), array( 'min', 'max', 'buttons', 'disabled_buttons' ) ),
		);
	}

	/**
	 * Creates a multi-group field definition.
	 *
	 * @param array       $items             Child field definitions.
	 * @param int|null    $min               Minimum number of items.
	 * @param int|null    $max               Maximum number of items.
	 * @param array|null  $buttons           Custom buttons for the multi-field.
	 * @param array|null  $disabled_buttons  Buttons to disable.
	 * @param string|null $label             Field label.
	 * @param string|null $description       Field description.
	 * @param bool|null   $required          Whether the field is required.
	 * @param mixed       $default           Default value.
	 * @param bool|null   $disabled          Whether the field is disabled.
	 * @param string|null $tab               Tab identifier.
	 * @param string|null $class_name         CSS class name.
	 * @param array|null  $conditions        Conditional display rules.
	 * @param array|null  $attributes        HTML attributes.
	 * @param bool|null   $unfiltered        Whether to skip sanitization.
	 * @param array|null  $render_options    Render options.
	 * @param string|null $generator         Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function multi_group(
		array $items = array(),
		?int $min = null,
		?int $max = null,
		?array $buttons = null,
		?array $disabled_buttons = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'multi_group',
			array(
				'items'            => $items,
				'min'              => $min,
				'max'              => $max,
				'buttons'          => $buttons,
				'disabled_buttons' => $disabled_buttons,
			),
			$this->extract_common( get_defined_vars(), array( 'items', 'min', 'max', 'buttons', 'disabled_buttons' ) ),
		);
	}
}
