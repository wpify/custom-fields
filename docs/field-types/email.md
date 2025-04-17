# Email Field Type

The Email field type provides an input field specifically designed for collecting email addresses, with built-in email format validation.

## Field Type: `email`

```php
array(
    'type'  => 'email',
    'id'    => 'example_email',
    'label' => 'Contact Email',
    'required' => true,
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `email` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have a value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(string)_ - Default email value for the field
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

The email field type doesn't have any additional specific properties beyond the default ones. The most commonly used are:

#### `attributes` _(array)_ - Optional

You can pass HTML attributes to the email input field. For example:

```php
'attributes' => array(
    'placeholder' => 'example@domain.com',
    'pattern' => '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$', // Optional additional validation pattern
    'autocomplete' => 'email',
),
```

## Stored Value

The field stores the email value as a string in the database.

## Validation

The Email field type includes built-in validation that:

1. Checks if the field is required and contains a value
2. Validates that the value matches a basic email format (contains `@` and domain parts)

## Example Usage

### Basic Email Field

```php
'contact_email' => array(
    'type'        => 'email',
    'id'          => 'contact_email',
    'label'       => 'Contact Email',
    'description' => 'Enter the primary contact email address.',
    'required'    => true,
    'attributes'  => array(
        'placeholder' => 'contact@example.com',
    ),
),
```

### Email Field with Default Value

```php
'notification_email' => array(
    'type'        => 'email',
    'id'          => 'notification_email',
    'label'       => 'Notification Email',
    'description' => 'Email address to receive notifications.',
    'default'     => 'notifications@example.com',
),
```

### Using Email Values in Your Theme or Plugin

```php
// Get the email value from the meta field
$contact_email = get_post_meta(get_the_ID(), 'contact_email', true);

if (!empty($contact_email)) {
    // Make sure to sanitize the output
    echo '<div class="contact-info">';
    echo 'Email: <a href="mailto:' . esc_attr($contact_email) . '">' . esc_html($contact_email) . '</a>';
    echo '</div>';
}
```

### Email Field with Conditional Logic

```php
'has_secondary_contact' => array(
    'type'  => 'toggle',
    'id'    => 'has_secondary_contact',
    'label' => 'Add Secondary Contact',
),
'secondary_email' => array(
    'type'        => 'email',
    'id'          => 'secondary_email',
    'label'       => 'Secondary Email',
    'description' => 'Enter an alternative contact email address.',
    'conditions'  => array(
        array('field' => 'has_secondary_contact', 'value' => true),
    ),
),
```

## Notes

- The email field uses the browser's native email input type, which may provide additional validation or specialized keyboards on mobile devices
- When retrieving email values for use in PHP, consider using the `sanitize_email()` WordPress function for additional sanitization
- The field validation helps ensure that collected emails at least match a basic email format, reducing the chance of storing invalid addresses