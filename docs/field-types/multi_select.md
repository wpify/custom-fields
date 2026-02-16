# Multi Select Field Type

The Multi Select field type allows users to select multiple options from a searchable dropdown. It provides a modern interface with add/remove functionality, making it ideal for categorization, tagging, or any scenario requiring multiple selections from a predefined set.

## Field Type: `multi_select`

```php
array(
	'type'    => 'multi_select',
	'id'      => 'example_multi_select',
	'label'   => 'Tags',
	'options' => array(
		'php' => 'PHP',
		'js'  => 'JavaScript',
	),
	'min'     => 1,
	'max'     => 5,
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

- `options` _(array|callable)_ — The available options for selection. Can be an associative array (`'value' => 'Label'`), an array of arrays with `value` and `label` keys, or a callable that returns options dynamically
- `options_key` _(string)_ — Optional: A key referencing a registered REST endpoint for fetching options asynchronously
- `async_params` _(array)_ — Optional: Additional parameters passed to the options callback. Supports dynamic value replacement using `{{field_path}}` placeholders
- `min` _(integer)_ — Optional: Minimum number of items
- `max` _(integer)_ — Optional: Maximum number of items
- `buttons` _(array)_ — Optional: Custom button labels (add, remove, duplicate)
- `disabled_buttons` _(array)_ — Optional: Buttons to disable (move, delete, duplicate)

## Stored Value

The field stores an array of selected option values (strings) in the database:

```php
array( 'php', 'js' )
```

## Example Usage

### Basic Multi Select

```php
'product_tags' => array(
	'type'        => 'multi_select',
	'id'          => 'product_tags',
	'label'       => 'Product Tags',
	'description' => 'Select tags that apply to this product',
	'options'     => array(
		'new'      => 'New',
		'sale'     => 'Sale',
		'featured' => 'Featured',
		'limited'  => 'Limited Edition',
	),
	'default'     => array( 'new' ),
),
```

### Multi Select with Array of Objects

```php
'color_choices' => array(
	'type'    => 'multi_select',
	'id'      => 'color_choices',
	'label'   => 'Colors',
	'options' => array(
		array( 'value' => 'red', 'label' => 'Red' ),
		array( 'value' => 'green', 'label' => 'Green' ),
		array( 'value' => 'blue', 'label' => 'Blue' ),
	),
),
```

### Multi Select with Dynamic Options

```php
'country' => array(
	'type'    => 'multi_select',
	'id'      => 'country',
	'label'   => 'Countries',
	'options' => function ( array $args ): array {
		return array(
			'us' => 'United States',
			'ca' => 'Canada',
			'mx' => 'Mexico',
		);
	},
),
```

The callback receives an array with the following keys:
- `value`: The current value of the field
- `search`: The search term entered by the user
- Additional parameters passed via `async_params`

### Multi Select with Async Params

```php
'product_type' => array(
	'type'    => 'select',
	'id'      => 'product_type',
	'label'   => 'Product Type',
	'options' => array(
		'physical' => 'Physical Product',
		'digital'  => 'Digital Product',
	),
),
'product_features' => array(
	'type'         => 'multi_select',
	'id'           => 'product_features',
	'label'        => 'Product Features',
	'options'      => 'get_product_features',
	'async_params' => array(
		'type' => '{{product_type}}',
	),
),
```

The `async_params` support dynamic value replacement using `{{field_path}}` placeholders, following the same path syntax as [Conditions](../features/conditions.md#field-path-references):
- Dot notation for nested fields: `{{parent_field.nested_field}}`
- `#` for relative references: `{{#.sibling_field}}`
- Multiple `#` for parent levels: `{{##.parent_sibling_field}}`

### Using Values in Your Theme

```php
$product_tags = get_post_meta( get_the_ID(), 'product_tags', true );

if ( ! empty( $product_tags ) && is_array( $product_tags ) ) {
	$tag_labels = array(
		'new'      => 'New',
		'sale'     => 'Sale',
		'featured' => 'Featured',
		'limited'  => 'Limited Edition',
	);

	echo '<div class="product-tags">';
	foreach ( $product_tags as $tag ) {
		if ( isset( $tag_labels[ $tag ] ) ) {
			echo '<span class="product-tag product-tag--' . esc_attr( $tag ) . '">';
			echo esc_html( $tag_labels[ $tag ] );
			echo '</span>';
		}
	}
	echo '</div>';
}
```

### With Conditional Logic

```php
'has_variations' => array(
	'type'  => 'toggle',
	'id'    => 'has_variations',
	'label' => 'Product has variations?',
	'title' => 'Enable product variations',
),
'variation_attributes' => array(
	'type'       => 'multi_select',
	'id'         => 'variation_attributes',
	'label'      => 'Variation Attributes',
	'options'    => array(
		'color'    => 'Color',
		'size'     => 'Size',
		'material' => 'Material',
	),
	'conditions' => array(
		array( 'field' => 'has_variations', 'value' => true ),
	),
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->multi_select(
	label: 'Tags',
	options: array( 'php' => 'PHP', 'js' => 'JavaScript' ),
	min: 1,
	max: 5,
);
```

## Notes

- The Multi Select field is based on React Select, providing a modern searchable dropdown
- Selected options appear as chips/tags that can be individually removed
- The field prevents duplicate selections
- The stored value is always an array, even if only one option is selected
- Options can be provided as a static array, a callable, or via async REST endpoints
- Dynamic `async_params` allow creating dependent select fields where available options update based on other field values
