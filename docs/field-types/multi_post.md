# Multi Post Field Type

The Multi Post field type allows users to select multiple WordPress posts, pages, or custom post types. It provides a searchable interface with post previews, making it easy to create relationships between content.

## Field Type: `multi_post`

```php
array(
	'type'        => 'multi_post',
	'id'          => 'example_multi_post',
	'label'       => 'Example Multi Post',
	'description' => 'Select multiple related posts',
	'post_type'   => 'post', // Can be a single post type or an array of post types
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `multi_post` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have at least one post selected
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(array)_ - Default values as an array of post IDs
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `post_type` _(string|array)_ - Required

Specifies which post types can be selected. Can be a single post type as a string (e.g., 'post', 'page', 'product') or an array of post types (e.g., ['post', 'page']).

## Stored Value

The field stores an array of post IDs (integers) in the database. These IDs can be used with WordPress functions like `get_post()` to retrieve the full post objects.

## Example Usage

### Basic Multi Post Field

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

### Multi Post for WooCommerce Related Products

```php
'related_products' => array(
	'type'        => 'multi_post',
	'id'          => 'related_products',
	'label'       => 'Related Products',
	'description' => 'Select products that are related to this product',
	'post_type'   => 'product',
),
```

### Retrieving and Displaying Multi Post Values

```php
// Get the array of post IDs
$related_posts = get_post_meta( get_the_ID(), 'related_posts', true );

if ( ! empty( $related_posts ) && is_array( $related_posts ) ) {
	echo '<div class="related-posts">';
	echo '<h3>Related Articles</h3>';
	echo '<div class="post-grid">';
	
	foreach ( $related_posts as $post_id ) {
		// Get the post object
		$related_post = get_post( $post_id );
		
		if ( ! $related_post || $related_post->post_status !== 'publish' ) {
			continue; // Skip if post doesn't exist or is not published
		}
		
		// Get featured image
		$thumbnail = get_the_post_thumbnail_url( $post_id, 'medium' );
		if ( ! $thumbnail ) {
			$thumbnail = '/wp-content/plugins/wpify-custom-fields/assets/images/placeholder-image.svg';
		}
		
		echo '<div class="post-card">';
		echo '<a href="' . esc_url( get_permalink( $post_id ) ) . '">';
		echo '<img src="' . esc_url( $thumbnail ) . '" alt="' . esc_attr( get_the_title( $post_id ) ) . '" />';
		echo '<h4>' . esc_html( get_the_title( $post_id ) ) . '</h4>';
		echo '</a>';
		echo '<p>' . esc_html( wp_trim_words( get_the_excerpt( $post_id ), 15 ) ) . '</p>';
		echo '</div>';
	}
	
	echo '</div>';
	echo '</div>';
}
```

### Advanced Usage: Custom Query with Multi Post Selections

```php
// Get the array of post IDs
$featured_content = get_post_meta( get_the_ID(), 'featured_content', true );

if ( ! empty( $featured_content ) && is_array( $featured_content ) ) {
	// Create a custom query with the selected posts in a specific order
	$featured_query = new WP_Query( array(
		'post_type'      => array( 'post', 'page' ),
		'post__in'       => $featured_content, // Use the selected post IDs
		'orderby'        => 'post__in', // Preserve the order of selection
		'posts_per_page' => -1, // Show all selected posts
	) );
	
	if ( $featured_query->have_posts() ) {
		echo '<div class="featured-content-slider">';
		
		while ( $featured_query->have_posts() ) {
			$featured_query->the_post();
			
			echo '<div class="slide">';
			
			if ( has_post_thumbnail() ) {
				echo '<div class="slide-image">';
				the_post_thumbnail( 'large' );
				echo '</div>';
			}
			
			echo '<div class="slide-content">';
			echo '<h2>' . get_the_title() . '</h2>';
			echo '<div class="excerpt">' . get_the_excerpt() . '</div>';
			echo '<a href="' . get_permalink() . '" class="read-more">Read More</a>';
			echo '</div>';
			
			echo '</div>';
		}
		
		echo '</div>';
		
		// Restore original post data
		wp_reset_postdata();
	}
}
```

### Cross-Post Type Relationships

```php
// Function to display team members associated with a project
function display_project_team_members() {
	$team_member_ids = get_post_meta( get_the_ID(), 'project_team', true );
	
	if ( empty( $team_member_ids ) || ! is_array( $team_member_ids ) ) {
		return;
	}
	
	$args = array(
		'post__in'       => $team_member_ids,
		'post_type'      => 'team_member', // Specific post type
		'posts_per_page' => -1,
		'orderby'        => 'post__in', // Maintain the selection order
	);
	
	$team_query = new WP_Query( $args );
	
	if ( $team_query->have_posts() ) {
		echo '<div class="project-team">';
		echo '<h3>Project Team</h3>';
		echo '<div class="team-members">';
		
		while ( $team_query->have_posts() ) {
			$team_query->the_post();
			
			$position = get_post_meta( get_the_ID(), 'position', true );
			
			echo '<div class="team-member">';
			if ( has_post_thumbnail() ) {
				echo '<div class="team-member-photo">';
				the_post_thumbnail( 'thumbnail' );
				echo '</div>';
			}
			
			echo '<div class="team-member-info">';
			echo '<h4>' . get_the_title() . '</h4>';
			
			if ( $position ) {
				echo '<p class="position">' . esc_html( $position ) . '</p>';
			}
			
			echo '<a href="' . esc_url( get_permalink() ) . '">View Profile</a>';
			echo '</div>'; // .team-member-info
			
			echo '</div>'; // .team-member
		}
		
		echo '</div>'; // .team-members
		echo '</div>'; // .project-team
		
		wp_reset_postdata();
	}
}
```

### Multi Post with Conditional Logic

```php
'show_team_members' => array(
	'type'  => 'toggle',
	'id'    => 'show_team_members',
	'label' => 'Show Team Members',
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

## Notes

- The Multi Post field provides a searchable dropdown to select posts
- Each selected post shows a preview with:
  - Thumbnail image (if available)
  - Post title
  - Post excerpt
  - A remove button to delete the selection
- Selected posts are stored as an ordered array of post IDs
- The field prevents duplicate selections
- The order of posts in the admin area is preserved when retrieving and displaying the values
- When retrieving values, always check if posts still exist and are published
- Works with any registered post type in WordPress
- This field is ideal for creating content relationships such as:
  - Related posts
  - Product recommendations
  - Team member associations
  - Featured content selections
  - Content cross-referencing
