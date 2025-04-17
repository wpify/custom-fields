# Extending Custom Fields

This document provides guidance on how to extend the WPify Custom Fields plugin with your own custom field types.

## Overview

The WPify Custom Fields plugin is designed to be highly extensible, allowing developers to create and register custom field types. To create a custom field type, you need to:

1. Create a PHP filter for sanitization
2. Specify the WordPress data type
3. Define default values
4. Create a JavaScript component for the field's UI
5. Register the field type with the WordPress filter system

## PHP Components

### 1. Sanitization Filter

Each field type requires a filter for sanitizing values. The filter follows the naming convention: `wpifycf_sanitize_{type}`.

```php
add_filter('wpifycf_sanitize_my_custom_field', function($sanitized_value, $original_value, $item) {
	// Custom sanitization logic
	return $sanitized_value;
}, 10, 3);
```

The filter receives three parameters:
- `$sanitized_value`: The pre-sanitized value (default WordPress sanitization)
- `$original_value`: The raw input value
- `$item`: The complete field configuration array

### 2. WordPress Data Type

Each field type must be mapped to a WordPress data type via the `wpifycf_wp_type_{type}` filter:

```php
add_filter('wpifycf_wp_type_my_custom_field', function($type, $item) {
	// Return one of: 'integer', 'number', 'boolean', 'object', 'array', 'string'
	return 'string';
}, 10, 2);
```

Available WordPress data types:
- `integer`: Whole numbers (no decimals)
- `number`: Numeric values (with decimals)
- `boolean`: True/false values
- `object`: Objects/associative arrays
- `array`: Indexed arrays/lists
- `string`: Text values

### 3. Default Value

Define a default value for your field type using the `wpifycf_default_value_{type}` filter:

```php
add_filter('wpifycf_default_value_my_custom_field', function($default_value, $item) {
	// Return the default value for this field type
	return '';
}, 10, 2);
```

## JavaScript Components

### 1. Field Component Definition

Create a React component that represents your field type:

```javascript
import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { checkValidityStringType } from '@/helpers/validators';

export function MyCustomField({
	id,
	htmlId,
	onChange,
	value = '',
	attributes = {},
	className,
	disabled = false,
}) {
	const handleChange = useCallback(event => onChange(event.target.value), [onChange]);
  
	return (
		<div 
			className={clsx('wpifycf-field-my-custom-field', `wpifycf-field-my-custom-field--${id}`, attributes.class, className)}
		>
			{/* Your field implementation */}
			<input
				type="text"
				id={htmlId}
				onChange={handleChange}
				value={value}
				disabled={disabled}
				{...attributes}
			/>
		</div>
	);
}
```

### 2. Validation Method

Add a validation method to your component:

```javascript
// You can use existing validators from helpers/validators.js
// or create your own validation function
MyCustomField.checkValidity = checkValidityStringType;
```

### 3. Field Type Registration

Register your field type using WordPress filters:

```javascript
// Register the field type
addFilter('wpifycf_field_my_custom_field', 'wpify_custom_fields', () => MyCustomField);
```

### 4. Including Your Field

Make sure your JavaScript file is loaded and registered with WordPress:

```php
wp_enqueue_script(
	'my-custom-fields',
	plugin_dir_url(__FILE__) . 'js/my-custom-fields.js',
	['wp-hooks', 'wpifycf-custom-fields'], // Dependencies
	'1.0.0',
	true
);
```

## Complete Example

Here's a complete example of creating a custom "Rating" field type:

### PHP Implementation

```php
/**
 * Register sanitization for the rating field
 */
add_filter('wpifycf_sanitize_rating', function($sanitized_value, $original_value, $item) {
	// Ensure rating is between 0 and 5
	$rating = intval($original_value);
	return min(5, max(0, $rating));
}, 10, 3);

/**
 * Register WordPress data type for the rating field
 */
add_filter('wpifycf_wp_type_rating', function($type, $item) {
	return 'integer';
}, 10, 2);

/**
 * Register default value for the rating field
 */
add_filter('wpifycf_default_value_rating', function($default_value, $item) {
	return 0;
}, 10, 2);
```

