# Time Field Type

The Time field type provides a specialized input for selecting time values. It uses the browser's native time picker to offer a user-friendly interface for selecting hours and minutes.

## Field Type: `time`

```php
array(
    'type'  => 'time',
    'id'    => 'example_time',
    'label' => 'Start Time',
    'min'   => '09:00',
    'max'   => '17:00',
)
```

## Properties

**For Default Field Properties, see [Field Types Definition](../field-types.md)**.

### `min` _(string)_ - Optional

The earliest time that can be selected. The value should be in 24-hour format (HH:MM).

### `max` _(string)_ - Optional

The latest time that can be selected. The value should be in 24-hour format (HH:MM).

### `attributes` _(array)_ - Optional

You can pass HTML attributes to the time input field. For example:

```php
'attributes' => array(
    'step' => '900', // 15-minute intervals (in seconds)
    'class' => 'custom-time-picker',
),
```

The most useful attributes for time inputs:

- `step`: Controls the time increments in seconds (e.g., `900` for 15-minute intervals, `1800` for 30-minute intervals)

## Stored Value

The field stores the time value as a string in 24-hour format (HH:MM), for example: `14:30`.

## Example Usage

### Basic Time Field

```php
'opening_time' => array(
    'type'        => 'time',
    'id'          => 'opening_time',
    'label'       => 'Opening Time',
    'description' => 'Select the business opening time.',
    'default'     => '09:00',
    'required'    => true,
),
```

### Time Field with Range Constraints

```php
'appointment_time' => array(
    'type'        => 'time',
    'id'          => 'appointment_time',
    'label'       => 'Appointment Time',
    'description' => 'Select an appointment time (business hours only).',
    'min'         => '09:00',
    'max'         => '17:00',
    'attributes'  => array(
        'step' => '1800', // 30-minute intervals
    ),
    'required'    => true,
),
```

### Using Time Values in Your Theme

```php
// Get the time value from the meta field
$opening_time = get_post_meta(get_the_ID(), 'opening_time', true);

if (!empty($opening_time)) {
    // Format the time according to site settings or custom format
    $formatted_time = date_i18n(get_option('time_format'), strtotime($opening_time));
    
    echo '<div class="business-hours">';
    echo 'Opens at: ' . esc_html($formatted_time);
    echo '</div>';
}
```

### Time Fields for Business Hours

```php
'monday_open' => array(
    'type'        => 'time',
    'id'          => 'monday_open',
    'label'       => 'Monday Opening Time',
    'default'     => '09:00',
    'attributes'  => array(
        'step' => '1800', // 30-minute intervals
    ),
),
'monday_close' => array(
    'type'        => 'time',
    'id'          => 'monday_close',
    'label'       => 'Monday Closing Time',
    'default'     => '17:00',
    'attributes'  => array(
        'step' => '1800', // 30-minute intervals
    ),
),
```

### Displaying Multiple Time Fields

```php
// Get business hours from meta fields
$days = array('monday', 'tuesday', 'wednesday', 'thursday', 'friday');
$business_hours = array();

foreach ($days as $day) {
    $open_time = get_post_meta(get_the_ID(), $day . '_open', true);
    $close_time = get_post_meta(get_the_ID(), $day . '_close', true);
    
    if (!empty($open_time) && !empty($close_time)) {
        $business_hours[$day] = array(
            'open' => date_i18n(get_option('time_format'), strtotime($open_time)),
            'close' => date_i18n(get_option('time_format'), strtotime($close_time)),
        );
    }
}

// Display business hours table
if (!empty($business_hours)) {
    echo '<table class="business-hours">';
    echo '<thead><tr><th>Day</th><th>Hours</th></tr></thead>';
    echo '<tbody>';
    
    foreach ($business_hours as $day => $hours) {
        echo '<tr>';
        echo '<td>' . ucfirst($day) . '</td>';
        echo '<td>' . $hours['open'] . ' - ' . $hours['close'] . '</td>';
        echo '</tr>';
    }
    
    echo '</tbody></table>';
}
```

## Notes

- The time picker uses the browser's native time input, which may look different across different browsers and operating systems
- The saved value is always in 24-hour format (HH:MM), regardless of the display format shown to the user
- When retrieving time values, you may want to convert them to a more user-friendly format using PHP's `date()` function or WordPress's `date_i18n()` function
- For date and time together, use the `datetime` field type instead
- The `step` attribute can be used to limit time selection to specific intervals
- The field validates that a value is provided when the field is required