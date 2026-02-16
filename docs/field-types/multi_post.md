# Multi Post Field Type

The Multi Post field type allows users to select multiple WordPress posts, pages, or custom post types. It provides a searchable interface with post previews, making it easy to create relationships between content.

## Field Type: `multi_post`

```php
array(
	'type'      => 'multi_post',
	'id'        => 'example_multi_post',
	'label'     => 'Related Articles',
	'post_type' => 'post',
	'min'       => 1,
	'max'       => 5,
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

- `post_type` _(string|array)_ — The post type(s) available for selection. Can be a single post type string (e.g., `'post'`, `'page'`, `'product'`) or an array of post types (e.g., `array( 'post', 'page' )`)
- `min` _(integer)_ — Optional: Minimum number of items
- `max` _(integer)_ — Optional: Maximum number of items
- `buttons` _(array)_ — Optional: Custom button labels (add, remove, duplicate)
- `disabled_buttons` _(array)_ — Optional: Buttons to disable (move, delete, duplicate)

## Stored Value

The field stores an array of post IDs (integers) in the database:

```php
array( 42, 87, 153 )
```

## Example Usage

### Basic Multi Post

```php
'related_posts' => array(
	'type'        => 'multi_post',
	'id'          => 'related_posts',
	'label'       => 'Related Posts',
	'description' => 'Select posts that are related to this content',
	'post_type'   => 'post',
),
```

### Multi Post with Multiple Post Types

```php
'featured_content' => array(
	'type'        => 'multi_post',
	'id'          => 'featured_content',
	'label'       => 'Featured Content',
	'description' => 'Select posts or pages to feature',
	'post_type'   => array( 'post', 'page' ),
),
```

### Multi Post with Min/Max Constraints

```php
'recommended_products' => array(
	'type'        => 'multi_post',
	'id'          => 'recommended_products',
	'label'       => 'Recommended Products',
	'description' => 'Select 2 to 6 recommended products',
	'post_type'   => 'product',
	'min'         => 2,
	'max'         => 6,
),
```

### Using Values in Your Theme

```php
$related_posts = get_post_meta( get_the_ID(), 'related_posts', true );

if ( ! empty( $related_posts ) && is_array( $related_posts ) ) {
	echo '<div class="related-posts">';
	echo '<h3>' . esc_html__( 'Related Articles', 'flavor' ) . '</h3>';
	echo '<div class="post-grid">';

	foreach ( $related_posts as $post_id ) {
		$related_post = get_post( $post_id );

		if ( ! $related_post || 'publish' !== $related_post->post_status ) {
			continue;
		}

		echo '<div class="post-card">';
		echo '<a href="' . esc_url( get_permalink( $post_id ) ) . '">';

		if ( has_post_thumbnail( $post_id ) ) {
			echo get_the_post_thumbnail( $post_id, 'medium' );
		}

		echo '<h4>' . esc_html( get_the_title( $post_id ) ) . '</h4>';
		echo '</a>';
		echo '<p>' . esc_html( wp_trim_words( get_the_excerpt( $post_id ), 15 ) ) . '</p>';
		echo '</div>';
	}

	echo '</div>';
	echo '</div>';
}
```

### With Conditional Logic

```php
'show_team_members' => array(
	'type'  => 'toggle',
	'id'    => 'show_team_members',
	'label' => 'Show Team Members',
	'title' => 'Display team members section',
),
'team_members' => array(
	'type'       => 'multi_post',
	'id'         => 'team_members',
	'label'      => 'Team Members',
	'post_type'  => 'team_member',
	'conditions' => array(
		array( 'field' => 'show_team_members', 'value' => true ),
	),
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->multi_post(
	label: 'Related Articles',
	post_type: 'post',
	min: 1,
	max: 5,
);
```

## Notes

- The Multi Post field provides a searchable dropdown to select posts
- Each selected post shows a preview with thumbnail, title, and excerpt
- Selected posts are stored as an ordered array of post IDs
- The field prevents duplicate selections
- The order of posts is preserved when retrieving and displaying the values
- When retrieving values, always verify that posts still exist and are published
- Works with any registered post type in WordPress
