# Multi Mapy.cz Field Type

The Multi Mapy.cz field type allows users to add multiple location entries using the Mapy.cz map service. Each entry provides an interactive map for selecting locations with geocoding capabilities that automatically retrieve address details from coordinates.

## Field Type: `multi_mapycz`

```php
array(
	'type'  => 'multi_mapycz',
	'id'    => 'example_multi_mapycz',
	'label' => 'Locations',
	'lang'  => 'en',
	'min'   => 1,
	'max'   => 10,
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

- `lang` _(string)_ — Optional: Language code for the map interface and geocoded results. Default is `'en'` (English). Other supported languages include `'cs'` (Czech), `'sk'` (Slovak), `'de'` (German), `'pl'` (Polish)
- `min` _(integer)_ — Optional: Minimum number of items
- `max` _(integer)_ — Optional: Maximum number of items
- `buttons` _(array)_ — Optional: Custom button labels (add, remove, duplicate)
- `disabled_buttons` _(array)_ — Optional: Buttons to disable (move, delete, duplicate)

## Stored Value

The field stores an array of location objects in the database. Each location object contains:

- `latitude` _(string)_ — The latitude coordinate (e.g., `"50.078625"`)
- `longitude` _(string)_ — The longitude coordinate (e.g., `"14.460411"`)
- `zoom` _(number)_ — The zoom level of the map (e.g., `13`)
- `street` _(string)_ — The street name retrieved from geocoding
- `number` _(string)_ — The street number retrieved from geocoding
- `zip` _(string)_ — The ZIP/postal code retrieved from geocoding
- `city` _(string)_ — The city name retrieved from geocoding
- `cityPart` _(string)_ — The city district/part retrieved from geocoding
- `country` _(string)_ — The country name retrieved from geocoding

```php
array(
	array(
		'latitude'  => '50.078625',
		'longitude' => '14.460411',
		'zoom'      => 13,
		'street'    => 'Vinohradska',
		'number'    => '12',
		'zip'       => '12000',
		'city'      => 'Prague',
		'cityPart'  => 'Vinohrady',
		'country'   => 'Czech Republic',
	),
)
```

## Example Usage

### Basic Multi Mapy.cz

```php
'branch_locations' => array(
	'type'        => 'multi_mapycz',
	'id'          => 'branch_locations',
	'label'       => 'Branch Locations',
	'description' => 'Add locations of all company branches',
),
```

### Multi Mapy.cz with Czech Language

```php
'delivery_points' => array(
	'type'        => 'multi_mapycz',
	'id'          => 'delivery_points',
	'label'       => 'Delivery Points',
	'description' => 'Mark all available delivery points on the map',
	'lang'        => 'cs',
),
```

### Multi Mapy.cz with Min/Max Constraints

```php
'event_venues' => array(
	'type'        => 'multi_mapycz',
	'id'          => 'event_venues',
	'label'       => 'Event Venues',
	'description' => 'Add 1 to 5 venue locations',
	'lang'        => 'en',
	'min'         => 1,
	'max'         => 5,
),
```

### Using Values in Your Theme

```php
$branch_locations = get_post_meta( get_the_ID(), 'branch_locations', true );

if ( ! empty( $branch_locations ) && is_array( $branch_locations ) ) {
	echo '<div class="branch-locations">';
	echo '<h3>' . esc_html__( 'Our Branches', 'flavor' ) . '</h3>';

	foreach ( $branch_locations as $location ) {
		if ( empty( $location['latitude'] ) || empty( $location['longitude'] ) ) {
			continue;
		}

		echo '<div class="location-card">';

		if ( ! empty( $location['street'] ) && ! empty( $location['number'] ) ) {
			echo '<p>' . esc_html( $location['street'] . ' ' . $location['number'] ) . '</p>';
		}

		if ( ! empty( $location['zip'] ) || ! empty( $location['city'] ) ) {
			$address_line = trim(
				( $location['zip'] ?? '' ) . ' ' . ( $location['city'] ?? '' )
			);
			echo '<p>' . esc_html( $address_line ) . '</p>';
		}

		if ( ! empty( $location['country'] ) ) {
			echo '<p>' . esc_html( $location['country'] ) . '</p>';
		}

		echo '<p><small>' . esc_html(
			sprintf( 'GPS: %s, %s', $location['latitude'], $location['longitude'] )
		) . '</small></p>';

		echo '</div>';
	}

	echo '</div>';
}
```

### With Conditional Logic

```php
'has_multiple_locations' => array(
	'type'  => 'toggle',
	'id'    => 'has_multiple_locations',
	'label' => 'Multiple locations?',
	'title' => 'This event has multiple venues',
),
'venue_locations' => array(
	'type'       => 'multi_mapycz',
	'id'         => 'venue_locations',
	'label'      => 'Venue Locations',
	'lang'       => 'en',
	'min'        => 2,
	'max'        => 10,
	'conditions' => array(
		array( 'field' => 'has_multiple_locations', 'value' => true ),
	),
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->multi_mapycz(
	label: 'Locations',
	lang: 'en',
	min: 1,
	max: 10,
);
```

## Notes

- Each location entry provides an interactive map for selecting positions
- Users can search for locations, drag the marker, or enter coordinates directly in the format `"50.073658, 14.418540"`
- Address details (street, city, ZIP, country) are automatically populated through reverse geocoding
- The field requires a one-time API key setup from Mapy.cz (free registration at the [Mapy.cz developer portal](https://developer.mapy.cz/account/projects))
- Mapy.cz provides particularly accurate geocoding for Czech Republic, Slovakia, and surrounding countries
- The stored value is always an array of location objects, even if only one location is provided
