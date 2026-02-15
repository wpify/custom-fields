# Coupon Options Integration

The Coupon Options integration allows you to add custom fields to WooCommerce coupon edit screens. Fields can be added to existing coupon data tabs or organized in new custom tabs.

## Requirements

- WooCommerce plugin must be installed and active.

## Usage

```php
$custom_fields = new \Wpify\CustomFields\CustomFields();

// Add fields to a new custom tab
$custom_fields->create_coupon_options(
	array(
		'tab'   => array(
			'label'    => 'Custom Coupon Data',
			'priority' => 50,
		),
		'items' => array(
			array(
				'id'    => 'custom_text_field',
				'type'  => 'text',
				'label' => 'Custom Text',
			),
			array(
				'id'      => 'custom_select',
				'type'    => 'select',
				'label'   => 'Options',
				'options' => array(
					'option1' => 'Option 1',
					'option2' => 'Option 2',
				),
			),
		),
	)
);

// Add fields to an existing WooCommerce coupon tab
$custom_fields->create_coupon_options(
	array(
		'tab'   => array(
			'id'    => 'general', // Use existing WooCommerce tab ID
			'label' => 'General', // For reference only, won't change original tab name
		),
		'items' => array(
			array(
				'id'          => 'custom_coupon_field',
				'type'        => 'text',
				'label'       => 'Additional Coupon Info',
				'description' => 'Enter additional coupon information',
			),
		),
	)
);
```

## Parameters

### Required Parameters

- `tab` (array): Information about the tab where fields will appear
  - `label` (string): Tab display name
  - `id` (string, optional): Unique ID (auto-generated from label if not provided)
  - `target` (string, optional): Target container ID (defaults to tab id)
  - `priority` (integer, optional): Order priority in tab list
  - `class` (array, optional): CSS classes for the tab
- `items` (array): Array of field definitions to display

### Optional Parameters

- `capability` (string): Permission required to view/edit fields (default: 'manage_options')
- `callback` (callable): Function to run during field rendering
- `hook_priority` (integer): Priority for hooks (default: 10)
- `help_tabs` (array): Help tab information
- `help_sidebar` (string): Content for help sidebar
- `display` (callable|boolean): Boolean or callback to determine if fields should be displayed
- `meta_key` (string): Base meta key for storing values
- `tabs` (array): Additional tab configuration for organizing fields

## Existing WooCommerce Coupon Tabs

You can add fields to these existing WooCommerce coupon data tabs:

- `general`: General coupon settings (discount type, amount, free shipping, expiry)
- `usage_restriction`: Usage restriction settings (minimum/maximum spend, products, categories)
- `usage_limits`: Usage limits settings (per-coupon limit, per-user limit)

## Data Storage

Custom field data is stored as coupon (post) meta. Each field is saved as a separate meta entry by default, or you can specify a `meta_key` to store all fields as a single meta entry.

## Retrieving Data

You can retrieve the custom field values from a coupon using standard WooCommerce methods:

```php
$coupon = new WC_Coupon( $coupon_id );
$custom_text = $coupon->get_meta( 'custom_text_field' );
$custom_option = $coupon->get_meta( 'custom_select' );
```

Alternatively, you can use WordPress functions since coupons are stored as posts:

```php
$custom_text = get_post_meta( $coupon_id, 'custom_text_field', true );
```

## Conditional Display

You can conditionally display fields based on a callback function:

```php
$custom_fields->create_coupon_options(
	array(
		'tab'     => array(
			'label' => 'Custom Data',
		),
		'items'   => array(
			// Field definitions
		),
		'display' => function( $coupon_id ) {
			$coupon = new WC_Coupon( $coupon_id );

			// Only show for percentage discount coupons
			return $coupon->get_discount_type() === 'percent';
		},
	)
);
```

## Organizing Fields in Tabs

You can organize fields into tabs within your coupon data panel:

```php
$custom_fields->create_coupon_options(
	array(
		'tab'  => array(
			'label' => 'Custom Data',
		),
		'tabs' => array(
			array(
				'id'    => 'first_tab',
				'label' => 'First Tab',
			),
			array(
				'id'    => 'second_tab',
				'label' => 'Second Tab',
			),
		),
		'items' => array(
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
