# Multi Select Field Type

The Multi Select field type allows users to select multiple options from a dropdown menu. It provides a modern, searchable interface with the ability to add or remove multiple selected values. This field is ideal for categorization, tagging, or any scenario where multiple choices from a predefined set need to be selected.

## Field Type: `multi_select`

```php
array(
	'type'    => 'multi_select',
	'id'      => 'example_multi_select',
	'label'   => 'Example Multi Select',
	'description' => 'Select multiple options',
	'options' => array(
		'red'   => 'Red',
		'green' => 'Green',
		'blue'  => 'Blue',
		'yellow' => 'Yellow',
	),
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `multi_select` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have at least one value selected
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(array)_ - Default values as an array of option values
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `options` _(array|callable)_ - Required

An associative array of options where the keys are the values to store and the array values are the labels to display. Alternatively, you can use an array of objects with `value` and `label` properties:

```php
'options' => array(
	array( 'value' => 'red', 'label' => 'Red' ),
	array( 'value' => 'green', 'label' => 'Green' ),
	array( 'value' => 'blue', 'label' => 'Blue' ),
),
```

You can also use an associative array:

```php
'options' => array(
    'red'   => 'Red',
    'green' => 'Green',
    'blue'  => 'Blue',
),
```

Another option is to use a callable function that returns the options array. This is useful for dynamic options:

```php
'options' => 'custom_get_colors',
```

You have to define the `custom_get_colors` function in your theme or plugin:

```php
function custom_get_colors( array $args ): array {
    // Perform any logic to fetch or generate options
    
    return array(
        'red'   => 'Red',
        'green' => 'Green',
        'blue'  => 'Blue',
    );
}
```
The function accepts an array of arguments with the following keys:
- `value`: The current value of the field
- `search`: The search term entered by the user
- additional parameters passed via `async_params`

The function should return the option that is currently selected (value) and options that match the search term. The returned array should be in the same format as the static options.

#### `async_params` _(array)_ - Optional

Additional parameters to pass to the API when fetching options with `options_key`. Useful for filtering or customizing the returned options.

## Stored Value

The field stores an array of selected option values in the database. For example:

```php
array( 'red', 'blue' )
```

## Example Usage

### Basic Multi Select Field

```php
'product_tags' => array(
	'type'        => 'multi_select',
	'id'          => 'product_tags',
	'label'       => 'Product Tags',
	'description' => 'Select tags that apply to this product',
	'options'     => array(
		'new'      => 'New',
		'sale'     => 'Sale',
		'featured' => 'Featured',
		'limited'  => 'Limited Edition',
		'organic'  => 'Organic',
		'popular'  => 'Popular',
	),
	'default'     => array( 'new' ),
),
```

### Multi Select with Dynamic Options from Callback

```php
'country' => array(
	'type'        => 'select',
	'label'       => 'Country',
	'description' => 'Select the country.',
	'options'     => function ( array $args ): array {
        return array(
            array( 'value' => 'us', 'label' => 'United States' ),
            array( 'value' => 'ca', 'label' => 'Canada' ),
            array( 'value' => 'mx', 'label' => 'Mexico' ),
            // More countries...
        );
    },
	'default'     => 'us',
),
```

### Retrieving and Using Multi Select Values

```php
// Get the array of selected values
$product_tags = get_post_meta( get_the_ID(), 'product_tags', true );

if ( ! empty( $product_tags ) && is_array( $product_tags ) ) {
	echo '<div class="product-tags">';
	
	// Define labels for display
	$tag_labels = array(
		'new'      => 'New',
		'sale'     => 'Sale',
		'featured' => 'Featured',
		'limited'  => 'Limited Edition',
		'organic'  => 'Organic',
		'popular'  => 'Popular',
	);
	
	foreach ( $product_tags as $tag ) {
		// Skip if no label is defined
		if ( ! isset( $tag_labels[ $tag ] ) ) {
			continue;
		}
		
		$label = $tag_labels[ $tag ];
		echo '<span class="product-tag product-tag--' . esc_attr( $tag ) . '">';
		echo esc_html( $label );
		echo '</span>';
	}
	
	echo '</div>';
	
	// Example: Add a class to the body for each selected tag
	add_filter( 'body_class', function( $classes ) use ( $product_tags ) {
		foreach ( $product_tags as $tag ) {
			$classes[] = 'has-product-tag-' . sanitize_html_class( $tag );
		}
		return $classes;
	} );
}
```

### Multi Select with Conditional Logic

```php
'has_variations' => array(
	'type'  => 'toggle',
	'id'    => 'has_variations',
	'label' => 'Product has variations?',
),
'variation_attributes' => array(
	'type'       => 'multi_select',
	'id'         => 'variation_attributes',
	'label'      => 'Variation Attributes',
	'description' => 'Select attributes used for variations',
	'options'    => array(
		'color' => 'Color',
		'size'  => 'Size',
		'material' => 'Material',
		'style' => 'Style',
	),
	'conditions' => array(
		array( 'field' => 'has_variations', 'value' => true ),
	),
),
```

## Notes

- The Multi Select field is based on React Select, providing a modern user experience
- Users can:
  - Search for options using the dropdown search field
  - View all selected options above the dropdown
  - Remove individual options with a delete button
  - Clear the search input after selecting an option
- Selected options appear as chips/tags that can be individually removed
- The field prevents duplicate selections
- The stored value is always an array, even if only one option is selected
- Empty values are not stored in the array
- This field is ideal for:
  - Categorization (tags, categories, attributes)
  - Multi-selection of related items
  - Filtering options for products or content
  - Any scenario where selecting multiple items from a list is needed
