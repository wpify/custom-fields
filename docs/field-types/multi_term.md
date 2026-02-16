# Multi Term Field Type

The Multi Term field type allows users to select multiple taxonomy terms. It automatically adapts its display based on whether the taxonomy is hierarchical (tree of checkboxes) or non-hierarchical (multi-select dropdown).

## Field Type: `multi_term`

```php
array(
	'type'     => 'multi_term',
	'id'       => 'example_multi_term',
	'label'    => 'Categories',
	'taxonomy' => 'category',
	'min'      => 1,
	'max'      => 5,
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

- `taxonomy` _(string)_ — The taxonomy slug to use for term selection (e.g., `'category'`, `'post_tag'`, or a custom taxonomy)
- `min` _(integer)_ — Optional: Minimum number of items
- `max` _(integer)_ — Optional: Maximum number of items
- `buttons` _(array)_ — Optional: Custom button labels (add, remove, duplicate)
- `disabled_buttons` _(array)_ — Optional: Buttons to disable (move, delete, duplicate)

## Stored Value

The field stores an array of term IDs (integers) in the database:

```php
array( 5, 12, 38 )
```

## Example Usage

### Basic Multi Term for Categories

```php
'post_categories' => array(
	'type'        => 'multi_term',
	'id'          => 'post_categories',
	'label'       => 'Categories',
	'description' => 'Select categories for this post',
	'taxonomy'    => 'category',
),
```

### Multi Term for Tags

```php
'post_tags' => array(
	'type'        => 'multi_term',
	'id'          => 'post_tags',
	'label'       => 'Tags',
	'description' => 'Select tags for this post',
	'taxonomy'    => 'post_tag',
),
```

### Multi Term for Custom Taxonomy

```php
'product_features' => array(
	'type'        => 'multi_term',
	'id'          => 'product_features',
	'label'       => 'Product Features',
	'description' => 'Select features that apply to this product',
	'taxonomy'    => 'product_feature',
	'min'         => 1,
	'max'         => 10,
),
```

### Using Values in Your Theme

```php
$post_categories = get_post_meta( get_the_ID(), 'post_categories', true );

if ( ! empty( $post_categories ) && is_array( $post_categories ) ) {
	echo '<div class="custom-categories">';
	echo '<h3>' . esc_html__( 'Categories', 'flavor' ) . '</h3>';
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

### With Conditional Logic

```php
'use_categories' => array(
	'type'  => 'toggle',
	'id'    => 'use_categories',
	'label' => 'Categorize this post?',
	'title' => 'Enable category selection',
),
'post_category_selection' => array(
	'type'       => 'multi_term',
	'id'         => 'post_category_selection',
	'label'      => 'Post Categories',
	'taxonomy'   => 'category',
	'conditions' => array(
		array( 'field' => 'use_categories', 'value' => true ),
	),
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->multi_term(
	label: 'Categories',
	taxonomy: 'category',
	min: 1,
	max: 5,
);
```

## Notes

- Hierarchical taxonomies (like categories) display as a tree of checkboxes with expandable/collapsible parent terms
- Non-hierarchical taxonomies (like tags) display as a multi-select dropdown
- The stored value is always an array of term IDs, even if only one term is selected
- Unlike the default WordPress taxonomy UI, this field stores data as post meta, not as taxonomy relationships
- Use `wp_set_object_terms()` if you also need to set regular taxonomy relationships
- Term options are loaded dynamically from the WordPress database
