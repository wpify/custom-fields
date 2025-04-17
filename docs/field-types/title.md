# Title Field Type

The Title field type provides a way to add section headings or dividers within your custom fields interface. It's a display-only field that doesn't store any data but helps organize and structure your form layout.

## Field Type: `title`

```php
array(
    'type'  => 'title',
    'id'    => 'section_heading',
    'title' => 'Advanced Settings',
)
```

## Properties

**For Default Field Properties, see [Field Types Definition](../field-types.md)**.

### `title` _(string)_ - Required

The text to display as the section heading. HTML tags are allowed and will be rendered properly.

### `className` _(string)_ - Optional

Additional CSS class to apply to the title container for custom styling.

## User Interface

The Title field renders as an `<h2>` heading element within a container div. It doesn't display the standard field wrapper, label, or description elements that other field types use.

## Stored Value

The Title field type doesn't store any data in the database. It's purely for visual organization of your custom fields interface.

## Example Usage

### Basic Section Heading

```php
'general_section' => array(
    'type'  => 'title',
    'id'    => 'general_section',
    'title' => 'General Information',
),
```

### Heading with HTML

```php
'advanced_section' => array(
    'type'  => 'title',
    'id'    => 'advanced_section',
    'title' => 'Advanced Settings <span class="beta-tag">Beta</span>',
),
```

### Using Multiple Section Headings for Organization

```php
// Example of using title fields to organize a complex form
$fields = array(
    'general_section' => array(
        'type'  => 'title',
        'id'    => 'general_section',
        'title' => 'General Information',
    ),
    'name' => array(
        'type'     => 'text',
        'id'       => 'name',
        'label'    => 'Name',
        'required' => true,
    ),
    'email' => array(
        'type'     => 'email',
        'id'       => 'email',
        'label'    => 'Email Address',
        'required' => true,
    ),
    
    'appearance_section' => array(
        'type'  => 'title',
        'id'    => 'appearance_section',
        'title' => 'Appearance Settings',
    ),
    'theme_color' => array(
        'type'    => 'color',
        'id'      => 'theme_color',
        'label'   => 'Theme Color',
        'default' => '#3366cc',
    ),
    'font_size' => array(
        'type'    => 'select',
        'id'      => 'font_size',
        'label'   => 'Font Size',
        'options' => array(
            'small'  => 'Small',
            'medium' => 'Medium',
            'large'  => 'Large',
        ),
    ),
    
    'advanced_section' => array(
        'type'  => 'title',
        'id'    => 'advanced_section',
        'title' => 'Advanced Options',
    ),
    // More fields...
);
```

## Styling Title Fields

You can customize the appearance of title fields using CSS:

```css
/* Target all title fields */
.wpify-field-title h2 {
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
    color: #23282d;
}

/* Target a specific title field */
.wpify-field-title--advanced_section h2 {
    color: #dc3232;
}
```

## Notes

- The Title field doesn't store or retrieve any data
- It's purely for visual organization of your custom fields interface
- Unlike most field types, it doesn't have a label or description
- It doesn't participate in validation or conditional logic evaluations
- The field can accept HTML in the title property, allowing for rich formatting
- Consider using title fields to break up long forms into logical sections
- When combined with the `tab` property for fields, you can organize complex forms with multiple sections under different tabs