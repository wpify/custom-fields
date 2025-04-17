# Conditional Fields

The WPify Custom Fields plugin provides a powerful conditional logic system that allows you to dynamically show or hide fields based on the values of other fields. This feature gives you the ability to create interactive, contextual forms that adapt to user input.

## Basic Usage

To make a field conditional, add the `conditions` parameter to your field definition:

```php
array(
	'type'       => 'text',
	'id'         => 'conditional_field',
	'label'      => 'This field depends on another field',
	'conditions' => array(
		array(
			'field'     => 'another_field',
			'value'     => 'show_me',
		),
	),
)
```

This example will only show the field when the value of `another_field` equals `show_me`.

## Condition Structure

The `conditions` parameter expects an array of condition rules. Each condition rule is an associative array with the following keys:

- `field`: The ID of the field to check (can include path references)
- `condition`: The comparison operator
- `value`: The value to compare against

## Available Comparison Operators

| Operator       | Description                | Example                                                    |
|----------------|----------------------------|------------------------------------------------------------|
| `==`           | Equal (default)            | `'condition' => '==', 'value' => 10`                       |
| `!=`           | Not equal                  | `'condition' => '!=', 'value' => 10`                       |
| `>`            | Greater than               | `'condition' => '>', 'value' => 10`                        |
| `>=`           | Greater than or equal      | `'condition' => '>=', 'value' => 10`                       |
| `<`            | Less than                  | `'condition' => '<', 'value' => 10`                        |
| `<=`           | Less than or equal         | `'condition' => '<=', 'value' => 10`                       |
| `between`      | Between (inclusive)        | `'condition' => 'between', 'value' => array(5, 10)`        |
| `contains`     | Contains substring         | `'condition' => 'contains', 'value' => 'something'`        |
| `not_contains` | Does not contain substring | `'condition' => 'not_contains', 'value' => 'something`     |
| `in`           | Value is in array          | `'condition' => 'in', 'value' => array('a', 'b', 'c')`     |
| `not_in`       | Value is not in array      | `'condition' => 'not_in', 'value' => array('x', 'y', 'z')` |
| `empty`        | Value is empty             | `'condition' => 'empty'`                                   |
| `not_empty`    | Value is not empty         | `'condition' => 'not_empty'`                               |

## Multiple Conditions

You can combine multiple conditions with AND or OR logic:

### AND Logic (Default)

All conditions must be true for the field to be shown:

```php
array(
	'type'       => 'text',
	'id'         => 'conditional_field',
	'label'      => 'Field that requires multiple conditions',
	'conditions' => array(
		array(
			'field'     => 'field_1',
			'condition' => '==',
			'value'     => 'value_1',
		),
		'and',
		array(
			'field'     => 'field_2',
			'condition' => '==',
			'value'     => 'value_2',
		),
	),
)
```

### OR Logic

Any condition can be true for the field to be shown:

```php
array(
	'type'       => 'text',
	'id'         => 'conditional_field',
	'label'      => 'Field that requires any condition',
	'conditions' => array(
		array(
			'field'     => 'field_1',
			'condition' => '==',
			'value'     => 'value_1',
		),
		'or',
		array(
			'field'     => 'field_2',
			'condition' => '==',
			'value'     => 'value_2',
		),
	),
)
```

## Nested Conditions

You can create complex condition logic by nesting condition groups:

```php
array(
	'type'       => 'text',
	'id'         => 'complex_conditional_field',
	'label'      => 'Field with complex conditions',
	'conditions' => array(
		array(
			'field'     => 'field_1',
			'condition' => '==',
			'value'     => 'value_1',
		),
		'and',
		array(
			array(
				'field'     => 'field_2',
				'condition' => '==',
				'value'     => 'value_2',
			),
			'or',
			array(
				'field'     => 'field_3',
				'condition' => '==',
				'value'     => 'value_3',
			),
		),
	),
)
```

This example translates to: Show the field if `field_1` equals `value_1` AND (`field_2` equals `value_2` OR `field_3` equals `value_3`).

## Field Path References

You can reference fields within nested structures by using dot notation and special characters:

### Basic Path References

Use dot notation to access nested fields:

```php
array(
	'field'     => 'parent_field.nested_field',
	'condition' => '==',
	'value'     => 'some_value',
)
```

### Relative Path References

