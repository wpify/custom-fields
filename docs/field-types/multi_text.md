# Multi Text Field Type

The Multi Text field type allows users to add multiple text inputs. It provides a repeatable interface for collecting multiple text values with add/remove functionality and optional sorting capability.

## Field Type: `multi_text`

```php
array(
	'type'        => 'multi_text',
	'id'          => 'example_multi_text',
	'label'       => 'Example Multi Text',
	'description' => 'Add multiple text entries',
	'default'     => array( 'First value', 'Second value' ),
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `multi_text` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have at least one value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(array)_ - Default values as an array of strings
- `attributes` _(array)_ - HTML attributes to add to each text input
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

Custom text for buttons. Example: `array( 'add' => 'Add New Entry', 'remove' => 'Delete' )`.

## Stored Value

The field stores an array of text strings in the database.

## Example Usage

### Basic Multi Text Field

```php
'alternative_titles' => array(
	'type'        => 'multi_text',
	'id'          => 'alternative_titles',
	'label'       => 'Alternative Titles',
	'description' => 'Add multiple alternative titles for this content',
),
```

### Multi Text with Minimum and Maximum Entries

```php
'product_benefits' => array(
	'type'        => 'multi_text',
	'id'          => 'product_benefits',
	'label'       => 'Product Benefits',
	'description' => 'Add 3-5 benefits of this product',
	'min'         => 3,
	'max'         => 5,
),
```

### Multi Text with Custom Button Labels

```php
'company_locations' => array(
	'type'        => 'multi_text',
	'id'          => 'company_locations',
	'label'       => 'Company Locations',
	'description' => 'Add all office locations',
	'buttons'     => array(
		'add'    => 'Add New Location',
		'remove' => 'Remove Location',
	),
),
```

### Multi Text with Input Attributes

```php
'contact_names' => array(
	'type'        => 'multi_text',
	'id'          => 'contact_names',
	'label'       => 'Contact Names',
	'description' => 'Add names of contact persons',
	'attributes'  => array(
		'placeholder' => 'Full name',
		'maxlength'   => 50,
		'class'       => 'name-input',
	),
),
```

### Retrieving and Using Multi Text Values

```php
// Get the array of text values
$alternative_titles = get_post_meta( get_the_ID(), 'alternative_titles', true );

if ( ! empty( $alternative_titles ) && is_array( $alternative_titles ) ) {
	echo '<div class="alternative-titles">';
	echo '<h3>Also Known As:</h3>';
	echo '<ul>';
	
	foreach ( $alternative_titles as $title ) {
		// Skip empty values
		if ( empty( $title ) ) {
			continue;
		}
		
		echo '<li>' . esc_html( $title ) . '</li>';
	}
	
	echo '</ul>';
	echo '</div>';
}
```

### Creating a Bullet Point List from Multi Text Values

```php
// Get the array of product benefits
$product_benefits = get_post_meta( get_the_ID(), 'product_benefits', true );

if ( ! empty( $product_benefits ) && is_array( $product_benefits ) ) {
	echo '<div class="product-benefits">';
	echo '<h3>Key Benefits</h3>';
	echo '<ul class="benefits-list">';
	
	foreach ( $product_benefits as $benefit ) {
		if ( ! empty( $benefit ) ) {
			echo '<li><span class="checkmark">✓</span> ' . esc_html( $benefit ) . '</li>';
		}
	}
	
	echo '</ul>';
	echo '</div>';
}
```

### Creating Structured Data from Multi Text Values

```php
// Get the company locations
$company_locations = get_post_meta( get_the_ID(), 'company_locations', true );

if ( ! empty( $company_locations ) && is_array( $company_locations ) ) {
	// Generate schema.org structured data for organization locations
	$locations_schema = array();
	
	foreach ( $company_locations as $location ) {
		if ( ! empty( $location ) ) {
			$locations_schema[] = array(
				'@type'   => 'Place',
				'address' => array(
					'@type'          => 'PostalAddress',
					'streetAddress'  => $location,
				),
			);
		}
	}
	
	if ( ! empty( $locations_schema ) ) {
		$company_schema = array(
			'@context' => 'https://schema.org',
			'@type'    => 'Organization',
			'name'     => get_bloginfo( 'name' ),
			'location' => $locations_schema,
		);
		
		echo '<script type="application/ld+json">';
		echo wp_json_encode( $company_schema );
		echo '</script>';
	}
}
```

### Multi Text with Conditional Logic

```php
'has_multiple_authors' => array(
	'type'  => 'toggle',
	'id'    => 'has_multiple_authors',
	'label' => 'Multiple authors?',
),
'coauthor_names' => array(
	'type'       => 'multi_text',
	'id'         => 'coauthor_names',
	'label'      => 'Co-Author Names',
	'description' => 'Add names of co-authors',
	'conditions' => array(
		array( 'field' => 'has_multiple_authors', 'value' => true ),
	),
),
```

## Notes

- The Multi Text field provides an "Add" button (+ icon) to add additional text inputs
- Each added text input includes:
  - A text field for entering content
  - A "Remove" button (trash icon) to delete the input
  - Optionally, a grab handle for reordering (when sorting is enabled)
- The stored value is always an array, even if only one text input is provided
- Empty text inputs are stored as empty strings in the array
- Text inputs can be reordered by dragging (this feature can be disabled)
- The minimum/maximum constraints allow you to control how many inputs can be added
- This field is ideal for collecting:
  - Lists of items (features, benefits, specifications)
  - Alternative names or titles
  - Multiple addresses or locations
  - Any scenario requiring multiple text entries