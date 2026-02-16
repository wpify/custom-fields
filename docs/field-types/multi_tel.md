# Multi Tel Field Type

The Multi Tel field type provides a repeatable interface for collecting multiple phone numbers with international formatting, country selector dropdown, and built-in validation.

## Field Type: `multi_tel`

```php
array(
	'type'  => 'multi_tel',
	'label' => 'Phone Numbers',
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

An array of phone number strings in E.164 format (e.g., `+12025550195`).

## Example Usage

### Basic Multi Tel Field

```php
'contact_numbers' => array(
	'type'        => 'multi_tel',
	'label'       => 'Contact Phone Numbers',
	'description' => 'Add phone numbers where the customer can be reached',
),
```

### With Default Values

```php
'support_hotlines' => array(
	'type'    => 'multi_tel',
	'label'   => 'Support Hotlines',
	'default' => array(
		'+18005550123',
		'+442071838750',
	),
),
```

### Using Values in Your Theme

```php
$contact_numbers = get_post_meta( get_the_ID(), 'contact_numbers', true );

if ( ! empty( $contact_numbers ) && is_array( $contact_numbers ) ) {
	echo '<ul>';

	foreach ( $contact_numbers as $phone ) {
		if ( empty( $phone ) ) {
			continue;
		}

		echo '<li><a href="tel:' . esc_attr( $phone ) . '">' . esc_html( $phone ) . '</a></li>';
	}

	echo '</ul>';
}
```

### With Conditional Logic

```php
'has_multiple_contacts' => array(
	'type'  => 'toggle',
	'id'    => 'has_multiple_contacts',
	'label' => 'Add multiple contact numbers?',
),
'contact_phone_numbers' => array(
	'type'       => 'multi_tel',
	'label'      => 'Contact Phone Numbers',
	'conditions' => array(
		array( 'field' => 'has_multiple_contacts', 'value' => true ),
	),
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->multi_tel(
	label: 'Phone Numbers',
	min: 1,
	max: 5,
);
```

## Notes

- The stored value is always an array, even if only one phone number is provided.
- Phone numbers are stored in E.164 format (e.g., `+12025550195`).
- Each phone input includes a country selector dropdown with flags and automatic formatting based on the selected country.
- The field uses the `react-phone-number-input` library for international phone number formatting and validation.
- Items can be reordered by dragging unless the `move` button is disabled.
- Ideal for collecting multiple contact numbers, support lines, or international phone lists.
