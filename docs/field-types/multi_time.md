# Multi Time Field Type

The Multi Time field type allows users to select and manage multiple time values. It provides a repeatable time picker interface for collecting multiple times, such as operating hours, appointment slots, or class schedules.

## Field Type: `multi_time`

```php
array(
	'type'    => 'multi_time',
	'id'      => 'class_schedule',
	'label'   => 'Class Schedule',
	'min'     => 1,
	'max'     => 5,
	'buttons' => array(
		'add'    => 'Add Time',
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

Array of time strings in 24-hour format (HH:MM):

```php
array(
	'09:00',
	'12:30',
	'15:45',
	'18:00',
)
```

## Example Usage

### Appointment Slots

```php
'appointment_times' => array(
	'type'        => 'multi_time',
	'id'          => 'appointment_times',
	'label'       => 'Available Appointment Times',
	'description' => 'Add the available time slots for appointments.',
	'min'         => 1,
	'max'         => 8,
),
```

### Using Values in Your Theme

```php
$class_times = get_post_meta( get_the_ID(), 'class_schedule', true );

if ( ! empty( $class_times ) && is_array( $class_times ) ) {
	sort( $class_times );

	echo '<div class="schedule-container">';
	echo '<h3>' . esc_html__( 'Class Schedule', 'your-theme' ) . '</h3>';
	echo '<ul class="time-list">';

	foreach ( $class_times as $time ) {
		$datetime = DateTime::createFromFormat( 'H:i', $time );

		if ( $datetime ) {
			echo '<li>' . esc_html( $datetime->format( 'g:i A' ) ) . '</li>';
		}
	}

	echo '</ul>';
	echo '</div>';
}
```

### With Conditional Logic

```php
'has_schedule' => array(
	'type'  => 'toggle',
	'id'    => 'has_schedule',
	'label' => 'Has class schedule',
),
'class_times' => array(
	'type'        => 'multi_time',
	'id'          => 'class_times',
	'label'       => 'Class Times',
	'description' => 'Select times when classes are held.',
	'conditions'  => array(
		array( 'field' => 'has_schedule', 'value' => true ),
	),
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->multi_time(
	label: 'Available Times',
	min: 1,
	max: 5,
);
```

## Notes

- Each time input has the same properties and behavior as the standard `time` field type
- Users can reorder times by dragging and dropping
- Times are stored in 24-hour format for easy sorting and comparison
- Uses native HTML5 time inputs for consistent and user-friendly time selection
- The stored value is always an array, even if only one time is selected
- Empty values are not stored in the array
- For date and time together, use the `multi_datetime` field type instead
