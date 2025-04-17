# Tel (Telephone) Field Type

The Tel field type provides a specialized input for phone numbers with international formatting support. It uses the `react-phone-number-input` library to offer country code selection, validation, and consistent formatting of phone numbers.

## Field Type: `tel`

```php
array(
    'type'           => 'tel',
    'id'             => 'example_tel',
    'label'          => 'Contact Phone',
    'default_country' => 'US',
)
```

## Properties

**For Default Field Properties, see [Field Types Definition](../field-types.md)**.

### `default_country` _(string)_ - Optional, default: `'US'`

The default country code to pre-select in the dropdown. Uses ISO 3166-1 alpha-2 country codes (e.g., 'US', 'GB', 'DE', 'FR', etc.).

### `attributes` _(array)_ - Optional

You can pass HTML attributes to the telephone input field. For example:

```php
'attributes' => array(
    'placeholder' => 'Enter phone number',
    'class' => 'custom-tel-field',
),
```

## User Interface

The Tel field provides a rich interface with:

1. **Country Code Dropdown**: Select the country code prefix
2. **Phone Number Input**: Enter the phone number with automatic formatting
3. **International Format**: Automatically displays in standardized E.164 format

## Stored Value

The field stores the phone number as a string in international E.164 format (e.g., `+12025550123`), which includes the country code prefix.

## Example Usage

### Basic Phone Number Field

```php
'contact_phone' => array(
    'type'           => 'tel',
    'id'             => 'contact_phone',
    'label'          => 'Contact Phone Number',
    'description'    => 'Enter a phone number where you can be reached.',
    'default_country' => 'US',
    'required'       => true,
),
```

### Phone Number with Different Default Country

```php
'uk_office_phone' => array(
    'type'           => 'tel',
    'id'             => 'uk_office_phone',
    'label'          => 'UK Office Phone',
    'description'    => 'Enter the UK office contact number.',
    'default_country' => 'GB',
),
```

### Using Phone Number Values in Your Theme

```php
// Get the phone number from the meta field
$contact_phone = get_post_meta(get_the_ID(), 'contact_phone', true);

if (!empty($contact_phone)) {
    echo '<div class="contact-info">';
    
    // Display phone number with clickable link
    echo '<p class="phone">';
    echo '<strong>Phone:</strong> ';
    echo '<a href="tel:' . esc_attr($contact_phone) . '">';
    echo esc_html($contact_phone);
    echo '</a>';
    echo '</p>';
    
    echo '</div>';
}
```

### Phone Number with Conditional Logic

```php
'preferred_contact' => array(
    'type'    => 'select',
    'id'      => 'preferred_contact',
    'label'   => 'Preferred Contact Method',
    'options' => array(
        'email' => 'Email',
        'phone' => 'Phone',
    ),
),
'contact_phone' => array(
    'type'           => 'tel',
    'id'             => 'contact_phone',
    'label'          => 'Phone Number',
    'default_country' => 'US',
    'conditions'     => array(
        array('field' => 'preferred_contact', 'value' => 'phone'),
    ),
),
```

## Features

1. **Country Code Selection**: Dropdown to select the appropriate country code
2. **Automatic Formatting**: Ensures consistent international phone number format
3. **Input Validation**: Basic validation to ensure the phone number is properly formatted
4. **International Support**: Works with phone numbers from any country

## Notes

- The Tel field automatically formats phone numbers in the E.164 international format (e.g., `+12025550123`)
- The country code dropdown displays flags to make country selection more intuitive
- For multiple phone numbers, consider using the `multi_tel` field type
- The field validates that the input is a string when required
- When working with phone numbers in your code, remember they're in international format with the '+' prefix
- The field is particularly useful for ensuring consistent phone number formatting across your application