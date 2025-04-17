# Multi Tel Field Type

The Multi Tel field type allows users to add multiple phone number inputs with international formatting. It provides a repeatable interface for collecting multiple phone numbers with add/remove functionality and built-in phone number formatting.

## Field Type: `multi_tel`

```php
array(
	'type'            => 'multi_tel',
	'id'              => 'example_multi_tel',
	'label'           => 'Example Multi Tel',
	'description'     => 'Add multiple phone numbers',
	'default_country' => 'US', // Optional, default country code
	'default'         => array( '+12025550195', '+442071838750' ),
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `multi_tel` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have at least one value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(array)_ - Default values as an array of phone number strings
- `attributes` _(array)_ - HTML attributes to add to each phone input
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `default_country` _(string)_ - Optional

The default country code to use for the phone number input. This affects the initial country selected in the dropdown and the format suggestion. Default is 'US'. Uses ISO 3166-1 alpha-2 country codes (e.g., 'US', 'GB', 'DE', 'FR', etc.).

## Stored Value

The field stores an array of phone number strings in the database. Phone numbers are stored in E.164 format (e.g., '+12025550195').

## Example Usage

### Basic Multi Tel Field

```php
'contact_numbers' => array(
	'type'        => 'multi_tel',
	'id'          => 'contact_numbers',
	'label'       => 'Contact Phone Numbers',
	'description' => 'Add phone numbers where the customer can be reached',
),
```

### Multi Tel with UK Default Country

```php
'uk_office_numbers' => array(
	'type'            => 'multi_tel',
	'id'              => 'uk_office_numbers',
	'label'           => 'UK Office Phone Numbers',
	'description'     => 'Add phone numbers for UK offices',
	'default_country' => 'GB',
),
```

### Multi Tel with Default Values

```php
'support_hotlines' => array(
	'type'        => 'multi_tel',
	'id'          => 'support_hotlines',
	'label'       => 'Support Hotlines',
	'description' => 'Phone numbers for customer support',
	'default'     => array(
		'+18005550123', // US toll-free
		'+442071838750', // UK
	),
),
```

### Retrieving and Using Multi Tel Values

```php
// Get the array of phone numbers
$contact_numbers = get_post_meta( get_the_ID(), 'contact_numbers', true );

if ( ! empty( $contact_numbers ) && is_array( $contact_numbers ) ) {
	echo '<div class="contact-numbers">';
	echo '<h3>Contact Phone Numbers</h3>';
	echo '<ul>';
	
	foreach ( $contact_numbers as $phone ) {
		// Skip empty values
		if ( empty( $phone ) ) {
			continue;
		}
		
		// Format for display or use as-is
		echo '<li>';
		echo '<a href="tel:' . esc_attr( $phone ) . '">';
		echo esc_html( $phone );
		echo '</a>';
		echo '</li>';
	}
	
	echo '</ul>';
	echo '</div>';
}
```

### Formatting Phone Numbers for Display

```php
/**
 * Format a phone number for display
 *
 * @param string $phone_number Phone number in E.164 format
 * @param string $format Display format (international, national, or url)
 * @return string Formatted phone number
 */
function format_phone_number( $phone_number, $format = 'international' ) {
	// If using a phone formatting library, you could call it here
	// This is a simple example without dependencies
	
	if ( empty( $phone_number ) ) {
		return '';
	}
	
	// For URL format (tel: links)
	if ( $format === 'url' ) {
		return 'tel:' . preg_replace( '/[^0-9+]/', '', $phone_number );
	}
	
	// Simple formatting for US numbers
	if ( strpos( $phone_number, '+1' ) === 0 && strlen( $phone_number ) === 12 ) {
		$number = substr( $phone_number, 2 );
		
		if ( $format === 'national' ) {
			return '(' . substr( $number, 0, 3 ) . ') ' . substr( $number, 3, 3 ) . '-' . substr( $number, 6 );
		}
	}
	
	// Default: return as is for international format
	return $phone_number;
}

// Get the stored phone numbers
$support_hotlines = get_post_meta( get_the_ID(), 'support_hotlines', true );

if ( ! empty( $support_hotlines ) && is_array( $support_hotlines ) ) {
	echo '<div class="support-contacts">';
	echo '<h3>Customer Support</h3>';
	
	foreach ( $support_hotlines as $phone ) {
		// Format phone for display and URL
		$formatted_phone = format_phone_number( $phone, 'national' );
		$phone_url = format_phone_number( $phone, 'url' );
		
		echo '<div class="support-contact">';
		echo '<i class="icon-phone"></i> ';
		echo '<a href="' . esc_attr( $phone_url ) . '">';
		echo esc_html( $formatted_phone );
		echo '</a>';
		echo '</div>';
	}
	
	echo '</div>';
}
```

### Multi Tel with Conditional Logic

```php
'has_multiple_contacts' => array(
	'type'  => 'toggle',
	'id'    => 'has_multiple_contacts',
	'label' => 'Add multiple contact numbers?',
),
'contact_phone_numbers' => array(
	'type'       => 'multi_tel',
	'id'         => 'contact_phone_numbers',
	'label'      => 'Contact Phone Numbers',
	'description' => 'Add all relevant contact phone numbers',
	'conditions' => array(
		array( 'field' => 'has_multiple_contacts', 'value' => true ),
	),
),
```

## Notes

- The Multi Tel field provides an "Add" button to add additional phone inputs
- Each added phone input includes a "Remove" button to delete it
- The stored value is always an array, even if only one phone number is provided
- Each phone input includes:
  - A country selector dropdown with flags
  - Automatic formatting based on the selected country
  - Input validation for proper phone number format
- Phone numbers are stored in E.164 format (e.g., '+12025550195')
- Empty values are not stored in the array
- This field is useful for collecting multiple contact numbers, support lines, or any scenario requiring multiple phone numbers
- The field uses the `react-phone-number-input` library for international phone number formatting and validation
