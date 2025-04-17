# Code Field Type

The Code field type provides a syntax-highlighted code editor for various programming languages. It uses CodeMirror for a rich code editing experience with features like line wrapping, syntax highlighting, and more.

## Field Type: `code`

```php
array(
    'type'     => 'code',
    'id'       => 'example_code',
    'label'    => 'Custom CSS',
    'language' => 'css',
    'height'   => 300,
    'theme'    => 'dark',
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `code` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have a value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(string)_ - Default value for the field
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `language` _(string)_ - Optional, default: `'html'`

The programming language for syntax highlighting. Supported languages:

- `html` (default)
- `javascript` or `js`
- `css`
- `php`
- `sql`
- `markdown` or `md`
- `xml`
- `json`

#### `height` _(integer)_ - Optional, default: `200`

The height of the code editor in pixels.

#### `theme` _(string)_ - Optional, default: `'dark'`

The color theme for the editor. Options:
- `dark` - Uses VS Code dark theme
- Any other value - Uses default light theme

## Stored Value

The field stores the code as a string in the database. The content is not processed or modified in any way when saved.

## Example Usage

### Custom CSS Code Block

```php
'custom_css' => array(
    'type'        => 'code',
    'id'          => 'custom_css',
    'label'       => 'Custom CSS',
    'description' => 'Add custom CSS styles for this page.',
    'language'    => 'css',
    'height'      => 250,
    'theme'       => 'dark',
),
```

### JavaScript Snippet

```php
'tracking_script' => array(
    'type'        => 'code',
    'id'          => 'tracking_script',
    'label'       => 'Tracking Script',
    'description' => 'Add custom JavaScript for analytics tracking.',
    'language'    => 'javascript',
    'height'      => 300,
),
```

### HTML Template Fragment

```php
'email_template' => array(
    'type'        => 'code',
    'id'          => 'email_template',
    'label'       => 'Email Template',
    'description' => 'Customize the HTML template for emails.',
    'language'    => 'html',
    'height'      => 400,
),
```

## Notes

- The code editor includes an error boundary that falls back to a simple textarea if the editor fails to load
- Code fields are well-suited for storing custom code snippets, templates, or configuration data
- The field does not provide code execution, validation, or sanitization beyond basic string handling
- For very large code blocks, consider increasing the height or providing external editing capabilities