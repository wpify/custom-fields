# Title Field Type

The Title field type provides a way to add section headings or dividers within your custom fields interface. It is a display-only field that helps organize and structure your form layout.

## Field Type: `title`

```php
array(
	'type'  => 'title',
	'title' => 'Advanced Settings',
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

- `title` _(string)_ — The text to display as the section heading. HTML tags are allowed and will be rendered properly.

## Stored Value

This field does not store any value.

## Example Usage

### Basic Section Heading

```php
'general_section' => array(
	'type'  => 'title',
	'title' => 'General Information',
),
```

### Heading with HTML

```php
'advanced_section' => array(
	'type'  => 'title',
	'title' => 'Advanced Settings <span class="beta-tag">Beta</span>',
),
```

### Using Multiple Section Headings for Organization

```php
// Example of using title fields to organize a complex form
$fields = array(
	'general_section' => array(
		'type'  => 'title',
		'title' => 'General Information',
	),
	'name' => array(
		'type'     => 'text',
		'label'    => 'Name',
		'required' => true,
	),
	'email' => array(
		'type'     => 'email',
		'label'    => 'Email Address',
		'required' => true,
	),

	'appearance_section' => array(
		'type'  => 'title',
		'title' => 'Appearance Settings',
	),
	'theme_color' => array(
		'type'    => 'color',
		'label'   => 'Theme Color',
		'default' => '#3366cc',
	),
	'font_size' => array(
		'type'    => 'select',
		'label'   => 'Font Size',
		'options' => array(
			'small'  => 'Small',
			'medium' => 'Medium',
			'large'  => 'Large',
		),
	),

	'advanced_section' => array(
		'type'  => 'title',
		'title' => 'Advanced Options',
	),
	// More fields...
);
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->title(
	title: 'Section Title',
);
```

## Notes

- The Title field does not store or retrieve any data.
- It is purely for visual organization of your custom fields interface.
- Unlike most field types, it does not have a label or description.
- The field renders as an `<h2>` heading element within a container div.
- The field can accept HTML in the title property, allowing for rich formatting.
- Consider using title fields to break up long forms into logical sections.
- When combined with the `tab` property for fields, you can organize complex forms with multiple sections under different tabs.
