# Mapycz Field Type

The Mapycz field type provides an interactive map interface using the Mapy.cz API, allowing users to select geographical locations with reverse geocoding capabilities that provide both coordinates and address information.

## Field Type: `mapycz`

```php
array(
	'type'  => 'mapycz',
	'id'    => 'example_location',
	'label' => 'Location',
	'lang'  => 'en',
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

#### `lang` _(string)_ — Optional

The language used for the map interface and geocoded address data. Defaults to `'en'`. Available options depend on Mapy.cz's supported languages, but typically include:

- `'en'` — English
- `'cs'` — Czech
- `'sk'` — Slovak
- `'de'` — German
- `'pl'` — Polish

## Setup Requirements

To use the Mapycz field type, you need to:

1. Register a free account at [Mapy.cz Developer Portal](https://developer.mapy.cz/account/projects)
2. Create a new project to obtain an API key
3. When the field is first used, you will be prompted to enter the API key

The API key is saved globally for all Mapycz fields across your WordPress site.

## Stored Value

The Mapycz field stores a comprehensive array of location data:

```php
array(
	'latitude'  => '50.078625',
	'longitude' => '14.460411',
	'zoom'      => 13,
	'street'    => 'Example Street',
	'number'    => '123',
	'zip'       => '10000',
	'city'      => 'Prague',
	'cityPart'  => 'Žižkov',
	'country'   => 'Czechia',
)
```

## Example Usage

### Basic Location Field

```php
array(
	'type'        => 'mapycz',
	'id'          => 'office_location',
	'label'       => 'Office Location',
	'description' => 'Mark the location of your office on the map.',
	'required'    => true,
)
```

### Multilingual Location Field

```php
array(
	'type'        => 'mapycz',
	'id'          => 'event_venue',
	'label'       => 'Event Venue',
	'description' => 'Select the location where the event will take place.',
	'lang'        => 'de',
)
```

### Using Values in Your Theme

```php
// Get the location data from the meta field
$location = get_post_meta( get_the_ID(), 'office_location', true );

if ( ! empty( $location ) && ! empty( $location['latitude'] ) && ! empty( $location['longitude'] ) ) {
	echo '<div class="location-address">';

	if ( ! empty( $location['street'] ) || ! empty( $location['number'] ) ) {
		echo '<p>' . esc_html( $location['street'] . ' ' . $location['number'] ) . '</p>';
	}

	if ( ! empty( $location['zip'] ) || ! empty( $location['city'] ) ) {
		echo '<p>' . esc_html( $location['zip'] . ' ' . $location['city'] );

		if ( ! empty( $location['cityPart'] ) ) {
			echo ' - ' . esc_html( $location['cityPart'] );
		}

		echo '</p>';
	}

	if ( ! empty( $location['country'] ) ) {
		echo '<p>' . esc_html( $location['country'] ) . '</p>';
	}

	// Display coordinates
	echo '<p class="coordinates">';
	echo 'Coordinates: ' . esc_html( $location['latitude'] ) . ', ' . esc_html( $location['longitude'] );
	echo '</p>';

	// Add a link to the location on Mapy.cz
	$map_url = 'https://mapy.cz/zakladni?x=' . esc_attr( $location['longitude'] )
		. '&y=' . esc_attr( $location['latitude'] )
		. '&z=' . esc_attr( $location['zoom'] );
	echo '<a href="' . esc_url( $map_url ) . '" target="_blank">View on Mapy.cz</a>';

	echo '</div>';
}
```

### With Conditional Logic

```php
array(
	'type'  => 'toggle',
	'id'    => 'has_physical_location',
	'label' => 'Physical Location',
	'title' => 'This event has a physical location',
),
array(
	'type'        => 'mapycz',
	'id'          => 'event_location',
	'label'       => 'Event Location',
	'description' => 'Select the event venue on the map.',
	'lang'        => 'en',
	'conditions'  => array(
		array( 'field' => 'has_physical_location', 'value' => true ),
	),
)
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->mapycz(
	label: 'Location',
	lang: 'en',
);
```

## Notes

- The Mapycz field requires an internet connection to load map tiles and perform geocoding
- The API key is stored in the WordPress database and used site-wide
- Users can interact with the map by dragging the marker, clicking on the map, or using the search bar to find locations by name or address
- The search bar also accepts direct coordinates input in "latitude, longitude" format
- Reverse geocoding automatically retrieves address details for the selected coordinates
- The field validates that latitude and longitude are present when the `required` property is set to `true`
- Coordinates are automatically formatted to 6 decimal places for precision
- The stored zoom level allows the map to be displayed at the same zoom level when returning to edit the field
- Be aware of potential usage limits for the Mapy.cz API depending on your account type
