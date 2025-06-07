# User Profile

Add custom fields to WordPress user profiles. This integration allows you to extend user profiles with additional fields in both the user's own profile and when administrators edit other users.

## Example

```php
wpify_custom_fields()->create_user_options(
	array(
		'id'    => 'user_profile_fields',
		'title' => 'Additional Information',
		'tabs'  => array(
			'contact'    => 'Contact Details',
			'social'     => 'Social Profiles',
			'biography'  => 'Biography',
		),
		'items' => array(
			'job_title' => array(
				'type'        => 'text',
				'label'       => 'Job Title',
				'description' => 'Your position or job title',
				'tab'         => 'contact',
			),
			'phone' => array(
				'type'        => 'tel',
				'label'       => 'Phone Number',
				'description' => 'Your contact phone number',
				'tab'         => 'contact',
			),
			'social_profiles' => array(
				'type'        => 'multi_url',
				'label'       => 'Social Media Profiles',
				'description' => 'Add your social media profile links',
				'tab'         => 'social',
			),
			'extended_bio' => array(
				'type'        => 'wysiwyg',
				'label'       => 'Extended Biography',
				'description' => 'A more detailed biography than the standard WordPress bio field',
				'tab'         => 'biography',
				'height'      => 250,
			),
		),
		// Optional: Control when these fields appear
		'display' => function() {
			// Only show these fields for administrators
			return current_user_can( 'manage_options' );
		},
	)
);
```

## Arguments

### `$id` _(string)_

Unique identifier for this user profile fields implementation.

### `$title` _(string)_

Title that appears above the custom fields section.

### `$tabs` _(array)_

Tabs used for organizing the custom fields. See [Tabs](../features/tabs.md) for more information.

### `$items` _(array)_

List of the fields to be shown. See [Field Types](../field-types.md) for available field types.

### `$display` _(callable)_ - Optional

A callback function that returns a boolean to determine whether the custom fields should be displayed. This is useful for conditionally showing fields based on user roles or other criteria.

### `$init_priority` _(int)_ - Default: 10

Priority for the init hook when registering meta.

### `$meta_key` _(string)_

Meta key used to store the custom fields values. If meta key is not set, the individual fields will be stored as separate meta values.

## Using User Meta

Field values can be retrieved using the standard WordPress user meta functions:

```php
// Get a user's job title
$job_title = get_user_meta( $user_id, 'job_title', true );

// Get a user's phone number
$phone = get_user_meta( $user_id, 'phone', true );

// Get a user's social profiles (returns an array)
$social_profiles = get_user_meta( $user_id, 'social_profiles', true );
if ( ! empty( $social_profiles ) && is_array( $social_profiles ) ) {
	echo '<div class="social-links">';
	foreach ( $social_profiles as $profile_url ) {
		echo '<a href="' . esc_url( $profile_url ) . '" target="_blank" rel="noopener noreferrer">';
		// Determine icon based on URL
		if ( strpos( $profile_url, 'twitter.com' ) !== false ) {
			echo '<span class="twitter-icon">Twitter</span>';
		} elseif ( strpos( $profile_url, 'linkedin.com' ) !== false ) {
			echo '<span class="linkedin-icon">LinkedIn</span>';
		} else {
			echo '<span class="generic-icon">Profile</span>';
		}
		echo '</a>';
	}
	echo '</div>';
}

// Display extended biography
$extended_bio = get_user_meta( $user_id, 'extended_bio', true );
if ( ! empty( $extended_bio ) ) {
	echo '<div class="extended-biography">';
	echo apply_filters( 'the_content', $extended_bio );
	echo '</div>';
}
```

## Display Location

Custom user fields appear in two locations:

1. On the user's own profile page (accessible via "Your Profile")
2. When administrators edit other users' profiles

The fields appear in sections with the title specified in the configuration.
