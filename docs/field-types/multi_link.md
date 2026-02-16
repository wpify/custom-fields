# Multi Link Field Type

The Multi Link field type allows users to add multiple links with URLs, labels, and additional options. Each link can be a direct URL or a reference to a WordPress post, making it useful for navigation menus, related resources, or any collection of links.

## Field Type: `multi_link`

```php
array(
	'type'      => 'multi_link',
	'id'        => 'example_multi_link',
	'label'     => 'Navigation Links',
	'post_type' => 'page',
	'min'       => 1,
	'max'       => 10,
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

- `post_type` _(string|array)_ — Optional: Post types available in the post picker when creating internal links. Can be a single post type or an array. If not provided, all public post types are available
- `min` _(integer)_ — Optional: Minimum number of items
- `max` _(integer)_ — Optional: Maximum number of items
- `buttons` _(array)_ — Optional: Custom button labels (add, remove, duplicate)
- `disabled_buttons` _(array)_ — Optional: Buttons to disable (move, delete, duplicate)

## Stored Value

The field stores an array of link objects in the database. Each link object contains:

- `url` _(string)_ — The URL of the link
- `label` _(string)_ — The display text for the link
- `target` _(string|null)_ — `'_blank'` if the link opens in a new tab, or `null`
- `post` _(int|null)_ — The post ID for internal links, or `null` for external links
- `post_type` _(string|null)_ — The post type for internal links, or `null` for external links

```php
array(
	array(
		'url'       => 'https://example.com/about',
		'label'     => 'About Us',
		'target'    => null,
		'post'      => 42,
		'post_type' => 'page',
	),
	array(
		'url'       => 'https://external.com',
		'label'     => 'External Resource',
		'target'    => '_blank',
		'post'      => null,
		'post_type' => null,
	),
)
```

## Example Usage

### Basic Multi Link

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
			'url'       => 'https://twitter.com/example',
			'label'     => 'Twitter',
			'target'    => '_blank',
			'post'      => null,
			'post_type' => null,
		),
	),
),
```

### Using Values in Your Theme

```php
$related_resources = get_post_meta( get_the_ID(), 'related_resources', true );

if ( ! empty( $related_resources ) && is_array( $related_resources ) ) {
	echo '<div class="related-resources">';
	echo '<h3>' . esc_html__( 'Related Resources', 'flavor' ) . '</h3>';
	echo '<ul>';

	foreach ( $related_resources as $link ) {
		if ( empty( $link['url'] ) || empty( $link['label'] ) ) {
			continue;
		}

		$target = ! empty( $link['target'] ) ? ' target="' . esc_attr( $link['target'] ) . '"' : '';
		$rel    = ( '_blank' === ( $link['target'] ?? '' ) ) ? ' rel="noopener noreferrer"' : '';

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

### With Conditional Logic

```php
'show_resources' => array(
	'type'  => 'toggle',
	'id'    => 'show_resources',
	'label' => 'Show Resources',
	'title' => 'Display a list of related resources',
),
'resource_links' => array(
	'type'       => 'multi_link',
	'id'         => 'resource_links',
	'label'      => 'Resource Links',
	'post_type'  => array( 'post', 'page' ),
	'conditions' => array(
		array( 'field' => 'show_resources', 'value' => true ),
	),
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->multi_link(
	label: 'Navigation Links',
	post_type: 'page',
	min: 1,
	max: 10,
);
```

## Notes

- Each link can be entered as a direct URL or selected from an internal post picker
- When a URL is entered and the field loses focus, the system attempts to fetch the page title as a suggested label
- The field automatically normalizes URLs by adding `https://` if missing
- Users can choose whether each link opens in a new tab
- Empty links (with no URL or post selected) are not stored in the array
- The stored value is always an array of link objects, even if only one link is provided
