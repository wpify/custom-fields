# Multi Toggle Field Type

The Multi Toggle field type allows users to select multiple options using toggle switches. It provides an intuitive interface for enabling or disabling multiple options from a predefined set, similar to a group of on/off switches.

## Field Type: `multi_toggle`

```php
array(
	'type'    => 'multi_toggle',
	'id'      => 'example_multi_toggle',
	'label'   => 'Example Multi Toggle',
	'description' => 'Select multiple options',
	'options' => array(
		array( 'value' => 'option1', 'label' => 'Option 1', 'disabled' => false ),
		array( 'value' => 'option2', 'label' => 'Option 2', 'disabled' => false ),
		array( 'value' => 'option3', 'label' => 'Option 3', 'disabled' => false ),
	),
	'default' => array( 'option1' ),
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `multi_toggle` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have at least one option selected
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(array)_ - Default values as an array of option values
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `options` _(array)_ - Required

An array of objects that define the toggle options. Each object must have the following properties:

- `value` _(string)_ - The option value to be stored
- `label` _(string)_ - The text label displayed next to the toggle
- `disabled` _(boolean)_ - Optional, whether this specific option should be disabled

## Stored Value

The field stores an array of selected option values in the database. For example:

```php
array( 'option1', 'option3' )
```

## Example Usage

### Basic Multi Toggle Field

```php
'page_features' => array(
	'type'        => 'multi_toggle',
	'id'          => 'page_features',
	'label'       => 'Page Features',
	'description' => 'Enable/disable various page features',
	'options'     => array(
		array( 'value' => 'sidebar', 'label' => 'Show Sidebar' ),
		array( 'value' => 'comments', 'label' => 'Enable Comments' ),
		array( 'value' => 'share_buttons', 'label' => 'Show Share Buttons' ),
		array( 'value' => 'featured_image', 'label' => 'Display Featured Image' ),
	),
	'default'     => array( 'sidebar', 'featured_image' ),
),
```

### Multi Toggle with Disabled Options

```php
'user_permissions' => array(
	'type'        => 'multi_toggle',
	'id'          => 'user_permissions',
	'label'       => 'User Permissions',
	'description' => 'Set permissions for this user role',
	'options'     => array(
		array( 'value' => 'read', 'label' => 'Read Content', 'disabled' => false ),
		array( 'value' => 'create', 'label' => 'Create Content', 'disabled' => false ),
		array( 'value' => 'edit', 'label' => 'Edit Content', 'disabled' => false ),
		array( 'value' => 'delete', 'label' => 'Delete Content', 'disabled' => true ), // Disabled option
		array( 'value' => 'manage_users', 'label' => 'Manage Users', 'disabled' => true ), // Disabled option
	),
),
```

### Multi Toggle with HTML in Labels

```php
'newsletter_options' => array(
	'type'        => 'multi_toggle',
	'id'          => 'newsletter_options',
	'label'       => 'Newsletter Options',
	'description' => 'Configure newsletter settings',
	'options'     => array(
		array( 'value' => 'welcome_email', 'label' => 'Send welcome email <small>(recommended)</small>' ),
		array( 'value' => 'weekly_digest', 'label' => 'Send weekly digest <span class="new-tag">New!</span>' ),
		array( 'value' => 'promotional', 'label' => 'Promotional emails <em>(occasional offers)</em>' ),
		array( 'value' => 'unsubscribe_link', 'label' => '<strong>Include unsubscribe link</strong> <small>(required by law)</small>' ),
	),
	'default'     => array( 'welcome_email', 'unsubscribe_link' ),
),
```

### Retrieving and Using Multi Toggle Values

```php
// Get the array of selected page features
$page_features = get_post_meta( get_the_ID(), 'page_features', true );

if ( ! empty( $page_features ) && is_array( $page_features ) ) {
	// Check if specific features are enabled
	$show_sidebar = in_array( 'sidebar', $page_features, true );
	$show_comments = in_array( 'comments', $page_features, true );
	$show_share_buttons = in_array( 'share_buttons', $page_features, true );
	$show_featured_image = in_array( 'featured_image', $page_features, true );
	
	// Use the feature settings
	if ( $show_sidebar ) {
		// Add sidebar to the page
		add_filter( 'body_class', function( $classes ) {
			$classes[] = 'has-sidebar';
			return $classes;
		} );
	}
	
	if ( ! $show_comments ) {
		// Disable comments for this page
		add_filter( 'comments_open', '__return_false', 20, 2 );
		add_filter( 'pings_open', '__return_false', 20, 2 );
		
		// Hide the comments section
		add_filter( 'comments_template', function( $template ) {
			return dirname( __FILE__ ) . '/templates/empty-comments.php';
		}, 20 );
	}
	
	if ( $show_share_buttons ) {
		// Add share buttons to the content
		add_filter( 'the_content', function( $content ) {
			return $content . get_template_part( 'templates/share-buttons' );
		} );
	}
	
	if ( ! $show_featured_image ) {
		// Remove featured image from the page
		add_filter( 'post_thumbnail_html', '__return_false' );
	}
}
```

### Displaying Enabled Features as a List

```php
// Get the array of selected page features
$page_features = get_post_meta( get_the_ID(), 'page_features', true );

if ( ! empty( $page_features ) && is_array( $page_features ) ) {
	// Define labels for all possible features
	$feature_labels = array(
		'sidebar'        => 'Sidebar Navigation',
		'comments'       => 'Comment Section',
		'share_buttons'  => 'Social Sharing',
		'featured_image' => 'Featured Image',
	);
	
	// Display enabled features
	echo '<div class="enabled-features">';
	echo '<h4>Enabled Features:</h4>';
	echo '<ul>';
	
	foreach ( $page_features as $feature ) {
		if ( isset( $feature_labels[ $feature ] ) ) {
			echo '<li><span class="dashicons dashicons-yes"></span> ' . esc_html( $feature_labels[ $feature ] ) . '</li>';
		}
	}
	
	echo '</ul>';
	echo '</div>';
}
```

### Multi Toggle with Conditional Logic

```php
'has_custom_settings' => array(
	'type'  => 'toggle',
	'id'    => 'has_custom_settings',
	'label' => 'Use custom settings?',
	'title' => 'Enable custom settings for this page',
),
'custom_settings' => array(
	'type'       => 'multi_toggle',
	'id'         => 'custom_settings',
	'label'      => 'Custom Settings',
	'description' => 'Configure custom settings for this page',
	'options'    => array(
		array( 'value' => 'custom_header', 'label' => 'Custom Header' ),
		array( 'value' => 'custom_footer', 'label' => 'Custom Footer' ),
		array( 'value' => 'custom_background', 'label' => 'Custom Background' ),
	),
	'conditions' => array(
		array( 'field' => 'has_custom_settings', 'value' => true ),
	),
),
```

## Notes

- The Multi Toggle field displays each option as a toggle switch with a label
- Unlike checkboxes, toggle switches provide a clearer visual indication of on/off states
- The stored value is always an array of selected option values, even if only one option is selected
- The field supports HTML in option labels, allowing for more descriptive or styled labels
- Individual options can be disabled, showing them as unavailable but still visible
- This field is ideal for:
  - Feature toggles (enabling/disabling various features)
  - Permission settings
  - Configuration options
  - Any scenario requiring multiple on/off selections
- Toggle switches provide better user experience on touch devices compared to checkboxes