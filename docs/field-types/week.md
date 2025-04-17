# Week Field Type

The Week field type provides a specialized input for selecting a specific week of the year. It uses the browser's native week picker interface, making it ideal for selecting reporting periods, work weeks, or any data that requires week-level precision.

## Field Type: `week`

```php
array(
    'type'  => 'week',
    'id'    => 'example_week',
    'label' => 'Reporting Week',
    'min'   => '2023-W01',
    'max'   => '2023-W52',
)
```

## Properties

**For Default Field Properties, see [Field Types Definition](../field-types.md)**.

### `min` _(string)_ - Optional

The earliest week that can be selected. The value should be in ISO format (YYYY-Www), where YYYY is the year and ww is the week number (e.g., `2023-W01`).

### `max` _(string)_ - Optional

The latest week that can be selected. The value should be in ISO format (YYYY-Www).

### `attributes` _(array)_ - Optional

You can pass HTML attributes to the week input field. For example:

```php
'attributes' => array(
    'class' => 'custom-week-picker',
),
```

## Stored Value

The field stores the week value as a string in ISO format (YYYY-Www), for example: `2023-W16` for the 16th week of 2023.

## Example Usage

### Basic Week Field

```php
'report_week' => array(
    'type'        => 'week',
    'id'          => 'report_week',
    'label'       => 'Weekly Report Period',
    'description' => 'Select the week this report covers.',
    'required'    => true,
),
```

### Week Field with Range Constraints

```php
'fiscal_quarter_1' => array(
    'type'        => 'week',
    'id'          => 'fiscal_quarter_1',
    'label'       => 'Q1 Planning Week',
    'description' => 'Select a week in the first quarter for planning.',
    'min'         => date('Y') . '-W01', // First week of current year
    'max'         => date('Y') . '-W13', // 13th week (roughly Q1)
),
```

### Current Year Weeks

```php
// Dynamic min/max constraints for the current year
'current_year_week' => array(
    'type'        => 'week',
    'id'          => 'current_year_week',
    'label'       => 'Week Selection',
    'description' => 'Select a week in the current year.',
    'min'         => date('Y') . '-W01', // First week of current year
    'max'         => date('Y') . '-W52', // Last week of current year (may be W53 in some years)
),
```

### Using Week Values in Your Theme

```php
// Get the week value from the meta field
$report_week = get_post_meta(get_the_ID(), 'report_week', true);

if (!empty($report_week)) {
    // Parse the week value
    list($year, $week_number) = explode('-W', $report_week);
    
    // Calculate the date of the first day of the week (Monday)
    $date = new DateTime();
    $date->setISODate($year, $week_number);
    $start_date = $date->format('M j, Y');
    
    // Calculate the end date (Sunday)
    $date->modify('+6 days');
    $end_date = $date->format('M j, Y');
    
    echo '<div class="report-period">';
    echo 'Report Period: Week ' . esc_html($week_number) . ', ' . esc_html($year);
    echo ' (' . esc_html($start_date) . ' to ' . esc_html($end_date) . ')';
    echo '</div>';
}
```

### Week Field with Conditional Logic

```php
'weekly_report' => array(
    'type'    => 'toggle',
    'id'      => 'weekly_report',
    'label'   => 'Weekly Report',
    'title'   => 'Include weekly report data',
),
'report_week' => array(
    'type'        => 'week',
    'id'          => 'report_week',
    'label'       => 'Report Week',
    'description' => 'Select the week for this report.',
    'conditions'  => array(
        array('field' => 'weekly_report', 'value' => true),
    ),
),
```

## Working with Week Data

The ISO week format (YYYY-Www) requires some special handling to convert to dates:

```php
/**
 * Convert a week string to start and end dates
 *
 * @param string $week_string ISO week string (e.g., '2023-W16')
 * @return array Array with start and end dates
 */
function convert_week_to_dates($week_string) {
    list($year, $week) = explode('-W', $week_string);
    
    // Create DateTime object for the first day of the week (Monday)
    $date_start = new DateTime();
    $date_start->setISODate((int)$year, (int)$week);
    
    // Create DateTime object for the last day of the week (Sunday)
    $date_end = clone $date_start;
    $date_end->modify('+6 days');
    
    return array(
        'start' => $date_start,
        'end'   => $date_end,
        'year'  => (int)$year,
        'week'  => (int)$week,
    );
}

// Usage
$week_data = convert_week_to_dates('2023-W16');
echo 'Week starts on: ' . $week_data['start']->format('F j, Y');
echo 'Week ends on: ' . $week_data['end']->format('F j, Y');
```

## Notes

- The week picker uses the browser's native week input, which may look different across different browsers and operating systems
- The saved value is always in ISO format (YYYY-Www), complying with ISO 8601
- Weeks in ISO 8601 start on Monday and end on Sunday
- The first week of the year (W01) is the week containing the first Thursday of the year
- Some years have 53 weeks according to ISO 8601
- When retrieving week values, use PHP's DateTime class with setISODate() to properly handle week calculations
- The field validates that a value is provided when the field is required
- The week format is particularly useful for applications requiring week-based reporting, scheduling, or planning