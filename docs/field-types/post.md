# Post Field Type

The Post field type allows you to create a relationship between your content and existing WordPress posts or custom post types. It provides a searchable dropdown selector to find and link to specific posts, pages, or custom post type entries.

## Field Type: `post`

```php
array(
	'type'      => 'post',
	'id'        => 'related_article',
	'label'     => 'Related Article',
	'post_type' => 'post',
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

#### `post_type` _(string|array)_ — Required

Specifies which post types can be selected. Can be a single post type as a string (e.g., `'post'`) or multiple post types as an array (e.g., `array( 'post', 'page', 'product' )`).

## Stored Value

The field stores the post ID as an integer in the database.

## Example Usage

### Single Post Type Relationship

```php
array(
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
array(
	'type'        => 'post',
	'id'          => 'featured_content',
	'label'       => 'Featured Content',
	'description' => 'Select featured content to highlight.',
	'post_type'   => array( 'post', 'page', 'product' ),
),
```

### Using Values in Your Theme

```php
$related_article_id = get_post_meta( get_the_ID(), 'related_article', true );

if ( ! empty( $related_article_id ) ) {
	$related_article = get_post( $related_article_id );

	if ( $related_article ) {
		echo '<div class="related-article">';
		echo '<h3>' . esc_html__( 'Related Article', 'flavor' ) . '</h3>';

		if ( has_post_thumbnail( $related_article_id ) ) {
			echo '<a href="' . esc_url( get_permalink( $related_article_id ) ) . '">';
			echo get_the_post_thumbnail( $related_article_id, 'thumbnail' );
			echo '</a>';
		}

		echo '<h4><a href="' . esc_url( get_permalink( $related_article_id ) ) . '">';
		echo esc_html( $related_article->post_title );
		echo '</a></h4>';

		if ( ! empty( $related_article->post_excerpt ) ) {
			echo '<p>' . esc_html( get_the_excerpt( $related_article_id ) ) . '</p>';
		}

		echo '</div>';
	}
}
```

### With Conditional Logic

```php
'show_related' => array(
	'type'  => 'toggle',
	'id'    => 'show_related',
	'label' => 'Show Related Content',
),
'related_post' => array(
	'type'       => 'post',
	'id'         => 'related_post',
	'label'      => 'Related Content',
	'post_type'  => array( 'post', 'page' ),
	'conditions' => array(
		array( 'field' => 'show_related', 'value' => true ),
	),
),
```

## User Interface

The Post field provides a comprehensive interface:

1. **Searchable Dropdown**: Type to search for posts by title
2. **Post Preview**: Once selected, displays a preview with:
   - Featured image thumbnail (or placeholder if none)
   - Post title with link to view/edit
   - Post excerpt (truncated if too long)
   - Delete button to remove the selection

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->post(
	label: 'Related Article',
	post_type: 'post',
);
```

## Notes

- The field validates that a valid post ID is selected when the field is required
- For multiple post selections, use the [`multi_post`](multi_post.md) field type instead
- The search functionality uses WordPress's built-in search capabilities
- The field automatically shows the post ID alongside the title for better identification
- When a post is deleted, the field will show an empty state when edited
