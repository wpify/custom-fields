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

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

This field type has no additional specific properties beyond the default ones.

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

### Using Values in Your Theme

```php
$header_color = get_post_meta( get_the_ID(), 'header_color', true );

echo '<style>
	.site-header {
		background-color: ' . esc_attr( $header_color ) . ';
	}
</style>';
```

### With Conditional Logic

```php
'use_custom_color' => array(
	'type'  => 'toggle',
	'id'    => 'use_custom_color',
	'label' => 'Use Custom Color',
	'title' => 'Enable custom color',
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

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->color(
	label: 'Primary Color',
	default: '#000000',
);
```

## Notes

- The color picker uses the browser's native color input, which may look different across different browsers and operating systems
- The saved value is always in hexadecimal format
- This field is useful for creating customizable color schemes for themes or for allowing users to specify custom brand colors
