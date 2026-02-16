# Multi Text Field Type

The Multi Text field type provides a repeatable interface for collecting multiple text values with add/remove functionality and optional drag-and-drop reordering.

## Field Type: `multi_text`

```php
array(
	'type'    => 'multi_text',
	'label'   => 'Keywords',
	'min'     => 1,
	'max'     => 10,
	'counter' => true,
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

#### `counter` _(boolean)_ — Optional

Whether to display a character counter below each text input.

## Stored Value

An array of strings.

## Example Usage

### Basic Multi Text Field

```php
'alternative_titles' => array(
	'type'        => 'multi_text',
	'label'       => 'Alternative Titles',
	'description' => 'Add multiple alternative titles for this content',
),
```

### With Min/Max Constraints

```php
'product_benefits' => array(
	'type'        => 'multi_text',
	'label'       => 'Product Benefits',
	'description' => 'Add 3-5 benefits of this product',
	'min'         => 3,
	'max'         => 5,
),
```

### With Custom Button Labels

```php
'company_locations' => array(
	'type'    => 'multi_text',
	'label'   => 'Company Locations',
	'buttons' => array(
		'add'    => 'Add New Location',
		'remove' => 'Remove Location',
	),
),
```

### Using Values in Your Theme

```php
$alternative_titles = get_post_meta( get_the_ID(), 'alternative_titles', true );

if ( ! empty( $alternative_titles ) && is_array( $alternative_titles ) ) {
	echo '<ul>';

	foreach ( $alternative_titles as $title ) {
		if ( empty( $title ) ) {
			continue;
		}

		echo '<li>' . esc_html( $title ) . '</li>';
	}

	echo '</ul>';
}
```

### With Conditional Logic

```php
'has_multiple_authors' => array(
	'type'  => 'toggle',
	'id'    => 'has_multiple_authors',
	'label' => 'Multiple authors?',
),
'coauthor_names' => array(
	'type'       => 'multi_text',
	'label'      => 'Co-Author Names',
	'conditions' => array(
		array( 'field' => 'has_multiple_authors', 'value' => true ),
	),
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->multi_text(
	label: 'Keywords',
	min: 1,
	max: 10,
	counter: true,
);
```

## Notes

- The stored value is always an array, even if only one text input is provided.
- Empty text inputs are stored as empty strings in the array.
- Items can be reordered by dragging unless the `move` button is disabled.
- The `min` and `max` constraints control how many items the user can add or remove.
- Ideal for collecting lists of items such as features, benefits, tags, or alternative names.
