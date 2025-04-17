# Month Field Type

The Month field type provides a specialized input for selecting a specific month and year combination. It uses the browser's native month picker interface, making it ideal for selecting billing cycles, subscription periods, or any data that requires month-level precision.

## Field Type: `month`

```php
array(
    'type'  => 'month',
    'id'    => 'example_month',
    'label' => 'Billing Cycle',
    'min'   => '2023-01',
    'max'   => '2025-12',
)
```

## Properties

**For Default Field Properties, see [Field Types Definition](../field-types.md)**.

### `min` _(string)_ - Optional

The earliest month and year that can be selected. The value should be in ISO format (YYYY-MM).

### `max` _(string)_ - Optional

The latest month and year that can be selected. The value should be in ISO format (YYYY-MM).

### `attributes` _(array)_ - Optional

You can pass HTML attributes to the month input field. For example:

```php
'attributes' => array(
    'placeholder' => 'Select month',
    'class' => 'custom-month-picker',
),
```

## Stored Value

The field stores the month value as a string in ISO format (YYYY-MM), for example: `2023-04`.

## Example Usage

### Basic Month Field

```php
'publication_month' => array(
    'type'        => 'month',
    'id'          => 'publication_month',
    'label'       => 'Publication Month',
    'description' => 'Select the month when this content was published.',
    'required'    => true,
),
```

### Month Field with Range Constraints

```php
'academic_term' => array(
    'type'        => 'month',
    'id'          => 'academic_term',
    'label'       => 'Academic Term',
    'description' => 'Select a term within the current academic year.',
    'min'         => date('Y-m', strtotime('first day of september last year')),
    'max'         => date('Y-m', strtotime('first day of august next year')),
    'required'    => true,
),
```

### Using Month Values in Your Theme

```php
// Get the month value from the meta field
$publication_month = get_post_meta(get_the_ID(), 'publication_month', true);

if (!empty($publication_month)) {
    // Format the month according to your needs
    $date = new DateTime($publication_month . '-01'); // Add day to create full date
    $formatted_month = $date->format('F Y'); // e.g., "April 2023"
    
    echo '<div class="publication-date">';
    echo 'Published: ' . esc_html($formatted_month);
    echo '</div>';
}
```

### Month Field with Conditional Logic

```php
'has_expiry' => array(
    'type'  => 'toggle',
    'id'    => 'has_expiry',
    'label' => 'Has Expiration Date',
),
'expiry_month' => array(
    'type'        => 'month',
    'id'          => 'expiry_month',
    'label'       => 'Expiration Month',
    'description' => 'Select when this item expires.',
    'min'         => date('Y-m'), // Current month
    'conditions'  => array(
        array('field' => 'has_expiry', 'value' => true),
    ),
),
```

## Field Validation

The Month field validates that:
- If the field is required, a month must be selected
- The selected month falls within the optional min and max constraints

## Notes

- The month picker uses the browser's native month input, which may look different across different browsers and operating systems
- The saved value is always in ISO format (YYYY-MM), regardless of the display format shown to the user
- This field is particularly useful for data that needs month precision but not day precision
- For more specific date selection, use the `date` field type
- For selecting recurring months without the year, consider using a `select` field with month options