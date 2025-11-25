# Text Field Type

The Text field type provides a single-line text input for short text content. It's ideal for titles, names, short labels, or any content that fits on a single line without rich text formatting.

## Field Type: `text`

```php
array(
	'type'  => 'text',
	'id'    => 'example_text',
	'label' => 'Title',
)
```

## Properties

**For Default Field Properties, see [Field Types Definition](../field-types.md)**.

### `attributes` _(array)_ - Optional

You can pass HTML attributes to the input element. Common attributes include:

```php
'attributes' => array(
	'placeholder' => 'Enter text here...',
	'maxlength'   => 100,
	'class'       => 'custom-text-input',
),
```

The most useful attributes for text inputs are:

- `placeholder`: Hint text displayed when the field is empty
- `maxlength`: Maximum number of characters allowed
- `class`: Additional CSS classes for styling

### `counter` _(boolean)_ - Optional

When set to `true`, displays a character counter below the input showing the current character count.

```php
'counter' => true,
```

## Stored Value

The field stores the text content as a string in the database. Values are sanitized using WordPress's `sanitize_text_field()` function, which removes HTML tags and line breaks.

## Example Usage

### Basic Text Field

```php
'product_title' => array(
	'type'        => 'text',
	'id'          => 'product_title',
	'label'       => 'Product Title',
	'description' => 'Enter the product title.',
	'required'    => true,
),
```

### Text Field with Character Counter

```php
'meta_title' => array(
	'type'        => 'text',
	'id'          => 'meta_title',
	'label'       => 'Meta Title',
	'description' => 'SEO title for search engines (recommended: 50-60 characters).',
	'counter'     => true,
	'attributes'  => array(
		'maxlength' => 60,
	),
),
```

### Text Field with Attributes

```php
'company_name' => array(
	'type'        => 'text',
	'id'          => 'company_name',
	'label'       => 'Company Name',
	'description' => 'Your company or organization name.',
	'attributes'  => array(
		'placeholder' => 'Enter company name...',
		'maxlength'   => 100,
		'class'       => 'company-name-input',
	),
),
```

### Using Text Values in Your Theme

```php
// Get the text content from the meta field
$product_title = get_post_meta( get_the_ID(), 'product_title', true );

if ( ! empty( $product_title ) ) {
	echo '<h1 class="product-title">' . esc_html( $product_title ) . '</h1>';
}

// Using in an attribute
$company_name = get_post_meta( get_the_ID(), 'company_name', true );

if ( ! empty( $company_name ) ) {
	echo '<input type="hidden" name="company" value="' . esc_attr( $company_name ) . '">';
}
```

### Text Field with Conditional Logic

```php
'enable_custom_title' => array(
	'type'  => 'toggle',
	'id'    => 'enable_custom_title',
	'label' => 'Use Custom Title',
),
'custom_title' => array(
	'type'        => 'text',
	'id'          => 'custom_title',
	'label'       => 'Custom Title',
	'description' => 'Enter a custom title to override the default.',
	'attributes'  => array(
		'placeholder' => 'Enter custom title...',
	),
	'conditions'  => array(
		array( 'field' => 'enable_custom_title', 'value' => true ),
	),
),
```

## Notes

- The text field is designed for single-line content; for multi-line content, use the [`textarea`](textarea.md) field type instead
- Values are sanitized with `sanitize_text_field()`, which strips HTML tags and converts line breaks to spaces
- For security, always use `esc_html()` when outputting text content and `esc_attr()` when using in HTML attributes
- The `counter` property is useful for SEO fields or any input where character count matters
- Use the `maxlength` attribute to enforce a character limit at the browser level
- The field validates that a value is provided when the `required` property is set to `true`
- CSS classes follow the pattern `wpifycf-field-text` and `wpifycf-field-text--{id}` for custom styling
