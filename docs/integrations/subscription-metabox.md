# WooCommerce Subscription Metabox Integration

This integration allows you to add custom meta boxes with custom fields to WooCommerce subscription edit screens.

## Requirements

- WooCommerce
- WooCommerce Subscriptions plugin

## Usage

```php
$custom_fields = new \Wpify\CustomFields\CustomFields();

$custom_fields->create_subscription_metabox(
	array(
		'title'    => 'Additional Subscription Information',
		'items'    => array(
			array(
				'type'  => 'text',
				'name'  => 'subscriber_id',
				'label' => 'Subscriber ID',
			),
			array(
				'type'    => 'select',
				'name'    => 'subscription_source',
				'label'   => 'Subscription Source',
				'options' => array(
					'website' => 'Website',
					'phone'   => 'Phone',
					'email'   => 'Email',
					'other'   => 'Other',
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

Custom field data is stored as subscription meta data. This integration uses the appropriate WooCommerce Subscriptions API methods for storing and retrieving meta.

## Retrieving Data

You can retrieve the custom field values from a subscription using standard WooCommerce methods:

```php
$subscription = wcs_get_subscription( $subscription_id );
$subscriber_id = $subscription->get_meta( 'subscriber_id' );
$subscription_source = $subscription->get_meta( 'subscription_source' );
```

## Tabs

You can organize fields into tabs for better user experience:

```php
$custom_fields->create_subscription_metabox(
	array(
		'title' => 'Subscription Details',
		'tabs'  => array(
			array(
				'id'    => 'account',
				'label' => 'Account Information',
			),
			array(
				'id'    => 'preferences',
				'label' => 'Preferences',
			),
		),
		'items' => array(
			array(
				'type'  => 'text',
				'name'  => 'account_number',
				'label' => 'Account Number',
				'tab'   => 'account',
			),
			array(
				'type'    => 'select',
				'name'    => 'delivery_preference',
				'label'   => 'Delivery Preference',
				'options' => array(
					'standard'    => 'Standard',
					'expedited'   => 'Expedited',
					'economy'     => 'Economy',
				),
				'tab'     => 'preferences',
			),
		),
	)
);
```

## Conditional Display

You can conditionally display the metabox based on a callback function:

```php
$custom_fields->create_subscription_metabox(
	array(
		'title'   => 'Premium Subscription Details',
		'items'   => array(
			// Field definitions
		),
		'display' => function( $subscription_id ) {
			$subscription = wcs_get_subscription( $subscription_id );
			$total = $subscription->get_total();
			
			// Only show for subscriptions above a certain value
			return $total >= 100;
		},
	)
);
```