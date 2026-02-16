# Multi Number Field Type

The Multi Number field type provides a repeatable interface for collecting multiple numeric values with add/remove functionality and validation for numeric entries.

## Field Type: `multi_number`

```php
array(
	'type'  => 'multi_number',
	'label' => 'Scores',
	'min'   => 1,
	'max'   => 10,
	'step'  => 0.5,
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

#### `min` _(integer)_ — Optional

Minimum number of items. Users cannot remove items below this count.

#### `max` _(integer)_ — Optional

Maximum number of items. Users cannot add items beyond this count.

#### `buttons` _(array)_ — Optional

Custom button labels. Supports keys: `add`, `remove`, `duplicate`.

#### `disabled_buttons` _(array)_ — Optional

Array of buttons to disable. Options: `'move'`, `'delete'`, `'duplicate'`.

#### `step` _(float)_ — Optional

Step increment for each number input. For example, a step of `0.5` allows values like 0, 0.5, 1, 1.5, etc.

## Stored Value

An array of numbers.

## Example Usage

### Basic Multi Number Field

```php
'quantity_points' => array(
	'type'        => 'multi_number',
	'label'       => 'Quantity Points',
	'description' => 'Add multiple quantity breakpoints',
),
```

### With Range Constraints and Step

```php
'temperature_readings' => array(
	'type' => 'multi_number',
	'label' => 'Temperature Readings',
	'min'  => 1,
	'max'  => 20,
	'step' => 0.1,
),
```

### With Default Values

```php
'price_tiers' => array(
	'type'    => 'multi_number',
	'label'   => 'Price Tiers',
	'step'    => 0.01,
	'default' => array( 9.99, 19.99, 29.99 ),
),
```

### Using Values in Your Theme

```php
$temperature_readings = get_post_meta( get_the_ID(), 'temperature_readings', true );

if ( ! empty( $temperature_readings ) && is_array( $temperature_readings ) ) {
	$count   = count( $temperature_readings );
	$average = array_sum( $temperature_readings ) / $count;

	echo '<p>' . esc_html( sprintf( 'Average: %s', number_format( $average, 1 ) ) ) . '</p>';
	echo '<ul>';

	foreach ( $temperature_readings as $reading ) {
		echo '<li>' . esc_html( number_format( $reading, 1 ) ) . '</li>';
	}

	echo '</ul>';
}
```

### With Conditional Logic

```php
'has_multiple_dimensions' => array(
	'type'  => 'toggle',
	'id'    => 'has_multiple_dimensions',
	'label' => 'Product has multiple dimensions',
),
'product_dimensions' => array(
	'type'       => 'multi_number',
	'label'      => 'Product Dimensions (cm)',
	'step'       => 0.1,
	'conditions' => array(
		array( 'field' => 'has_multiple_dimensions', 'value' => true ),
	),
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->multi_number(
	label: 'Scores',
	min: 1,
	max: 10,
	step: 0.5,
);
```

## Notes

- The stored value is always an array of numbers, even if only one value is provided.
- Input validation ensures values are valid numbers and comply with the `step` increment if provided.
- The field uses the browser's native number input, which includes up/down arrows for incrementing and decrementing.
- Items can be reordered by dragging unless the `move` button is disabled.
- Ideal for collecting sets of measurements, statistics, quantity breakpoints, price tiers, or scores.
