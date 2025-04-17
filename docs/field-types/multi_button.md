# Multi Button Field Type

The Multi Button field type allows you to add a group of related buttons within your custom fields interface. This is useful for providing multiple actions or links grouped together in a single field.

## Field Type: `multi_button`

```php
array(
    'type'    => 'multi_button',
    'id'      => 'example_multi_button',
    'label'   => 'Action Buttons',
    'buttons' => array(
        array(
            'title'   => 'View Documentation',
            'url'     => 'https://example.com/docs',
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

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `multi_button` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether all buttons should be disabled
- `attributes` _(array)_ - HTML attributes to add to the field container
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `buttons` _(array)_ - Required

An array of button definitions, where each button has the following properties:

- `title` _(string)_ - The text to display on the button
- `id` _(string)_ - Optional unique identifier for the button
- `url` or `href` _(string)_ - URL to navigate to when the button is clicked (ignored if `action` is specified)
- `action` _(string)_ - Name of WordPress hook action to trigger when the button is clicked
- `primary` _(boolean)_ - Whether to style the button as a primary action button
- `disabled` _(boolean)_ - Whether this specific button should be disabled
- `attributes` _(array)_ - HTML attributes to add to the button

## Stored Value

The Multi Button field type doesn't store any data in the database. It's purely for displaying interactive elements in the admin interface.

## Example Usage

### Navigation Buttons Group

```php
'documentation_links' => array(
    'type'        => 'multi_button',
    'id'          => 'documentation_links',
    'label'       => 'Documentation',
    'description' => 'Quick links to documentation resources.',
    'buttons'     => array(
        array(
            'title' => 'User Guide',
            'url'   => 'https://example.com/user-guide',
            'id'    => 'user_guide_button',
        ),
        array(
            'title' => 'API Reference',
            'url'   => 'https://example.com/api-reference',
            'id'    => 'api_reference_button',
        ),
        array(
            'title' => 'Video Tutorials',
            'url'   => 'https://example.com/tutorials',
            'id'    => 'tutorials_button',
        ),
    ),
),
```

### Action Buttons Group

```php
'data_management' => array(
    'type'        => 'multi_button',
    'id'          => 'data_management',
    'label'       => 'Data Management',
    'description' => 'Manage product data with these actions.',
    'buttons'     => array(
        array(
            'title'   => 'Import Data',
            'action'  => 'import_product_data',
            'id'      => 'import_button',
            'primary' => true,
        ),
        array(
            'title'  => 'Export Data',
            'action' => 'export_product_data',
            'id'     => 'export_button',
        ),
        array(
            'title'  => 'Reset Data',
            'action' => 'reset_product_data',
            'id'     => 'reset_button',
            'attributes' => array(
                'class' => 'button-danger',
                'data-confirm' => 'Are you sure you want to reset all data?',
            ),
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
    'id'          => 'support_options',
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

## Notes

- The Multi Button field doesn't store any data - it's a UI component only
- Buttons can either navigate to URLs or trigger JavaScript actions via WordPress hooks
- Each button within the group can have its own styles and attributes
- You can mix URL buttons and action buttons within the same group
- The field is particularly useful for providing related actions grouped together
- Unlike the single `button` field, this field type allows organizing multiple buttons in a horizontal group
- For JavaScript action handlers, you need to register them using the WordPress hooks API
- Buttons are rendered in the order they are defined in the `buttons` array