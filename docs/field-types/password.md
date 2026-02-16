# Password Field Type

The Password field type provides a specialized input field for collecting passwords or other sensitive information. The field masks the entered text, displaying bullets or asterisks instead of the actual characters, providing basic visual security during input.

## Field Type: `password`

```php
array(
	'type'  => 'password',
	'id'    => 'example_password',
	'label' => 'API Key',
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

This field type has no additional properties beyond the defaults.

## Stored Value

The field stores the value as a plain text string in the database.

> **IMPORTANT SECURITY NOTE**: The password is stored as plain text in the database. This field type is NOT intended for user authentication passwords. It should only be used for storing API keys, tokens, or other credentials where WordPress-native password hashing is not necessary.

## Example Usage

### API Key Field

```php
array(
	'type'        => 'password',
	'id'          => 'api_key',
	'label'       => 'API Key',
	'description' => 'Enter your API key. This will be stored securely.',
	'required'    => true,
	'attributes'  => array(
		'autocomplete' => 'off',
	),
)
```

### Token Storage Field

```php
array(
	'type'        => 'password',
	'id'          => 'access_token',
	'label'       => 'Access Token',
	'description' => 'Your access token for the external service.',
	'attributes'  => array(
		'placeholder' => 'Paste your access token here',
	),
)
```

### Using Values in Your Theme

```php
// Get the password value from the meta field
$api_key = get_post_meta( get_the_ID(), 'api_key', true );

if ( ! empty( $api_key ) ) {
	// Use the API key for making secure API requests
	$response = wp_remote_get( 'https://api.example.com/data', array(
		'headers' => array(
			'Authorization' => 'Bearer ' . $api_key,
		),
	) );

	// Process the response...
}
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->password(
	label: 'API Key',
);
```

## Notes

- The password field visually masks input but does not provide any encryption or hashing
- It is not suitable for user account passwords, which should use WordPress's built-in user management
- The field validation only checks if a value is present when required; it does not enforce password strength
- Consider the security implications before using this field type for sensitive information
- For highly sensitive credentials, consider using WordPress encryption functions like `wp_encrypt()` before storage and `wp_decrypt()` when retrieving
- Add `autocomplete="off"` or `autocomplete="new-password"` to prevent browsers from saving or auto-filling the password field
- Restrict access to any admin pages containing password fields to trusted administrators only
