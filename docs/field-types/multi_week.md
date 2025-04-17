# MultiWeek

MultiWeek field allows users to select and manage multiple week values. It's useful for planning recurring activities, scheduling content, collecting availability data, or any other scenario where multiple week selections are needed.

## Field Configuration

```php
[
    'id' => 'training_weeks',
    'type' => 'multi_week',
    'label' => 'Training Schedule',
    'description' => 'Select weeks when training sessions are available',
    'min' => 1,
    'max' => 10,
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

- **min** (number, optional): Sets the minimum number of week inputs. If set, the user won't be able to remove items below this number.
- **max** (number, optional): Sets the maximum number of week inputs. If set, the user won't be able to add more items beyond this number.
- **buttons** (array, optional): Customize button labels.
  - **add** (string, optional): Custom label for the add button. Default is an icon button.
  - **remove** (string, optional): Custom label for the remove button. Default is an icon button.
- **disabled_buttons** (array, optional): Array of buttons to disable. Options: 'move', 'delete'.

For the individual week inputs, the following properties from the standard Week field apply:

- **min** (string, optional): Sets the minimum week that can be selected (format: "YYYY-Www").
- **max** (string, optional): Sets the maximum week that can be selected (format: "YYYY-Www").

## Stored Value Format

The MultiWeek field stores data as an array of week strings in ISO 8601 format (YYYY-Www):

```php
[
    '2023-W01',
    '2023-W10',
    '2023-W22',
    '2023-W35'
]
```

Each string represents a specific week of a specific year, where:
- 'YYYY' is the four-digit year
- 'W' is a literal character
- 'ww' is the two-digit week number (01-53)

## Usage Examples

### Retrieving Data

```php
// Get the field value
$training_weeks = get_post_meta(get_the_ID(), 'training_weeks', true);

// Loop through each week
if (!empty($training_weeks) && is_array($training_weeks)) {
    echo '<ul class="training-weeks">';
    foreach ($training_weeks as $week) {
        // Parse the week value
        list($year, $week_number) = explode('-W', $week);
        
        // Display in a more readable format
        echo '<li>Week ' . intval($week_number) . ', ' . $year . '</li>';
        
        // Alternative: Convert to date range
        $first_day_of_week = new DateTime();
        $first_day_of_week->setISODate($year, $week_number, 1); // 1 = Monday
        
        $last_day_of_week = clone $first_day_of_week;
        $last_day_of_week->modify('+6 days'); // Sunday
        
        echo '<li>' . $first_day_of_week->format('M j') . ' - ' . 
                      $last_day_of_week->format('M j, Y') . '</li>';
    }
    echo '</ul>';
}
```

### Theme Implementation

```php
// Function to display schedule of training weeks
function display_training_schedule() {
    $training_weeks = get_post_meta(get_the_ID(), 'training_weeks', true);
    
    if (empty($training_weeks) || !is_array($training_weeks)) {
        return;
    }
    
    // Sort weeks chronologically
    sort($training_weeks);
    
    echo '<div class="training-schedule">';
    echo '<h3>Upcoming Training Sessions</h3>';
    echo '<div class="schedule-grid">';
    
    $current_date = new DateTime();
    $current_year_week = $current_date->format('Y-\WW');
    
    foreach ($training_weeks as $week) {
        // Skip past weeks
        if ($week < $current_year_week) {
            continue;
        }
        
        // Parse the week value
        list($year, $week_number) = explode('-W', $week);
        
        // Get date range for this week
        $week_start = new DateTime();
        $week_start->setISODate($year, $week_number, 1); // 1 = Monday
        
        $week_end = clone $week_start;
        $week_end->modify('+6 days'); // Sunday
        
        $date_range = $week_start->format('F j') . ' - ' . $week_end->format('F j, Y');
        
        echo '<div class="schedule-item">';
        echo '<div class="week-number">Week ' . intval($week_number) . '</div>';
        echo '<div class="date-range">' . esc_html($date_range) . '</div>';
        
        // Add additional information if needed
        echo '<div class="schedule-details">';
        echo '<p>Training sessions run Monday through Friday, 9:00 AM - 5:00 PM</p>';
        echo '<a href="/register" class="register-button">Register for this week</a>';
        echo '</div>';
        
        echo '</div>'; // .schedule-item
    }
    
    echo '</div>'; // .schedule-grid
    echo '</div>'; // .training-schedule
}
```

### Advanced Usage: Calendar View

```php
function display_week_calendar() {
    $selected_weeks = get_post_meta(get_the_ID(), 'training_weeks', true);
    
    if (empty($selected_weeks) || !is_array($selected_weeks)) {
        return;
    }
    
    // Get current year
    $current_year = date('Y');
    
    echo '<div class="year-calendar">';
    echo '<h3>Training Calendar ' . $current_year . '</h3>';
    
    echo '<div class="calendar-grid">';
    
    // Loop through all weeks of the year
    for ($week = 1; $week <= 52; $week++) {
        $week_id = sprintf('%s-W%02d', $current_year, $week);
        $is_selected = in_array($week_id, $selected_weeks);
        
        // Create date object for this week
        $date = new DateTime();
        $date->setISODate($current_year, $week, 1); // 1 = Monday
        
        echo '<div class="calendar-week ' . ($is_selected ? 'selected-week' : '') . '">';
        echo '<div class="week-label">Week ' . $week . '</div>';
        echo '<div class="week-dates">' . $date->format('M j') . '</div>';
        
        if ($is_selected) {
            echo '<div class="training-badge">Training</div>';
        }
        
        echo '</div>'; // .calendar-week
    }
    
    echo '</div>'; // .calendar-grid
    echo '</div>'; // .year-calendar
}
```

## Features and Notes

- **Drag and Drop Reordering**: Users can easily reorder weeks using drag and drop.
- **Multiple Weeks**: Add as many week inputs as needed.
- **Input Validation**: Ensures that entered values are valid week formats.
- **Min/Max Constraints**: Set minimum and maximum allowed weeks for each input.
- **Minimum/Maximum Items**: Enforce a minimum or maximum number of week inputs.
- **HTML5 Week Inputs**: Uses native HTML5 week inputs for consistent and user-friendly week selection.
- **ISO 8601 Format**: Weeks are stored in standard ISO 8601 format (YYYY-Www) for easy sorting and comparison.
- **Browser Support**: Note that some browsers (like Firefox and Safari) don't fully support the HTML5 week input. In these browsers, users may see a text input or alternative date picker.

The MultiWeek field is ideal for course planning, event scheduling, seasonal planning, availability tracking, or any application where multiple week-based selections are needed.
