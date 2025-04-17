# Mapycz Field Type

The Mapycz field type provides an interactive map interface using the Mapy.cz API, allowing users to select geographical locations. This field is great for storing location data with reverse geocoding capabilities, providing both coordinates and address information.

## Field Type: `mapycz`

```php
array(
    'type'  => 'mapycz',
    'id'    => 'example_location',
    'label' => 'Location',
    'lang'  => 'en', // Optional - language for the interface and geocoding
)
```

## Properties

**For Default Field Properties, see [Field Types Definition](../field-types.md)**.

### `lang` _(string)_ - Optional, default: `'en'`

The language used for the map interface and geocoded address data. Available options depend on Mapy.cz's supported languages, but typically include:
- `'en'` - English
- `'cs'` - Czech
- `'sk'` - Slovak
- `'de'` - German
- `'pl'` - Polish

## Setup Requirements

To use the Mapycz field type, you need to:

1. Register a free account at [Mapy.cz Developer Portal](https://developer.mapy.cz/account/projects)
2. Create a new project to obtain an API key
3. When the field is first used, you'll be prompted to enter the API key

The API key is saved globally for all Mapycz fields across your WordPress site.

## Stored Value

The Mapycz field stores a comprehensive array of location data:

```php
array(
    'latitude'  => '50.078625', // Decimal latitude (stored as string with 6 decimal places)
    'longitude' => '14.460411', // Decimal longitude (stored as string with 6 decimal places)
    'zoom'      => 13,          // Map zoom level
    'street'    => 'Example Street', // Street name (from reverse geocoding)
    'number'    => '123',       // Street number (from reverse geocoding)
    'zip'       => '10000',     // Postal/ZIP code (from reverse geocoding)
    'city'      => 'Prague',    // City name (from reverse geocoding)
    'cityPart'  => 'Žižkov',    // City district/part (from reverse geocoding)
    'country'   => 'Czechia',   // Country name (from reverse geocoding)
)
```

## User Interface

The Mapycz field provides a feature-rich interface:

1. **Search Bar**: Allows searching for addresses, points of interest, or directly entering coordinates
2. **Interactive Map**: Displays a map with a draggable marker
3. **Address Display**: Shows the reverse geocoded address information
4. **Coordinates Display**: Shows the precise latitude and longitude values

## Example Usage

### Basic Location Field

```php
'office_location' => array(
    'type'        => 'mapycz',
    'id'          => 'office_location',
    'label'       => 'Office Location',
    'description' => 'Mark the location of your office on the map.',
    'required'    => true,
),
```

### Multilingual Location Field

```php
'event_venue' => array(
    'type'        => 'mapycz',
    'id'          => 'event_venue',
    'label'       => 'Event Venue',
    'description' => 'Select the location where the event will take place.',
    'lang'        => 'de', // German interface and geocoding
),
```

### Using Location Values in Your Theme

```php
// Get the location data from the meta field
$location = get_post_meta(get_the_ID(), 'office_location', true);

if (!empty($location) && !empty($location['latitude']) && !empty($location['longitude'])) {
    // Display a formatted address
    echo '<div class="location-address">';
    
    if (!empty($location['street']) || !empty($location['number'])) {
        echo '<p>' . esc_html($location['street'] . ' ' . $location['number']) . '</p>';
    }
    
    if (!empty($location['zip']) || !empty($location['city'])) {
        echo '<p>' . esc_html($location['zip'] . ' ' . $location['city']);
        
        if (!empty($location['cityPart'])) {
            echo ' - ' . esc_html($location['cityPart']);
        }
        
        echo '</p>';
    }
    
    if (!empty($location['country'])) {
        echo '<p>' . esc_html($location['country']) . '</p>';
    }
    
    // Display coordinates
    echo '<p class="coordinates">';
    echo 'Coordinates: ' . esc_html($location['latitude']) . ', ' . esc_html($location['longitude']);
    echo '</p>';
    
    // Add a link to the location on Mapy.cz
    echo '<a href="https://mapy.cz/zakladni?x=' . esc_attr($location['longitude']) . '&y=' . esc_attr($location['latitude']) . '&z=' . esc_attr($location['zoom']) . '" target="_blank">';
    echo 'View on Mapy.cz';
    echo '</a>';
    
    echo '</div>';
}
```

## Features

1. **Interactive Map**: Users can drag the marker or click on the map to set a location
2. **Address Search**: Integrated search bar for finding locations by name or address
3. **Coordinates Input**: Accepts direct input of coordinates in "latitude, longitude" format
4. **Reverse Geocoding**: Automatically retrieves address details for the selected coordinates
5. **Marker Display**: Visual indicator of the selected location on the map
6. **Zoom Controls**: Ability to zoom in and out for precise location selection

## Notes

- The Mapycz field requires an internet connection to load map tiles and perform geocoding
- The API key is stored in the WordPress database and used site-wide
- The field validates that latitude and longitude are present when the field is required
- Coordinates are automatically formatted to 6 decimal places for precision
- The stored zoom level allows the map to be displayed at the same zoom level when returning to edit the field
- Be aware of potential usage limits for the Mapy.cz API depending on your account type