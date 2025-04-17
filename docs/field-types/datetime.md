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

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `datetime` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have a value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(string)_ - Default datetime value in ISO format (YYYY-MM-DDThh:mm)
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `min` _(string)_ - Optional

The earliest date and time that can be selected. The value should be in ISO format (YYYY-MM-DDThh:mm).

#### `max` _(string)_ - Optional

The latest date and time that can be selected. The value should be in ISO format (YYYY-MM-DDThh:mm).

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
    'min'         => date('Y-m-d\T09:00'), // Today at 9:00 AM
    'max'         => date('Y-m-d\T17:00', strtotime('+30 days')), // 30 days from today at 5:00 PM
    'required'    => true,
    'attributes'  => array(
        'step' => '1800', // 30-minute intervals
    ),
),
```

### Using the Datetime Value in Your Theme

```php
// Get the datetime value from the meta field
$event_start = get_post_meta(get_the_ID(), 'event_start', true);

if (!empty($event_start)) {
    // Split into date and time components
    list($date, $time) = explode('T', $event_start);
    
    // Format the date and time according to your needs
    $formatted_date = date_i18n(get_option('date_format'), strtotime($date));
    $formatted_time = date_i18n(get_option('time_format'), strtotime($time));
    
    echo '<div class="event-datetime">';
    echo esc_html($formatted_date) . ' at ' . esc_html($formatted_time);
    echo '</div>';
}
```

## Field Validation

The Datetime field validates that:
- If the field is required, a date and time must be selected
- The selected datetime falls within the optional min and max constraints

## Notes

- The datetime picker uses the browser's native datetime-local input, which may look different across different browsers and operating systems
- The saved value is always in ISO format (YYYY-MM-DDThh:mm), regardless of the display format shown to the user
- This field is particularly useful for event scheduling, appointment booking, or any other datetime-specific data collection
- You can add a `step` attribute to control the time increments (in seconds). For example, `step="1800"` for 30-minute intervals
- For date only selection, use the `date` field type instead
- For time only selection, use the `time` field type instead