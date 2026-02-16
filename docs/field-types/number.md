# Number Field Type

The Number field type provides a specialized input for numeric values. It uses the browser's native number input, which typically includes increment/decrement controls and validation to ensure only numeric data is entered.

## Field Type: `number`

```php
array(
	'type'  => 'number',
	'id'    => 'example_number',
	'label' => 'Quantity',
	'min'   => 0,
	'max'   => 100,
	'step'  => 1,
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

#### `min` _(numeric)_ — Optional

The minimum value allowed for the input. This enables browser validation to prevent values below this threshold.

#### `max` _(numeric)_ — Optional

The maximum value allowed for the input. This enables browser validation to prevent values above this threshold.

#### `step` _(numeric)_ — Optional

The stepping interval used when incrementing or decrementing the value, and for validation to ensure the value is a multiple of this step. Defaults to `1`.

## Stored Value

The field stores the value as a number in the database. Built-in validation ensures the value is a valid number and respects the `min`, `max`, and `step` constraints.

## Example Usage

### Basic Quantity Field

```php
array(
	'type'        => 'number',
	'id'          => 'quantity',
	'label'       => 'Quantity',
	'description' => 'Enter the quantity of items.',
	'default'     => 1,
	'min'         => 1,
	'required'    => true,
)
```

### Percentage Field with Step

```php
array(
	'type'        => 'number',
	'id'          => 'discount_percentage',
	'label'       => 'Discount Percentage',
	'description' => 'Enter the discount percentage in 5% increments.',
	'min'         => 0,
	'max'         => 100,
	'step'        => 5,
	'attributes'  => array(
		'placeholder' => '0-100%',
	),
)
```

### Currency Field with Decimals

```php
array(
	'type'        => 'number',
	'id'          => 'price',
	'label'       => 'Price',
	'description' => 'Enter the product price.',
	'min'         => 0,
	'step'        => 0.01,
	'attributes'  => array(
		'placeholder' => '0.00',
	),
)
```

### Using Values in Your Theme

```php
// Get the number value from the meta field
$quantity = get_post_meta( get_the_ID(), 'quantity', true );

// Ensure it's treated as a number (important for calculations)
$quantity = (int) $quantity;

if ( $quantity > 0 ) {
	echo '<div class="product-quantity">';
	echo 'Quantity: ' . esc_html( $quantity );
	echo '</div>';

	// Perform calculations with the numeric value
	$total = $quantity * $price;
	echo '<div class="product-total">';
	echo 'Total: $' . esc_html( number_format( $total, 2 ) );
	echo '</div>';
}
```

### With Conditional Logic

```php
array(
	'type'  => 'toggle',
	'id'    => 'has_custom_price',
	'label' => 'Enable Custom Price',
),
array(
	'type'       => 'number',
	'id'         => 'custom_price',
	'label'      => 'Custom Price',
	'min'        => 0,
	'step'       => 0.01,
	'conditions' => array(
		array( 'field' => 'has_custom_price', 'value' => true ),
	),
)
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->number(
	label: 'Quantity',
	min: 0,
	max: 100,
	step: 1,
);
```

## Notes

- The number field uses the browser's native number input type, which may provide additional validation or specialized controls on different browsers
- When retrieving number values in PHP, consider using type casting to ensure proper numeric operations: `(int)` for integers, `(float)` for decimal values
- The `step` property can be used to enforce precision (e.g., `step: 0.01` for 2 decimal places)
- Some browsers may display spinner buttons to increment/decrement the value
- For percentage or other specialized numeric inputs, consider adding a visual indicator in the label or description
