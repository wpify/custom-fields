# Multi Month Field Type

The Multi Month field type allows users to add multiple month and year inputs. It provides a repeatable interface for collecting multiple month values with add, remove, and reorder functionality.

## Field Type: `multi_month`

```php
array(
	'type'    => 'multi_month',
	'id'      => 'active_months',
	'label'   => 'Active Months',
	'min'     => 1,
	'max'     => 12,
	'buttons' => array(
		'add'    => 'Add Month',
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

Array of month strings in the format `YYYY-MM`:

```php
array(
	'2025-03',
	'2025-06',
	'2025-09',
	'2025-12',
)
```

## Example Usage

### Subscription Months

```php
'subscription_months' => array(
	'type'        => 'multi_month',
	'id'          => 'subscription_months',
	'label'       => 'Subscription Months',
	'description' => 'Select the months for this subscription.',
),
```

### Quarterly Reports with Defaults

```php
'quarterly_reports' => array(
	'type'        => 'multi_month',
	'id'          => 'quarterly_reports',
	'label'       => 'Quarterly Reports',
	'description' => 'Select the months for quarterly reports.',
	'default'     => array(
		'2025-03',
		'2025-06',
		'2025-09',
		'2025-12',
	),
),
```

### Using Values in Your Theme

```php
$subscription_months = get_post_meta( get_the_ID(), 'subscription_months', true );

if ( ! empty( $subscription_months ) && is_array( $subscription_months ) ) {
	sort( $subscription_months );

	echo '<div class="subscription-schedule">';
	echo '<h3>' . esc_html__( 'Subscription Schedule', 'your-theme' ) . '</h3>';
	echo '<ul>';

	foreach ( $subscription_months as $month_value ) {
		$date = new DateTime( $month_value . '-01' );

		echo '<li>';
		echo esc_html( $date->format( 'F Y' ) );
		echo '</li>';
	}

	echo '</ul>';
	echo '</div>';
}
```

### With Conditional Logic

```php
'has_recurring_schedule' => array(
	'type'  => 'toggle',
	'id'    => 'has_recurring_schedule',
	'label' => 'Has recurring payment schedule?',
),
'payment_months' => array(
	'type'        => 'multi_month',
	'id'          => 'payment_months',
	'label'       => 'Payment Months',
	'description' => 'Select the months when payments are due.',
	'conditions'  => array(
		array( 'field' => 'has_recurring_schedule', 'value' => true ),
	),
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->multi_month(
	label: 'Active Months',
	min: 1,
	max: 12,
);
```

## Notes

- Each month input has the same properties and behavior as the standard `month` field type
- Users can reorder months by dragging and dropping
- The field uses the browser's native month input, which typically displays as a dropdown or date picker depending on the browser
- Values are stored in the `YYYY-MM` format, which is easy to sort chronologically
- The stored value is always an array, even if only one month is selected
- Empty values are not stored in the array
