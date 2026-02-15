# Field Generators

Generators auto-populate field values on first render when the current value is empty. They are useful for assigning unique identifiers, timestamps, or other computed values to new entries.

## Overview

A generator runs once when a field is first displayed and its value is falsy (empty string, `null`, `undefined`, `false`, or `0`). If the field already has a value, the generator does not run.

## Usage

Add the `generator` property to any field definition:

```php
'unique_id' => array(
	'type'      => 'text',
	'label'     => 'Unique ID',
	'generator' => 'uuid',
	'disabled'  => true,
),
```

Or with the Field Factory:

```php
$f = wpify_custom_fields()->field_factory;

'unique_id' => $f->text(
	label: 'Unique ID',
	generator: 'uuid',
	disabled: true,
),
```

## Built-in Generators

### UUID Generator

The `uuid` generator creates a random UUID v4 string.

```php
'order_token' => array(
	'type'      => 'text',
	'label'     => 'Order Token',
	'generator' => 'uuid',
),
```

This produces a value like `550e8400-e29b-41d4-a716-446655440000`.

## How Generators Work

1. When a field component mounts, the `Field` component checks if `value` is falsy and `generator` is a string.
2. It applies the WordPress filter `wpifycf_generator_{name}`, passing the current value and field props.
3. If the filter returns a new value different from the current one, `onChange` is called to update the field.

```js
// Simplified internal logic
useEffect(() => {
  if (!value && typeof generator === 'string') {
    const nextValue = applyFilters('wpifycf_generator_' + generator, value, props);
    if (nextValue && nextValue !== value) {
      props.onChange(nextValue);
    }
  }
}, [value, generator]);
```

## Creating Custom Generators

Register a custom generator by adding a JavaScript filter with the `wpifycf_generator_{name}` hook:

```js
import { addFilter } from '@wordpress/hooks';

// Generator that creates a timestamp-based ID
addFilter( 'wpifycf_generator_timestamp_id', 'my-plugin', ( value, props ) => {
  return value || 'id_' + Date.now().toString( 36 );
} );
```

Then use it in your field definition:

```php
'entry_id' => array(
	'type'      => 'text',
	'label'     => 'Entry ID',
	'generator' => 'timestamp_id',
),
```

### Another Example — Slug Generator

```js
import { addFilter } from '@wordpress/hooks';

addFilter( 'wpifycf_generator_slug', 'my-plugin', ( value, props ) => {
  if ( value ) {
    return value;
  }
  // Generate a random slug
  return Math.random().toString( 36 ).substring( 2, 10 );
} );
```

## Best Practices

- **Always check the existing value** in your generator filter. Return the existing value if it is truthy to avoid overwriting user data.
- **Combine with `disabled: true`** for immutable identifiers that should not be edited after generation.
- **Use with hidden fields** when you need auto-generated values that users should not see.
- **Generators run client-side only.** They execute in the browser when the field renders. They do not run during PHP processing or REST API calls.
