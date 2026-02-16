# URL Field Type

The URL field type provides a specialized input for collecting and validating web addresses. It includes automatic URL normalization to ensure proper formatting and security of entered URLs.

## Field Type: `url`

```php
array(
	'type'  => 'url',
	'id'    => 'example_url',
	'label' => 'Website',
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

This field type has no additional properties beyond the defaults.

## Stored Value

The field stores the URL as a normalized string in the database. The normalization process:

1. Trims whitespace
2. Adds `https://` prefix if no protocol is specified
3. Converts protocol-relative URLs (starting with `//`) to use `https:`
4. Blocks disallowed schemes like `javascript:` or `data:` for security
5. Validates the URL structure

## Example Usage

### Basic Website Field

```php
array(
	'type'        => 'url',
	'id'          => 'company_website',
	'label'       => 'Company Website',
	'description' => 'Enter the company website URL.',
	'required'    => true,
	'attributes'  => array(
		'placeholder' => 'https://example.com',
	),
)
```

### Social Media Link

```php
array(
	'type'        => 'url',
	'id'          => 'twitter_profile',
	'label'       => 'Twitter Profile',
	'description' => 'Enter your Twitter/X profile URL.',
	'attributes'  => array(
		'placeholder' => 'https://twitter.com/username',
	),
)
```

### Using Values in Your Theme

```php
// Get the URL from the meta field
$company_website = get_post_meta( get_the_ID(), 'company_website', true );

if ( ! empty( $company_website ) ) {
	echo '<div class="company-website">';
	echo '<strong>Website:</strong> ';
	echo '<a href="' . esc_url( $company_website ) . '" target="_blank" rel="noopener">';

	// Display a cleaned version of the URL for output
	$display_url = preg_replace( '/^https?:\/\/(www\.)?/', '', $company_website );
	echo esc_html( $display_url );

	echo '</a>';
	echo '</div>';
}
```

### With Conditional Logic

```php
array(
	'type'  => 'toggle',
	'id'    => 'has_website',
	'label' => 'Has Website',
	'title' => 'This company has a website',
),
array(
	'type'        => 'url',
	'id'          => 'website_url',
	'label'       => 'Website URL',
	'description' => 'Enter the company website URL.',
	'conditions'  => array(
		array( 'field' => 'has_website', 'value' => true ),
	),
)
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->url(
	label: 'Website URL',
	required: true,
);
```

## Notes

- The URL field uses the browser's native URL input type, which may provide additional validation or specialized keyboards on mobile devices
- When the field loses focus, it automatically normalizes the URL (adds `https://` prefix, blocks dangerous schemes)
- When retrieving URL values for use in PHP, always use WordPress's `esc_url()` function when outputting the URL in HTML
- For multiple URLs, consider using the `multi_url` field type
- For more complex link data that includes both URL and text, consider using the [`link`](link.md) field type
