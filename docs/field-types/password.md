# Password Field Type

The Password field type provides a specialized input field for collecting password or other sensitive information. The field masks the entered text, displaying bullets or asterisks instead of the actual characters, providing basic visual security during input.

## Field Type: `password`

```php
array(
	'type'  => 'password',
	'id'    => 'example_password',
	'label' => 'API Key',
)
```

## Properties

**For Default Field Properties, see [Field Types Definition](../field-types.md)**.

The password field type primarily uses the default field properties. Some commonly used ones include:

### `required` _(boolean)_ - Optional, default: `false`

Whether the password field is required to contain a value.

### `attributes` _(array)_ - Optional

You can pass HTML attributes to the password input field. For example:

```php
'attributes' => array(
	'placeholder'   => 'Enter your password',
	'class'         => 'custom-password-field',
	'maxlength'     => 64,
	'autocomplete'  => 'new-password', // Prevent browser from auto-filling
),
```

## Stored Value

The field stores the value as a plain text string in the database. 

> **IMPORTANT SECURITY NOTE**: The password is stored as plain text in the database. This field type is NOT intended for user authentication passwords. It should only be used for storing API keys, tokens, or other credentials where WordPress-native password hashing is not necessary.

## Example Usage

### API Key Field

```php
'api_key' => array(
	'type'        => 'password',
	'id'          => 'api_key',
	'label'       => 'API Key',
	'description' => 'Enter your API key. This will be stored securely.',
	'required'    => true,
	'attributes'  => array(
		'autocomplete' => 'off',
	),
),
```

### Token Storage Field

```php
'access_token' => array(
	'type'        => 'password',
	'id'          => 'access_token',
	'label'       => 'Access Token',
	'description' => 'Your access token for the external service.',
	'attributes'  => array(
		'placeholder' => 'Paste your access token here',
	),
),
```

### Using Password Field Values in PHP

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

## Security Best Practices

When working with password fields, consider these security precautions:

1. **Limit Access**: Restrict access to any admin pages containing password fields to trusted administrators only.

2. **Data Encryption**: For highly sensitive credentials, consider using WordPress encryption functions like `wp_encrypt()` before storage and `wp_decrypt()` when retrieving.

3. **Masking in UI**: While the input masks characters during entry, be careful not to expose the password in other parts of your UI.

4. **Clear Explanation**: Provide a clear description of how the password will be used and what security measures are in place.

5. **Autocomplete Control**: Add `autocomplete="off"` or `autocomplete="new-password"` to prevent browsers from saving or auto-filling the password field.

## Notes

- The password field visually masks input but does not provide any encryption or hashing
- It's not suitable for user account passwords, which should use WordPress's built-in user management
- The field validation only checks if a value is present when required; it doesn't enforce password strength
- Consider the security implications before using this field type for sensitive information
- For truly sensitive information that should never be visible, server-side tokens or WordPress secure storage options might be more appropriate