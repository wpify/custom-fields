# Multi Mapy.cz Field Type

The Multi Mapy.cz field type allows users to add multiple location entries using the Mapy.cz map service (a popular map service in the Czech Republic). Each entry provides an interactive map for selecting locations with geocoding capabilities that automatically retrieve address details from coordinates.

## Field Type: `multi_mapycz`

```php
array(
	'type'        => 'multi_mapycz',
	'id'          => 'example_multi_mapycz',
	'label'       => 'Example Multi Mapy.cz',
	'description' => 'Add multiple location entries',
	'lang'        => 'en', // Optional, default 'en'
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `multi_mapycz` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have at least one value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(array)_ - Default values as an array of location objects
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `lang` _(string)_ - Optional

The language code for the map interface and geocoded results. Default is 'en' (English). Other supported languages include 'cs' (Czech), 'sk' (Slovak), 'de' (German), 'pl' (Polish).

## Stored Value

The field stores an array of location objects in the database. Each location object contains the following properties:

- `latitude` _(string)_ - The latitude coordinate (e.g., "50.078625")
- `longitude` _(string)_ - The longitude coordinate (e.g., "14.460411")
- `zoom` _(number)_ - The zoom level of the map (e.g., 13)
- `street` _(string)_ - The street name retrieved from geocoding
- `number` _(string)_ - The street number retrieved from geocoding
- `zip` _(string)_ - The ZIP/postal code retrieved from geocoding
- `city` _(string)_ - The city name retrieved from geocoding
- `cityPart` _(string)_ - The city district/part retrieved from geocoding
- `country` _(string)_ - The country name retrieved from geocoding

## API Key Requirement

The Mapy.cz field requires an API key from Mapy.cz. The first time this field is used, users will be prompted to enter their API key. Registration is free at the [Mapy.cz developer portal](https://developer.mapy.cz/account/projects).

## Example Usage

### Basic Multi Mapy.cz Field

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
	'lang'        => 'cs', // Use Czech language for address data
),
```

### Retrieving and Displaying Multi Mapy.cz Values

```php
// Get the array of locations
$branch_locations = get_post_meta( get_the_ID(), 'branch_locations', true );

if ( ! empty( $branch_locations ) && is_array( $branch_locations ) ) {
	echo '<div class="branch-locations">';
	echo '<h3>Our Branches</h3>';
	echo '<div class="location-grid">';
	
	foreach ( $branch_locations as $location ) {
		// Skip incomplete locations
		if ( empty( $location['latitude'] ) || empty( $location['longitude'] ) ) {
			continue;
		}
		
		echo '<div class="location-card">';
		
		// Display the address
		if ( ! empty( $location['street'] ) || ! empty( $location['city'] ) ) {
			echo '<div class="location-address">';
			
			if ( ! empty( $location['street'] ) && ! empty( $location['number'] ) ) {
				echo '<p>' . esc_html( $location['street'] . ' ' . $location['number'] ) . '</p>';
			}
			
			if ( ! empty( $location['zip'] ) || ! empty( $location['city'] ) ) {
				echo '<p>';
				if ( ! empty( $location['zip'] ) ) {
					echo esc_html( $location['zip'] ) . ' ';
				}
				if ( ! empty( $location['city'] ) ) {
					echo esc_html( $location['city'] );
					if ( ! empty( $location['cityPart'] ) && $location['cityPart'] !== $location['city'] ) {
						echo ' - ' . esc_html( $location['cityPart'] );
					}
				}
				echo '</p>';
			}
			
			if ( ! empty( $location['country'] ) ) {
				echo '<p>' . esc_html( $location['country'] ) . '</p>';
			}
			
			echo '</div>';
		}
		
		// Display a static map image or link to map
		echo '<div class="location-map">';
		echo '<a href="https://mapy.cz/zakladni?x=' . esc_attr( $location['longitude'] ) . '&y=' . esc_attr( $location['latitude'] ) . '&z=16" target="_blank" rel="noopener noreferrer">';
		echo '<img src="https://api.mapy.cz/v1/staticmap?width=300&height=200&zoom=15&lat=' . esc_attr( $location['latitude'] ) . '&lon=' . esc_attr( $location['longitude'] ) . '" alt="Map" />';
		echo '</a>';
		echo '</div>';
		
		// Add coordinates for reference
		echo '<div class="location-coordinates">';
		echo '<small>GPS: ' . esc_html( $location['latitude'] ) . ', ' . esc_html( $location['longitude'] ) . '</small>';
		echo '</div>';
		
		echo '</div>';
	}
	
	echo '</div>';
	echo '</div>';
}
```

