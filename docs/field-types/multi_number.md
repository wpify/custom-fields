# Multi Number Field Type

The Multi Number field type allows users to add multiple numeric inputs. It provides a repeatable interface for collecting multiple numeric values with add/remove functionality and validation for numeric entries.

## Field Type: `multi_number`

```php
array(
	'type'        => 'multi_number',
	'id'          => 'example_multi_number',
	'label'       => 'Example Multi Number',
	'description' => 'Add multiple numeric values',
	'min'         => 0,
	'max'         => 100,
	'step'        => 1,
	'default'     => array( 10, 20, 30 ),
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `multi_number` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have at least one value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(array)_ - Default values as an array of numbers
- `attributes` _(array)_ - HTML attributes to add to each number input
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `min` _(number)_ - Optional

The minimum value allowed for each number input.

#### `max` _(number)_ - Optional

The maximum value allowed for each number input.

#### `step` _(number)_ - Optional

The stepping interval for each number input. For example, a step of `0.5` allows values like 0, 0.5, 1, 1.5, etc.

## Stored Value

The field stores an array of numeric values in the database. JavaScript automatically converts the input values to the Number type.

## Example Usage

### Basic Multi Number Field

```php
'quantity_points' => array(
	'type'        => 'multi_number',
	'id'          => 'quantity_points',
	'label'       => 'Quantity Points',
	'description' => 'Add multiple quantity breakpoints',
),
```

### Multi Number with Range Constraints

```php
'temperature_readings' => array(
	'type'        => 'multi_number',
	'id'          => 'temperature_readings',
	'label'       => 'Temperature Readings',
	'description' => 'Record multiple temperature readings',
	'min'         => -50,
	'max'         => 50,
	'step'        => 0.1,
),
```

### Multi Number with Decimal Step

```php
'price_tiers' => array(
	'type'        => 'multi_number',
	'id'          => 'price_tiers',
	'label'       => 'Price Tiers',
	'description' => 'Set price tiers for quantity discounts',
	'min'         => 0,
	'step'        => 0.01,
	'default'     => array( 9.99, 19.99, 29.99 ),
),
```

### Retrieving and Using Multi Number Values

```php
// Get the array of numeric values
$quantity_points = get_post_meta( get_the_ID(), 'quantity_points', true );

if ( ! empty( $quantity_points ) && is_array( $quantity_points ) ) {
	// Sort the numbers in ascending order
	sort( $quantity_points );
	
	echo '<div class="quantity-tiers">';
	echo '<h3>Quantity Discount Tiers</h3>';
	echo '<ul>';
	
	// Track previous quantity for ranges
	$prev_quantity = 0;
	
	foreach ( $quantity_points as $index => $quantity ) {
		echo '<li>';
		
		// For the first tier
		if ( $index === 0 ) {
			echo esc_html( sprintf( 'Buy 1-%d items: Regular price', $quantity - 1 ) );
		} 
		// For middle tiers
		elseif ( $index < count( $quantity_points ) - 1 ) {
			$discount = 5 + ( $index * 5 ); // Example discount calculation
			echo esc_html( sprintf( 'Buy %d-%d items: %d%% discount', 
				$prev_quantity, 
				$quantity - 1,
				$discount
			) );
		}
		// For the last tier
		else {
			$discount = 5 + ( $index * 5 ); // Example discount calculation
			echo esc_html( sprintf( 'Buy %d+ items: %d%% discount', 
				$prev_quantity,
				$discount
			) );
		}
		
		echo '</li>';
		
		// Update previous quantity for next iteration
		$prev_quantity = $quantity;
	}
	
	echo '</ul>';
	echo '</div>';
}
```

### Calculating Statistics from Multi Number Values

```php
// Get the array of temperature readings
$temperature_readings = get_post_meta( get_the_ID(), 'temperature_readings', true );

if ( ! empty( $temperature_readings ) && is_array( $temperature_readings ) ) {
	// Calculate basic statistics
	$count = count( $temperature_readings );
	$sum = array_sum( $temperature_readings );
	$average = $sum / $count;
	$min = min( $temperature_readings );
	$max = max( $temperature_readings );
	
	// Calculate standard deviation
	$variance = 0;
	foreach ( $temperature_readings as $reading ) {
		$variance += pow( $reading - $average, 2 );
	}
	$std_deviation = sqrt( $variance / $count );
	
	echo '<div class="temperature-stats">';
	echo '<h3>Temperature Statistics</h3>';
	
	echo '<table class="stats-table">';
	echo '<tr><th>Readings</th><td>' . esc_html( $count ) . '</td></tr>';
	echo '<tr><th>Average</th><td>' . esc_html( number_format( $average, 1 ) ) . ' °C</td></tr>';
	echo '<tr><th>Minimum</th><td>' . esc_html( number_format( $min, 1 ) ) . ' °C</td></tr>';
	echo '<tr><th>Maximum</th><td>' . esc_html( number_format( $max, 1 ) ) . ' °C</td></tr>';
	echo '<tr><th>Range</th><td>' . esc_html( number_format( $max - $min, 1 ) ) . ' °C</td></tr>';
	echo '<tr><th>Standard Deviation</th><td>' . esc_html( number_format( $std_deviation, 2 ) ) . '</td></tr>';
	echo '</table>';
	
	echo '</div>';
}
```

### Multi Number with Conditional Logic

```php
'has_multiple_dimensions' => array(
	'type'  => 'toggle',
	'id'    => 'has_multiple_dimensions',
	'label' => 'Product has multiple dimensions',
),
'product_dimensions' => array(
	'type'        => 'multi_number',
	'id'          => 'product_dimensions',
	'label'       => 'Product Dimensions (cm)',
	'description' => 'Enter each dimension in centimeters',
	'min'         => 0.1,
	'step'        => 0.1,
	'conditions'  => array(
		array( 'field' => 'has_multiple_dimensions', 'value' => true ),
	),
),
```

## Notes

- The Multi Number field provides an "Add" button to add additional numeric inputs
- Each added number input includes a "Remove" button to delete it
- The stored value is always an array of numbers, even if only one value is provided
- Input validation includes:
  - Ensuring the value is a valid number
  - Checking against min and max constraints if provided
  - Validating against the step increment if provided
- The field uses the browser's native number input, which typically includes up/down arrows for incrementing/decrementing values
- Empty or invalid values are not stored in the array
- This field is useful for collecting sets of measurements, statistics, quantity breakpoints, price tiers, or any scenario requiring multiple numeric values