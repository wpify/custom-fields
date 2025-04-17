# WooCommerce Membership Plan Options Integration

The WooCommerce Membership Plan Options integration adds custom fields to WooCommerce Membership plan edit screens. This allows you to store additional data for membership plans.

## Requirements

- WooCommerce
- WooCommerce Memberships plugin

## Usage

```php
$custom_fields = new \Wpify\CustomFields\CustomFields();

$custom_fields->create_wc_membership_plan_options(
	array(
		'tab'   => array(
			'label'    => 'Custom Fields',
			'priority' => 50,
		),
		'items' => array(
			array(
				'id'          => 'welcome_message',
				'type'        => 'wysiwyg',
				'label'       => 'Welcome Message',
				'description' => 'Message shown to new members',
			),
			array(
				'id'      => 'membership_color',
				'type'    => 'color',
				'label'   => 'Membership Color',
				'default' => '#3498db',
			),
		),
	)
);
```

## Parameters

### Required Parameters

- `tab` (array): Information about the tab where fields will appear
  - `label` (string): Tab display name (required)
  - `id` (string, optional): Unique ID (auto-generated from label if not provided)
  - `target` (string, optional): Target container ID (defaults to tab id)
  - `priority` (integer, optional): Order priority in tab list (default: 100)
  - `class` (array, optional): CSS classes for the tab
- `items` (array): Array of field definitions to display

### Optional Parameters

- `capability` (string): User capability required to view/edit fields (default: 'manage_options')
- `callback` (callable): Function to execute when rendering options
- `hook_priority` (integer): Priority for hooks (default: 10)
- `help_tabs` (array): Help tabs for the screen
- `help_sidebar` (string): Content for help sidebar
- `meta_key` (string): Custom option name for storing all fields as a single meta entry
- `tabs` (array): Additional tab configuration for organizing fields
- `display` (callable|boolean): Determines whether fields should be displayed

## Default WooCommerce Membership Plan Tabs

The WooCommerce Memberships plugin includes these default tabs that you can reference:

- `general`: General settings
- `restrict_content`: Content restriction settings
- `restrict_products`: Product restriction settings
- `purchasing_discount`: Purchasing discount settings
- `member_perks`: Member perks

## Data Storage

Custom field data is stored as post meta for the membership plan. Each field is saved as a separate meta entry by default, or you can specify a `meta_key` to store all fields as a single meta entry.

## Retrieving Data

You can retrieve the saved field values from a membership plan:

```php
$plan_id = get_the_ID(); // Or specify the plan ID
$welcome_message = get_post_meta( $plan_id, 'welcome_message', true );
$membership_color = get_post_meta( $plan_id, 'membership_color', true );

// If using meta_key
$custom_fields = get_post_meta( $plan_id, 'your_meta_key', true );
$welcome_message = isset( $custom_fields['welcome_message'] ) ? $custom_fields['welcome_message'] : '';
```

## Conditional Display

You can conditionally display fields based on a callback function:

```php
$custom_fields->create_wc_membership_plan_options(
	array(
		'tab'     => array(
			'label' => 'Custom Fields',
		),
		'items'   => array(
			// Field definitions
		),
		'display' => function( $plan_id ) {
			// Only show for specific membership plans
			return $plan_id == 123;
		},
	)
);
```

## Organizing Fields in Tabs

You can organize your fields into tabs for better user experience:

```php
$custom_fields->create_wc_membership_plan_options(
	array(
		'tab'  => array(
			'label' => 'Custom Fields',
		),
		'tabs' => array(
			array(
				'id'    => 'appearance',
				'label' => 'Appearance',
			),
			array(
				'id'    => 'content',
				'label' => 'Content',
			),
		),
		'items' => array(
			array(
				'id'    => 'membership_color',
				'type'  => 'color',
				'label' => 'Membership Color',
				'tab'   => 'appearance',
			),
			array(
				'id'    => 'welcome_message',
				'type'  => 'wysiwyg',
				'label' => 'Welcome Message',
				'tab'   => 'content',
			),
		),
	)
);
```