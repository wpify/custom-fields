# Multi Textarea Field Type

The Multi Textarea field type allows users to add multiple textarea inputs. It provides a repeatable interface for collecting multiple paragraphs or blocks of text with add/remove functionality and optional sorting capability.

## Field Type: `multi_textarea`

```php
array(
	'type'        => 'multi_textarea',
	'id'          => 'example_multi_textarea',
	'label'       => 'Example Multi Textarea',
	'description' => 'Add multiple text blocks',
	'default'     => array( 'First paragraph text...', 'Second paragraph text...' ),
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `multi_textarea` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have at least one value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(array)_ - Default values as an array of strings
- `attributes` _(array)_ - HTML attributes to add to each textarea input
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `min` _(number)_ - Optional

The minimum number of entries required. If specified, the user won't be able to remove entries below this number.

#### `max` _(number)_ - Optional

The maximum number of entries allowed. If specified, the user won't be able to add entries beyond this number.

#### `disabled_buttons` _(array)_ - Optional

Array of button types to disable. Possible values: 'add', 'remove', 'sort'.

#### `buttons` _(array)_ - Optional

Custom text for buttons. Example: `array( 'add' => 'Add New Section', 'remove' => 'Delete' )`.

## Stored Value

The field stores an array of text strings in the database. Each string can contain multiple lines of text.

## Example Usage

### Basic Multi Textarea Field

```php
'testimonials' => array(
	'type'        => 'multi_textarea',
	'id'          => 'testimonials',
	'label'       => 'Testimonials',
	'description' => 'Add customer testimonials',
),
```

### Multi Textarea with Rows Attribute

```php
'product_descriptions' => array(
	'type'        => 'multi_textarea',
	'id'          => 'product_descriptions',
	'label'       => 'Product Descriptions',
	'description' => 'Add different descriptions for this product',
	'attributes'  => array(
		'rows'        => 4,
		'placeholder' => 'Enter product description here...',
	),
),
```

### Multi Textarea with Min/Max and Custom Buttons

```php
'faq_items' => array(
	'type'        => 'multi_textarea',
	'id'          => 'faq_items',
	'label'       => 'FAQ Items',
	'description' => 'Add frequently asked questions (2-10)',
	'min'         => 2,
	'max'         => 10,
	'buttons'     => array(
		'add'    => 'Add New Question',
		'remove' => 'Remove Question',
	),
),
```

### Retrieving and Displaying Multi Textarea Values

```php
// Get the array of testimonials
$testimonials = get_post_meta( get_the_ID(), 'testimonials', true );

if ( ! empty( $testimonials ) && is_array( $testimonials ) ) {
	echo '<div class="testimonials-section">';
	echo '<h3>Customer Testimonials</h3>';
	
	foreach ( $testimonials as $index => $testimonial ) {
		// Skip empty values
		if ( empty( $testimonial ) ) {
			continue;
		}
		
		// Add paragraph tags and convert line breaks
		$formatted_testimonial = '<p>' . str_replace( "\n", '</p><p>', esc_html( $testimonial ) ) . '</p>';
		$formatted_testimonial = str_replace( '<p></p>', '', $formatted_testimonial );
		
		echo '<div class="testimonial-item">';
		echo '<div class="testimonial-content">';
		echo '<blockquote>';
		echo $formatted_testimonial;
		echo '</blockquote>';
		echo '<div class="testimonial-index">' . esc_html( $index + 1 ) . '</div>';
		echo '</div>';
		echo '</div>';
	}
	
	echo '</div>';
}
```

### Creating an FAQ Accordion from Multi Textarea Values

```php
// Get the array of FAQ items
$faq_items = get_post_meta( get_the_ID(), 'faq_items', true );

