# Range Field Type

The Range field type provides a slider input for selecting numeric values within a specified range. It offers a visual and intuitive way for users to select values, especially useful for settings like opacity, zoom levels, or intensity controls.

## Field Type: `range`

```php
array(
	'type'  => 'range',
	'id'    => 'example_range',
	'label' => 'Opacity',
	'min'   => 0,
	'max'   => 100,
	'step'  => 5,
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

#### `min` _(numeric)_ — Required

The minimum value of the range. This value is displayed at the left end of the slider.

#### `max` _(numeric)_ — Required

The maximum value of the range. This value is displayed at the right end of the slider.

#### `step` _(numeric)_ — Optional

The stepping interval when moving the slider. For example, a step of `5` means the slider will snap to values like 0, 5, 10, 15, etc. Defaults to `1`.

## Stored Value

The field stores the selected value as a number in the database. The slider displays the minimum and maximum values on either end and shows the currently selected value numerically.

## Example Usage

### Opacity Control

```php
array(
	'type'        => 'range',
	'id'          => 'overlay_opacity',
	'label'       => 'Overlay Opacity',
	'description' => 'Adjust the transparency of the overlay.',
	'min'         => 0,
	'max'         => 100,
	'step'        => 5,
	'default'     => 50,
)
```

### Zoom Level Control

```php
array(
	'type'        => 'range',
	'id'          => 'zoom_level',
	'label'       => 'Zoom Level',
	'description' => 'Set the initial zoom level for the map.',
	'min'         => 1,
	'max'         => 20,
	'step'        => 1,
	'default'     => 10,
)
```

### Price Range Filter

```php
array(
	'type'        => 'range',
	'id'          => 'price_filter',
	'label'       => 'Price Range',
	'description' => 'Filter products up to this price.',
	'min'         => 0,
	'max'         => 1000,
	'step'        => 50,
	'default'     => 500,
)
```

### Using Values in Your Theme

```php
// Get the range value from the meta field
$opacity = get_post_meta( get_the_ID(), 'overlay_opacity', true );

// Convert to appropriate format if needed (e.g., percentage to decimal)
$opacity_decimal = $opacity / 100;

// Use the value in your theme
echo '<style>';
echo '.overlay { opacity: ' . esc_attr( $opacity_decimal ) . '; }';
echo '</style>';

// Display the selected value
echo '<div class="setting-info">';
echo 'Overlay Opacity: ' . esc_html( $opacity ) . '%';
echo '</div>';
```

### With Conditional Logic

```php
array(
	'type'  => 'toggle',
	'id'    => 'use_custom_brightness',
	'label' => 'Use Custom Brightness',
),
array(
	'type'        => 'range',
	'id'          => 'brightness_level',
	'label'       => 'Brightness Level',
	'min'         => -100,
	'max'         => 100,
	'step'        => 10,
	'default'     => 0,
	'conditions'  => array(
		array( 'field' => 'use_custom_brightness', 'value' => true ),
	),
)
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->range(
	label: 'Volume',
	min: 0,
	max: 100,
	step: 5,
);
```

## Notes

- The range slider uses the browser's native range input, which may look different across different browsers and operating systems
- The field displays both the min/max values and the current selected value for better usability
- Range fields are particularly useful for settings that are best represented visually
- Consider using appropriate step values to provide the right level of precision for your use case
- Validation ensures the value is a number within the specified min/max range
- For fine-tuned control, use smaller step values (e.g., `0.1`); for coarse selection, use larger step values (e.g., `10`)
