# Columns Field Type

The Columns field type arranges child fields in a responsive multi-column grid layout. Like the [Wrapper](wrapper.md) field type, it is a purely visual container — its children store their values flat at the parent level. The key difference is that Columns uses CSS Grid to place fields side by side instead of stacking them vertically.

The layout is responsive: columns automatically reduce when they would be narrower than 300px, ensuring fields remain usable on smaller screens.

## Field Type: `columns`

```php
array(
	'type'    => 'columns',
	'id'      => 'contact_columns',
	'columns' => 3,
	'items'   => array(
		'first_name' => array(
			'type'  => 'text',
			'label' => 'First Name',
		),
		'last_name' => array(
			'type'  => 'text',
			'label' => 'Last Name',
		),
		'email' => array(
			'type'  => 'email',
			'label' => 'Email Address',
		),
	),
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `columns` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have a value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `items` _(array)_ - Required

An array of field definitions that make up the columns' content. Each item is a complete field definition with its own type, label, and other properties.

#### `columns` _(integer)_

The number of columns in the grid layout. Defaults to `2`. This is the maximum number of columns — the actual number may be lower on narrow containers (see [Responsive Behavior](#responsive-behavior)).

#### `gap` _(string)_

A CSS gap value to override the default spacing between columns and rows. For example, `'16px'`, `'1rem'`, or `'8px 16px'` (row gap / column gap).

#### `classname` _(string)_

A CSS class name added to the columns container element. This is applied alongside the default `wpifycf-field-columns` class.

### Per-Child Properties

These properties can be set on individual field definitions inside `items` to control their placement within the grid:

#### `column` _(integer)_

A 1-based column index specifying which column the field should start in. When omitted, the field is auto-placed by CSS Grid.

#### `column_span` _(integer)_

The number of columns the field should span. Defaults to `1`. Useful for fields that need more horizontal space, such as textareas or WYSIWYG editors.

#### Placement Rules

| `column` | `column_span` | Behavior |
|----------|---------------|----------|
| Set | Not set | Placed at that column, spans 1 |
| Not set | Set | Auto-placed, spans N columns |
| Set | Set | Placed at column X, spans N columns |
| Not set | Not set | Auto-placed, spans 1 (default) |

When the container is too narrow and columns collapse (see [Responsive Behavior](#responsive-behavior)), all explicit `column` placements are ignored and CSS Grid auto-flow handles the layout.

## Responsive Behavior

The Columns field automatically adapts to the available container width:

1. Each column has a minimum width of **300px**
2. If the container is too narrow for the requested number of columns, columns are reduced: `effectiveColumns = floor(containerWidth / 300)`
3. The minimum is always **1 column**
4. When columns collapse below the requested count, all explicit `column` placements are ignored — fields flow naturally in row order

This means a `columns: 4` layout on a 900px-wide container will display as 3 columns, and on a 500px container as 1 column.

## Stored Value

The Columns field does **not** store its own value. Children of a columns field store their values flat at the parent level, as if the columns container did not exist.

This behavior is identical to the [Wrapper](wrapper.md) field type.

## Example Usage

### Basic Two-Column Layout

```php
'name_columns' => array(
	'type'    => 'columns',
	'columns' => 2,
	'items'   => array(
		'first_name' => array(
			'type'     => 'text',
			'label'    => 'First Name',
			'required' => true,
		),
		'last_name' => array(
			'type'     => 'text',
			'label'    => 'Last Name',
			'required' => true,
		),
	),
)
```

### Spanning Columns

Use `column_span` to make a field take up more horizontal space:

```php
'contact_columns' => array(
	'type'    => 'columns',
	'columns' => 3,
	'items'   => array(
		'first_name' => array(
			'type'   => 'text',
			'label'  => 'First Name',
			'column' => 1,
		),
		'last_name' => array(
			'type'   => 'text',
			'label'  => 'Last Name',
			'column' => 2,
		),
		'email' => array(
			'type'   => 'email',
			'label'  => 'Email',
			'column' => 3,
		),
		'bio' => array(
			'type'        => 'textarea',
			'label'       => 'Bio',
			'column_span' => 3,
		),
	),
)
```

The `bio` field spans all 3 columns, creating a full-width row beneath the three single-column fields.

### Columns Inside a Group

When a columns field is placed inside a group, its children's values stay flat within the group's namespace:

```php
'profile' => array(
	'type'  => 'group',
	'label' => 'Profile',
	'items' => array(
		'avatar' => array(
			'type'  => 'attachment',
			'label' => 'Avatar',
		),
		'details_columns' => array(
			'type'    => 'columns',
			'columns' => 2,
			'items'   => array(
				'bio' => array(
					'type'  => 'textarea',
					'label' => 'Bio',
				),
				'website' => array(
					'type'  => 'url',
					'label' => 'Website',
				),
			),
		),
	),
)
```

The stored value looks like this — `bio` and `website` sit alongside `avatar` inside the group:

```php
array(
	'profile' => array(
		'avatar'  => 123,
		'bio'     => 'A short bio...',
		'website' => 'https://example.com',
	),
)
```

### With Conditions

Use a columns field to show or hide a block of side-by-side fields together:

```php
'show_social' => array(
	'type'  => 'toggle',
	'label' => 'Show Social Links',
	'title' => 'Display social media links',
),
'social_columns' => array(
	'type'       => 'columns',
	'columns'    => 3,
	'conditions' => array(
		array( 'field' => 'show_social', 'value' => true ),
	),
	'items'      => array(
		'twitter' => array(
			'type'  => 'url',
			'label' => 'Twitter URL',
		),
		'facebook' => array(
			'type'  => 'url',
			'label' => 'Facebook URL',
		),
		'linkedin' => array(
			'type'  => 'url',
			'label' => 'LinkedIn URL',
		),
	),
)
```

### With FieldFactory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->columns(
	columns: 3,
	items: array(
		$f->text( label: 'First Name' ),
		$f->text( label: 'Last Name' ),
		$f->email( label: 'Email' ),
		$f->textarea( label: 'Bio', column_span: 3 ),
	),
);
```

### Custom Gap

Override the default gap between columns:

```php
'settings_columns' => array(
	'type'    => 'columns',
	'columns' => 2,
	'gap'     => '8px 24px',
	'items'   => array(
		'option_a' => array(
			'type'  => 'toggle',
			'label' => 'Option A',
			'title' => 'Enable option A',
		),
		'option_b' => array(
			'type'  => 'toggle',
			'label' => 'Option B',
			'title' => 'Enable option B',
		),
	),
)
```

## Notes

- The key difference from the [Wrapper](wrapper.md) field type is the CSS Grid layout — Wrapper stacks fields vertically, while Columns arranges them side by side.
- Like Wrapper, the Columns field does **not** nest values. Children store their values flat at the parent level.
- By default, the columns field sets `renderOptions` to `noLabel: true`, `noFieldWrapper: true`, and `noControlWrapper: true`, so it renders with no label or extra wrapping markup.
- Each column item has `container-type: inline-size` set, so child fields' responsive label/control layout switching uses the column width rather than the full container width.
- Columns children participate in validation at the parent level. The validation system flattens columns items using `flattenWrapperItems()` so each child is validated individually.
- Columns can be nested inside groups, wrappers, or other columns.
- In PHP, the `flatten_items()` method hoists columns children to the parent level for meta registration and sanitization, just like wrapper fields.
- Conditionally hidden fields inside columns are automatically collapsed (no empty grid cells) via CSS `:has()` selector.
