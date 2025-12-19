# Date Range Field Type

The Date Range field type provides two date pickers side by side, allowing users to select a start and end date for defining a date range.

## Field Type: `date_range`

```php
array(
	'type'  => 'date_range',
	'id'    => 'example_date_range',
	'label' => 'Event Period',
	'min'   => '2023-01-01',
	'max'   => '2025-12-31',
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `date_range` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have a value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(array)_ - Default date range value as an array of two dates in ISO format (YYYY-MM-DD)
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `min` _(string)_ - Optional

The earliest date that can be selected for both start and end dates. The date should be in ISO format (YYYY-MM-DD).

#### `max` _(string)_ - Optional

The latest date that can be selected for both start and end dates. The date should be in ISO format (YYYY-MM-DD).

## Stored Value

The field stores the date range value in the following formats:

- **Both dates filled**: `['2023-01-01', '2023-12-31']` - Array with start date at index 0 and end date at index 1
- **Only start date**: `['2023-01-01', null]` - Array with start date and null for end date
- **Only end date**: `[null, '2023-12-31']` - Array with null for start date and end date
- **Both dates empty**: `null` - Null value when no dates are selected

All dates are stored in ISO format (YYYY-MM-DD).

## Example Usage

### Basic Date Range Field

```php
'event_period' => array(
	'type'        => 'date_range',
	'id'          => 'event_period',
	'label'       => 'Event Period',
	'description' => 'Select the start and end dates for the event.',
	'required'    => true,
),
```

### Date Range Field with Constraints

```php
'booking_period' => array(
	'type'        => 'date_range',
	'id'          => 'booking_period',
	'label'       => 'Booking Period',
	'description' => 'Select a booking period within the next year.',
	'min'         => date( 'Y-m-d' ), // Today
	'max'         => date( 'Y-m-d', strtotime( '+1 year' ) ), // One year from today
	'required'    => true,
),
```

### Date Range Field with Default Value

```php
'default_period' => array(
	'type'    => 'date_range',
	'id'      => 'default_period',
	'label'   => 'Period',
	'default' => array( '2024-01-01', '2024-12-31' ),
),
```

### Using the Date Range Value in Your Theme

```php
// Get the date range value from the meta field
$event_period = get_post_meta( get_the_ID(), 'event_period', true );

if ( ! empty( $event_period ) && is_array( $event_period ) ) {
	$start_date = $event_period[0];
	$end_date   = $event_period[1];

	echo '<div class="event-period">';

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

	echo '</div>';
}
```

## Field Validation

The Date Range field validates that:

- If the field is required, at least one date must be selected
- If both dates are provided, the start date must be before or equal to the end date
- Both dates fall within the optional min and max constraints

## Notes

- The date pickers use the browser's native date inputs, which may look different across different browsers and operating systems
- The saved values are always in ISO format (YYYY-MM-DD), regardless of the display format shown to the user
- This field is particularly useful for event scheduling, booking systems, promotions with validity periods, or any other date range-specific data collection
- For a single date, use the `date` field type instead
- The field allows selecting the same date for both start and end, which is useful for single-day events
