# Select Field Type

The Select field type provides a dropdown interface for selecting a single option from a list of choices. It uses the React Select library to provide a modern, searchable dropdown with clear functionality.

## Field Type: `select`

```php
array(
	'type'    => 'select',
	'id'      => 'example_select',
	'label'   => 'Color',
	'options' => array(
		'red'   => 'Red',
		'green' => 'Green',
		'blue'  => 'Blue',
	),
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `select` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have a value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(string)_ - Default selected value
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `options` _(array|callable)_ - Required

An associative array of options where the keys are the values to store and the array values are the labels to display. **Please be aware that value must be always string!** Alternatively, you can use an array of objects with `value` and `label` properties:

```php
'options' => array(
	array( 'value' => 'red', 'label' => 'Red' ),
	array( 'value' => 'green', 'label' => 'Green' ),
	array( 'value' => 'blue', 'label' => 'Blue' ),
),
```

You can also use an associative array:

```php
'options' => array(
    'red'   => 'Red',
    'green' => 'Green',
    'blue'  => 'Blue',
),
```

Another option is to use a callable function that returns the options array. This is useful for dynamic options:

```php
'options' => 'custom_get_colors',
```

You have to define the `custom_get_colors` function in your theme or plugin:

```php
function custom_get_colors( array $args ): array {
    // Perform any logic to fetch or generate options
    
    return array(
        'red'   => 'Red',
        'green' => 'Green',
        'blue'  => 'Blue',
    );
}
```
The function accepts an array of arguments with the following keys:
- `value`: The current value of the field
- `search`: The search term entered by the user
- additional parameters passed via `async_params`

The function should return the option that is currently selected (value) and options that match the search term. The returned array should be in the same format as the static options.

#### `async_params` _(array)_ - Optional

Additional parameters to pass to the API when fetching options with `options_key`. Useful for filtering or customizing the returned options.

## Stored Value

The field stores the value (key) of the selected option as a string in the database.

## Example Usage

### Basic Select Field

```php
'color_scheme' => array(
	'type'        => 'select',
	'label'       => 'Color Scheme',
	'description' => 'Select the color scheme for this content.',
	'options'     => array(
		'light'  => 'Light Mode',
		'dark'   => 'Dark Mode',
		'custom' => 'Custom Colors',
	),
	'default'     => 'light',
),
```

### Dynamic Options from Callback

```php
'country' => array(
	'type'        => 'select',
	'label'       => 'Country',
	'description' => 'Select the country.',
	'options'     => function ( array $args ): array {
        return array(
            array( 'value' => 'us', 'label' => 'United States' ),
            array( 'value' => 'ca', 'label' => 'Canada' ),
            array( 'value' => 'mx', 'label' => 'Mexico' ),
            // More countries...
        );
    },
	'default'     => 'us',
),
```

### Using Select Values in Your Theme

```php
// Get the selected value from the meta field
$color_scheme = get_post_meta( get_the_ID(), 'color_scheme', true );

// Use the value to customize functionality
if ( $color_scheme === 'dark' ) {
	add_filter( 'body_class', function( $classes ) {
		$classes[] = 'dark-mode';
		return $classes;
	} );
} elseif ( $color_scheme === 'custom' ) {
	// Load custom color settings
	$custom_colors = get_post_meta( get_the_ID(), 'custom_colors', true );
	// Apply custom colors...
}

// Display the selected option label
$color_options = array(
	'light'  => 'Light Mode',
	'dark'   => 'Dark Mode',
	'custom' => 'Custom Colors',
);

echo '<div class="selected-option">';
echo 'Selected Theme: ' . esc_html( $color_options[ $color_scheme ] ?? '' );
echo '</div>';
```

## Notes

- The Select field uses React Select, which provides a modern, searchable dropdown experience
- When the field loses focus, it sets its title to the selected option's label
- For selecting multiple options, use the [`multi_select`](multi_select.md) field type instead
- The dropdown menu is portaled to the document body to avoid layout issues with parent containers
- Options can be either statically defined or dynamically loaded through the API
- The field supports asynchronous searching when using `options_key`
- The field always includes a clear button to remove the selection
