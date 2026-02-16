# Email Field Type

The Email field type provides an input field specifically designed for collecting email addresses, with built-in email format validation.

## Field Type: `email`

```php
array(
	'type'     => 'email',
	'id'       => 'example_email',
	'label'    => 'Contact Email',
	'required' => true,
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

This field type has no additional properties beyond the defaults.

## Stored Value

The field stores the email value as a string in the database. Built-in validation checks that the value matches a basic email format (contains `@` and domain parts).

## Example Usage

### Basic Email Field

```php
array(
	'type'        => 'email',
	'id'          => 'contact_email',
	'label'       => 'Contact Email',
	'description' => 'Enter the primary contact email address.',
	'required'    => true,
	'attributes'  => array(
		'placeholder' => 'contact@example.com',
	),
)
```

### Email Field with Default Value

```php
array(
	'type'        => 'email',
	'id'          => 'notification_email',
	'label'       => 'Notification Email',
	'description' => 'Email address to receive notifications.',
	'default'     => 'notifications@example.com',
)
```

### Using Values in Your Theme

```php
// Get the email value from the meta field
$contact_email = get_post_meta( get_the_ID(), 'contact_email', true );

if ( ! empty( $contact_email ) ) {
	echo '<div class="contact-info">';
	echo 'Email: <a href="mailto:' . esc_attr( $contact_email ) . '">' . esc_html( $contact_email ) . '</a>';
	echo '</div>';
}
```

### With Conditional Logic

```php
array(
	'type'  => 'toggle',
	'id'    => 'has_secondary_contact',
	'label' => 'Add Secondary Contact',
),
array(
	'type'        => 'email',
	'id'          => 'secondary_email',
	'label'       => 'Secondary Email',
	'description' => 'Enter an alternative contact email address.',
	'conditions'  => array(
		array( 'field' => 'has_secondary_contact', 'value' => true ),
	),
)
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->email(
	label: 'Email Address',
	required: true,
);
```

## Notes

- The email field uses the browser's native email input type, which may provide additional validation or specialized keyboards on mobile devices
- When retrieving email values for use in PHP, consider using the `sanitize_email()` WordPress function for additional sanitization
- The field validation helps ensure that collected emails at least match a basic email format, reducing the chance of storing invalid addresses
