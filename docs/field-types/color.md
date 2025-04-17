# Color Field Type

The Color field type provides a color picker that allows users to select a color using the browser's native color picker interface.

## Field Type: `color`

```php
array(
	'type'    => 'color',
	'id'      => 'example_color',
	'label'   => 'Example Color',
	'default' => '#3366cc',
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `color` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have a value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(string)_ - Default color value in hexadecimal format (e.g., `#ff0000`)
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

This field type doesn't have any additional specific properties beyond the default ones.

## Stored Value

The field stores the color value as a string in hexadecimal format (e.g., `#ff0000`).

## Example Usage

### Basic Color Field

```php
'header_color' => array(
	'type'        => 'color',
	'id'          => 'header_color',
	'label'       => 'Header Background Color',
	'default'     => '#ffffff',
	'description' => 'Select the background color for the header.',
),
```

### Using the Color Value in Your Theme

```php
// Get the color value from the meta field
$header_color = get_post_meta( get_the_ID(), 'header_color', true );

// Use the color value in your CSS
echo '<style>
	.site-header {
		background-color: ' . esc_attr( $header_color ) . ';
	}
</style>';
```

### Color Field with Conditional Logic

```php
'use_custom_color' => array(
	'type'  => 'toggle',
	'id'    => 'use_custom_color',
	'label' => 'Use Custom Color',
),
'custom_color' => array(
	'type'       => 'color',
	'id'         => 'custom_color',
	'label'      => 'Custom Color',
	'default'    => '#3366cc',
	'conditions' => array(
		array( 'field' => 'use_custom_color', 'value' => true ),
	),
),
```

## Notes

- The color picker uses the browser's native color input, which may look different across different browsers and operating systems
- The saved value is always in hexadecimal format
- This field is useful for creating customizable color schemes for themes or for allowing users to specify custom brand colors