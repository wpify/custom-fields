# WYSIWYG Field Type

The WYSIWYG (What You See Is What You Get) field type provides a rich text editor powered by WordPress's TinyMCE, offering a familiar interface for creating HTML content with formatting, links, lists, and more.

## Field Type: `wysiwyg`

```php
array(
	'type'   => 'wysiwyg',
	'id'     => 'example_wysiwyg',
	'label'  => 'Content',
	'height' => 300,
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

#### `height` _(integer)_ — Optional

The height of the editor in pixels. Defaults to `200`.

#### `toolbar` _(string)_ — Optional

The toolbar configuration for the editor. Controls which formatting options are available.

#### `delay` _(boolean)_ — Optional

When set to `true`, delays the initialization of the editor until the field is interacted with.

#### `tabs` _(string)_ — Optional

Controls the visibility of Visual/HTML editing tabs in the editor.

#### `force_modal` _(boolean)_ — Optional

When set to `true`, forces the editor to always open in a modal dialog regardless of context.

## Stored Value

The field stores the content as an HTML string in the database.

## Example Usage

### Basic Content Editor

```php
array(
	'type'        => 'wysiwyg',
	'id'          => 'product_description',
	'label'       => 'Product Description',
	'description' => 'Add a detailed product description with formatting.',
	'height'      => 300,
)
```

### Editor with Initial Content

```php
array(
	'type'    => 'wysiwyg',
	'id'      => 'terms_conditions',
	'label'   => 'Terms and Conditions',
	'default' => '<h3>Terms and Conditions</h3><p>Welcome to our website.</p>',
	'height'  => 400,
)
```

### Using Values in Your Theme

```php
// Get the WYSIWYG content from the meta field
$product_description = get_post_meta( get_the_ID(), 'product_description', true );

if ( ! empty( $product_description ) ) {
	echo '<div class="product-description">';

	// Apply WordPress filters for auto-paragraphs and other content features
	echo wp_kses_post( apply_filters( 'the_content', $product_description ) );

	echo '</div>';
}
```

### With Conditional Logic

```php
array(
	'type'  => 'toggle',
	'id'    => 'show_extra_content',
	'label' => 'Additional Content',
	'title' => 'Include additional content',
),
array(
	'type'        => 'wysiwyg',
	'id'          => 'extra_content',
	'label'       => 'Additional Content',
	'description' => 'This content will be displayed at the end of the page.',
	'height'      => 250,
	'conditions'  => array(
		array( 'field' => 'show_extra_content', 'value' => true ),
	),
)
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->wysiwyg(
	label: 'Content',
	height: 300,
	toolbar: 'full',
);
```

## Notes

- The WYSIWYG field uses WordPress's TinyMCE editor, providing a familiar editing experience with standard formatting options
- The editor provides two editing modes: Visual (WYSIWYG) and HTML (code view) for direct markup editing
- When used within the Gutenberg editor, the field displays as a content preview; clicking it opens a modal dialog with the full editor and a fullscreen option
- Content is stored as HTML, which can be output with `wp_kses_post( apply_filters( 'the_content', $content ) )` to enable auto-paragraphs and other WordPress content features
- For simple text without formatting, consider using the [`textarea`](textarea.md) field type instead
- For code editing with syntax highlighting, use the [`code`](code.md) field type instead
- The field does not support file uploads directly through the editor; use separate [`attachment`](attachment.md) fields for media
