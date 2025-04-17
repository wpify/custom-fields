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

**For Default Field Properties, see [Field Types Definition](../field-types.md)**.

### `attributes` _(array)_ - Optional

You can pass HTML attributes to the URL input field. For example:

```php
'attributes' => array(
    'placeholder' => 'https://example.com',
    'class' => 'custom-url-field',
),
```

## User Interface

The URL field provides a standard text input with:

1. Type validation from the browser's native URL input
2. Automatic URL normalization when the field loses focus

## Stored Value

The field stores the URL as a normalized string in the database. The normalization process:

1. Trims whitespace
2. Adds 'https://' prefix if no protocol is specified
3. Converts protocol-relative URLs (starting with '//') to use 'https:'
4. Blocks disallowed schemes like 'javascript:' or 'data:' for security
5. Validates the URL structure

## Example Usage

### Basic Website Field

```php
'company_website' => array(
    'type'        => 'url',
    'id'          => 'company_website',
    'label'       => 'Company Website',
    'description' => 'Enter the company website URL.',
    'required'    => true,
    'attributes'  => array(
        'placeholder' => 'https://example.com',
    ),
),
```

### Social Media Link

```php
'twitter_profile' => array(
    'type'        => 'url',
    'id'          => 'twitter_profile',
    'label'       => 'Twitter Profile',
    'description' => 'Enter your Twitter/X profile URL.',
    'attributes'  => array(
        'placeholder' => 'https://twitter.com/username',
    ),
),
```

### Using URL Values in Your Theme

```php
// Get the URL from the meta field
$company_website = get_post_meta(get_the_ID(), 'company_website', true);

if (!empty($company_website)) {
    echo '<div class="company-website">';
    echo '<strong>Website:</strong> ';
    echo '<a href="' . esc_url($company_website) . '" target="_blank" rel="noopener">';
    
    // Display a cleaned version of the URL for output
    $display_url = preg_replace('/^https?:\/\/(www\.)?/', '', $company_website);
    echo esc_html($display_url);
    
    echo '</a>';
    echo '</div>';
}
```

### URL Field with Conditional Logic

```php
'has_website' => array(
    'type'  => 'toggle',
    'id'    => 'has_website',
    'label' => 'Has Website',
    'title' => 'This company has a website',
),
'website_url' => array(
    'type'        => 'url',
    'id'          => 'website_url',
    'label'       => 'Website URL',
    'description' => 'Enter the company website URL.',
    'conditions'  => array(
        array('field' => 'has_website', 'value' => true),
    ),
),
```

## Security Features

The URL field implements several security measures:

1. **Disallowed Schemes**: Blocks potentially dangerous URL schemes like `javascript:` and `data:` that could be used for XSS attacks
2. **HTTPS by Default**: Automatically upgrades URLs to use the HTTPS protocol
3. **URL Validation**: Ensures the URL has valid structure using the browser's native URL parser

## Notes

- The URL field uses the browser's native URL input type, which may provide additional validation or specialized keyboards on mobile devices
- When the field loses focus, it automatically normalizes the URL
- When retrieving URL values for use in PHP, always use WordPress's `esc_url()` function when outputting the URL in HTML
- The field is particularly useful for:
  - Website addresses
  - Social media profiles
  - Document URLs
  - API endpoints
- For multiple URLs, consider using the `multi_url` field type
- For more complex link data that includes both URL and text, consider using the `link` field type
- The field validates that a value is provided when the field is required