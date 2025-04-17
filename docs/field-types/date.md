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

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `date` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have a value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(string)_ - Default date value in ISO format (YYYY-MM-DD)
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `min` _(string)_ - Optional

The earliest date that can be selected. The date should be in ISO format (YYYY-MM-DD).

#### `max` _(string)_ - Optional

The latest date that can be selected. The date should be in ISO format (YYYY-MM-DD).

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
    'min'         => date('Y-m-d'), // Today
    'max'         => date('Y-m-d', strtotime('+90 days')), // 90 days from today
    'required'    => true,
),
```

### Using the Date Value in Your Theme

```php
// Get the date value from the meta field
$event_date = get_post_meta(get_the_ID(), 'event_date', true);

if (!empty($event_date)) {
    // Format the date according to your needs
    $formatted_date = date_i18n(get_option('date_format'), strtotime($event_date));
    
    echo '<div class="event-date">';
    echo esc_html($formatted_date);
    echo '</div>';
}
```

## Field Validation

The Date field validates that:
- If the field is required, a date must be selected
- The selected date falls within the optional min and max constraints

## Notes

- The date picker uses the browser's native date input, which may look different across different browsers and operating systems
- The saved value is always in ISO format (YYYY-MM-DD), regardless of the display format shown to the user
- This field is particularly useful for event scheduling, booking systems, or any other date-specific data collection
- For date and time together, use the `datetime` field type instead