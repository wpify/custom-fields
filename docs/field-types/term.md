# Term Field Type

The Term field type provides an interface for selecting a single WordPress taxonomy term. It adapts to display either a dropdown select or a hierarchical tree view depending on the taxonomy structure, making it perfect for associating content with categories, tags, or custom taxonomies.

## Field Type: `term`

```php
array(
    'type'     => 'term',
    'id'       => 'example_term',
    'label'    => 'Category',
    'taxonomy' => 'category',
)
```

## Properties

**For Default Field Properties, see [Field Types Definition](../field-types.md)**.

### `taxonomy` _(string)_ - Required

The WordPress taxonomy slug that this field will use. Common values include:
- `category` - WordPress post categories
- `post_tag` - WordPress post tags
- Custom taxonomy slugs (e.g., `product_cat`, `event_type`, etc.)

## Stored Value

The field stores the term ID as an integer in the database.

## User Interface

The Term field provides two different interfaces based on the taxonomy structure:

1. **For Hierarchical Taxonomies**: Displays an expandable tree view with radio buttons
   - Parent terms can be expanded/collapsed using +/- icons
   - Terms are selected with radio buttons (only one can be selected)
   - Automatically expands parents of selected terms

2. **For Non-Hierarchical Taxonomies**: Displays a searchable dropdown menu
   - Uses the Select component with search functionality
   - Shows all available terms in a flat list

## Example Usage

### Basic Category Selector

```php
'post_category' => array(
    'type'        => 'term',
    'id'          => 'post_category',
    'label'       => 'Primary Category',
    'description' => 'Select the primary category for this content.',
    'taxonomy'    => 'category',
    'required'    => true,
),
```

### Custom Taxonomy Selector

```php
'product_type' => array(
    'type'        => 'term',
    'id'          => 'product_type', 
    'label'       => 'Product Type',
    'description' => 'Select the product type.',
    'taxonomy'    => 'product_type', // Custom taxonomy
),
```

### Using Term Values in Your Theme

```php
// Get the term ID from the meta field
$category_id = get_post_meta(get_the_ID(), 'post_category', true);

if (!empty($category_id)) {
    // Get the full term object
    $term = get_term($category_id);
    
    if (!is_wp_error($term) && $term) {
        echo '<div class="primary-category">';
        echo '<h4>Primary Category:</h4>';
        
        // Display term name with link
        echo '<a href="' . esc_url(get_term_link($term)) . '">';
        echo esc_html($term->name);
        echo '</a>';
        
        // Optionally display term description
        if (!empty($term->description)) {
            echo '<p class="term-description">' . esc_html($term->description) . '</p>';
        }
        
        echo '</div>';
    }
}
```

### Term Field with Conditional Logic

```php
'show_location' => array(
    'type'  => 'toggle',
    'id'    => 'show_location',
    'label' => 'Specify Location',
),
'location_type' => array(
    'type'        => 'term',
    'id'          => 'location_type',
    'label'       => 'Location',
    'taxonomy'    => 'location',
    'conditions'  => array(
        array('field' => 'show_location', 'value' => true),
    ),
),
```

## Features

1. **Adaptive UI**: Automatically adjusts between dropdown and tree view based on taxonomy structure
2. **Hierarchical Support**: Displays parent-child relationships for hierarchical taxonomies
3. **Expandable Tree**: Allows collapsing/expanding branches of the taxonomy tree
4. **Search Capability**: For non-hierarchical taxonomies, provides search functionality

## Notes

- The field validates that a valid term ID is selected when the field is required
- For selecting multiple terms, use the [`multi_term`](multi_term.md) field type instead
- The field automatically loads all terms from the specified taxonomy
- For hierarchical taxonomies, the tree structure maintains proper parent-child relationships
- The stored term ID can be used with WordPress functions like `get_term()` and `get_term_link()`
- If no terms exist in the specified taxonomy, a "No terms found" message is displayed
- The field shows a loading state while terms are being fetched