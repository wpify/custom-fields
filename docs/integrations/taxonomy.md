# Taxonomy Term

Add custom fields to taxonomy terms. This integration allows you to attach custom fields to any taxonomy term edit screens.

## Example

```php
wpify_custom_fields()->create_taxonomy(
	array(
		'id'       => 'product_category_fields',
		'taxonomy' => 'product_cat',
		'tabs'     => array(
			'general' => 'General',
			'display' => 'Display Options',
		),
		'items'    => array(
			'subtitle' => array(
				'type'        => 'text',
				'label'       => 'Subtitle',
				'description' => 'Category subtitle displayed below the title',
				'tab'         => 'general',
			),
			'featured' => array(
				'type'        => 'toggle',
				'label'       => 'Featured Category',
				'title'       => 'Show in featured categories section',
				'tab'         => 'display',
			),
			'icon'     => array(
				'type'        => 'attachment',
				'label'       => 'Category Icon',
				'description' => 'Icon displayed next to category name',
				'tab'         => 'display',
			),
		),
	)
);
```

## Arguments

### `$id` _(string)_

Unique identifier for this taxonomy custom fields implementation.

### `$taxonomy` _(string)_ - Required

The taxonomy slug where the custom fields should be added (e.g., 'category', 'post_tag', 'product_cat').

### `$tabs` _(array)_

Tabs used for organizing the custom fields. See [Tabs](../features/tabs.md) for more information.

### `$items` _(array)_

List of the fields to be shown. See [Field Types](../field-types.md) for available field types.

### `$hook_priority` _(int)_ - Default: 10

Priority for the hooks that render the form fields.

### `$init_priority` _(int)_ - Default: 10

Priority for the init hook when registering meta.

### `$meta_key` _(string)_

Meta key used to store the custom fields values. If meta key is not set, the individual fields will be stored as separate meta values.

## Using Term Meta

Field values can be retrieved using the standard WordPress term meta functions:

```php
// Get a single term meta value
$subtitle = get_term_meta( $term_id, 'subtitle', true );

// Get a term's icon attachment ID
$icon_id = get_term_meta( $term_id, 'icon', true );
if ( ! empty( $icon_id ) ) {
	$icon_url = wp_get_attachment_image_url( $icon_id, 'thumbnail' );
	echo '<img src="' . esc_url( $icon_url ) . '" alt="Category Icon" class="category-icon">';
}

// Check if a term is featured
$is_featured = get_term_meta( $term_id, 'featured', true );
if ( $is_featured ) {
	// Display special featured badge or include in featured section
	echo '<span class="featured-badge">Featured</span>';
}
```

## Field Display Location

Custom fields are displayed in two different locations:

1. **Add Term Form**: When creating a new term, fields appear at the bottom of the add term form
2. **Edit Term Form**: When editing an existing term, fields appear in the term edit screen

The integration automatically adjusts the field layout based on the context.