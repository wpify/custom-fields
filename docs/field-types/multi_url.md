# Multi URL Field Type

The Multi URL field type allows users to add multiple URL inputs. It provides a repeatable interface for collecting multiple web addresses with add/remove functionality and automatic URL normalization.

## Field Type: `multi_url`

```php
array(
	'type'        => 'multi_url',
	'id'          => 'example_multi_url',
	'label'       => 'Example Multi URL',
	'description' => 'Add multiple URLs',
	'default'     => array( 'https://example.com', 'https://wordpress.org' ),
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `multi_url` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have at least one value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(array)_ - Default values as an array of URL strings
- `attributes` _(array)_ - HTML attributes to add to each URL input
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `min` _(number)_ - Optional

The minimum number of entries required. If specified, the user won't be able to remove entries below this number.

#### `max` _(number)_ - Optional

The maximum number of entries allowed. If specified, the user won't be able to add entries beyond this number.

#### `buttons` _(array)_ - Optional

Custom text for buttons. Example: `array( 'add' => 'Add New URL', 'remove' => 'Remove' )`.

## Stored Value

The field stores an array of URL strings in the database. URLs are automatically normalized (adding 'https://' if missing) when the input field loses focus.

## Example Usage

### Basic Multi URL Field

```php
'social_profiles' => array(
	'type'        => 'multi_url',
	'id'          => 'social_profiles',
	'label'       => 'Social Media Profiles',
	'description' => 'Add links to your social media profiles',
),
```

### Multi URL with Input Attributes

```php
'external_resources' => array(
	'type'        => 'multi_url',
	'id'          => 'external_resources',
	'label'       => 'External Resources',
	'description' => 'Add URLs to external resources',
	'attributes'  => array(
		'placeholder' => 'https://example.com',
		'class'       => 'wide-url-input',
	),
),
```

### Multi URL with Min/Max Values

```php
'partner_websites' => array(
	'type'        => 'multi_url',
	'id'          => 'partner_websites',
	'label'       => 'Partner Websites',
	'description' => 'Add 2-5 partner website URLs',
	'min'         => 2,
	'max'         => 5,
),
```

### Retrieving and Displaying Multi URL Values

```php
// Get the array of social profile URLs
$social_profiles = get_post_meta( get_the_ID(), 'social_profiles', true );

if ( ! empty( $social_profiles ) && is_array( $social_profiles ) ) {
	echo '<div class="social-profiles">';
	echo '<h3>Follow Us</h3>';
	echo '<ul class="social-icons">';
	
	foreach ( $social_profiles as $url ) {
		// Skip empty values
		if ( empty( $url ) ) {
			continue;
		}
		
		// Determine icon based on URL
		$icon_class = 'dashicons-admin-links'; // Default icon
		
		if ( strpos( $url, 'facebook.com' ) !== false ) {
			$icon_class = 'dashicons-facebook';
		} elseif ( strpos( $url, 'twitter.com' ) !== false || strpos( $url, 'x.com' ) !== false ) {
			$icon_class = 'dashicons-twitter';
		} elseif ( strpos( $url, 'instagram.com' ) !== false ) {
			$icon_class = 'dashicons-instagram';
		} elseif ( strpos( $url, 'linkedin.com' ) !== false ) {
			$icon_class = 'dashicons-linkedin';
		} elseif ( strpos( $url, 'youtube.com' ) !== false ) {
			$icon_class = 'dashicons-youtube';
		}
		
		echo '<li class="social-icon">';
		echo '<a href="' . esc_url( $url ) . '" target="_blank" rel="noopener noreferrer">';
		echo '<span class="dashicons ' . esc_attr( $icon_class ) . '"></span>';
		echo '</a>';
		echo '</li>';
	}
	
	echo '</ul>';
	echo '</div>';
}
```

### Creating a Resources Section

```php
// Get the array of external resource URLs
$resources = get_post_meta( get_the_ID(), 'external_resources', true );

if ( ! empty( $resources ) && is_array( $resources ) ) {
	echo '<div class="resources-section">';
	echo '<h3>Additional Resources</h3>';
	echo '<div class="resource-list">';
	
	foreach ( $resources as $index => $url ) {
		if ( empty( $url ) ) {
			continue;
		}
		
		// Try to get the domain name for display
		$domain = preg_replace( '/^https?:\/\//', '', $url );
		$domain = preg_replace( '/\/.*$/', '', $domain );
		$label = $domain ? $domain : 'Resource ' . ( $index + 1 );
		
		echo '<div class="resource-item">';
		echo '<a href="' . esc_url( $url ) . '" target="_blank" rel="noopener noreferrer">';
		echo '<span class="resource-icon dashicons dashicons-admin-site"></span>';
		echo '<span class="resource-label">' . esc_html( $label ) . '</span>';
		echo '<span class="resource-url">' . esc_html( $url ) . '</span>';
		echo '</a>';
		echo '</div>';
	}
	
	echo '</div>';
	echo '</div>';
}
```

### Adding Multiple Links to Schema.org Structured Data

```php
// Get the array of partner website URLs
$partner_websites = get_post_meta( get_the_ID(), 'partner_websites', true );

if ( ! empty( $partner_websites ) && is_array( $partner_websites ) ) {
	// Generate schema.org structured data for partner organizations
	$partners_schema = array();
	
	foreach ( $partner_websites as $url ) {
		if ( ! empty( $url ) ) {
			$partners_schema[] = array(
				'@type'       => 'Organization',
				'url'         => $url,
				'sameAs'      => $url,
				'description' => 'Partner organization',
			);
		}
	}
	
	if ( ! empty( $partners_schema ) ) {
		$organization_schema = array(
			'@context'    => 'https://schema.org',
			'@type'       => 'Organization',
			'name'        => get_bloginfo( 'name' ),
			'url'         => home_url(),
			'knowsAbout'  => $partners_schema,
			'memberOf'    => $partners_schema,
		);
		
		echo '<script type="application/ld+json">';
		echo wp_json_encode( $organization_schema );
		echo '</script>';
	}
}
```

### Multi URL with Conditional Logic

```php
'has_references' => array(
	'type'  => 'toggle',
	'id'    => 'has_references',
	'label' => 'Include references?',
),
'reference_links' => array(
	'type'       => 'multi_url',
	'id'         => 'reference_links',
	'label'      => 'Reference Links',
	'description' => 'Add URLs to reference sources',
	'conditions' => array(
		array( 'field' => 'has_references', 'value' => true ),
	),
),
```

## Notes

- The Multi URL field provides an "Add" button to add additional URL inputs
- Each added URL input includes a "Remove" button to delete it
- The stored value is always an array, even if only one URL is provided
- URLs are automatically normalized when the field loses focus:
  - Missing protocol is set to "https://"
  - "http://" is converted to "https://"
  - Invalid URLs are converted to empty strings
  - URLs are validated against scheme attacks (javascript: and data: URLs are removed)
- The browser provides native validation for URL format
- Empty URL inputs are stored as empty strings in the array
- This field is ideal for collecting:
  - Social media profile links
  - Reference or resource links
  - Partner or affiliate website URLs
  - Any scenario requiring multiple web addresses