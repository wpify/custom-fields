# Link Field Type

The Link field type provides a comprehensive interface for creating and managing links. It supports both URLs and internal WordPress post links, making it versatile for navigation, call-to-action buttons, and other linked content.

## Field Type: `link`

```php
array(
	'type'      => 'link',
	'id'        => 'cta_link',
	'label'     => 'Call to Action',
	'post_type' => array( 'page', 'post' ),
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

#### `post_type` _(string|array)_ — Optional

Limits the post selection to specific post types. Can be a single post type as a string or an array of post types. If not specified, the field will only allow external URL input without post selection options.

## Stored Value

The Link field stores a structured array with the following keys:

```php
array(
	'url'       => 'https://example.com',
	'label'     => 'Visit Example',
	'target'    => '_blank',
	'post'      => 123,
	'post_type' => 'page',
)
```

- `url` _(string)_ — URL of the link
- `label` _(string)_ — Display text for the link
- `target` _(string|null)_ — Target attribute (`null` or `'_blank'`)
- `post` _(integer|null)_ — Post ID if linking to an internal post (`null` for external URLs)
- `post_type` _(string|null)_ — Post type if linking to an internal post (`null` for external URLs)

## Example Usage

### Basic External Link Field

```php
array(
	'type'        => 'link',
	'id'          => 'external_link',
	'label'       => 'External Resource',
	'description' => 'Add a link to an external resource.',
),
```

### Internal Post Link Field

```php
array(
	'type'        => 'link',
	'id'          => 'related_content',
	'label'       => 'Related Content',
	'description' => 'Link to a related page or post.',
	'post_type'   => array( 'page', 'post' ),
),
```

### Using Values in Your Theme

```php
$link = get_post_meta( get_the_ID(), 'external_link', true );

if ( ! empty( $link ) && ! empty( $link['url'] ) ) {
	$target = ! empty( $link['target'] ) ? ' target="' . esc_attr( $link['target'] ) . '"' : '';
	$label  = ! empty( $link['label'] ) ? $link['label'] : $link['url'];

	echo '<a href="' . esc_url( $link['url'] ) . '"' . $target . '>';
	echo esc_html( $label );
	echo '</a>';
}
```

### With Conditional Logic

```php
'show_cta' => array(
	'type'  => 'toggle',
	'id'    => 'show_cta',
	'label' => 'Show Call to Action',
),
'cta_link' => array(
	'type'       => 'link',
	'id'         => 'cta_link',
	'label'      => 'CTA Link',
	'post_type'  => array( 'page', 'post' ),
	'conditions' => array(
		array( 'field' => 'show_cta', 'value' => true ),
	),
),
```

## User Interface

The Link field provides a comprehensive UI with the following elements:

1. **Link Type Selector**: If `post_type` is specified, a dropdown to choose between URL or specific post types
2. **Post Selector**: Appears when a post type is selected, allowing the user to choose from existing content
3. **URL Input**: For entering external URLs
4. **"Open in new tab" Checkbox**: Controls the link's target attribute
5. **Label Input**: For specifying the link text displayed to visitors

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->link(
	label: 'Call to Action',
	post_type: 'page',
);
```

## Notes

- When entering a URL, the field will attempt to fetch the page title to use as the label automatically
- URLs are automatically normalized when the input field loses focus
- When selecting a post, the URL and label are automatically populated with the post's permalink and title
- The field title dynamically updates as you enter link details
- If you need to allow multiple links, use the `multi_link` field type instead
- The field includes validation to ensure that a valid link is provided when required
