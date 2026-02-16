# Multi Email Field Type

The Multi Email field type provides a repeatable interface for collecting multiple email addresses with add/remove functionality and built-in email validation.

## Field Type: `multi_email`

```php
array(
	'type'  => 'multi_email',
	'label' => 'Email Addresses',
	'min'   => 1,
	'max'   => 5,
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

#### `min` _(integer)_ — Optional

Minimum number of items. Users cannot remove items below this count.

#### `max` _(integer)_ — Optional

Maximum number of items. Users cannot add items beyond this count.

#### `buttons` _(array)_ — Optional

Custom button labels. Supports keys: `add`, `remove`, `duplicate`.

#### `disabled_buttons` _(array)_ — Optional

Array of buttons to disable. Options: `'move'`, `'delete'`, `'duplicate'`.

## Stored Value

An array of email address strings.

## Example Usage

### Basic Multi Email Field

```php
'notification_emails' => array(
	'type'        => 'multi_email',
	'label'       => 'Notification Emails',
	'description' => 'Add email addresses that should receive notifications',
),
```

### With Default Values

```php
'team_emails' => array(
	'type'    => 'multi_email',
	'label'   => 'Team Email Addresses',
	'default' => array(
		'manager@company.com',
		'support@company.com',
	),
),
```

### Using Values in Your Theme

```php
$notification_emails = get_post_meta( get_the_ID(), 'notification_emails', true );

if ( ! empty( $notification_emails ) && is_array( $notification_emails ) ) {
	echo '<ul>';

	foreach ( $notification_emails as $email ) {
		if ( ! is_email( $email ) ) {
			continue;
		}

		echo '<li><a href="mailto:' . esc_attr( $email ) . '">' . esc_html( $email ) . '</a></li>';
	}

	echo '</ul>';
}
```

### With Conditional Logic

```php
'enable_notifications' => array(
	'type'  => 'toggle',
	'id'    => 'enable_notifications',
	'label' => 'Enable Email Notifications',
),
'recipient_emails' => array(
	'type'       => 'multi_email',
	'label'      => 'Recipient Email Addresses',
	'conditions' => array(
		array( 'field' => 'enable_notifications', 'value' => true ),
	),
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->multi_email(
	label: 'Email Addresses',
	min: 1,
	max: 5,
);
```

## Notes

- The stored value is always an array, even if only one email address is provided.
- Each email address is validated for proper format (must include `@` and a domain with a period).
- When retrieving emails for sending, use WordPress's `is_email()` function to verify validity.
- Items can be reordered by dragging unless the `move` button is disabled.
- Ideal for collecting notification recipients, team contacts, or any scenario requiring multiple email addresses.