if ( ! empty( $faq_items ) && is_array( $faq_items ) ) {
	// Extract questions and answers (assuming format: "Question?\nAnswer text")
	$faqs = array();
	
	foreach ( $faq_items as $item ) {
		// Skip empty items
		if ( empty( $item ) ) {
			continue;
		}
		
		// Split into question and answer parts
		$parts = explode( "\n", $item, 2 );
		
		if ( count( $parts ) === 2 ) {
			$faqs[] = array(
				'question' => trim( $parts[0] ),
				'answer'   => trim( $parts[1] ),
			);
		} else {
			// Handle items without the expected format
			$faqs[] = array(
				'question' => 'FAQ Item',
				'answer'   => trim( $item ),
			);
		}
	}
	
	// Output FAQ accordion if we have valid items
	if ( ! empty( $faqs ) ) {
		echo '<div class="faq-accordion">';
		echo '<h3>Frequently Asked Questions</h3>';
		
		foreach ( $faqs as $index => $faq ) {
			$id = 'faq-' . sanitize_title( $faq['question'] ) . '-' . $index;
			
			echo '<div class="faq-item">';
			echo '<h4 class="faq-question">';
			echo '<button class="accordion-trigger" aria-expanded="false" aria-controls="' . esc_attr( $id ) . '">';
			echo esc_html( $faq['question'] );
			echo '<span class="accordion-icon"></span>';
			echo '</button>';
			echo '</h4>';
			
			echo '<div id="' . esc_attr( $id ) . '" class="faq-answer" hidden>';
			echo '<p>' . nl2br( esc_html( $faq['answer'] ) ) . '</p>';
			echo '</div>';
			echo '</div>';
		}
		
		echo '</div>';
		
		// Add JavaScript for accordion functionality
		echo '<script>
			document.addEventListener("DOMContentLoaded", function() {
				const triggers = document.querySelectorAll(".accordion-trigger");
				triggers.forEach(trigger => {
					trigger.addEventListener("click", function() {
						const expanded = this.getAttribute("aria-expanded") === "true";
						this.setAttribute("aria-expanded", !expanded);
						const content = document.getElementById(this.getAttribute("aria-controls"));
						content.hidden = expanded;
					});
				});
			});
		</script>';
	}
}
```

### Generating Schema.org Structured Data for FAQs

```php
// Get the array of FAQ items
$faq_items = get_post_meta( get_the_ID(), 'faq_items', true );

if ( ! empty( $faq_items ) && is_array( $faq_items ) ) {
	// Extract questions and answers (assuming format: "Question?\nAnswer text")
	$faq_schema_items = array();
	
	foreach ( $faq_items as $item ) {
		// Skip empty items
		if ( empty( $item ) ) {
			continue;
		}
		
		// Split into question and answer parts
		$parts = explode( "\n", $item, 2 );
		
		if ( count( $parts ) === 2 ) {
			$faq_schema_items[] = array(
				'@type'          => 'Question',
				'name'           => trim( $parts[0] ),
				'acceptedAnswer' => array(
					'@type' => 'Answer',
					'text'  => trim( $parts[1] ),
				),
			);
		}
	}
	
	// Output FAQ schema if we have valid items
	if ( ! empty( $faq_schema_items ) ) {
		$schema = array(
			'@context'   => 'https://schema.org',
			'@type'      => 'FAQPage',
			'mainEntity' => $faq_schema_items,
		);
		
		echo '<script type="application/ld+json">';
		echo wp_json_encode( $schema );
		echo '</script>';
	}
}
```

### Multi Textarea with Conditional Logic

```php
'show_sections' => array(
	'type'  => 'toggle',
	'id'    => 'show_sections',
	'label' => 'Add content sections?',
),
'content_sections' => array(
	'type'       => 'multi_textarea',
	'id'         => 'content_sections',
	'label'      => 'Content Sections',
	'description' => 'Add multiple content sections',
	'conditions' => array(
		array( 'field' => 'show_sections', 'value' => true ),
	),
),
```

## Notes

- The Multi Textarea field provides an "Add" button (+ icon) to add additional textarea inputs
- Each added textarea input includes:
  - A textarea field for entering multi-line content
  - A "Remove" button (trash icon) to delete the input
  - Optionally, a grab handle for reordering (when sorting is enabled)
- The stored value is always an array, even if only one textarea input is provided
- Empty textarea inputs are stored as empty strings in the array
- Textarea inputs can be reordered by dragging (this feature can be disabled)
- Textareas support multi-line content with line breaks
- Line breaks in content are stored as "\n" in the database
- When displaying content, consider using `nl2br()` or wrapping lines in paragraph tags
- This field is ideal for collecting:
  - Testimonials or reviews
  - FAQ questions and answers
  - Product descriptions for different contexts
  - Multiple paragraphs of content
  - Any scenario requiring multiple blocks of formatted text