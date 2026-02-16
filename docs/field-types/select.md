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

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

#### `options` _(array|callable)_ — Required

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

#### `options_key` _(string)_ — Optional

A registered options key for loading options asynchronously through the REST API. When set, options are fetched dynamically rather than embedded in the page.

#### `async_params` _(array)_ — Optional

Additional parameters to pass to the API when fetching options with `options_key`. Useful for filtering or customizing the returned options.

The `async_params` support dynamic value replacement using placeholders. You can reference values from other fields using the `{{field_path}}` syntax:

```php
'category_select' => array(
	'type'    => 'select',
	'id'      => 'category',
	'label'   => 'Category',
	'options' => array(
		'products'  => 'Products',
		'services'  => 'Services',
		'resources' => 'Resources',
	),
),
'subcategory_select' => array(
	'type'         => 'select',
	'id'           => 'subcategory',
	'label'        => 'Subcategory',
	'options'      => 'get_subcategories',
	'async_params' => array(
		'category' => '{{category}}', // Will be replaced with the value from category field
	),
),
```

In this example, when the user selects a category, the subcategory select field will automatically update its options based on the selected category value.

**Field Path Syntax:**

The field path syntax follows the same rules as described in the [Conditions documentation](../features/conditions.md#field-path-references):

- Use dot notation for nested fields: `{{parent_field.nested_field}}`
- Use `#` for relative references: `{{#.sibling_field}}` (references a sibling field)
- Use multiple `#` for parent levels: `{{##.parent_sibling_field}}`
- Access array elements: `{{my_multi_field[0]}}`

**Example with Nested Fields:**

```php
'group_field' => array(
	'type'  => 'group',
	'id'    => 'location_group',
	'items' => array(
		'country' => array(
			'type'    => 'select',
			'id'      => 'country',
			'label'   => 'Country',
			'options' => 'get_countries',
		),
		'state' => array(
			'type'         => 'select',
			'id'           => 'state',
			'label'        => 'State/Province',
			'options'      => 'get_states',
			'async_params' => array(
				'country' => '{{#.country}}', // References the country field in the same group
			),
		),
		'city' => array(
			'type'         => 'select',
			'id'           => 'city',
			'label'        => 'City',
			'options'      => 'get_cities',
			'async_params' => array(
				'country' => '{{#.country}}',
				'state'   => '{{#.state}}',
			),
		),
	),
),
```

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

### Using Values in Your Theme

```php
$color_scheme = get_post_meta( get_the_ID(), 'color_scheme', true );

if ( $color_scheme === 'dark' ) {
	add_filter( 'body_class', function ( $classes ) {
		$classes[] = 'dark-mode';
		return $classes;
	} );
} elseif ( $color_scheme === 'custom' ) {
	$custom_colors = get_post_meta( get_the_ID(), 'custom_colors', true );
	// Apply custom colors...
}

$color_options = array(
	'light'  => 'Light Mode',
	'dark'   => 'Dark Mode',
	'custom' => 'Custom Colors',
);

echo '<div class="selected-option">';
echo 'Selected Theme: ' . esc_html( $color_options[ $color_scheme ] ?? '' );
echo '</div>';
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->select(
	label: 'Color',
	options: array( 'red' => 'Red', 'green' => 'Green', 'blue' => 'Blue' ),
);
```

## Notes

- The Select field uses React Select, which provides a modern, searchable dropdown experience
- When the field loses focus, it sets its title to the selected option's label
- For selecting multiple options, use the [`multi_select`](multi_select.md) field type instead
- The dropdown menu is portaled to the document body to avoid layout issues with parent containers
- Options can be either statically defined or dynamically loaded through the API
- The field supports asynchronous searching when using `options_key`
- The field always includes a clear button to remove the selection
