# Multi Week Field Type

The Multi Week field type allows users to select and manage multiple week values. It provides a repeatable week picker interface for planning recurring activities, scheduling content, or collecting availability data.

## Field Type: `multi_week`

```php
array(
	'type'    => 'multi_week',
	'id'      => 'training_weeks',
	'label'   => 'Training Schedule',
	'min'     => 1,
	'max'     => 10,
	'buttons' => array(
		'add'    => 'Add Week',
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

Array of week strings in ISO 8601 format (`YYYY-Wnn`):

```php
array(
	'2023-W01',
	'2023-W10',
	'2023-W22',
	'2023-W35',
)
```

Each string represents a specific week of a specific year, where `YYYY` is the four-digit year, `W` is a literal character, and `nn` is the two-digit week number (01-53).

## Example Usage

### Training Schedule

```php
'training_weeks' => array(
	'type'        => 'multi_week',
	'id'          => 'training_weeks',
	'label'       => 'Training Schedule',
	'description' => 'Select weeks when training sessions are available.',
	'min'         => 1,
	'max'         => 10,
),
```

### Using Values in Your Theme

```php
$training_weeks = get_post_meta( get_the_ID(), 'training_weeks', true );

if ( ! empty( $training_weeks ) && is_array( $training_weeks ) ) {
	sort( $training_weeks );

	echo '<div class="training-schedule">';
	echo '<h3>' . esc_html__( 'Upcoming Training Sessions', 'your-theme' ) . '</h3>';
	echo '<ul class="training-weeks">';

	foreach ( $training_weeks as $week ) {
		list( $year, $week_number ) = explode( '-W', $week );

		$week_start = new DateTime();
		$week_start->setISODate( (int) $year, (int) $week_number, 1 );

		$week_end = clone $week_start;
		$week_end->modify( '+6 days' );

		$date_range = $week_start->format( 'F j' ) . ' - ' . $week_end->format( 'F j, Y' );

		echo '<li>';
		echo esc_html( sprintf( 'Week %d: %s', (int) $week_number, $date_range ) );
		echo '</li>';
	}

	echo '</ul>';
	echo '</div>';
}
```

### With Conditional Logic

```php
'has_training' => array(
	'type'  => 'toggle',
	'id'    => 'has_training',
	'label' => 'Has training schedule',
),
'scheduled_weeks' => array(
	'type'        => 'multi_week',
	'id'          => 'scheduled_weeks',
	'label'       => 'Scheduled Weeks',
	'description' => 'Select weeks when training is scheduled.',
	'conditions'  => array(
		array( 'field' => 'has_training', 'value' => true ),
	),
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->multi_week(
	label: 'Active Weeks',
	min: 1,
	max: 10,
);
```

## Notes

- Each week input has the same properties and behavior as the standard `week` field type
- Users can reorder weeks by dragging and dropping
- Weeks are stored in ISO 8601 format (`YYYY-Wnn`) for easy sorting and comparison
- Uses native HTML5 week inputs for consistent and user-friendly week selection
- Some browsers (like Firefox and Safari) do not fully support the HTML5 week input and may show a text input instead
- The stored value is always an array, even if only one week is selected
- Empty values are not stored in the array
