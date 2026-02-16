# Date Field Type

The Date field type provides a date picker that allows users to select a date from a calendar interface.

## Field Type: `date`

```php
array(
	'type'  => 'date',
	'id'    => 'example_date',
	'label' => 'Event Date',
	'min'   => '2023-01-01',
	'max'   => '2025-12-31',
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

`min` _(string)_ — The earliest date that can be selected. The date should be in ISO format (YYYY-MM-DD).

`max` _(string)_ — The latest date that can be selected. The date should be in ISO format (YYYY-MM-DD).

## Stored Value

The field stores the date value as a string in ISO format (YYYY-MM-DD), for example: `2023-04-15`.

## Example Usage

### Basic Date Field

```php
'event_date' => array(
	'type'        => 'date',
	'id'          => 'event_date',
	'label'       => 'Event Date',
	'description' => 'Select the date when the event takes place.',
	'required'    => true,
),
```

### Date Field with Range Constraints

```php
'booking_date' => array(
	'type'        => 'date',
	'id'          => 'booking_date',
	'label'       => 'Booking Date',
	'description' => 'Select a date for your booking (next 90 days only).',
	'min'         => date( 'Y-m-d' ), // Today
	'max'         => date( 'Y-m-d', strtotime( '+90 days' ) ), // 90 days from today
	'required'    => true,
),
```

### Using Values in Your Theme

```php
// Get the date value from the meta field.
$event_date = get_post_meta( get_the_ID(), 'event_date', true );

if ( ! empty( $event_date ) ) {
	// Format the date according to your needs.
	$formatted_date = date_i18n( get_option( 'date_format' ), strtotime( $event_date ) );

	echo '<div class="event-date">';
	echo esc_html( $formatted_date );
	echo '</div>';
}
```

### With Conditional Logic

```php
'has_event' => array(
	'type'  => 'toggle',
	'id'    => 'has_event',
	'label' => 'Has Event',
),
'event_date' => array(
	'type'        => 'date',
	'id'          => 'event_date',
	'label'       => 'Event Date',
	'description' => 'Select the date when the event takes place.',
	'conditions'  => array(
		array( 'field' => 'has_event', 'value' => true ),
	),
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->date(
	label: 'Start Date',
	required: true,
);
```

## Notes

- The date picker uses the browser's native date input, which may look different across different browsers and operating systems
- The saved value is always in ISO format (YYYY-MM-DD), regardless of the display format shown to the user
- The `min` and `max` constraints are passed through the field definition array; the FieldFactory method does not expose them as named parameters
- For date and time together, use the `datetime` field type instead
- For selecting a date range, use the `date_range` field type instead
