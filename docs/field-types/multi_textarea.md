# Multi Textarea Field Type

The Multi Textarea field type provides a repeatable interface for collecting multiple blocks of multi-line text with add/remove functionality and optional drag-and-drop reordering.

## Field Type: `multi_textarea`

```php
array(
	'type'    => 'multi_textarea',
	'label'   => 'Paragraphs',
	'min'     => 1,
	'max'     => 5,
	'counter' => true,
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

#### `min` _(integer)_ — Optional

Minimum number of items. Users cannot remove items below this count.

#### `max` _(integer)_ — Optional

Maximum number of items. Users cannot add items beyond this count.

#### `buttons` _(array)_ — Optional

Custom button labels. Supports keys: `add`, `remove`, `duplicate`.

#### `disabled_buttons` _(array)_ — Optional

Array of buttons to disable. Options: `'move'`, `'delete'`, `'duplicate'`.

#### `counter` _(boolean)_ — Optional

Whether to display a character counter below each textarea input.

## Stored Value

An array of strings. Each string can contain multiple lines of text.

## Example Usage

### Basic Multi Textarea Field

```php
'testimonials' => array(
	'type'        => 'multi_textarea',
	'label'       => 'Testimonials',
	'description' => 'Add customer testimonials',
),
```

### With Min/Max and Custom Buttons

```php
'faq_items' => array(
	'type'    => 'multi_textarea',
	'label'   => 'FAQ Items',
	'min'     => 2,
	'max'     => 10,
	'buttons' => array(
		'add'    => 'Add New Question',
		'remove' => 'Remove Question',
	),
),
```

### With Textarea Attributes

```php
'product_descriptions' => array(
	'type'       => 'multi_textarea',
	'label'      => 'Product Descriptions',
	'attributes' => array(
		'rows'        => 4,
		'placeholder' => 'Enter product description here...',
	),
),
```

### Using Values in Your Theme

```php
$testimonials = get_post_meta( get_the_ID(), 'testimonials', true );

if ( ! empty( $testimonials ) && is_array( $testimonials ) ) {
	echo '<div class="testimonials">';

	foreach ( $testimonials as $testimonial ) {
		if ( empty( $testimonial ) ) {
			continue;
		}

		echo '<blockquote>';
		echo nl2br( esc_html( $testimonial ) );
		echo '</blockquote>';
	}

	echo '</div>';
}
```

### With Conditional Logic

```php
'show_sections' => array(
	'type'  => 'toggle',
	'id'    => 'show_sections',
	'label' => 'Add content sections?',
),
'content_sections' => array(
	'type'       => 'multi_textarea',
	'label'      => 'Content Sections',
	'conditions' => array(
		array( 'field' => 'show_sections', 'value' => true ),
	),
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->multi_textarea(
	label: 'Paragraphs',
	min: 1,
	max: 5,
	counter: true,
);
```

## Notes

- The stored value is always an array, even if only one textarea is provided.
- Empty textarea inputs are stored as empty strings in the array.
- Textareas support multi-line content; line breaks are stored as `\n` in the database.
- When displaying content, use `nl2br()` or wrap lines in paragraph tags to preserve formatting.
- Items can be reordered by dragging unless the `move` button is disabled.
- Ideal for collecting testimonials, FAQ entries, content sections, or multiple paragraphs of text.
