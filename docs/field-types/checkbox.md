# Checkbox Field Type

The checkbox field type is used to create a single checkbox field.

## Field Type: `checkbox`

```php
array(
	'type'  => 'checkbox',
	'id'    => 'example_checkbox',
	'label' => 'Example Checkbox',
	'title' => 'Checkbox title shown on the right from the checkbox.',
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

#### `title` _(string)_ — Optional

The text displayed on the right side of the checkbox.

## Stored Value

The field stores a boolean value (`true` when checked, `false` when unchecked) in the database.

## Example Usage

### Basic Checkbox

```php
'show_related_posts' => array(
	'type'        => 'checkbox',
	'id'          => 'show_related_posts',
	'label'       => 'Related Posts',
	'title'       => 'Display related posts at the end of content',
	'description' => 'When enabled, related posts will appear below the content.',
	'default'     => true,
),
```

### Using Values in Your Theme

```php
$show_related = get_post_meta( get_the_ID(), 'show_related_posts', true );

if ( $show_related ) {
	// Display related posts
	display_related_posts();
}
```

### With Conditional Logic

```php
'show_sidebar' => array(
	'type'  => 'checkbox',
	'id'    => 'show_sidebar',
	'label' => 'Sidebar',
	'title' => 'Show the sidebar on this page',
),
'sidebar_position' => array(
	'type'       => 'select',
	'id'         => 'sidebar_position',
	'label'      => 'Sidebar Position',
	'options'    => array(
		'left'  => 'Left',
		'right' => 'Right',
	),
	'conditions' => array(
		array( 'field' => 'show_sidebar', 'value' => true ),
	),
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->checkbox(
	label: 'Terms',
	title: 'I agree to the terms and conditions',
);
```

## Notes

- The checkbox renders a single input with an optional title next to it
- For multiple checkboxes, use the [`multi_checkbox`](multi_checkbox.md) field type instead
- The `title` property supports plain text displayed beside the checkbox control
