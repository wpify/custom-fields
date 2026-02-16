# Group Field Type

The Group field type allows you to organize multiple fields into a logical group, creating a structured data format. Groups are ideal for collecting related information that should be stored and managed together.

## Field Type: `group`

```php
array(
	'type'  => 'group',
	'id'    => 'example_group',
	'label' => 'Contact Information',
	'items' => array(
		'name' => array(
			'type'  => 'text',
			'label' => 'Name',
		),
		'email' => array(
			'type'  => 'email',
			'label' => 'Email Address',
		),
		'phone' => array(
			'type'  => 'tel',
			'label' => 'Phone Number',
		),
	),
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

#### `items` _(array)_ — Required

An array of child field definitions that make up the group. Each item is a complete field definition with its own type, label, and other properties. Items can be defined as an associative array (keys become field IDs) or as a numeric array where each field has an explicit `id` property.

## Stored Value

The Group field stores values as an associative array, with each child field's value accessible by its ID:

```php
array(
	'name'  => 'John Doe',
	'email' => 'john@example.com',
	'phone' => '555-123-4567',
)
```

## Example Usage

### Basic Contact Information Group

```php
array(
	'type'        => 'group',
	'id'          => 'contact_info',
	'label'       => 'Contact Information',
	'description' => 'Enter primary contact details.',
	'items'       => array(
		'name' => array(
			'type'     => 'text',
			'label'    => 'Full Name',
			'required' => true,
		),
		'position' => array(
			'type'  => 'text',
			'label' => 'Position/Title',
		),
		'email' => array(
			'type'     => 'email',
			'label'    => 'Email Address',
			'required' => true,
		),
		'phone' => array(
			'type'  => 'tel',
			'label' => 'Phone Number',
		),
	),
)
```

### Nested Groups for Complex Data

```php
array(
	'type'  => 'group',
	'id'    => 'business_details',
	'label' => 'Business Details',
	'items' => array(
		'company_name' => array(
			'type'     => 'text',
			'label'    => 'Company Name',
			'required' => true,
		),
		'address' => array(
			'type'  => 'group',
			'label' => 'Address',
			'items' => array(
				'street' => array(
					'type'  => 'text',
					'label' => 'Street Address',
				),
				'city' => array(
					'type'  => 'text',
					'label' => 'City',
				),
				'state' => array(
					'type'  => 'text',
					'label' => 'State/Province',
				),
				'postal_code' => array(
					'type'  => 'text',
					'label' => 'Postal Code',
				),
				'country' => array(
					'type'    => 'select',
					'label'   => 'Country',
					'options' => array(
						'us' => 'United States',
						'ca' => 'Canada',
						// More countries...
					),
				),
			),
		),
	),
)
```

### Using Values in Your Theme

```php
// Get the group value from the meta field
$contact_info = get_post_meta( get_the_ID(), 'contact_info', true );

if ( ! empty( $contact_info ) ) {
	echo '<div class="contact-card">';

	if ( ! empty( $contact_info['name'] ) ) {
		echo '<h3>' . esc_html( $contact_info['name'] ) . '</h3>';
	}

	if ( ! empty( $contact_info['position'] ) ) {
		echo '<p class="position">' . esc_html( $contact_info['position'] ) . '</p>';
	}

	if ( ! empty( $contact_info['email'] ) ) {
		echo '<p class="email"><strong>Email:</strong> ';
		echo '<a href="mailto:' . esc_attr( $contact_info['email'] ) . '">';
		echo esc_html( $contact_info['email'] ) . '</a></p>';
	}

	if ( ! empty( $contact_info['phone'] ) ) {
		echo '<p class="phone"><strong>Phone:</strong> ';
		echo esc_html( $contact_info['phone'] ) . '</p>';
	}

	echo '</div>';
}
```

### With Conditional Logic

```php
array(
	'type'  => 'toggle',
	'id'    => 'has_contact_info',
	'label' => 'Contact Information',
	'title' => 'Include contact information',
),
array(
	'type'        => 'group',
	'id'          => 'contact_info',
	'label'       => 'Contact Information',
	'items'       => array(
		'name' => array(
			'type'     => 'text',
			'label'    => 'Full Name',
			'required' => true,
		),
		'email' => array(
			'type'  => 'email',
			'label' => 'Email Address',
		),
	),
	'conditions'  => array(
		array( 'field' => 'has_contact_info', 'value' => true ),
	),
)
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->group(
	label: 'Contact Information',
	items: array(
		$f->text( label: 'Name', required: true ),
		$f->email( label: 'Email' ),
		$f->tel( label: 'Phone' ),
	),
);
```

## Notes

- The Group field automatically sets its display title based on the first non-empty text or number field in the group
- Groups can be nested for more complex data structures (a group can contain another group)
- Groups are useful for organizing related fields that should be edited together
- Unlike the [`multi_group`](multi_group.md) field type, a Group field does not support repeating multiple sets of the same fields
- Fields inside a group should not have the `tab` property, as tab navigation is only applicable to root-level fields
- When saving a group to post meta, the entire group structure is saved as a single serialized array in the database, making it efficient for related data
- The Group field performs validation on each of its child fields according to their individual validation rules; if any child field fails validation, the entire group is considered invalid
