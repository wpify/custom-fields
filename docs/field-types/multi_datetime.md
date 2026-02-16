# Multi Datetime Field Type

The Multi Datetime field type allows users to add multiple date and time inputs. It provides a repeatable interface for collecting multiple datetime values with add, remove, and reorder functionality.

## Field Type: `multi_datetime`

```php
array(
	'type'    => 'multi_datetime',
	'id'      => 'example_datetimes',
	'label'   => 'Event Times',
	'min'     => 1,
	'max'     => 10,
	'buttons' => array(
		'add'    => 'Add Event Time',
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

Array of datetime strings in the format `YYYY-MM-DDTHH:MM`:

```php
array(
	'2025-04-15T09:30',
	'2025-04-16T14:00',
	'2025-04-17T18:00',
)
```

## Example Usage

### Event Sessions

```php
'event_sessions' => array(
	'type'        => 'multi_datetime',
	'id'          => 'event_sessions',
	'label'       => 'Event Sessions',
	'description' => 'Select the dates and times for each session of this event.',
	'min'         => 1,
),
```

### Conference Schedule with Defaults

```php
'conference_schedule' => array(
	'type'        => 'multi_datetime',
	'id'          => 'conference_schedule',
	'label'       => 'Conference Schedule',
	'description' => 'Set the schedule for the conference days.',
	'default'     => array(
		'2025-06-01T09:00',
		'2025-06-02T09:00',
		'2025-06-03T09:00',
	),
),
```

### Using Values in Your Theme

```php
$event_sessions = get_post_meta( get_the_ID(), 'event_sessions', true );

if ( ! empty( $event_sessions ) && is_array( $event_sessions ) ) {
	echo '<div class="event-sessions">';
	echo '<h3>' . esc_html__( 'Event Sessions', 'your-theme' ) . '</h3>';
	echo '<ul>';

	foreach ( $event_sessions as $session ) {
		$session_datetime = new DateTime( $session );

		echo '<li>';
		echo esc_html( $session_datetime->format( 'F j, Y - g:i A' ) );
		echo '</li>';
	}

	echo '</ul>';
	echo '</div>';
}
```

### With Conditional Logic

```php
'has_multiple_sessions' => array(
	'type'  => 'toggle',
	'id'    => 'has_multiple_sessions',
	'label' => 'Event has multiple sessions',
),
'session_dates' => array(
	'type'        => 'multi_datetime',
	'id'          => 'session_dates',
	'label'       => 'Session Dates and Times',
	'conditions'  => array(
		array( 'field' => 'has_multiple_sessions', 'value' => true ),
	),
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->multi_datetime(
	label: 'Event Times',
	min: 1,
	max: 10,
);
```

## Notes

- Each datetime input has the same properties and behavior as the standard `datetime` field type
- Users can reorder datetime entries by dragging and dropping
- The stored value is always an array, even if only one datetime is selected
- The browser's native `datetime-local` input is used, which may appear differently across browsers
- Empty values are not stored in the array
- For dates without times, use the `multi_date` field type instead
