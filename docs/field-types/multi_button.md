# Multi Button Field Type

The Multi Button field type allows you to add a group of related buttons within your custom fields interface. This is useful for providing multiple actions or links grouped together in a single field.

## Field Type: `multi_button`

```php
array(
	'type'    => 'multi_button',
	'label'   => 'Action Buttons',
	'buttons' => array(
		array(
			'title'  => 'View Documentation',
			'url'    => 'https://example.com/docs',
		),
		array(
			'title'   => 'Run Action',
			'action'  => 'my_custom_action',
			'primary' => true,
		),
	),
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

- `buttons` _(array)_ — An array of button definitions, where each button has the following properties:
  - `title` _(string)_ — The text to display on the button.
  - `id` _(string)_ — Optional unique identifier for the button.
  - `url` _(string)_ — URL to navigate to when the button is clicked. Also accepts `href` as an alias. Ignored if `action` is specified.
  - `target` _(string)_ — The target attribute for the link (e.g., `_blank`, `_self`). Defaults to `_blank`.
  - `action` _(string)_ — Name of a WordPress hook action to trigger when the button is clicked.
  - `primary` _(boolean)_ — Whether to style the button as a primary action button.
  - `disabled` _(boolean)_ — Whether this specific button should be disabled.
  - `attributes` _(array)_ — HTML attributes to add to the button.

## Stored Value

This field does not store any value.

## Example Usage

### Navigation Buttons Group

```php
'documentation_links' => array(
	'type'        => 'multi_button',
	'label'       => 'Documentation',
	'description' => 'Quick links to documentation resources.',
	'buttons'     => array(
		array(
			'title' => 'User Guide',
			'url'   => 'https://example.com/user-guide',
		),
		array(
			'title' => 'API Reference',
			'url'   => 'https://example.com/api-reference',
		),
		array(
			'title' => 'Video Tutorials',
			'url'   => 'https://example.com/tutorials',
		),
	),
),
```

### Action Buttons Group

```php
'data_management' => array(
	'type'        => 'multi_button',
	'label'       => 'Data Management',
	'description' => 'Manage product data with these actions.',
	'buttons'     => array(
		array(
			'title'   => 'Import Data',
			'action'  => 'import_product_data',
			'primary' => true,
		),
		array(
			'title'  => 'Export Data',
			'action' => 'export_product_data',
		),
		array(
			'title'  => 'Reset Data',
			'action' => 'reset_product_data',
		),
	),
),
```

### JavaScript Handlers for Actions

```javascript
// Add your action handlers in your custom JS file
wp.hooks.addAction('import_product_data', 'my-plugin', function(props) {
  console.log('Import button clicked with props:', props);
  // Start the import process, e.g., open a modal
});

wp.hooks.addAction('export_product_data', 'my-plugin', function(props) {
  console.log('Export button clicked with props:', props);
  // Start the export process, e.g., download a file
});

wp.hooks.addAction('reset_product_data', 'my-plugin', function(props) {
  console.log('Reset button clicked with props:', props);
  // Confirm and reset data
  if (confirm('Are you sure you want to reset all data?')) {
    // Perform reset action
  }
});
```

### Mixed URL and Action Buttons

```php
'support_options' => array(
	'type'        => 'multi_button',
	'label'       => 'Support Options',
	'description' => 'Get help with your installation.',
	'buttons'     => array(
		array(
			'title' => 'Knowledge Base',
			'url'   => 'https://example.com/kb',
		),
		array(
			'title'   => 'System Diagnostic',
			'action'  => 'run_system_diagnostic',
			'primary' => true,
		),
		array(
			'title' => 'Contact Support',
			'url'   => 'https://example.com/support',
		),
	),
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->multi_button(
	label: 'Actions',
	buttons: array(
		array( 'title' => 'Save', 'action' => 'save' ),
		array( 'title' => 'Export', 'action' => 'export' ),
	),
);
```

## Notes

- The Multi Button field does not store any data — it is a UI component only.
- Buttons can either navigate to URLs or trigger JavaScript actions via WordPress hooks.
- Each button within the group can have its own styles and attributes.
- You can mix URL buttons and action buttons within the same group.
- Unlike the single `button` field, this field type allows organizing multiple buttons in a horizontal group.
- For JavaScript action handlers, register them using the WordPress hooks API.
- Buttons are rendered in the order they are defined in the `buttons` array.
