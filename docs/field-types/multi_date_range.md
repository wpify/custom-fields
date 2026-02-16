# Multi Date Range Field Type

The Multi Date Range field type allows users to manage multiple date ranges. It provides a repeatable date range picker interface where users can add, remove, and reorder date ranges, each consisting of a start date and end date.

## Field Type: `multi_date_range`

```php
array(
	'type'    => 'multi_date_range',
	'id'      => 'example_date_ranges',
	'label'   => 'Event Periods',
	'min'     => 1,
	'max'     => 5,
	'buttons' => array(
		'add'    => 'Add Period',
		'remove' => 'Remove',
	),
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

## Stored Value

Array of arrays, each containing `from` and `to` keys with date strings in ISO format (YYYY-MM-DD):

```php
array(
	array( 'from' => '2023-01-01', 'to' => '2023-01-15' ),
	array( 'from' => '2023-02-01', 'to' => '2023-02-28' ),
	array( 'from' => '2023-03-15', 'to' => null ),
	array( 'from' => null, 'to' => '2023-04-30' ),
)
```

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
	'max'         => 10,
),
```

### Using Values in Your Theme

```php
$availability_periods = get_post_meta( get_the_ID(), 'availability_periods', true );

if ( ! empty( $availability_periods ) && is_array( $availability_periods ) ) {
	echo '<div class="availability-schedule">';
	echo '<h3>' . esc_html__( 'Availability Schedule', 'your-theme' ) . '</h3>';
	echo '<ul class="period-list">';

	foreach ( $availability_periods as $period ) {
		$start_date = $period['from'] ?? null;
		$end_date   = $period['to'] ?? null;

		echo '<li class="period-item">';

		if ( ! empty( $start_date ) && ! empty( $end_date ) ) {
			$formatted_start = date_i18n( get_option( 'date_format' ), strtotime( $start_date ) );
			$formatted_end   = date_i18n( get_option( 'date_format' ), strtotime( $end_date ) );
			echo esc_html( sprintf( '%s - %s', $formatted_start, $formatted_end ) );
		} elseif ( ! empty( $start_date ) ) {
			$formatted_start = date_i18n( get_option( 'date_format' ), strtotime( $start_date ) );
			echo esc_html( sprintf( 'From %s', $formatted_start ) );
		} elseif ( ! empty( $end_date ) ) {
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
 * @param string $date    Date to check in any format parseable by strtotime().
 * @param array  $periods Array of date range arrays with 'from' and 'to' keys.
 * @return boolean True if the date falls within any period.
 */
function is_date_in_periods( $date, $periods ) {
	$check_timestamp = strtotime( $date );

	foreach ( $periods as $period ) {
		$start = ! empty( $period['from'] ) ? strtotime( $period['from'] ) : null;
		$end   = ! empty( $period['to'] ) ? strtotime( $period['to'] ) : null;

		if ( $start && ! $end && $check_timestamp >= $start ) {
			return true;
		}

		if ( ! $start && $end && $check_timestamp <= $end ) {
			return true;
		}

		if ( $start && $end && $check_timestamp >= $start && $check_timestamp <= $end ) {
			return true;
		}
	}

	return false;
}

$blackout_periods = get_post_meta( get_the_ID(), 'blackout_periods', true );
$requested_date   = '2023-07-15';

if ( is_date_in_periods( $requested_date, $blackout_periods ) ) {
	echo esc_html__( 'Sorry, this date is not available for booking.', 'your-theme' );
}
```

### With Conditional Logic

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

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->multi_date_range(
	label: 'Availability Periods',
	min: 1,
	max: 5,
);
```

## Notes

- Each date range input has the same properties and behavior as the standard `date_range` field type
- Users can reorder date ranges by dragging and dropping
- When using `min`/`max` constraints, the field automatically enforces these limits
- If both dates in a range are provided, the start date must be before or equal to the end date
- For a single date range, use the `date_range` field type instead
- For multiple individual dates (not ranges), use the `multi_date` field type instead
- Consider validating for overlapping periods in your application logic if needed
