# Group Field Type

The Group field type allows you to organize multiple fields into a logical group, creating a structured data format. Groups are ideal for collecting related information that should be stored and managed together.

## Field Type: `group`

```php
array(
    'type'  => 'group',
    'id'    => 'example_group',
    'label' => 'Contact Information',
    'items' => array(
        'name' => array(
            'type'  => 'text',
            'label' => 'Name',
        ),
        'email' => array(
            'type'  => 'email',
            'label' => 'Email Address',
        ),
        'phone' => array(
            'type'  => 'tel',
            'label' => 'Phone Number',
        ),
    ),
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `group` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have a value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `items` _(array)_ - Required

An array of field definitions that make up the group. Each item in the array is a complete field definition with its own type, label, and other properties. Items can be defined as an associative array (as shown in the example above) or as a numeric array with 'id' property for each field.

## Stored Value

The Group field stores values as a structured array, with each subfield's value accessible by its ID. For example:

```php
array(
    'name'  => 'John Doe',
    'email' => 'john@example.com',
    'phone' => '555-123-4567',
)
```

## Validation

The Group field performs validation on each of its child fields according to their individual validation rules. If any child field fails validation, the entire group is considered invalid.

## Example Usage

### Basic Contact Information Group

```php
'contact_info' => array(
    'type'        => 'group',
    'id'          => 'contact_info',
    'label'       => 'Contact Information',
    'description' => 'Enter primary contact details.',
    'items'       => array(
        'name' => array(
            'type'     => 'text',
            'label'    => 'Full Name',
            'required' => true,
        ),
        'position' => array(
            'type'  => 'text',
            'label' => 'Position/Title',
        ),
        'email' => array(
            'type'     => 'email',
            'label'    => 'Email Address',
            'required' => true,
        ),
        'phone' => array(
            'type'  => 'tel',
            'label' => 'Phone Number',
        ),
    ),
)
```

### Nested Groups for Complex Data

```php
'business_details' => array(
    'type'   => 'group',
    'id'     => 'business_details',
    'label'  => 'Business Details',
    'items'  => array(
        'company_name' => array(
            'type'     => 'text',
            'label'    => 'Company Name',
            'required' => true,
        ),
        'address' => array(
            'type'  => 'group',
            'label' => 'Address',
            'items' => array(
                'street' => array(
                    'type'  => 'text',
                    'label' => 'Street Address',
                ),
                'city' => array(
                    'type'  => 'text',
                    'label' => 'City',
                ),
                'state' => array(
                    'type'  => 'text',
                    'label' => 'State/Province',
                ),
                'postal_code' => array(
                    'type'  => 'text',
                    'label' => 'Postal Code',
                ),
                'country' => array(
                    'type'  => 'select',
                    'label' => 'Country',
                    'options' => array(
                        'us' => 'United States',
                        'ca' => 'Canada',
                        // More countries...
                    ),
                ),
            ),
        ),
    ),
)
```

### Using Group Field Values in Your Theme

```php
// Get the group value from the meta field
$contact_info = get_post_meta(get_the_ID(), 'contact_info', true);

if (!empty($contact_info)) {
    echo '<div class="contact-card">';
    
    if (!empty($contact_info['name'])) {
        echo '<h3>' . esc_html($contact_info['name']) . '</h3>';
    }
    
    if (!empty($contact_info['position'])) {
        echo '<p class="position">' . esc_html($contact_info['position']) . '</p>';
    }
    
    if (!empty($contact_info['email'])) {
        echo '<p class="email"><strong>Email:</strong> ';
        echo '<a href="mailto:' . esc_attr($contact_info['email']) . '">';
        echo esc_html($contact_info['email']) . '</a></p>';
    }
    
    if (!empty($contact_info['phone'])) {
        echo '<p class="phone"><strong>Phone:</strong> ';
        echo esc_html($contact_info['phone']) . '</p>';
    }
    
    echo '</div>';
}
```

## Notes

- The Group field automatically sets its display title based on the first non-empty text or number field in the group
- Groups can be nested for more complex data structures (a group can contain another group)
- Groups are useful for organizing related fields that should be edited together
- Unlike the Multi Group field type, a Group field does not support repeating multiple sets of the same fields
- Fields inside a group should not have the `tab` property, as tab navigation is only applicable to root-level fields
- When saving a group to post meta, the entire group structure is saved as a single serialized array in the database, making it efficient for related data