# Site Options Integration

The Site Options integration adds custom fields to the WordPress Multisite network admin. This allows you to create site-specific options pages that are accessible from the Sites menu in the network admin.

## Usage

```php
$custom_fields = new \Wpify\CustomFields\CustomFields();

$custom_fields->create_site_options(
	array(
		'page_title'  => 'Site Settings',
		'menu_title'  => 'Site Settings',
		'id'          => 'site-settings',
		'option_name' => 'site_custom_options',
		'items'       => array(
			array(
				'type'        => 'text',
				'id'          => 'site_api_key',
				'label'       => 'Site API Key',
				'description' => 'Enter the API key for this site',
			),
			array(
				'type'    => 'select',
				'id'      => 'site_status',
				'label'   => 'Site Status',
				'options' => array(
					'active'    => 'Active',
					'inactive'  => 'Inactive',
					'suspended' => 'Suspended',
				),
			),
		),
	)
);
```

## Parameters

### Required Parameters

- `page_title` (string): Title displayed at the top of the options page
- `menu_title` (string): Title displayed in the admin menu
- `id` (string): Unique identifier for the options page
- `items` (array): Array of field definitions to display on the page

### Optional Parameters

- `parent_slug` (string): Parent menu slug (default: 'settings.php')
- `capability` (string): Capability required to access the page (default: 'manage_options')
- `icon` (string): Menu icon (only used if parent_slug is empty)
- `position` (integer): Menu position (only used if parent_slug is empty)
- `tabs` (array): Configuration for tab organization of fields
- `option_name` (string): Name under which all options are stored
  - If not provided, each field is stored as a separate option
- `callback` (callable): Function to call when rendering the page
- `display` (callable|boolean): Determines whether the options page should be displayed
- `help_tabs` (array): Help tabs configuration
- `help_sidebar` (string): Content for the help sidebar
- `hook_priority` (integer): Priority for WordPress hooks (default: 10)

## Site Context

This integration works in the context of individual sites in a WordPress multisite network. The site ID is determined from the URL parameter when editing a site in the network admin.

## Data Storage

Options are stored in the site-specific options table using the standard WordPress options API. The site context is automatically determined.

- If `option_name` is provided, all fields are stored as a single serialized array
- If `option_name` is not provided, each field is stored as a separate option

## Retrieving Data

You can retrieve the saved options for a specific site using the WordPress functions with a specified blog ID:

```php
// Switch to the target site context
switch_to_blog( $site_id );

// If using option_name
$options = get_option( 'site_custom_options' );
$api_key = isset( $options['site_api_key'] ) ? $options['site_api_key'] : '';

// If not using option_name
$api_key = get_option( 'site_api_key', '' );

// Restore the original site context
restore_current_blog();
```

## Tabs

You can organize your fields into tabs for better user experience:

```php
$custom_fields->create_site_options(
	array(
		'page_title'  => 'Site Settings',
		'menu_title'  => 'Site Settings',
		'id'          => 'site-settings',
		'tabs'        => array(
			array(
				'id'    => 'general',
				'label' => 'General',
			),
			array(
				'id'    => 'advanced',
				'label' => 'Advanced',
			),
		),
		'items'       => array(
			array(
				'type'  => 'text',
				'id'    => 'site_name',
				'label' => 'Site Name',
				'tab'   => 'general',
			),
			array(
				'type'  => 'textarea',
				'id'    => 'site_custom_css',
				'label' => 'Custom CSS',
				'tab'   => 'advanced',
			),
		),
	)
);
```

## Conditional Display

You can conditionally display the options page based on a callback function:

```php
$custom_fields->create_site_options(
	array(
		'page_title' => 'Advanced Site Settings',
		'menu_title' => 'Advanced Settings',
		'id'         => 'advanced-site-settings',
		'items'      => array(
			// Field definitions
		),
		'display'    => function( $site_id ) {
			// Only show for certain site IDs
			return in_array( $site_id, array( 1, 5, 10 ) );
		},
	)
);
```