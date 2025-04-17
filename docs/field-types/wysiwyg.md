# WYSIWYG Field Type

The WYSIWYG (What You See Is What You Get) field type provides a rich text editor for creating formatted content. It integrates WordPress's TinyMCE editor, offering a familiar interface for creating HTML content with buttons for text formatting, links, lists, and more.

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

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `wysiwyg` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have a value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(string)_ - Default HTML content for the editor
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `height` _(integer)_ - Optional, default: `200`

The height of the editor in pixels. This controls the vertical size of the editing area.

## User Interface

The WYSIWYG field provides a comprehensive editing experience with:

1. **Visual/HTML Tabs**: Switch between visual editing and HTML code view
2. **Formatting Toolbar**: Standard WordPress editor toolbar with formatting options
3. **Content Area**: The main editing area where content is created and formatted
4. **Modal Dialog**: When used within the Gutenberg editor, the WYSIWYG opens in a modal dialog

## Stored Value

The field stores the content as HTML markup in the database.

## Example Usage

### Basic Content Editor

```php
'product_description' => array(
	'type'        => 'wysiwyg',
	'id'          => 'product_description',
	'label'       => 'Product Description',
	'description' => 'Add a detailed product description with formatting.',
	'height'      => 300,
),
```

### Editor with Initial Content

```php
'terms_conditions' => array(
	'type'        => 'wysiwyg',
	'id'          => 'terms_conditions',
	'label'       => 'Terms and Conditions',
	'description' => 'Modify the default terms and conditions as needed.',
	'default'     => '<h3>Terms and Conditions</h3>
	                 <p>Welcome to our website. If you continue to browse and use this website, you are agreeing to comply with and be bound by the following terms and conditions of use.</p>
	                 <p><strong>The content of the pages of this website is for your general information and use only.</strong> It is subject to change without notice.</p>',
),
```

### Using WYSIWYG Content in Your Theme

```php
// Get the WYSIWYG content from the meta field
$product_description = get_post_meta( get_the_ID(), 'product_description', true );

if ( ! empty( $product_description ) ) {
	echo '<div class="product-description">';
	
	// Apply WordPress filters to the content (optional)
	echo apply_filters( 'the_content', $product_description );
	
	// Or output the raw HTML content directly
	// echo $product_description;
	
	echo '</div>';
}
```

### WYSIWYG Field with Conditional Logic

```php
'show_extra_content' => array(
	'type'  => 'toggle',
	'id'    => 'show_extra_content',
	'label' => 'Additional Content',
	'title' => 'Include additional content',
),
'extra_content' => array(
	'type'        => 'wysiwyg',
	'id'          => 'extra_content',
	'label'       => 'Additional Content',
	'description' => 'This content will be displayed at the end of the page.',
	'height'      => 250,
	'conditions'  => array(
		array( 'field' => 'show_extra_content', 'value' => true ),
	),
),
```

## Modes

The WYSIWYG editor provides two editing modes:

### Visual Editor Mode

The visual mode provides a WYSIWYG interface with formatting buttons similar to word processors. This is suitable for most users who want to create formatted content without writing HTML code directly.

### HTML Mode

The HTML mode provides a code editor view where you can directly edit the HTML markup. This is useful for:
- Adding custom HTML elements not available in the visual editor
- Fine-tuning the HTML structure
- Adding custom attributes to elements
- Including embedded content like iframes

## Gutenberg Integration

When used within the Gutenberg editor, the WYSIWYG field behaves slightly differently:

1. It initially displays as a preview of the content
2. Clicking the content or the "Edit" button opens a modal dialog with the full editor
3. The modal includes a fullscreen option for larger editing space
4. Changes are applied when clicking the "OK" button

## Notes

- The WYSIWYG field uses WordPress's TinyMCE editor, providing a familiar editing experience
- The editor includes the standard WordPress formatting options
- Content is stored as HTML, which can be output directly or processed with `apply_filters( 'the_content', $content )`
- The field tracks changes and updates the value as you type
- For simple text without formatting, consider using the `textarea` field type instead
- For code editing with syntax highlighting, use the `code` field type
- The field doesn't support file uploads directly through the editor - use separate attachment fields
- When displaying WYSIWYG content, apply WordPress's content filters with `apply_filters( 'the_content', $content )` to enable auto-paragraphs and other WordPress content features