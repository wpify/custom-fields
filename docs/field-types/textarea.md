# Textarea Field Type

The Textarea field type provides a multi-line text input area for longer content. It's ideal for descriptions, excerpts, notes, or any content that spans multiple lines but doesn't require rich text formatting.

## Field Type: `textarea`

```php
array(
    'type'  => 'textarea',
    'id'    => 'example_textarea',
    'label' => 'Description',
)
```

## Properties

**For Default Field Properties, see [Field Types Definition](../field-types.md)**.

### `counter` _(boolean)_ - Optional

When set to `true`, displays a character counter below the textarea showing the current character count.

```php
'counter' => true,
```

### `attributes` _(array)_ - Optional

You can pass HTML attributes to the textarea element. Common attributes include:

```php
'attributes' => array(
    'placeholder' => 'Enter your description here...',
    'rows'        => 5,
    'cols'        => 40,
    'maxlength'   => 500,
    'class'       => 'custom-textarea',
),
```

The most useful attributes for textareas are:

- `rows`: Number of visible text lines (height)
- `cols`: Number of average character widths (width)
- `maxlength`: Maximum number of characters allowed
- `placeholder`: Hint text displayed when the field is empty

## Stored Value

The field stores the text content as a string in the database, preserving line breaks.

## Example Usage

### Basic Description Field

```php
'product_description' => array(
    'type'        => 'textarea',
    'id'          => 'product_description',
    'label'       => 'Product Description',
    'description' => 'Provide a detailed description of the product.',
    'required'    => true,
    'attributes'  => array(
        'placeholder' => 'Describe the product features, benefits, and specifications...',
        'rows'        => 6,
    ),
),
```

### Address Field

```php
'mailing_address' => array(
    'type'        => 'textarea',
    'id'          => 'mailing_address',
    'label'       => 'Mailing Address',
    'description' => 'Enter the complete mailing address.',
    'attributes'  => array(
        'placeholder' => "Street Address\nCity, State ZIP\nCountry",
        'rows'        => 4,
    ),
),
```

### Textarea with Character Counter

```php
'meta_description' => array(
    'type'        => 'textarea',
    'id'          => 'meta_description',
    'label'       => 'Meta Description',
    'description' => 'SEO description for search engines (recommended: 150-160 characters).',
    'counter'     => true,
    'attributes'  => array(
        'maxlength' => 160,
        'rows'      => 3,
    ),
),
```

### Notes Field with Character Limit

```php
'editor_notes' => array(
    'type'        => 'textarea',
    'id'          => 'editor_notes',
    'label'       => 'Editor\'s Notes',
    'description' => 'Internal notes (maximum 300 characters).',
    'attributes'  => array(
        'maxlength' => 300,
        'rows'      => 3,
    ),
),
```

### Using Textarea Values in Your Theme

```php
// Get the textarea content from the meta field
$product_description = get_post_meta(get_the_ID(), 'product_description', true);

if (!empty($product_description)) {
    echo '<div class="product-description">';
    
    // Option 1: Preserve line breaks but apply escaping
    echo nl2br(esc_html($product_description));
    
    // Option 2: Convert to paragraphs (similar to wpautop but with more control)
    $paragraphs = explode("\n\n", $product_description);
    foreach ($paragraphs as $paragraph) {
        if (trim($paragraph)) {
            echo '<p>' . nl2br(esc_html($paragraph)) . '</p>';
        }
    }
    
    echo '</div>';
}
```

### Textarea Field with Conditional Logic

```php
'needs_special_instructions' => array(
    'type'  => 'toggle',
    'id'    => 'needs_special_instructions',
    'label' => 'Add Special Instructions',
),
'special_instructions' => array(
    'type'        => 'textarea',
    'id'          => 'special_instructions',
    'label'       => 'Special Instructions',
    'description' => 'Provide any special instructions or requirements.',
    'attributes'  => array(
        'rows' => 4,
    ),
    'conditions'  => array(
        array('field' => 'needs_special_instructions', 'value' => true),
    ),
),
```

## Notes

- The textarea field preserves line breaks entered by the user
- The `counter` property is useful for SEO fields or any input where character count matters
- For rich text editing with formatting options, consider using the [`wysiwyg`](wysiwyg.md) field type instead
- When displaying textarea content, use `nl2br()` to convert line breaks to HTML `<br>` tags
- For security, always use `esc_html()` when outputting textarea content to prevent XSS attacks
- Consider using the `maxlength` attribute to limit the amount of text users can enter
- For very large text content, adjust the `rows` attribute to provide an appropriately sized input area
- The field validates that a value is provided when the field is required
- Textarea fields are well-suited for unformatted content like addresses, notes, code snippets, or biographical information