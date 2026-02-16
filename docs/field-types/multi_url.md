# Multi URL Field Type

The Multi URL field type provides a repeatable interface for collecting multiple web addresses with add/remove functionality and automatic URL normalization.

## Field Type: `multi_url`

```php
array(
	'type'  => 'multi_url',
	'label' => 'Social Links',
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

An array of URL strings.

## Example Usage

### Basic Multi URL Field

```php
'social_profiles' => array(
	'type'        => 'multi_url',
	'label'       => 'Social Media Profiles',
	'description' => 'Add links to your social media profiles',
),
```

### With Min/Max Constraints

```php
'partner_websites' => array(
	'type'  => 'multi_url',
	'label' => 'Partner Websites',
	'min'   => 2,
	'max'   => 5,
),
```

### Using Values in Your Theme

```php
$social_profiles = get_post_meta( get_the_ID(), 'social_profiles', true );

if ( ! empty( $social_profiles ) && is_array( $social_profiles ) ) {
	echo '<ul>';

	foreach ( $social_profiles as $url ) {
		if ( empty( $url ) ) {
			continue;
		}

		echo '<li><a href="' . esc_url( $url ) . '" target="_blank" rel="noopener noreferrer">';
		echo esc_html( $url );
		echo '</a></li>';
	}

	echo '</ul>';
}
```

### With Conditional Logic

```php
'has_references' => array(
	'type'  => 'toggle',
	'id'    => 'has_references',
	'label' => 'Include references?',
),
'reference_links' => array(
	'type'       => 'multi_url',
	'label'      => 'Reference Links',
	'conditions' => array(
		array( 'field' => 'has_references', 'value' => true ),
	),
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->multi_url(
	label: 'Social Links',
	min: 1,
	max: 5,
);
```

## Notes

- The stored value is always an array, even if only one URL is provided.
- URLs are automatically normalized when the field loses focus: missing protocol defaults to `https://`.
- The browser provides native validation for URL format.
- Items can be reordered by dragging unless the `move` button is disabled.
- Ideal for collecting social media links, reference URLs, partner websites, or any scenario requiring multiple web addresses.
