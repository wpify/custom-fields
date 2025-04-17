# Post Field Type

The Post field type allows you to create a relationship between your content and existing WordPress posts or custom post types. It provides a searchable dropdown selector to find and link to specific posts, pages, or custom post type entries.

## Field Type: `post`

```php
array(
    'type'      => 'post',
    'id'        => 'example_post',
    'label'     => 'Related Article',
    'post_type' => 'post', // or array('post', 'page')
)
```

## Properties

**For Default Field Properties, see [Field Types Definition](../field-types.md)**.

### `post_type` _(string|array)_ - Required

Specifies which post types can be selected. Can be a single post type as a string (e.g., `'post'`) or multiple post types as an array (e.g., `array('post', 'page', 'product')`).

## Stored Value

The field stores the post ID as an integer in the database.

## User Interface

The Post field provides a comprehensive interface:

1. **Searchable Dropdown**: Type to search for posts by title
2. **Post Preview**: Once selected, displays a preview with:
   - Featured image thumbnail (or placeholder if none)
   - Post title with link to view/edit
   - Post excerpt (truncated if too long)
   - Delete button to remove the selection

## Example Usage

### Single Post Type Relationship

```php
'related_article' => array(
    'type'        => 'post',
    'id'          => 'related_article',
    'label'       => 'Related Article',
    'description' => 'Select a related article to display.',
    'post_type'   => 'post',
    'required'    => true,
),
```

### Multiple Post Types Relationship

```php
'featured_content' => array(
    'type'        => 'post',
    'id'          => 'featured_content',
    'label'       => 'Featured Content',
    'description' => 'Select featured content to highlight.',
    'post_type'   => array('post', 'page', 'product'),
),
```

### Using Post Field Values in Your Theme

```php
// Get the linked post ID from the meta field
$related_article_id = get_post_meta(get_the_ID(), 'related_article', true);

if (!empty($related_article_id)) {
    // Get the full post object
    $related_article = get_post($related_article_id);
    
    if ($related_article) {
        echo '<div class="related-article">';
        echo '<h3>Related Article</h3>';
        
        // Display featured image if available
        if (has_post_thumbnail($related_article_id)) {
            echo '<a href="' . esc_url(get_permalink($related_article_id)) . '">';
            echo get_the_post_thumbnail($related_article_id, 'thumbnail');
            echo '</a>';
        }
        
        // Display title with link
        echo '<h4><a href="' . esc_url(get_permalink($related_article_id)) . '">';
        echo esc_html($related_article->post_title);
        echo '</a></h4>';
        
        // Display excerpt
        if (!empty($related_article->post_excerpt)) {
            echo '<p>' . esc_html(get_the_excerpt($related_article_id)) . '</p>';
        } else {
            // Generate excerpt from content if no excerpt exists
            echo '<p>' . wp_trim_words($related_article->post_content, 20) . '</p>';
        }
        
        echo '</div>';
    }
}
```

### Post Field with Conditional Logic

```php
'show_related' => array(
    'type'  => 'toggle',
    'id'    => 'show_related',
    'label' => 'Show Related Content',
),
'related_post' => array(
    'type'        => 'post',
    'id'          => 'related_post',
    'label'       => 'Related Content',
    'post_type'   => array('post', 'page'),
    'conditions'  => array(
        array('field' => 'show_related', 'value' => true),
    ),
),
```

## Features

1. **Searchable Interface**: Type to quickly find posts by title
2. **Rich Preview**: Visual preview of the selected post
3. **Direct Links**: Quick access to view or edit the selected post
4. **Multiple Post Types**: Ability to search across different post types

## Notes

- The field validates that a valid post ID is selected when the field is required
- For multiple post selections, use the [`multi_post`](multi_post.md) field type instead
- The search functionality uses WordPress's built-in search capabilities
- The field automatically shows the post ID alongside the title for better identification
- When a post is deleted, the field will show an empty state when edited
- Consider using this field type when you need to create relationships between content items