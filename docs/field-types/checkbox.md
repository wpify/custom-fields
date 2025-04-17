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

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `checkbox` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must be checked
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(boolean)_ - Default value for the field (true or false)
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `title` _(string)_

The title property is used to set the text that will be displayed on the right side of the checkbox.

## Stored Value

The field stores a boolean value (`true` when checked, `false` when unchecked) in the database.

## Example Usage

```php
// Define the field
'show_related_posts' => array(
	'type'        => 'checkbox',
	'id'          => 'show_related_posts',
	'label'       => 'Related Posts',
	'title'       => 'Display related posts at the end of content',
	'description' => 'When enabled, related posts will appear below the content.',
	'default'     => true,
),

// Retrieve and use the checkbox value in your theme
$show_related = get_post_meta( get_the_ID(), 'show_related_posts', true );
if ( $show_related ) {
	// Display related posts
	display_related_posts();
}
```

## User Interface

The checkbox field provides:

1. A single checkbox input
2. A title next to the checkbox (defined by the `title` property)
3. A label above the field (defined by the `label` property)
4. Optional description text below the field