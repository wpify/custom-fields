# Multi Checkbox Field Type

The Multi Checkbox field type provides a repeatable set of checkbox inputs. Each checkbox has a text label and stores a boolean value, allowing users to manage a dynamic list of on/off selections.

## Field Type: `multi_checkbox`

```php
array(
	'type'  => 'multi_checkbox',
	'id'    => 'example_multi_checkbox',
	'label' => 'Agreement List',
	'title' => 'I agree',
	'min'   => 1,
	'max'   => 5,
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

- `title` _(string)_ — Text displayed next to each checkbox
- `min` _(integer)_ — Optional: Minimum number of items
- `max` _(integer)_ — Optional: Maximum number of items
- `buttons` _(array)_ — Optional: Custom button labels (add, remove, duplicate)
- `disabled_buttons` _(array)_ — Optional: Buttons to disable (move, delete, duplicate)

## Stored Value

The field stores an array of boolean values in the database:

```php
array( true, false, true )
```

## Example Usage

### Basic Multi Checkbox

```php
'agreements' => array(
	'type'        => 'multi_checkbox',
	'id'          => 'agreements',
	'label'       => 'Agreements',
	'description' => 'Manage agreement checkboxes',
	'title'       => 'I agree to the terms',
),
```

### Multi Checkbox with Min/Max Constraints

```php
'task_completion' => array(
	'type'        => 'multi_checkbox',
	'id'          => 'task_completion',
	'label'       => 'Task Completion',
	'description' => 'Track completion of tasks',
	'title'       => 'Completed',
	'min'         => 1,
	'max'         => 10,
),
```

### Multi Checkbox with Custom Buttons

```php
'checklist_items' => array(
	'type'        => 'multi_checkbox',
	'id'          => 'checklist_items',
	'label'       => 'Checklist',
	'title'       => 'Done',
	'buttons'     => array(
		'add'    => 'Add Checklist Item',
		'remove' => 'Remove Item',
	),
),
```

### Using Values in Your Theme

```php
$agreements = get_post_meta( get_the_ID(), 'agreements', true );

if ( ! empty( $agreements ) && is_array( $agreements ) ) {
	$total   = count( $agreements );
	$checked = count( array_filter( $agreements ) );

	echo '<p>' . esc_html(
		sprintf( '%d of %d agreements accepted', $checked, $total )
	) . '</p>';

	echo '<ul>';
	foreach ( $agreements as $index => $value ) {
		$status = $value ? 'Accepted' : 'Pending';
		echo '<li>' . esc_html( sprintf( 'Agreement %d: %s', $index + 1, $status ) ) . '</li>';
	}
	echo '</ul>';
}
```

### With Conditional Logic

```php
'enable_checklist' => array(
	'type'  => 'toggle',
	'id'    => 'enable_checklist',
	'label' => 'Enable checklist?',
	'title' => 'Show the checklist on this page',
),
'checklist' => array(
	'type'       => 'multi_checkbox',
	'id'         => 'checklist',
	'label'      => 'Checklist Items',
	'title'      => 'Completed',
	'min'        => 1,
	'max'        => 10,
	'conditions' => array(
		array( 'field' => 'enable_checklist', 'value' => true ),
	),
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->multi_checkbox(
	label: 'Agreement List',
	title: 'I agree',
	min: 1,
	max: 5,
);
```

## Notes

- Each item in the repeater is a single checkbox with the `title` text displayed next to it
- The stored value is always an array of booleans, one per checkbox item
- Items can be reordered by dragging
- The minimum/maximum constraints control how many checkbox items can be added or removed
- Use `disabled_buttons` to restrict which actions are available to the user