Use hash (#) symbols to reference relative paths:

- `#` references the parent field
- `##` references the grandparent field
- `###` references the great-grandparent field
- etc.

```php
// In a deeply nested field structure
array(
	'field'     => '#.sibling_field',
	'condition' => '==',
	'value'     => 'show_me',
)
```

### Accessing Array Elements

To reference specific items in an array (useful for multi-fields like `multi_text`):

```php
array(
	'field'     => 'my_multi_field[0]',
	'condition' => '==',
	'value'     => 'first_value',
)
```

## Practical Examples

### Example 1: Show/Hide Based on Select Field

```php
array(
	'type'    => 'select',
	'id'      => 'shipping_method',
	'label'   => 'Shipping Method',
	'options' => array(
		'standard'    => 'Standard',
		'express'     => 'Express',
		'free'        => 'Free',
		'pickup'      => 'Local Pickup',
		'custom'      => 'Custom',
	),
),

array(
	'type'       => 'text',
	'id'         => 'express_details',
	'label'      => 'Express Shipping Details',
	'conditions' => array(
		array(
			'field'     => 'shipping_method',
			'condition' => '==',
			'value'     => 'express',
		),
	),
),

array(
	'type'       => 'text',
	'id'         => 'pickup_location',
	'label'      => 'Pickup Location',
	'conditions' => array(
		array(
			'field'     => 'shipping_method',
			'condition' => '==',
			'value'     => 'pickup',
		),
	),
),

array(
	'type'       => 'textarea',
	'id'         => 'custom_shipping_instructions',
	'label'      => 'Custom Shipping Instructions',
	'conditions' => array(
		array(
			'field'     => 'shipping_method',
			'condition' => '==',
			'value'     => 'custom',
		),
	),
),
```

### Example 2: Price Range with Complex Conditions

```php
array(
	'type'    => 'select',
	'id'      => 'pricing_type',
	'label'   => 'Pricing Type',
	'options' => array(
		'free'     => 'Free',
		'fixed'    => 'Fixed Price',
		'variable' => 'Variable Price',
		'tiered'   => 'Tiered Pricing',
	),
),

array(
	'type'       => 'number',
	'id'         => 'fixed_price',
	'label'      => 'Price',
	'conditions' => array(
		array(
			'field'     => 'pricing_type',
			'condition' => '==',
			'value'     => 'fixed',
		),
	),
),

array(
	'type'       => 'number',
	'id'         => 'min_price',
	'label'      => 'Minimum Price',
	'conditions' => array(
		array(
			array(
				'field'     => 'pricing_type',
				'condition' => '==',
				'value'     => 'variable',
			),
			'or',
			array(
				'field'     => 'pricing_type',
				'condition' => '==',
				'value'     => 'tiered',
			),
		),
	),
),

array(
	'type'       => 'number',
	'id'         => 'max_price',
	'label'      => 'Maximum Price',
	'conditions' => array(
		array(
			array(
				'field'     => 'pricing_type',
				'condition' => '==',
				'value'     => 'variable',
			),
			'or',
			array(
				'field'     => 'pricing_type',
				'condition' => '==',
				'value'     => 'tiered',
			),
		),
	),
),

array(
	'type'       => 'multi_text',
	'id'         => 'tier_thresholds',
	'label'      => 'Tier Thresholds',
	'conditions' => array(
		array(
			'field'     => 'pricing_type',
			'condition' => '==',
			'value'     => 'tiered',
		),
	),
),
```

### Example 3: Conditional Fields in a Group

```php
array(
	'type'  => 'group',
	'id'    => 'contact_info',
	'label' => 'Contact Information',
	'items' => array(
		array(
			'type'    => 'select',
			'id'      => 'contact_method',
			'label'   => 'Preferred Contact Method',
			'options' => array(
				'email'  => 'Email',
				'phone'  => 'Phone',
				'mail'   => 'Mail',
				'none'   => 'No Contact',
			),
		),
		array(
			'type'       => 'email',
			'id'         => 'email_address',
			'label'      => 'Email Address',
			'conditions' => array(
				array(
					'field'     => '#.contact_method',
					'condition' => '==',
					'value'     => 'email',
				),
			),
		),
		array(
			'type'       => 'tel',
			'id'         => 'phone_number',
			'label'      => 'Phone Number',
			'conditions' => array(
				array(
					'field'     => '#.contact_method',
					'condition' => '==',
					'value'     => 'phone',
				),
			),
		),
		array(
			'type'       => 'group',
			'id'         => 'mailing_address',
			'label'      => 'Mailing Address',
			'conditions' => array(
				array(
					'field'     => '#.contact_method',
					'condition' => '==',
					'value'     => 'mail',
				),
			),
			'items'      => array(
				array(
					'type'  => 'text',
					'id'    => 'street',
					'label' => 'Street',
				),
				array(
					'type'  => 'text',
					'id'    => 'city',
					'label' => 'City',
				),
				array(
					'type'  => 'text',
					'id'    => 'state',
					'label' => 'State/Province',
				),
				array(
					'type'  => 'text',
					'id'    => 'postal_code',
					'label' => 'Postal Code',
				),
			),
		),
	),
),
```

### Example 4: Using the `empty` and `not_empty` Conditions

```php
array(
	'type'  => 'text',
	'id'    => 'optional_field',
	'label' => 'Optional Information',
),

array(
	'type'       => 'textarea',
	'id'         => 'additional_details',
	'label'      => 'Additional Details',
	'conditions' => array(
		array(
			'field'     => 'optional_field',
			'condition' => 'not_empty',
		),
	),
),

array(
	'type'       => 'text',
	'id'         => 'empty_field_notice',
	'label'      => 'Notice: Optional Field is Empty',
	'conditions' => array(
		array(
			'field'     => 'optional_field',
			'condition' => 'empty',
		),
	),
),
```

## Notes on Implementation

1. Conditions are evaluated in real-time as users interact with the form.
2. Hidden fields will still be submitted with the form, but their values will have a `data-hide-field="true"` attribute.
3. Conditional logic is implemented client-side using JavaScript (React).
4. The system supports backward compatibility with older field definitions.
5. For complex multi-level nested conditions, make sure to properly structure the arrays and operator placement.

## Technical Implementation

The conditional logic is implemented in the JavaScript files:

- `Field.js`: Integrates the `useConditions` hook to determine field visibility
- `hooks.js`: Contains the `useConditions` hook that evaluates conditions against current field values
- `functions.js`: Contains the `evaluateConditions` and `evaluateCondition` functions that perform the actual logic

The condition evaluation system traverses the condition structure, resolves field references, and applies the appropriate comparison operations to determine if a field should be displayed.
