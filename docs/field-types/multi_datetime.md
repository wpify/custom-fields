# Multi Datetime Field Type

The Multi Datetime field type allows users to add multiple date and time inputs. It provides a repeatable interface for collecting multiple datetime values with add/remove functionality.

## Field Type: `multi_datetime`

```php
array(
	'type'        => 'multi_datetime',
	'id'          => 'example_multi_datetime',
	'label'       => 'Example Multi Datetime',
	'description' => 'Add multiple date and time entries',
	'default'     => array( '2025-04-15T09:30', '2025-04-16T14:00' ),
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `multi_datetime` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have at least one value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(array)_ - Default values as an array of datetime strings (format: 'YYYY-MM-DDThh:mm')
- `attributes` _(array)_ - HTML attributes to add to each datetime input
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `min` _(string)_ - Optional

The earliest date and time that can be selected. Format: 'YYYY-MM-DDThh:mm'.

#### `max` _(string)_ - Optional

The latest date and time that can be selected. Format: 'YYYY-MM-DDThh:mm'.

## Stored Value

The field stores an array of datetime strings in the format 'YYYY-MM-DDThh:mm' in the database.

## Example Usage

### Basic Multi Datetime Field

```php
'event_sessions' => array(
	'type'        => 'multi_datetime',
	'id'          => 'event_sessions',
	'label'       => 'Event Sessions',
	'description' => 'Select the dates and times for each session of this event',
	'min'         => '2025-01-01T00:00',
	'max'         => '2025-12-31T23:59',
),
```

### Multi Datetime with Default Values

```php
'conference_schedule' => array(
	'type'        => 'multi_datetime',
	'id'          => 'conference_schedule',
	'label'       => 'Conference Schedule',
	'description' => 'Set the schedule for the conference days',
	'default'     => array(
		'2025-06-01T09:00',
		'2025-06-02T09:00',
		'2025-06-03T09:00',
	),
),
```

### Retrieving and Using Multi Datetime Values

```php
// Get the array of session datetimes
$event_sessions = get_post_meta( get_the_ID(), 'event_sessions', true );

if ( ! empty( $event_sessions ) && is_array( $event_sessions ) ) {
	echo '<div class="event-sessions">';
	echo '<h3>Event Sessions</h3>';
	echo '<ul>';
	
	foreach ( $event_sessions as $session ) {
		// Convert to DateTime object for formatting
		$session_datetime = new DateTime( $session );
		
		echo '<li>';
		echo esc_html( $session_datetime->format( 'F j, Y - g:i A' ) );
		echo '</li>';
	}
	
	echo '</ul>';
	echo '</div>';
}
```

### Multi Datetime with Conditional Logic

```php
'has_multiple_sessions' => array(
	'type'  => 'toggle',
	'id'    => 'has_multiple_sessions',
	'label' => 'Event has multiple sessions',
),
'session_dates' => array(
	'type'       => 'multi_datetime',
	'id'         => 'session_dates',
	'label'      => 'Session Dates and Times',
	'conditions' => array(
		array( 'field' => 'has_multiple_sessions', 'value' => true ),
	),
),
```

## Notes

- The Multi Datetime field provides an "Add" button to add additional datetime inputs
- Each added datetime input includes a "Remove" button to delete it
- The stored value is always an array, even if only one datetime is selected
- The browser's native datetime-local input is used, which may appear differently across browsers
- The field supports standard HTML5 datetime input validation (min/max ranges)
- Empty values are not stored in the array
- This field is useful for events with multiple dates, scheduling sessions, or any case where multiple datetime values need to be collected