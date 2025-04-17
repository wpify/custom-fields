# Order Metabox Integration

This integration allows you to add custom meta boxes with custom fields to WooCommerce order edit screens. It is designed to work with both traditional post-based orders and the WooCommerce HPOS (High-Performance Order Storage) architecture.

![Order Metabox Integration](../images/integration-metabox.png)

## Usage

```php
$custom_fields = new \Wpify\CustomFields\CustomFields();

$custom_fields->create_order_metabox(
	array(
		'title'    => 'Additional Order Information',
		'items'    => array(
			array(
				'type'  => 'text',
				'name'  => 'tracking_number',
				'label' => 'Tracking Number',
			),
			array(
				'type'    => 'select',
				'name'    => 'shipping_provider',
				'label'   => 'Shipping Provider',
				'options' => array(
					'ups'   => 'UPS',
					'fedex' => 'FedEx',
					'usps'  => 'USPS',
				),
			),
		),
		'context'  => 'side',
		'priority' => 'high',
	)
);
```

## Parameters

### Required Parameters

- `title` (string): The title of the metabox
- `items` (array): Array of field definitions to display in the metabox

### Optional Parameters

- `context` (string): Position of the metabox on the screen
  - Default: 'advanced'
  - Options: 'normal', 'side', 'advanced'
- `priority` (string): Priority within the selected context
  - Default: 'default'
  - Options: 'high', 'core', 'default', 'low'
- `meta_key` (string): Meta key used to store custom fields values
- `capability` (string): Required capability to view/edit metabox
  - Default: 'manage_woocommerce'
- `callback` (callable): Additional function to execute when rendering the metabox
- `tabs` (array): Tab configuration for organizing fields
- `display` (callable|boolean): Determines whether the metabox should be displayed

## Data Storage

Custom field data is stored as order meta data. The integration automatically uses the appropriate storage method based on whether WooCommerce HPOS is enabled.

## Retrieving Data

You can retrieve the custom field values from an order using standard WooCommerce methods:

```php
$order = wc_get_order( $order_id );
$tracking_number = $order->get_meta( 'tracking_number' );
$shipping_provider = $order->get_meta( 'shipping_provider' );
```

## Tabs

You can organize fields into tabs for better user experience:

```php
$custom_fields->create_order_metabox(
	array(
		'title' => 'Order Details',
		'tabs'  => array(
			array(
				'id'    => 'shipping',
				'label' => 'Shipping Information',
			),
			array(
				'id'    => 'billing',
				'label' => 'Billing Information',
			),
		),
		'items' => array(
			array(
				'type'  => 'text',
				'name'  => 'tracking_number',
				'label' => 'Tracking Number',
				'tab'   => 'shipping',
			),
			array(
				'type'  => 'text',
				'name'  => 'invoice_number',
				'label' => 'Invoice Number',
				'tab'   => 'billing',
			),
		),
	)
);
```

## Conditional Display

You can conditionally display the metabox based on a callback function:

```php
$custom_fields->create_order_metabox(
	array(
		'title'   => 'International Shipping Details',
		'items'   => array(
			// Field definitions
		),
		'display' => function( $order_id ) {
			$order = wc_get_order( $order_id );
			$shipping_country = $order->get_shipping_country();
			
			// Only show for international orders
			return $shipping_country !== 'US';
		},
	)
);
```