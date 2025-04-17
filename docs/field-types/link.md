# Link Field Type

The Link field type provides a comprehensive interface for creating and managing links. It supports both URLs and internal WordPress post links, making it versatile for navigation, call-to-action buttons, and other linked content.

## Field Type: `link`

```php
array(
	'type'      => 'link',
	'id'        => 'example_link',
	'label'     => 'Call to Action',
	'post_type' => array( 'page', 'post' ), // Optional - limits post selection to specific post types
)
```

## Properties

**For Default Field Properties, see [Field Types Definition](../field-types.md)**.

### `post_type` _(array|string)_ - Optional

Limits the post selection to specific post types. This can be a single post type as a string or an array of post types. If not specified, the field will only allow external URL input without post selection options.

## Stored Value

The Link field stores a structured array with the following properties:

```php
array(
	'url'       => 'https://example.com', // URL of the link
	'label'     => 'Visit Example',       // Display text for the link
	'target'    => '_blank',              // Target attribute (null or '_blank')
	'post'      => 123,                   // Post ID if linking to an internal post (null for external URLs)
	'post_type' => 'page',                // Post type if linking to an internal post (null for external URLs)
)
```

## User Interface

The Link field provides a comprehensive UI with the following elements:

1. **Link Type Selector**: If `post_type` is specified, a dropdown to choose between URL or specific post types
2. **Post Selector**: Appears when a post type is selected, allowing the user to choose from existing content
3. **URL Input**: For entering external URLs
4. **"Open in new tab" Checkbox**: Controls the link's target attribute
5. **Label Input**: For specifying the link text displayed to visitors

## Example Usage

### Basic External Link Field

```php
'external_link' => array(
	'type'        => 'link',
	'id'          => 'external_link',
	'label'       => 'External Resource',
	'description' => 'Add a link to an external resource.',
),
```

### Internal Post Link Field

```php
'related_content' => array(
	'type'        => 'link',
	'id'          => 'related_content',
	'label'       => 'Related Content',
	'description' => 'Link to a related page or post.',
	'post_type'   => array( 'page', 'post' ),
),
```

### Product Button Link

```php
'product_button' => array(
	'type'        => 'link',
	'id'          => 'product_button',
	'label'       => 'Product Button',
	'description' => 'Add a button linking to a product or external store.',
	'post_type'   => array( 'product', 'page' ),
),
```

### Using Link Values in Your Theme

```php
// Get the link value from the meta field
$link = get_post_meta( get_the_ID(), 'external_link', true );

if ( ! empty( $link ) && ! empty( $link['url'] ) ) {
	// Prepare target attribute
	$target = ! empty( $link['target'] ) ? ' target="' . esc_attr( $link['target'] ) . '"' : '';
	
	// Prepare label (fallback to URL if no label)
	$label = ! empty( $link['label'] ) ? $link['label'] : $link['url'];
	
	echo '<div class="custom-link">';
	echo '<a href="' . esc_url( $link['url'] ) . '"' . $target . '>';
	echo esc_html( $label );
	echo '</a>';
	echo '</div>';
}
```

## Features

1. **Automatic URL Normalization**: URLs are automatically normalized when the input field loses focus
2. **Automatic Title Fetching**: When entering a URL, the field will attempt to fetch the page title to use as the label
3. **Post Selection**: When linking to internal content, the field provides a search interface to find posts
4. **Open in New Tab Option**: Simple checkbox to set the target attribute
5. **Dynamic Link Preview**: The field title updates as you enter the link details

## Notes

- The Link field automatically updates its title based on the link label or URL
- When selecting a post, the URL and label are automatically populated with the post's permalink and title
- If you need to allow multiple links, consider using the `multi_link` field type
- The field includes validation to ensure that a valid link is provided when required