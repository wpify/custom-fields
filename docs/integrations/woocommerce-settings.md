# WooCommerce Settings Integration

The WooCommerce Settings integration allows you to add custom fields to WooCommerce settings pages. You can create new tabs in WooCommerce settings or add sections to existing tabs.

## Usage

```php
$custom_fields = new \Wpify\CustomFields\CustomFields();

// Add a new tab with custom fields
$custom_fields->create_woocommerce_settings(
	array(
		'tab'     => array(
			'id'    => 'custom_settings',
			'label' => 'Custom Settings',
		),
		'section' => array(
			'id'    => 'general_section',
			'label' => 'General Settings',
		),
		'items'   => array(
			array(
				'id'          => 'custom_text_setting',
				'type'        => 'text',
				'label'       => 'Custom Text Setting',
				'description' => 'Description for the custom text setting',
			),
			array(
				'id'      => 'custom_select_setting',
				'type'    => 'select',
				'label'   => 'Custom Select Setting',
				'options' => array(
					'option1' => 'Option 1',
					'option2' => 'Option 2',
				),
			),
		),
		'option_name' => 'my_custom_wc_settings', // All fields stored under this option
	)
);

// Add a section to an existing WooCommerce tab
$custom_fields->create_woocommerce_settings(
	array(
		'tab'     => array(
			'id'    => 'products', // Existing WooCommerce tab
			'label' => 'Products', // For reference only
		),
		'section' => array(
			'id'    => 'custom_product_settings',
			'label' => 'Custom Product Settings',
		),
		'items'   => array(
			// Field definitions
		),
	)
);
```

## Parameters

### Required Parameters

- `tab` (array): Information about the WooCommerce settings tab
  - `id` (string): Identifier for the tab
  - `label` (string): Display name for the tab
- `items` (array): Array of field definitions to display in the section

### Optional Parameters

- `section` (array): Information about the section within the tab
  - `id` (string): Identifier for the section
  - `label` (string): Display name for the section
- `tabs` (array): Used for organizing fields into tabs within the custom fields interface
- `option_name` (string): Name under which all field values are stored as a group
  - If not provided, each field value is stored as a separate option
- `display` (callable|boolean): Determines whether to display the fields (default: true)
- `id` (string): Unique identifier for this instance (auto-generated if not provided)

## Existing WooCommerce Settings Tabs

You can add sections to these existing WooCommerce settings tabs:

- `general`: General settings
- `products`: Product settings
- `shipping`: Shipping settings
- `tax`: Tax settings
- `checkout`: Checkout settings
- `account`: Account settings
- `email`: Email settings
- `advanced`: Advanced settings
- Custom tabs from third-party plugins

## Data Storage

When using this integration, field values are stored in the WordPress options table:

- If `option_name` is provided, all fields are stored as a single serialized array under that option name
- If `option_name` is not provided, each field is stored as a separate option with the field ID as the option name

## Retrieving Data

You can retrieve the saved field values:

```php
// If using option_name
$options = get_option( 'my_custom_wc_settings' );
$custom_text = isset( $options['custom_text_setting'] ) ? $options['custom_text_setting'] : '';

// If not using option_name
$custom_text = get_option( 'custom_text_setting', '' );
```

## Conditional Display

You can conditionally display the settings section based on a callback function:

```php
$custom_fields->create_woocommerce_settings(
	array(
		'tab'     => array(
			'id'    => 'products',
			'label' => 'Products',
		),
		'section' => array(
			'id'    => 'special_settings',
			'label' => 'Special Settings',
		),
		'items'   => array(
			// Field definitions
		),
		'display' => function() {
			// Only show if a specific plugin is active
			return is_plugin_active( 'some-plugin/some-plugin.php' );
		},
	)
);
```

## Organizing Fields in Tabs

You can organize your settings fields into tabs for better user experience:

```php
$custom_fields->create_woocommerce_settings(
	array(
		'tab'     => array(
			'id'    => 'custom_settings',
			'label' => 'Custom Settings',
		),
		'section' => array(
			'id'    => 'general_section',
			'label' => 'General Settings',
		),
		'tabs'    => array(
			array(
				'id'    => 'first_tab',
				'label' => 'First Tab',
			),
			array(
				'id'    => 'second_tab',
				'label' => 'Second Tab',
			),
		),
		'items'   => array(
			array(
				'id'    => 'field_in_first_tab',
				'type'  => 'text',
				'label' => 'Field in First Tab',
				'tab'   => 'first_tab',
			),
			array(
				'id'    => 'field_in_second_tab',
				'type'  => 'text',
				'label' => 'Field in Second Tab',
				'tab'   => 'second_tab',
			),
		),
	)
);
```