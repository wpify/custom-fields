# Multi Date Field Type

The Multi Date field type allows users to select and manage multiple dates. It provides a repeatable date picker interface where users can add, remove, and reorder dates as needed.

## Field Type: `multi_date`

```php
array(
    'type'     => 'multi_date',
    'id'       => 'example_dates',
    'label'    => 'Event Dates',
    'min'      => 2,       // Minimum number of dates
    'max'      => 10,      // Maximum number of dates
    'buttons'  => array(   // Custom button labels
        'add'    => 'Add Date',
        'remove' => 'Remove',
    ),
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `multi_date` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have at least one date
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(string)_ - Default date value for new items in ISO format (YYYY-MM-DD)
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `min` _(integer)_ - Optional

Minimum number of dates required. If specified, the field will automatically add dates to reach this minimum.

#### `max` _(integer)_ - Optional

Maximum number of dates allowed. When this limit is reached, the "Add" button will be disabled.

#### `buttons` _(array)_ - Optional

Custom labels for the buttons:
- `add` _(string)_ - Custom label for the add button
- `remove` _(string)_ - Custom label for the remove button

#### `disabled_buttons` _(array)_ - Optional

Array of button names to disable. Possible values: `['add']`, `['remove']`, `['move']`, or combinations.

## User Interface

The Multi Date field provides an interactive interface with:

1. **Date Picker Rows**: Each row contains a date picker input
2. **Add Button**: Adds a new date row
3. **Remove Buttons**: Each date row has a remove button (trash icon)
4. **Drag Handles**: Each row has a drag handle for reordering (move icon)

## Stored Value

The field stores an array of date strings in ISO format (YYYY-MM-DD). For example:

```php
[
    '2023-01-15',
    '2023-02-20',
    '2023-03-05'
]
```

## Validation

Each date in the Multi Date field is validated using the same rules as the standard Date field:
- If the field is required, at least one date must be provided
- Each date value must be a valid date string
- Additional validation can be applied to each date based on the min/max attributes of the date field

## Example Usage

### Event Schedule Dates

```php
'event_dates' => array(
    'type'        => 'multi_date',
    'id'          => 'event_dates',
    'label'       => 'Event Schedule',
    'description' => 'Select all dates when this event will take place.',
    'required'    => true,
    'min'         => 1,
    'attributes'  => array(
        'min' => date('Y-m-d'), // Today's date as minimum (no past dates)
    ),
),
```

### Recurring Availability Dates

```php
'availability_dates' => array(
    'type'        => 'multi_date',
    'id'          => 'availability_dates',
    'label'       => 'Available Dates',
    'description' => 'Select dates when this product is available.',
    'buttons'     => array(
        'add'    => 'Add Available Date',
        'remove' => 'Remove Date',
    ),
    'max'         => 30, // Limit to 30 dates
),
```

### Using Multi Date Values in Your Theme

```php
// Get the array of dates
$event_dates = get_post_meta(get_the_ID(), 'event_dates', true);

if (!empty($event_dates) && is_array($event_dates)) {
    echo '<div class="event-schedule">';
    echo '<h3>Event Schedule</h3>';
    echo '<ul class="date-list">';
    
    // Sort dates chronologically
    sort($event_dates);
    
    foreach ($event_dates as $date) {
        // Format the date according to your needs
        $formatted_date = date_i18n(get_option('date_format'), strtotime($date));
        
        // Get day of week
        $day_of_week = date_i18n('l', strtotime($date));
        
        echo '<li class="event-date">';
        echo '<span class="date">' . esc_html($formatted_date) . '</span>';
        echo '<span class="day">(' . esc_html($day_of_week) . ')</span>';
        echo '</li>';
    }
    
    echo '</ul></div>';
}
```

### Multi Date with Conditional Logic

```php
'has_special_dates' => array(
    'type'   => 'toggle',
    'id'     => 'has_special_dates',
    'label'  => 'Special Dates',
    'title'  => 'This product has special availability dates',
),
'special_dates' => array(
    'type'        => 'multi_date',
    'id'          => 'special_dates',
    'label'       => 'Special Availability',
    'description' => 'Select dates when this product has special availability.',
    'conditions'  => array(
        array('field' => 'has_special_dates', 'value' => true),
    ),
),
```

## Notes

- The Multi Date field extends the standard Date field to allow multiple selections
- Each date input has the same properties and behavior as the standard Date field
- Users can reorder dates by dragging and dropping (requires JavaScript)
- The field automatically generates a unique key for each date row to maintain integrity during reordering
- When using min/max constraints, the field automatically enforces these limits
- Consider using date sorting functions when retrieving the dates for display
- For selecting date ranges rather than individual dates, consider using two Date fields (start/end) or creating a custom solution
- For date and time together, use the `multi_datetime` field type instead