### Creating a Store Locator with Distance Calculation

```php
<?php
/**
 * Calculate distance between two coordinates using the Haversine formula
 *
 * @param float $lat1 First latitude
 * @param float $lon1 First longitude
 * @param float $lat2 Second latitude
 * @param float $lon2 Second longitude
 * @return float Distance in kilometers
 */
function calculate_distance( $lat1, $lon1, $lat2, $lon2 ) {
	$earth_radius = 6371; // Radius of the earth in km
	
	$dLat = deg2rad( $lat2 - $lat1 );
	$dLon = deg2rad( $lon2 - $lon1 );
	
	$a = sin( $dLat / 2 ) * sin( $dLat / 2 ) +
	     cos( deg2rad( $lat1 ) ) * cos( deg2rad( $lat2 ) ) *
	     sin( $dLon / 2 ) * sin( $dLon / 2 );
	
	$c = 2 * atan2( sqrt( $a ), sqrt( 1 - $a ) );
	$distance = $earth_radius * $c;
	
	return $distance;
}

// User's location (could come from geolocation or form input)
$user_lat = 50.073658;
$user_lon = 14.418540;

// Get all stores from options
$stores = get_option( 'company_stores', array() );

// Sort stores by distance from user
$stores_with_distance = array();

foreach ( $stores as $store ) {
	if ( empty( $store['latitude'] ) || empty( $store['longitude'] ) ) {
		continue;
	}
	
	// Calculate distance
	$distance = calculate_distance(
		$user_lat,
		$user_lon,
		floatval( $store['latitude'] ),
		floatval( $store['longitude'] )
	);
	
	$stores_with_distance[] = array(
		'store'    => $store,
		'distance' => $distance,
	);
}

// Sort by distance
usort( $stores_with_distance, function( $a, $b ) {
	return $a['distance'] <=> $b['distance'];
} );

// Display the nearest stores
if ( ! empty( $stores_with_distance ) ) {
	echo '<div class="nearest-stores">';
	echo '<h3>Nearest Stores</h3>';
	echo '<ul>';
	
	foreach ( $stores_with_distance as $index => $item ) {
		// Show only 5 nearest stores
		if ( $index >= 5 ) {
			break;
		}
		
		$store = $item['store'];
		$distance = $item['distance'];
		
		echo '<li>';
		echo '<strong>' . esc_html( $store['city'] ) . '</strong>';
		echo '<p>' . esc_html( $store['street'] . ' ' . $store['number'] ) . '</p>';
		echo '<p>' . esc_html( sprintf( '%.1f km away', $distance ) ) . '</p>';
		echo '</li>';
	}
	
	echo '</ul>';
	echo '</div>';
}
```

## Notes

- The Multi Mapy.cz field provides an "Add" button to add additional map inputs
- Each added map includes a "Remove" button to delete it
- The stored value is always an array of location objects, even if only one location is provided
- For each location, users can:
  - Search for a location using the search box
  - Drag the marker to set a precise location
  - Pan and zoom the map
  - Enter coordinates directly in the format "50.073658, 14.418540"
- Address details (street, city, etc.) are automatically populated through reverse geocoding
- The field requires a one-time API key setup from Mapy.cz (free registration)
- This field is ideal for store locations, delivery points, event venues, or any application requiring multiple geographic locations
- Integration with Mapy.cz provides particularly accurate geocoding for Czech Republic, Slovakia, and surrounding countries