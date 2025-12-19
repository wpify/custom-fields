# Multi Date Range Field Type

The Multi Date Range field type allows users to manage multiple date ranges. It provides a repeatable date range picker interface where users can add, remove, and reorder date ranges as needed. Each date range consists of a start date and end date.

## Field Type: `multi_date_range`

```php
array(
	'type'    => 'multi_date_range',
	'id'      => 'example_date_ranges',
	'label'   => 'Event Periods',
	'min'     => 1,        // Minimum number of date ranges
	'max'     => 5,        // Maximum number of date ranges
	'buttons' => array(    // Custom button labels
		'add'    => 'Add Period',
		'remove' => 'Remove',
	),
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `multi_date_range` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have at least one date range
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(array)_ - Default date range value for new items as an array of two dates in ISO format (YYYY-MM-DD)
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `min` _(integer)_ - Optional

Minimum number of date ranges required. If specified, the field will automatically add date ranges to reach this minimum.

#### `max` _(integer)_ - Optional

Maximum number of date ranges allowed. When this limit is reached, the "Add" button will be disabled.

#### `buttons` _(array)_ - Optional

Custom labels for the buttons:
- `add` _(string)_ - Custom label for the add button
- `remove` _(string)_ - Custom label for the remove button

#### `disabled_buttons` _(array)_ - Optional

Array of button names to disable. Possible values: `['add']`, `['remove']`, `['move']`, or combinations.

## User Interface

The Multi Date Range field provides an interactive interface with:

1. **Date Range Rows**: Each row contains two date picker inputs (start and end)
2. **Add Button**: Adds a new date range row
3. **Remove Buttons**: Each date range row has a remove button (trash icon)
4. **Drag Handles**: Each row has a drag handle for reordering (move icon)

## Stored Value

The field stores an array of date range arrays. Each date range is stored as an array with start date at index 0 and end date at index 1. For example:

```php
[
	[ '2023-01-01', '2023-01-15' ],   // First date range (both dates)
	[ '2023-02-01', '2023-02-28' ],   // Second date range (both dates)
	[ '2023-03-15', null ],           // Third date range (only start date)
	[ null, '2023-04-30' ],           // Fourth date range (only end date)
]
```

All dates are stored in ISO format (YYYY-MM-DD).

## Validation

Each date range in the Multi Date Range field is validated using the same rules as the standard Date Range field:
- If the field is required, at least one date range must be provided
- If both dates in a range are provided, the start date must be before or equal to the end date
- Both dates in each range fall within the optional min and max constraints

## Example Usage

### Seasonal Availability Periods

```php
'availability_periods' => array(
	'type'        => 'multi_date_range',
	'id'          => 'availability_periods',
	'label'       => 'Availability Periods',
	'description' => 'Define the periods when this product or service is available.',
	'required'    => true,
	'min'         => 1,
	'buttons'     => array(
		'add'    => 'Add Availability Period',
		'remove' => 'Remove Period',
	),
),
```

### Booking Blackout Dates

```php
'blackout_periods' => array(
	'type'        => 'multi_date_range',
	'id'          => 'blackout_periods',
	'label'       => 'Blackout Periods',
	'description' => 'Select date ranges when bookings are not allowed.',
	'max'         => 10, // Limit to 10 blackout periods
),
```

### Using Multi Date Range Values in Your Theme

```php
// Get the array of date ranges
$availability_periods = get_post_meta( get_the_ID(), 'availability_periods', true );

if ( ! empty( $availability_periods ) && is_array( $availability_periods ) ) {
	echo '<div class="availability-schedule">';
	echo '<h3>Availability Schedule</h3>';
	echo '<ul class="period-list">';

	foreach ( $availability_periods as $period ) {
		$start_date = $period[0] ?? null;
		$end_date   = $period[1] ?? null;

		echo '<li class="period-item">';

		if ( ! empty( $start_date ) && ! empty( $end_date ) ) {
			// Both dates are set
			$formatted_start = date_i18n( get_option( 'date_format' ), strtotime( $start_date ) );
			$formatted_end   = date_i18n( get_option( 'date_format' ), strtotime( $end_date ) );
			echo esc_html( sprintf( '%s - %s', $formatted_start, $formatted_end ) );
		} elseif ( ! empty( $start_date ) ) {
			// Only start date is set
			$formatted_start = date_i18n( get_option( 'date_format' ), strtotime( $start_date ) );
			echo esc_html( sprintf( 'From %s', $formatted_start ) );
		} elseif ( ! empty( $end_date ) ) {
			// Only end date is set
			$formatted_end = date_i18n( get_option( 'date_format' ), strtotime( $end_date ) );
			echo esc_html( sprintf( 'Until %s', $formatted_end ) );
		}

		echo '</li>';
	}

	echo '</ul></div>';
}
```

### Checking if a Date Falls Within Any Period

```php
/**
 * Check if a given date falls within any of the defined periods.
 *
 * @param string $date           Date to check in any format parseable by strtotime().
 * @param array  $periods        Array of date range arrays.
 * @return boolean               True if the date falls within any period.
 */
function is_date_in_periods( $date, $periods ) {
	$check_timestamp = strtotime( $date );

	foreach ( $periods as $period ) {
		$start = ! empty( $period[0] ) ? strtotime( $period[0] ) : null;
		$end   = ! empty( $period[1] ) ? strtotime( $period[1] ) : null;

		// If only start date, check if date is on or after start
		if ( $start && ! $end && $check_timestamp >= $start ) {
			return true;
		}

		// If only end date, check if date is on or before end
		if ( ! $start && $end && $check_timestamp <= $end ) {
			return true;
		}

		// If both dates, check if date is within range
		if ( $start && $end && $check_timestamp >= $start && $check_timestamp <= $end ) {
			return true;
		}
	}

	return false;
}

// Usage example
$blackout_periods = get_post_meta( get_the_ID(), 'blackout_periods', true );
$requested_date   = '2023-07-15';

if ( is_date_in_periods( $requested_date, $blackout_periods ) ) {
	echo 'Sorry, this date is not available for booking.';
}
```

### Multi Date Range with Conditional Logic

```php
'has_seasonal_pricing' => array(
	'type'  => 'toggle',
	'id'    => 'has_seasonal_pricing',
	'label' => 'Seasonal Pricing',
	'title' => 'Enable seasonal pricing for this product',
),
'seasonal_periods' => array(
	'type'        => 'multi_date_range',
	'id'          => 'seasonal_periods',
	'label'       => 'Seasonal Periods',
	'description' => 'Define the date ranges for seasonal pricing.',
	'conditions'  => array(
		array( 'field' => 'has_seasonal_pricing', 'value' => true ),
	),
),
```

## Notes

- The Multi Date Range field extends the standard Date Range field to allow multiple selections
- Each date range input has the same properties and behavior as the standard Date Range field
- Users can reorder date ranges by dragging and dropping (requires JavaScript)
- The field automatically generates a unique key for each date range row to maintain integrity during reordering
- When using min/max constraints, the field automatically enforces these limits
- For a single date range, use the `date_range` field type instead
- For multiple individual dates (not ranges), use the `multi_date` field type instead
- Consider validating for overlapping periods in your application logic if needed
