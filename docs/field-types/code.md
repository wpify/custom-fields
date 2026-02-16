# Code Field Type

The Code field type provides a syntax-highlighted code editor powered by CodeMirror. It supports multiple programming languages with features like line wrapping, syntax highlighting, and configurable themes.

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

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

#### `language` _(string)_ — Optional

The programming language for syntax highlighting. Defaults to `'html'`. Supported languages:

- `html` (default)
- `javascript` or `js`
- `css`
- `php`
- `sql`
- `markdown` or `md`
- `xml`
- `json`

#### `height` _(integer)_ — Optional

The height of the code editor in pixels. Defaults to `200`.

#### `theme` _(string)_ — Optional

The color theme for the editor. Defaults to `'dark'` (VS Code dark theme). Any other value uses the default light theme.

## Stored Value

The field stores the code as a string in the database. The content is not processed or modified when saved.

## Example Usage

### Custom CSS Code Block

```php
array(
	'type'        => 'code',
	'id'          => 'custom_css',
	'label'       => 'Custom CSS',
	'description' => 'Add custom CSS styles for this page.',
	'language'    => 'css',
	'height'      => 250,
	'theme'       => 'dark',
)
```

### JavaScript Snippet

```php
array(
	'type'        => 'code',
	'id'          => 'tracking_script',
	'label'       => 'Tracking Script',
	'description' => 'Add custom JavaScript for analytics tracking.',
	'language'    => 'javascript',
	'height'      => 300,
)
```

### Using Values in Your Theme

```php
// Get the code content from the meta field
$custom_css = get_post_meta( get_the_ID(), 'custom_css', true );

if ( ! empty( $custom_css ) ) {
	echo '<style>' . wp_kses( $custom_css, array() ) . '</style>';
}

// Output a tracking script
$tracking_script = get_post_meta( get_the_ID(), 'tracking_script', true );

if ( ! empty( $tracking_script ) ) {
	echo '<script>' . esc_js( $tracking_script ) . '</script>';
}
```

### With Conditional Logic

```php
array(
	'type'  => 'toggle',
	'id'    => 'enable_custom_css',
	'label' => 'Custom CSS',
	'title' => 'Add custom CSS to this page',
),
array(
	'type'        => 'code',
	'id'          => 'custom_css',
	'label'       => 'Custom CSS',
	'description' => 'Enter CSS styles for this page.',
	'language'    => 'css',
	'height'      => 300,
	'conditions'  => array(
		array( 'field' => 'enable_custom_css', 'value' => true ),
	),
)
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->code(
	label: 'Custom CSS',
	language: 'css',
	height: 300,
);
```

## Notes

- The code editor includes an error boundary that falls back to a simple textarea if the editor fails to load
- Code fields are well-suited for storing custom code snippets, templates, or configuration data
- The field does not provide code execution, validation, or sanitization beyond basic string handling
- For very large code blocks, consider increasing the height or providing external editing capabilities
- For rich text editing without syntax highlighting, use the [`wysiwyg`](wysiwyg.md) field type instead
