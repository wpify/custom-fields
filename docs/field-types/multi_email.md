# Multi Email Field Type

The Multi Email field type allows users to add multiple email address inputs. It provides a repeatable interface for collecting multiple email addresses with add/remove functionality and built-in email validation.

## Field Type: `multi_email`

```php
array(
	'type'        => 'multi_email',
	'id'          => 'example_multi_email',
	'label'       => 'Example Multi Email',
	'description' => 'Add multiple email addresses',
	'default'     => array( 'example@domain.com', 'contact@domain.com' ),
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `multi_email` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have at least one value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(array)_ - Default values as an array of email strings
- `attributes` _(array)_ - HTML attributes to add to each email input
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

This field type doesn't have any additional specific properties beyond the default ones.

## Stored Value

The field stores an array of email address strings in the database. Each email is validated to ensure it conforms to a basic email format (contains `@` and a domain with a dot).

## Example Usage

### Basic Multi Email Field

```php
'notification_emails' => array(
	'type'        => 'multi_email',
	'id'          => 'notification_emails',
	'label'       => 'Notification Emails',
	'description' => 'Add email addresses that should receive notifications',
),
```

### Multi Email with Default Values

```php
'team_emails' => array(
	'type'        => 'multi_email',
	'id'          => 'team_emails',
	'label'       => 'Team Email Addresses',
	'description' => 'Email addresses for team members',
	'default'     => array(
		'manager@company.com',
		'support@company.com',
	),
),
```

### Multi Email with Placeholder

```php
'contact_emails' => array(
	'type'        => 'multi_email',
	'id'          => 'contact_emails',
	'label'       => 'Contact Email Addresses',
	'description' => 'Enter email addresses for contacts',
	'attributes'  => array(
		'placeholder' => 'name@example.com',
	),
),
```

### Retrieving and Using Multi Email Values

```php
// Get the array of email addresses
$notification_emails = get_post_meta( get_the_ID(), 'notification_emails', true );

if ( ! empty( $notification_emails ) && is_array( $notification_emails ) ) {
	// Send a notification to all email addresses
	$subject = 'New content published: ' . get_the_title();
	$message = 'A new post has been published on your website: ' . get_permalink();
	$headers = array( 'Content-Type: text/html; charset=UTF-8' );
	
	foreach ( $notification_emails as $email ) {
		// Validate email address
		if ( is_email( $email ) ) {
			wp_mail( $email, $subject, $message, $headers );
		}
	}
	
	// Display the notification emails
	echo '<div class="notification-emails">';
	echo '<h3>Notification Recipients</h3>';
	echo '<ul>';
	
	foreach ( $notification_emails as $email ) {
		echo '<li>' . esc_html( $email ) . '</li>';
	}
	
	echo '</ul>';
	echo '</div>';
}
```

### Multi Email with Conditional Logic

```php
'enable_notifications' => array(
	'type'  => 'toggle',
	'id'    => 'enable_notifications',
	'label' => 'Enable Email Notifications',
),
'recipient_emails' => array(
	'type'       => 'multi_email',
	'id'         => 'recipient_emails',
	'label'      => 'Recipient Email Addresses',
	'conditions' => array(
		array( 'field' => 'enable_notifications', 'value' => true ),
	),
),
```

## Notes

- The Multi Email field provides an "Add" button to add additional email inputs
- Each added email input includes a "Remove" button to delete it
- The stored value is always an array, even if only one email is provided
- Each email address is validated for proper format (must include `@` and a domain with a period)
- Empty values are not stored in the array
- This field is useful for collecting multiple contact emails, notification recipients, or team member email addresses
- When retrieving emails for sending, it's good practice to use WordPress's `is_email()` function to verify validity