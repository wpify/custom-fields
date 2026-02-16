# Hidden Field Type

The Hidden field type allows you to include invisible input fields that store values without displaying them to users in the admin interface. This is useful for storing metadata, tracking information, or other values that should not be edited directly but need to be submitted with the form.

## Field Type: `hidden`

```php
array(
	'type'    => 'hidden',
	'id'      => 'example_hidden',
	'default' => 'default-value',
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

This field type has no additional specific properties beyond the default ones. It primarily uses the `default` and `attributes` properties from the common set since it has no visual interface.

## Stored Value

The field stores the value as a string in the database.

## Example Usage

### Store Timestamp

```php
'timestamp' => array(
	'type'    => 'hidden',
	'id'      => 'timestamp',
	'default' => time(),
),
```

### Store Generated ID

```php
'entry_id' => array(
	'type'    => 'hidden',
	'id'      => 'entry_id',
	'default' => uniqid( 'entry_' ),
),
```

### Store Form Source

```php
'form_source' => array(
	'type'    => 'hidden',
	'id'      => 'form_source',
	'default' => 'product_registration',
),
```

### Using Values in Your Theme

```php
$timestamp = get_post_meta( get_the_ID(), 'timestamp', true );

if ( ! empty( $timestamp ) ) {
	$formatted_date = date_i18n( get_option( 'date_format' ), $timestamp );

	echo '<div class="submission-date">';
	echo 'Submitted on: ' . esc_html( $formatted_date );
	echo '</div>';
}
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->hidden(
	default: 'some_value',
	generator: 'uuid',
);
```

## Notes

- Hidden fields do not appear in the visual interface, so users cannot directly modify their values
- They are particularly useful for storing system-generated values like timestamps or unique IDs, tracking form submission sources, maintaining state between requests, and including values that should always be submitted but never edited
- Though hidden from the interface, the values are still stored and processed like any other field
- Unlike most field types, hidden fields do not have a label or description since they are not visible
- Hidden fields can still be used in conditional logic to control the display of other fields
