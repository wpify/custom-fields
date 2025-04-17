# Multi Checkbox Field Type

The multi checkbox field type is used to create a set of checkboxes.

## Field Type: `multi_checkbox`

```php
array(
	'type'    => 'multi_checkbox',
	'id'      => 'example_multi_checkbox',
	'label'   => 'Example Multi Checkbox',
	'options' => array(
		array( 'value' => 'option1', 'label' => 'Option 1 Title', 'disabled' => false ),
		array( 'value' => 'option2', 'label' => 'Option 2 Title', 'disabled' => false ),
		array( 'value' => 'option3', 'label' => 'Option 3 Title', 'disabled' => false ),
	),
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `multi_checkbox` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have a value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(array)_ - Default selected values as an array of option values
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `options` _(array)_ - Required

The options property is used to define the set of checkboxes. It can be structured in two ways:

1. As an associative array where the key is the option value and the value is the option title:

```php
'options' => array(
	'option1' => 'Option 1 Title',
	'option2' => 'Option 2 Title',
	'option3' => 'Option 3 Title',
),
```

2. As an array of arrays. Each inner array should contain `value` and `label` keys. Optionally, you can set the `disabled` key to `true` to disable specific checkboxes:

```php
'options' => array(
	array( 'value' => 'option1', 'label' => 'Option 1 Title', 'disabled' => false ),
	array( 'value' => 'option2', 'label' => 'Option 2 Title', 'disabled' => false ),
	array( 'value' => 'option3', 'label' => 'Option 3 Title', 'disabled' => false ),
),
```

## Stored Value

The field stores an array of selected option values in the database.

## Example Usage

```php
// Define the field
'post_features' => array(
	'type'        => 'multi_checkbox',
	'id'          => 'post_features',
	'label'       => 'Post Features',
	'description' => 'Select all features that should be enabled for this post.',
	'options'     => array(
		'comments'      => 'Enable Comments',
		'sharing'       => 'Social Sharing Buttons',
		'featured'      => 'Featured on Homepage',
		'related_posts' => 'Show Related Posts',
	),
	'default'     => array( 'comments' ),
),

// Retrieve and use the checkbox values in your theme
$features = get_post_meta( get_the_ID(), 'post_features', true );
if ( is_array( $features ) ) {
	if ( in_array( 'comments', $features, true ) ) {
		// Enable comments functionality
	}
	
	if ( in_array( 'featured', $features, true ) ) {
		// Add to featured posts
		add_post_meta( get_the_ID(), '_is_featured', 'yes', true );
	}
}
```

## Notes

- The multi checkbox field allows selecting multiple options
- The field value is always an array, even if only one option is selected
- Options can be disabled individually
- When using the field with conditions, you can check if a specific value is in the array
