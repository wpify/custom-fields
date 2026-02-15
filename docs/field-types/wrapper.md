# Wrapper Field Type

The Wrapper field type allows you to visually group multiple fields together without nesting their values. Unlike the [Group](group.md) field type, which stores child values in a nested array, the Wrapper is a purely visual container — its children store their values flat at the parent level.

## Field Type: `wrapper`

```php
array(
	'type'  => 'wrapper',
	'id'    => 'contact_wrapper',
	'items' => array(
		'name' => array(
			'type'  => 'text',
			'label' => 'Name',
		),
		'email' => array(
			'type'  => 'email',
			'label' => 'Email Address',
		),
		'phone' => array(
			'type'  => 'tel',
			'label' => 'Phone Number',
		),
	),
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `wrapper` for this field type
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

An array of field definitions that make up the wrapper's content. Each item is a complete field definition with its own type, label, and other properties.

#### `tag` _(string)_

The HTML tag used for the wrapper container element. Defaults to `div`. You can use any valid HTML tag such as `section`, `fieldset`, `aside`, etc.

#### `classname` _(string)_

A CSS class name added to the wrapper container element. This is applied alongside the default `wpifycf-field-wrapper` class.

## Stored Value

The Wrapper field does **not** store its own value. Children of a wrapper store their values flat at the parent level, as if the wrapper did not exist.

### Comparison with Group

Given the same child fields, here is how values are stored:

**Group** stores nested values:

```php
// group field with id 'contact_group'
array(
	'contact_group' => array(
		'name'  => 'John Doe',
		'email' => 'john@example.com',
		'phone' => '555-123-4567',
	),
)
```

**Wrapper** stores flat values:

```php
// wrapper field with id 'contact_wrapper'
// Children are stored at the same level as the wrapper:
array(
	'name'  => 'John Doe',
	'email' => 'john@example.com',
	'phone' => '555-123-4567',
)
```

## Example Usage

### Basic Visual Grouping

Use a wrapper to visually separate a section of fields without affecting data structure:

```php
'contact_section' => array(
	'type'  => 'wrapper',
	'items' => array(
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
		'email' => array(
			'type'  => 'email',
			'label' => 'Email',
		),
	),
)
```

All three values (`first_name`, `last_name`, `email`) are stored flat at the root level.

### Wrapper Inside a Group

When a wrapper is placed inside a group, its children's values stay flat within the group's namespace:

```php
'profile' => array(
	'type'  => 'group',
	'label' => 'Profile',
	'items' => array(
		'avatar' => array(
			'type'  => 'attachment',
			'label' => 'Avatar',
		),
		'details_wrapper' => array(
			'type'  => 'wrapper',
			'items' => array(
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

### Custom HTML Tag

You can change the wrapper's HTML tag to add semantic meaning:

```php
'settings_section' => array(
	'type'      => 'wrapper',
	'tag'       => 'section',
	'classname' => 'my-settings-section',
	'items'     => array(
		'enable_feature' => array(
			'type'  => 'toggle',
			'label' => 'Enable Feature',
			'title' => 'Turn on the advanced feature',
		),
		'feature_mode' => array(
			'type'    => 'select',
			'label'   => 'Feature Mode',
			'options' => array(
				'basic'    => 'Basic',
				'advanced' => 'Advanced',
			),
		),
	),
)
```

### With Conditions

Use a wrapper to show or hide a block of related fields together based on a condition:

```php
'show_social' => array(
	'type'  => 'toggle',
	'label' => 'Show Social Links',
	'title' => 'Display social media links',
),
'social_wrapper' => array(
	'type'       => 'wrapper',
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

When the toggle is off, all three social link fields are hidden together.

## Notes

- The key difference from the [Group](group.md) field type is that the wrapper does **not** nest values. Children store their values flat at the parent level.
- By default, the wrapper sets `renderOptions` to `noLabel: true`, `noFieldWrapper: true`, and `noControlWrapper: true`, so it renders with no label or extra wrapping markup.
- Wrapper children participate in validation at the parent level. The validation system flattens wrapper items using `flattenWrapperItems()` so each child is validated individually.
- Wrappers can be nested inside other wrappers or inside groups.
- In PHP, the `flatten_items()` method hoists wrapper children to the parent level for meta registration and sanitization. This ensures each child field is registered as its own meta key.
- The wrapper is ideal for applying conditions to a block of fields, adding semantic HTML structure, or visually organizing fields without changing how data is stored.
