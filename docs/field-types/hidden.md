# Hidden Field Type

The Hidden field type allows you to include invisible input fields that store values without displaying them to users in the admin interface. This is useful for storing metadata, tracking information, or other values that shouldn't be edited directly but need to be submitted with the form.

## Field Type: `hidden`

```php
array(
	'type'    => 'hidden',
	'id'      => 'example_hidden',
	'default' => 'default-value',
)
```

## Properties

**For Default Field Properties, see [Field Types Definition](../field-types.md)**.

The hidden field type primarily uses just a subset of the default field properties since it doesn't have a visual interface:

### `default` _(mixed)_ - Optional

The default value for the field. This is particularly important for hidden fields since they're not visible for editing.

### `attributes` _(array)_ - Optional

You can pass HTML attributes to the hidden input field if needed. For example:

```php
'attributes' => array(
	'class'       => 'custom-hidden-field',
	'data-source' => 'system-generated',
),
```

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

### Using Hidden Field Values in PHP

```php
// Get the hidden value from the meta field
$timestamp = get_post_meta( get_the_ID(), 'timestamp', true );

if ( ! empty( $timestamp ) ) {
	// Format the timestamp
	$formatted_date = date_i18n( get_option( 'date_format' ), $timestamp );
	
	echo '<div class="submission-date">';
	echo 'Submitted on: ' . esc_html( $formatted_date );
	echo '</div>';
}
```

## Notes

- Hidden fields do not appear in the visual interface, so users cannot directly modify their values
- They are particularly useful for:
  - Storing system-generated values like timestamps or unique IDs
  - Tracking form submission sources
  - Maintaining state between requests
  - Including values that should always be submitted but never edited
- Though hidden from the interface, the values are still stored and processed like any other field
- Unlike most field types, hidden fields don't have a label or description since they're not visible
- Hidden fields can still be used in conditional logic to control the display of other fields