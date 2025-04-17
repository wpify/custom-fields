# Product Options Integration

The Product Options integration allows you to add custom fields to WooCommerce product edit screens. Fields can be added to existing product data tabs or organized in new custom tabs.

## Usage

```php
$custom_fields = new \Wpify\CustomFields\CustomFields();

// Add fields to a new custom tab
$custom_fields->create_product_options(
	array(
		'tab'   => array(
			'label'    => 'Custom Product Data',
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

// Add fields to an existing WooCommerce tab
$custom_fields->create_product_options(
	array(
		'tab'   => array(
			'id'    => 'inventory', // Use existing WooCommerce tab ID
			'label' => 'Inventory', // For reference only, won't change original tab name
		),
		'items' => array(
			array(
				'id'          => 'custom_inventory_field',
				'type'        => 'text',
				'label'       => 'Additional Stock Info',
				'description' => 'Enter additional inventory information',
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

## Existing WooCommerce Product Tabs

You can add fields to these existing WooCommerce product data tabs:

- `general`: General product information
- `inventory`: Inventory management
- `shipping`: Shipping options
- `linked_product`: Linked products
- `attribute`: Product attributes
- `variations`: Product variations (variable products only)
- `advanced`: Advanced settings
- `custom_tabs` from third-party plugins

## Data Storage

Custom field data is stored as product meta. Each field is saved as a separate meta entry by default, or you can specify a `meta_key` to store all fields as a single meta entry.

## Retrieving Data

You can retrieve the custom field values from a product using standard WooCommerce methods:

```php
$product = wc_get_product( $product_id );
$custom_text = $product->get_meta( 'custom_text_field' );
$custom_option = $product->get_meta( 'custom_select' );
```

## Conditional Display

You can conditionally display fields based on a callback function:

```php
$custom_fields->create_product_options(
	array(
		'tab'     => array(
			'label' => 'Custom Data',
		),
		'items'   => array(
			// Field definitions
		),
		'display' => function( $product_id ) {
			$product = wc_get_product( $product_id );
			
			// Only show for simple products
			return $product->is_type( 'simple' );
		},
	)
);
```

## Organizing Fields in Tabs

You can organize fields into tabs within your product data panel:

```php
$custom_fields->create_product_options(
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