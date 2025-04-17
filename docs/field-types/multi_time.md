# MultiTime

MultiTime field allows users to select and manage multiple time values. It's useful when you need to store a collection of times, such as operating hours, appointment slots, class schedules, or other time-related data.

## Field Configuration

```php
[
    'id' => 'class_schedule',
    'type' => 'multi_time',
    'label' => 'Class Schedule',
    'description' => 'Add multiple class times',
    'min' => 1,
    'max' => 8,
]
```

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `code` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have a value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(string)_ - Default value for the field
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

- **min** (number, optional): Sets the minimum number of time inputs. If set, the user won't be able to remove items below this number.
- **max** (number, optional): Sets the maximum number of time inputs. If set, the user won't be able to add more items beyond this number.
- **buttons** (array, optional): Customize button labels.
  - **add** (string, optional): Custom label for the add button. Default is an icon button.
  - **remove** (string, optional): Custom label for the remove button. Default is an icon button.
- **disabled_buttons** (array, optional): Array of buttons to disable. Options: 'move', 'delete'.

For the individual time inputs, the following properties from the standard Time field apply:

- **min** (string, optional): Sets the minimum time that can be selected (format: "HH:MM").
- **max** (string, optional): Sets the maximum time that can be selected (format: "HH:MM").

## Stored Value Format

The MultiTime field stores data as an array of time strings in 24-hour format:

```php
[
    '09:00',
    '12:30',
    '15:45',
    '18:00'
]
```

## Usage Examples

### Retrieving Data

```php
// Get the field value
$class_times = get_post_meta(get_the_ID(), 'class_schedule', true);

// Loop through each time
if (!empty($class_times) && is_array($class_times)) {
    echo '<ul class="class-times">';
    foreach ($class_times as $time) {
        // Display the time (optionally format it)
        echo '<li>' . esc_html($time) . '</li>';
        
        // To display in 12-hour format with AM/PM
        $datetime = DateTime::createFromFormat('H:i', $time);
        if ($datetime) {
            echo '<li>' . $datetime->format('g:i A') . '</li>';
        }
    }
    echo '</ul>';
}
```

### Theme Implementation

```php
// Function to display class schedule
function display_class_schedule() {
    $class_times = get_post_meta(get_the_ID(), 'class_schedule', true);
    
    if (empty($class_times) || !is_array($class_times)) {
        return;
    }
    
    // Sort times chronologically
    sort($class_times);
    
    echo '<div class="schedule-container">';
    echo '<h3>Class Schedule</h3>';
    echo '<div class="time-slots">';
    
    foreach ($class_times as $time) {
        // Convert to DateTime for formatting
        $datetime = DateTime::createFromFormat('H:i', $time);
        if (!$datetime) {
            continue;
        }
        
        $formatted_time = $datetime->format('g:i A'); // 12-hour format with AM/PM
        
        echo '<div class="time-slot">';
        echo '<span class="time">' . esc_html($formatted_time) . '</span>';
        echo '</div>';
    }
    
    echo '</div>'; // .time-slots
    echo '</div>'; // .schedule-container
}
```

### Advanced Usage: Sorting and Grouping Times

```php
function display_weekly_schedule() {
    $monday_times = get_post_meta(get_the_ID(), 'monday_schedule', true);
    $tuesday_times = get_post_meta(get_the_ID(), 'tuesday_schedule', true);
    // ... other days
    
    $days = [
        'monday' => [
            'label' => 'Monday',
            'times' => $monday_times
        ],
        'tuesday' => [
            'label' => 'Tuesday',
            'times' => $tuesday_times
        ],
        // ... other days
    ];
    
    echo '<div class="weekly-schedule">';
    
    foreach ($days as $day) {
        echo '<div class="day-schedule">';
        echo '<h4>' . esc_html($day['label']) . '</h4>';
        
        if (!empty($day['times']) && is_array($day['times'])) {
            // Sort times
            sort($day['times']);
            
            echo '<ul class="time-list">';
            foreach ($day['times'] as $time) {
                $datetime = DateTime::createFromFormat('H:i', $time);
                if (!$datetime) {
                    continue;
                }
                
                echo '<li>' . esc_html($datetime->format('g:i A')) . '</li>';
            }
            echo '</ul>';
        } else {
            echo '<p class="no-times">No classes scheduled</p>';
        }
        
        echo '</div>'; // .day-schedule
    }
    
    echo '</div>'; // .weekly-schedule
}
```

## Features and Notes

- **Drag and Drop Reordering**: Users can easily reorder times using drag and drop.
- **Multiple Times**: Add as many time inputs as needed.
- **Input Validation**: Ensures that entered values are valid time formats.
- **Min/Max Constraints**: Set minimum and maximum allowed times for each input.
- **Minimum/Maximum Items**: Enforce a minimum or maximum number of time inputs.
- **HTML5 Time Inputs**: Uses native HTML5 time inputs for consistent and user-friendly time selection.
- **24-Hour Format Storage**: Times are stored in 24-hour format for easy sorting and comparison.

The MultiTime field is ideal for scenarios where multiple time values need to be collected and managed, such as business hours, appointment scheduling, event planning, or any time-based data collections.
