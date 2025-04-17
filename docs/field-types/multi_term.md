# Multi Term Field Type

The Multi Term field type allows users to select multiple taxonomy terms. It provides an interface for selecting terms from any WordPress taxonomy, automatically adapting its display based on whether the taxonomy is hierarchical (shows as a tree of checkboxes) or non-hierarchical (shows as a multi-select dropdown).

## Field Type: `multi_term`

```php
array(
	'type'     => 'multi_term',
	'id'       => 'example_multi_term',
	'label'    => 'Example Multi Term',
	'description' => 'Select multiple taxonomy terms',
	'taxonomy' => 'category', // Required, specify which taxonomy to use
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `multi_term` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have at least one term selected
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(array)_ - Default values as an array of term IDs
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `taxonomy` _(string)_ - Required

The taxonomy slug to use for term selection. This can be any registered taxonomy in WordPress, such as 'category', 'post_tag', or a custom taxonomy.

## Stored Value

The field stores an array of term IDs (integers) in the database. These IDs can be used with WordPress functions like `get_term()` to retrieve the full term objects.

## Example Usage

### Basic Multi Term Field for Categories

```php
'post_categories' => array(
	'type'        => 'multi_term',
	'id'          => 'post_categories',
	'label'       => 'Categories',
	'description' => 'Select categories for this post',
	'taxonomy'    => 'category',
),
```

### Multi Term Field for Tags

```php
'post_tags' => array(
	'type'        => 'multi_term',
	'id'          => 'post_tags',
	'label'       => 'Tags',
	'description' => 'Select tags for this post',
	'taxonomy'    => 'post_tag',
),
```

### Multi Term Field for Custom Taxonomy

```php
'product_features' => array(
	'type'        => 'multi_term',
	'id'          => 'product_features',
	'label'       => 'Product Features',
	'description' => 'Select features that apply to this product',
	'taxonomy'    => 'product_feature', // Custom taxonomy
),
```

### Retrieving and Displaying Multi Term Values

```php
// Get the array of term IDs
$post_categories = get_post_meta( get_the_ID(), 'post_categories', true );

if ( ! empty( $post_categories ) && is_array( $post_categories ) ) {
	echo '<div class="custom-categories">';
	echo '<h3>Categories</h3>';
	echo '<ul class="category-list">';
	
	foreach ( $post_categories as $term_id ) {
		$term = get_term( $term_id, 'category' );
		
		if ( ! is_wp_error( $term ) && $term ) {
			echo '<li class="category-item">';
			echo '<a href="' . esc_url( get_term_link( $term ) ) . '">';
			echo esc_html( $term->name );
			echo '</a>';
			echo '</li>';
		}
	}
	
	echo '</ul>';
	echo '</div>';
}
```

### Advanced Usage: Custom Query with Multi Term Selections

```php
// Get the array of term IDs
$product_features = get_post_meta( get_the_ID(), 'product_features', true );

if ( ! empty( $product_features ) && is_array( $product_features ) ) {
	// Find other products with the same features
	$related_query = new WP_Query( array(
		'post_type'      => 'product',
		'posts_per_page' => 4,
		'post__not_in'   => array( get_the_ID() ), // Exclude current product
		'tax_query'      => array(
			array(
				'taxonomy' => 'product_feature',
				'field'    => 'term_id',
				'terms'    => $product_features,
				'operator' => 'IN', // Products with any of these features
			),
		),
	) );
	
	if ( $related_query->have_posts() ) {
		echo '<div class="related-products">';
		echo '<h3>Related Products</h3>';
		echo '<div class="product-grid">';
		
		while ( $related_query->have_posts() ) {
			$related_query->the_post();
			
			echo '<div class="product-card">';
			
			if ( has_post_thumbnail() ) {
				echo '<div class="product-image">';
				the_post_thumbnail( 'medium' );
				echo '</div>';
			}
			
			echo '<div class="product-details">';
			echo '<h4><a href="' . get_permalink() . '">' . get_the_title() . '</a></h4>';
			
			// Get matching features
			$product_terms = wp_get_post_terms( get_the_ID(), 'product_feature', array( 'fields' => 'ids' ) );
			$matching_features = array_intersect( $product_features, $product_terms );
			
			if ( ! empty( $matching_features ) ) {
				echo '<div class="matching-features">';
				echo '<strong>Matching Features:</strong> ';
				
				$feature_names = array();
				foreach ( $matching_features as $feature_id ) {
					$term = get_term( $feature_id, 'product_feature' );
					if ( $term && ! is_wp_error( $term ) ) {
						$feature_names[] = $term->name;
					}
				}
				
				echo esc_html( implode( ', ', $feature_names ) );
				echo '</div>';
			}
			
			echo '</div>'; // .product-details
			echo '</div>'; // .product-card
		}
		
		echo '</div>'; // .product-grid
		echo '</div>'; // .related-products
		
		wp_reset_postdata();
	}
}
```

### Setting Terms Programmatically

```php
/**
 * Save terms to a post when using multi_term field
 *
 * @param int   $post_id   The post ID
 * @param array $term_ids  Array of term IDs
 * @param string $taxonomy The taxonomy name
 * @return bool|WP_Error True on success, WP_Error on failure
 */
function save_post_terms( $post_id, $term_ids, $taxonomy ) {
	// Save as post meta
	update_post_meta( $post_id, 'post_' . $taxonomy, $term_ids );
	
	// Optionally, also set as regular taxonomy terms
	return wp_set_object_terms( $post_id, $term_ids, $taxonomy );
}

// Example usage
$post_id = get_the_ID();
$selected_categories = array( 5, 10, 15 ); // Category IDs
save_post_terms( $post_id, $selected_categories, 'category' );
```

### Multi Term with Conditional Logic

```php
'use_categories' => array(
	'type'  => 'toggle',
	'id'    => 'use_categories',
	'label' => 'Categorize this post?',
),
'post_category_selection' => array(
	'type'       => 'multi_term',
	'id'         => 'post_category_selection',
	'label'      => 'Post Categories',
	'description' => 'Select categories for this post',
	'taxonomy'   => 'category',
	'conditions' => array(
		array( 'field' => 'use_categories', 'value' => true ),
	),
),
```

## Notes

- The Multi Term field adapts its interface based on the taxonomy:
  - Hierarchical taxonomies (like categories) show as a tree of checkboxes
  - Non-hierarchical taxonomies (like tags) show as a multi-select dropdown
- For hierarchical taxonomies:
  - Parent terms can be expanded/collapsed to show/hide children
  - Selecting a term doesn't automatically select its children
  - The visual tree structure makes it easy to navigate complex taxonomies
- The stored value is always an array of term IDs, even if only one term is selected
- Unlike WordPress's default taxonomy UI, this field stores data as post meta, not as taxonomy relationships
  - Use the `wp_set_object_terms()` function if you also want to set regular taxonomy relationships
- Term options are loaded dynamically from the WordPress database
- This field is ideal for:
  - Custom categorization systems
  - Filtering content by multiple taxonomy terms
  - Creating custom taxonomic relationships
  - Any scenario where multiple terms from a taxonomy need to be selected