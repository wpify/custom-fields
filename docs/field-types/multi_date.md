# Multi Date Field Type

The Multi Date field type allows users to select and manage multiple dates. It provides a repeatable date picker interface where users can add, remove, and reorder dates as needed.

## Field Type: `multi_date`

```php
array(
	'type'    => 'multi_date',
	'id'      => 'example_dates',
	'label'   => 'Event Dates',
	'min'     => 2,
	'max'     => 10,
	'buttons' => array(
		'add'    => 'Add Date',
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

Array of date strings in ISO format (YYYY-MM-DD):

```php
array(
	'2023-01-15',
	'2023-02-20',
	'2023-03-05',
)
```

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
		'min' => date( 'Y-m-d' ),
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
	'max'         => 30,
),
```

### Using Values in Your Theme

```php
$event_dates = get_post_meta( get_the_ID(), 'event_dates', true );

if ( ! empty( $event_dates ) && is_array( $event_dates ) ) {
	sort( $event_dates );

	echo '<div class="event-schedule">';
	echo '<h3>' . esc_html__( 'Event Schedule', 'your-theme' ) . '</h3>';
	echo '<ul class="date-list">';

	foreach ( $event_dates as $date ) {
		$formatted_date = date_i18n( get_option( 'date_format' ), strtotime( $date ) );
		$day_of_week    = date_i18n( 'l', strtotime( $date ) );

		echo '<li class="event-date">';
		echo '<span class="date">' . esc_html( $formatted_date ) . '</span>';
		echo '<span class="day">(' . esc_html( $day_of_week ) . ')</span>';
		echo '</li>';
	}

	echo '</ul></div>';
}
```

### With Conditional Logic

```php
'has_special_dates' => array(
	'type'  => 'toggle',
	'id'    => 'has_special_dates',
	'label' => 'Special Dates',
	'title' => 'This product has special availability dates',
),
'special_dates' => array(
	'type'        => 'multi_date',
	'id'          => 'special_dates',
	'label'       => 'Special Availability',
	'description' => 'Select dates when this product has special availability.',
	'conditions'  => array(
		array( 'field' => 'has_special_dates', 'value' => true ),
	),
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->multi_date(
	label: 'Important Dates',
	min: 1,
	max: 10,
);
```

## Notes

- Each date input has the same properties and behavior as the standard `date` field type
- Users can reorder dates by dragging and dropping
- When using `min`/`max` constraints, the field automatically enforces these limits
- Consider using date sorting functions when retrieving dates for display
- For selecting date ranges rather than individual dates, use the `multi_date_range` field type instead
- For date and time together, use the `multi_datetime` field type instead
