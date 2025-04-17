# Product Variation Options Integration

The Product Variation Options integration adds custom fields to WooCommerce product variation forms in the WordPress admin. This allows you to store and manage additional data for individual product variations.

## Usage

```php
$custom_fields = new \Wpify\CustomFields\CustomFields();

$custom_fields->create_product_variation_options(
	array(
		'tab'   => array(
			'label' => 'Custom Variation Fields',
		),
		'items' => array(
			array(
				'id'          => 'custom_text_field',
				'type'        => 'text',
				'label'       => 'Custom Text Field',
				'description' => 'Enter additional information for this variation',
			),
			array(
				'id'      => 'custom_select',
				'type'    => 'select',
				'label'   => 'Custom Options',
				'options' => array(
					'option1' => 'Option 1',
					'option2' => 'Option 2',
					'option3' => 'Option 3',
				),
			),
		),
		'after'      => 'pricing', // Show after pricing fields
		'capability' => 'manage_woocommerce', // Restrict to WooCommerce managers
	)
);
```

## Parameters

### Required Parameters

- `tab` (array): Information about the tab
  - `label` (string): Tab display name (required)
  - `id` (string, optional): Tab identifier (default: sanitized label)
  - `target` (string, optional): Target element for tab content (default: same as id)
  - `priority` (integer, optional): Tab display priority (default: 100)
  - `class` (array, optional): CSS classes for the tab (default: empty array)
- `items` (array): Array of field definitions to display

### Optional Parameters

- `display` (callable|boolean): Determines if custom fields should be shown (default: true)
- `capability` (string): User capability required to see/edit fields (default: 'manage_options')
- `callback` (callable): Function called to output content (default: null)
- `after` (string): Position to show fields (default: '')
  - Options: 'pricing', 'inventory', 'dimensions', 'download'
  - When empty, fields appear after all variable attributes
- `hook_priority` (integer): Priority for hooks (default: 10)
- `help_tabs` (array): Help tabs for the screen (default: empty array)
- `help_sidebar` (string): Text for help sidebar (default: '')
- `meta_key` (string): Meta key for storing values (default: '')
- `tabs` (array): Tabs for organizing custom fields (default: empty array)

## Field Positioning

The `after` parameter determines where your fields appear in the variation form:

- `pricing`: Fields appear after pricing fields
- `inventory`: Fields appear after inventory fields
- `dimensions`: Fields appear after dimension fields
- `download`: Fields appear after downloadable file fields
- Empty value or any other value: Fields appear after all variable attributes

## Data Storage

Custom field data is stored as variation meta data. Each field is saved as a separate meta entry by default, or you can specify a `meta_key` to store all fields as a single meta entry.

## Retrieving Data

You can retrieve the custom field values from a variation using standard WooCommerce methods:

```php
$variation = wc_get_product( $variation_id );
$custom_text = $variation->get_meta( 'custom_text_field' );
$custom_option = $variation->get_meta( 'custom_select' );
```

## Conditional Display

You can conditionally display fields based on a callback function:

```php
$custom_fields->create_product_variation_options(
	array(
		'tab'     => array(
			'label' => 'Custom Fields',
		),
		'items'   => array(
			// Field definitions
		),
		'display' => function( $variation_id ) {
			$variation = wc_get_product( $variation_id );
			$parent_id = $variation->get_parent_id();
			$product = wc_get_product( $parent_id );
			
			// Only show for variations of products in a specific category
			return has_term( 'clothing', 'product_cat', $parent_id );
		},
	)
);
```

## Organizing Fields in Tabs

You can organize variation fields into tabs for better organization:

```php
$custom_fields->create_product_variation_options(
	array(
		'tab'  => array(
			'label' => 'Custom Fields',
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