### JavaScript Implementation

```javascript
// rating.js
import { useCallback } from 'react';
import clsx from 'clsx';
import { addFilter } from '@wordpress/hooks';
import { checkValidityNumberType } from '@/helpers/validators';

export function Rating({
	id,
	htmlId,
	onChange,
	value = 0,
	attributes = {},
	className,
	disabled = false,
}) {
	const handleChange = useCallback(event => {
		const newValue = parseInt(event.target.value, 10);
		onChange(newValue);
	}, [onChange]);
  
	// Create five star buttons
	const stars = [];
	for (let i = 1; i <= 5; i++) {
		stars.push(
			<button 
				key={i}
				type="button"
				className={clsx(
					'wpifycf-rating-star',
					i <= value && 'wpifycf-rating-star--active'
				)}
				onClick={() => onChange(i)}
				disabled={disabled}
			>
				
			</button>
		);
	}
  
	return (
		<div 
			className={clsx('wpifycf-field-rating', `wpifycf-field-rating--${id}`, attributes.class, className)}
		>
			<input
				type="hidden"
				id={htmlId}
				value={value}
				{...attributes}
			/>
			<div className="wpifycf-rating-stars">
				{stars}
			</div>
		</div>
	);
}

// Use number type validation
Rating.checkValidity = checkValidityNumberType;

// Register field type
addFilter('wpifycf_field_rating', 'wpify_custom_fields', () => Rating);
```

## Using Your Custom Field

Once registered, you can use your custom field type in any integration:

```php
$custom_fields = new \Wpify\CustomFields\CustomFields();

$metabox = $custom_fields->create_metabox([
	'id' => 'product_review',
	'title' => 'Product Review',
	'post_types' => ['product'],
	'items' => [
		[
			'id' => 'rating',
			'type' => 'rating',  // Your custom field type
			'label' => 'Product Rating',
			'description' => 'Rate this product from 1 to 5 stars',
		],
		// Other fields...
	],
]);
```

## Advanced Usage: Multi-Fields

If you want to create a multi-version of your field (that accepts multiple values), you can leverage the existing multi-field framework:

```php
// Set the WordPress type for the multi-version
add_filter('wpifycf_wp_type_multi_rating', function($type, $item) {
	return 'array';
}, 10, 2);

// Set default value
add_filter('wpifycf_default_value_multi_rating', function($default_value, $item) {
	return [];
}, 10, 2);

// Sanitization is handled automatically through the multi_ prefix
```

Then create a JavaScript file that imports your base field and the MultiField component:

```javascript
// multi-rating.js
import { addFilter } from '@wordpress/hooks';
import { MultiField } from '@/components/MultiField';
import { Rating } from './rating';
import { checkValidityMultiFieldType } from '@/helpers/validators';

// Create the multi-field component
function MultiRating(props) {
	return <MultiField {...props} itemType="rating" />;
}

// Set validation
MultiRating.checkValidity = checkValidityMultiFieldType('rating');

// Register field type
addFilter('wpifycf_field_multi_rating', 'wpify_custom_fields', () => MultiRating);
```

## Best Practices

1. **Naming Conventions**: 
   - Use lowercase with underscores for field type identifiers
   - Use PascalCase for JavaScript components

2. **Validation**:
   - Always implement validation to ensure data integrity
   - Use existing validation helpers when possible

3. **CSS Naming**:
   - Follow the plugin's CSS naming: `wpifycf-field-{type}`
   - Add modifiers with double dashes: `wpifycf-field-{type}--modifier`

4. **Security**:
   - Always sanitize input values
   - Include proper escaping when outputting values

5. **Documentation**:
   - Add PHPDoc comments to your filters
   - Document expected input and output formats

## Troubleshooting

- **Field not showing up**: Ensure your JavaScript is properly enqueued and that it depends on the main plugin script
- **Validation errors**: Check browser console for JavaScript errors
- **Sanitization issues**: Verify that your PHP filter is correctly registered and follows the naming convention