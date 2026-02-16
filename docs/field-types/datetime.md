# Datetime Field Type

The Datetime field type provides a date and time picker that allows users to select both a date and time in a single field.

## Field Type: `datetime`

```php
array(
	'type'  => 'datetime',
	'id'    => 'example_datetime',
	'label' => 'Event Start Time',
	'min'   => '2023-01-01T09:00',
	'max'   => '2025-12-31T18:00',
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

`min` _(string)_ — The earliest date and time that can be selected. The value should be in ISO format (YYYY-MM-DDThh:mm).

`max` _(string)_ — The latest date and time that can be selected. The value should be in ISO format (YYYY-MM-DDThh:mm).

## Stored Value

The field stores the date and time value as a string in ISO format (YYYY-MM-DDThh:mm), for example: `2023-04-15T14:30`.

## Example Usage

### Basic Datetime Field

```php
'event_start' => array(
	'type'        => 'datetime',
	'id'          => 'event_start',
	'label'       => 'Event Start Time',
	'description' => 'Select the date and time when the event starts.',
	'required'    => true,
),
```

### Datetime Field with Range Constraints

```php
'appointment_time' => array(
	'type'        => 'datetime',
	'id'          => 'appointment_time',
	'label'       => 'Appointment Time',
	'description' => 'Select a date and time for your appointment (business hours only).',
	'min'         => date( 'Y-m-d\T09:00' ), // Today at 9:00 AM
	'max'         => date( 'Y-m-d\T17:00', strtotime( '+30 days' ) ), // 30 days from today at 5:00 PM
	'required'    => true,
	'attributes'  => array(
		'step' => '1800', // 30-minute intervals
	),
),
```

### Using Values in Your Theme

```php
// Get the datetime value from the meta field.
$event_start = get_post_meta( get_the_ID(), 'event_start', true );

if ( ! empty( $event_start ) ) {
	// Split into date and time components.
	list( $date, $time ) = explode( 'T', $event_start );

	// Format the date and time according to your needs.
	$formatted_date = date_i18n( get_option( 'date_format' ), strtotime( $date ) );
	$formatted_time = date_i18n( get_option( 'time_format' ), strtotime( $time ) );

	echo '<div class="event-datetime">';
	echo esc_html( $formatted_date ) . ' at ' . esc_html( $formatted_time );
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
'event_start' => array(
	'type'        => 'datetime',
	'id'          => 'event_start',
	'label'       => 'Event Start Time',
	'description' => 'Select the date and time when the event starts.',
	'conditions'  => array(
		array( 'field' => 'has_event', 'value' => true ),
	),
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->datetime(
	label: 'Event Time',
	required: true,
);
```

## Notes

- The datetime picker uses the browser's native datetime-local input, which may look different across different browsers and operating systems
- The saved value is always in ISO format (YYYY-MM-DDThh:mm), regardless of the display format shown to the user
- You can add a `step` attribute to control the time increments (in seconds). For example, `step="1800"` for 30-minute intervals
- The `min` and `max` constraints are passed through the field definition array; the FieldFactory method does not expose them as named parameters
- For date only selection, use the `date` field type instead
- For time only selection, use the `time` field type instead
