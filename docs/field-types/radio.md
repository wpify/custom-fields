# Radio Field Type

The radio field type provides a set of radio buttons allowing users to select a single option from multiple choices.

## Field Type: `radio`

```php
array(
	'type'    => 'radio',
	'id'      => 'example_radio',
	'label'   => 'Select Option',
	'options' => array(
		'option1' => 'Option One',
		'option2' => 'Option Two',
		'option3' => 'Option Three',
	),
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `radio` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have a value selected
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
	array( 'value' => 'small', 'label' => 'Small' ),
	array( 'value' => 'medium', 'label' => 'Medium' ),
	array( 'value' => 'large', 'label' => 'Large' ),
),
```

You can also use an associative array:

```php
'options' => array(
	'small'  => 'Small',
	'medium' => 'Medium',
	'large'  => 'Large',
),
```

Another option is to use a callable function that returns the options array. This is useful for dynamic options:

```php
'options' => 'custom_get_sizes',
```

You have to define the `custom_get_sizes` function in your theme or plugin:

```php
function custom_get_sizes( array $args ): array {
	// Perform any logic to fetch or generate options
	
	return array(
		'small'  => 'Small',
		'medium' => 'Medium',
		'large'  => 'Large',
	);
}
```

The function accepts an array of arguments with the following keys:
- `value`: The current value of the field
- `search`: The search term entered by the user
- additional parameters passed via `async_params`

The function should return the option that is currently selected (value) and options that match the search term. The returned array should be in the same format as the static options.

#### `async_params` _(array)_ - Optional

Additional parameters to pass to the API when fetching options dynamically. Useful for filtering or customizing the returned options.

## Stored Value

The field stores the value (key) of the selected option as a string in the database.

## Example Usage

### Basic Radio Field

```php
'post_status' => array(
	'type'        => 'radio',
	'label'       => 'Post Status',
	'description' => 'Select the visibility status for this post.',
	'options'     => array(
		'public'  => 'Public',
		'private' => 'Private',
		'draft'   => 'Draft',
	),
	'default'     => 'public',
),
```

### Radio Field with Dynamic Options

```php
'product_size' => array(
	'type'        => 'radio',
	'label'       => 'Product Size',
	'description' => 'Select the product size.',
	'options'     => function ( array $args ): array {
		// Get sizes based on product category
		$category = get_post_meta( get_the_ID(), 'product_category', true );
		
		if ( $category === 'clothing' ) {
			return array(
				'xs' => 'Extra Small',
				's'  => 'Small',
				'm'  => 'Medium',
				'l'  => 'Large',
				'xl' => 'Extra Large',
			);
		} else {
			return array(
				'one-size' => 'One Size Fits All',
			);
		}
	},
	'default'     => 'm',
),
```

### Using Radio Values in Your Theme

```php
// Get the selected radio value
$post_status = get_post_meta( get_the_ID(), 'post_status', true );

// Use the value to control functionality
if ( $post_status === 'private' ) {
	// Check if user is logged in
	if ( ! is_user_logged_in() ) {
		wp_redirect( wp_login_url( get_permalink() ) );
		exit;
	}
} elseif ( $post_status === 'draft' ) {
	// Only show to editors and above
	if ( ! current_user_can( 'edit_posts' ) ) {
		wp_die( 'This content is not yet published.' );
	}
}

// Display the selected option label
$status_options = array(
	'public'  => 'Public',
	'private' => 'Private',
	'draft'   => 'Draft',
);

echo '<div class="post-status">';
echo 'Status: ' . esc_html( $status_options[ $post_status ] ?? 'Unknown' );
echo '</div>';
```

## Notes

- Radio buttons are ideal when you want users to select exactly one option from a small set of choices
- All radio options are visible at once, making it easy to see all available choices
- Unlike select fields, radio buttons take up more vertical space but provide better visibility
- Radio buttons within the same field automatically form a group where only one can be selected
- For selecting multiple options, use the [`multi_checkbox`](multi_checkbox.md) field type instead
- Each radio button has a unique ID generated from the field's HTML ID and its index for proper label association