# Multi Link Field Type

The Multi Link field type allows users to add multiple links with URLs, labels, and additional options. Each link can be a direct URL or a reference to a WordPress post. This field type is useful for creating navigation menus, lists of related resources, or any collection of links.

## Field Type: `multi_link`

```php
array(
	'type'        => 'multi_link',
	'id'          => 'example_multi_link',
	'label'       => 'Example Multi Link',
	'description' => 'Add multiple links',
	'post_type'   => array( 'post', 'page' ), // Optional, limits post selection to specific post types
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `multi_link` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have at least one value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(array)_ - Default values as an array of link objects
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `post_type` _(string|array)_ - Optional

Specifies which post types can be selected when creating a link to an internal post. Can be a single post type as a string or an array of post types. If not provided, all public post types will be available.

## Stored Value

The field stores an array of link objects in the database. Each link object contains the following properties:

- `url` _(string)_ - The URL of the link (either manually entered or generated from a post)
- `label` _(string)_ - The text to display for the link
- `target` _(string|null)_ - Set to `_blank` if the link should open in a new tab, or `null` otherwise
- `post` _(int|null)_ - The post ID if the link is to an internal post, or `null` for external links
- `post_type` _(string|null)_ - The post type if the link is to an internal post, or `null` for external links

## Example Usage

### Basic Multi Link Field

```php
'related_resources' => array(
	'type'        => 'multi_link',
	'id'          => 'related_resources',
	'label'       => 'Related Resources',
	'description' => 'Add links to related resources',
),
```

### Multi Link Limited to Specific Post Types

```php
'related_content' => array(
	'type'        => 'multi_link',
	'id'          => 'related_content',
	'label'       => 'Related Content',
	'description' => 'Select related posts or pages',
	'post_type'   => array( 'post', 'page' ),
),
```

### Multi Link with Default Values

```php
'social_links' => array(
	'type'        => 'multi_link',
	'id'          => 'social_links',
	'label'       => 'Social Media Links',
	'description' => 'Add links to your social media profiles',
	'default'     => array(
		array(
			'url'    => 'https://twitter.com/example',
			'label'  => 'Twitter',
			'target' => '_blank',
			'post'   => null,
			'post_type' => null,
		),
		array(
			'url'    => 'https://linkedin.com/in/example',
			'label'  => 'LinkedIn',
			'target' => '_blank',
			'post'   => null,
			'post_type' => null,
		),
	),
),
```

### Retrieving and Displaying Multi Link Values

```php
// Get the array of links
$related_resources = get_post_meta( get_the_ID(), 'related_resources', true );

if ( ! empty( $related_resources ) && is_array( $related_resources ) ) {
	echo '<div class="related-resources">';
	echo '<h3>Related Resources</h3>';
	echo '<ul>';
	
	foreach ( $related_resources as $link ) {
		// Skip links without URL or label
		if ( empty( $link['url'] ) || empty( $link['label'] ) ) {
			continue;
		}
		
		$target = ! empty( $link['target'] ) ? ' target="' . esc_attr( $link['target'] ) . '"' : '';
		$rel = ( ! empty( $link['target'] ) && $link['target'] === '_blank' ) ? ' rel="noopener noreferrer"' : '';
		
		echo '<li>';
		echo '<a href="' . esc_url( $link['url'] ) . '"' . $target . $rel . '>';
		echo esc_html( $link['label'] );
		echo '</a>';
		echo '</li>';
	}
	
	echo '</ul>';
	echo '</div>';
}
```

### Advanced Usage: Creating a Navigation Menu

```php
// Get the menu links
$menu_links = get_option( 'site_footer_menu', array() );

if ( ! empty( $menu_links ) && is_array( $menu_links ) ) {
	echo '<nav class="footer-navigation">';
	echo '<ul class="menu">';
	
	foreach ( $menu_links as $index => $link ) {
		if ( empty( $link['url'] ) || empty( $link['label'] ) ) {
			continue;
		}
		
		$classes = array( 'menu-item' );
		$classes[] = 'menu-item-' . $index;
		
		// Add active class if this is the current page
		if ( ! empty( $link['post'] ) && is_singular() && get_the_ID() === intval( $link['post'] ) ) {
			$classes[] = 'current-menu-item';
		}
		
		$target = ! empty( $link['target'] ) ? ' target="' . esc_attr( $link['target'] ) . '"' : '';
		$rel = ( ! empty( $link['target'] ) && $link['target'] === '_blank' ) ? ' rel="noopener noreferrer"' : '';
		
		echo '<li class="' . esc_attr( implode( ' ', $classes ) ) . '">';
		echo '<a href="' . esc_url( $link['url'] ) . '"' . $target . $rel . '>';
		echo esc_html( $link['label'] );
		echo '</a>';
		echo '</li>';
	}
	
	echo '</ul>';
	echo '</nav>';
}
```

## Notes

- The Multi Link field provides an "Add" button to add additional link inputs
- Each added link includes a "Remove" button to delete it
- The stored value is always an array of link objects, even if only one link is provided
- For each link, users can:
  - Enter a URL directly or select an internal post from the dropdown
  - Specify a label for the link
  - Choose whether the link should open in a new tab
- When a URL is entered and the field loses focus, the system attempts to fetch the page title as a suggested label
- The field automatically normalizes URLs (adding `https://` if missing)
- Empty links (with no URL or post selected) are not stored in the array
- This field is ideal for creating collections of links like related resources, navigation menus, or social media profiles