# Multi Month Field Type

The Multi Month field type allows users to add multiple month and year inputs. It provides a repeatable interface for collecting multiple month values with add/remove functionality.

## Field Type: `multi_month`

```php
array(
	'type'        => 'multi_month',
	'id'          => 'example_multi_month',
	'label'       => 'Example Multi Month',
	'description' => 'Add multiple month entries',
	'default'     => array( '2025-04', '2025-05' ),
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `multi_month` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have at least one value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(array)_ - Default values as an array of month strings (format: 'YYYY-MM')
- `attributes` _(array)_ - HTML attributes to add to each month input
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `min` _(string)_ - Optional

The earliest month and year that can be selected. Format: 'YYYY-MM'.

#### `max` _(string)_ - Optional

The latest month and year that can be selected. Format: 'YYYY-MM'.

## Stored Value

The field stores an array of month strings in the format 'YYYY-MM' in the database (e.g., "2025-04").

## Example Usage

### Basic Multi Month Field

```php
'subscription_months' => array(
	'type'        => 'multi_month',
	'id'          => 'subscription_months',
	'label'       => 'Subscription Months',
	'description' => 'Select the months for this subscription',
),
```

### Multi Month with Range Constraints

```php
'fiscal_periods' => array(
	'type'        => 'multi_month',
	'id'          => 'fiscal_periods',
	'label'       => 'Fiscal Periods',
	'description' => 'Select the relevant fiscal periods',
	'min'         => '2024-01', // Limit selections to January 2024 or later
	'max'         => '2025-12', // Limit selections to December 2025 or earlier
),
```

### Multi Month with Default Values

```php
'quarterly_reports' => array(
	'type'        => 'multi_month',
	'id'          => 'quarterly_reports',
	'label'       => 'Quarterly Reports',
	'description' => 'Select the months for quarterly reports',
	'default'     => array(
		'2025-03',
		'2025-06',
		'2025-09',
		'2025-12',
	),
),
```

### Retrieving and Using Multi Month Values

```php
// Get the array of month values
$subscription_months = get_post_meta( get_the_ID(), 'subscription_months', true );

if ( ! empty( $subscription_months ) && is_array( $subscription_months ) ) {
	echo '<div class="subscription-schedule">';
	echo '<h3>Subscription Schedule</h3>';
	echo '<ul>';
	
	foreach ( $subscription_months as $month_value ) {
		// Parse the year and month
		list( $year, $month ) = explode( '-', $month_value );
		
		// Create a DateTime object for formatting
		$date = new DateTime( $month_value . '-01' );
		
		echo '<li>';
		echo esc_html( $date->format( 'F Y' ) ); // Format as "April 2025"
		echo '</li>';
	}
	
	echo '</ul>';
	echo '</div>';
}
```

### Sorting Month Values

```php
// Get the array of month values
$quarterly_reports = get_post_meta( get_the_ID(), 'quarterly_reports', true );

if ( ! empty( $quarterly_reports ) && is_array( $quarterly_reports ) ) {
	// Sort months chronologically
	sort( $quarterly_reports );
	
	echo '<div class="report-schedule">';
	echo '<h3>Report Schedule</h3>';
	echo '<table class="report-table">';
	echo '<thead><tr><th>Period</th><th>Due Date</th></tr></thead>';
	echo '<tbody>';
	
	foreach ( $quarterly_reports as $month_value ) {
		// Create a DateTime object for the first day of the month
		$date = new DateTime( $month_value . '-01' );
		
		// Due date is 15 days after the end of the month
		$due_date = clone $date;
		$due_date->modify( 'last day of this month' );
		$due_date->modify( '+15 days' );
		
		echo '<tr>';
		echo '<td>' . esc_html( $date->format( 'F Y' ) ) . '</td>';
		echo '<td>' . esc_html( $due_date->format( 'F j, Y' ) ) . '</td>';
		echo '</tr>';
	}
	
	echo '</tbody>';
	echo '</table>';
	echo '</div>';
}
```

### Multi Month with Conditional Logic

```php
'has_recurring_schedule' => array(
	'type'  => 'toggle',
	'id'    => 'has_recurring_schedule',
	'label' => 'Has recurring payment schedule?',
),
'payment_months' => array(
	'type'       => 'multi_month',
	'id'         => 'payment_months',
	'label'      => 'Payment Months',
	'description' => 'Select the months when payments are due',
	'conditions' => array(
		array( 'field' => 'has_recurring_schedule', 'value' => true ),
	),
),
```

## Notes

- The Multi Month field provides an "Add" button to add additional month inputs
- Each added month input includes a "Remove" button to delete it
- The stored value is always an array, even if only one month is selected
- The field uses the browser's native month input, which typically displays as a dropdown or date picker depending on the browser
- On most browsers, the month selector shows both month and year
- The field stores values in the 'YYYY-MM' format, which is easy to sort chronologically
- Empty values are not stored in the array
- This field is useful for scheduling, recurring events, fiscal periods, or any scenario requiring multiple month/year selections