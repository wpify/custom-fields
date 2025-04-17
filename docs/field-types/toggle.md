# Toggle Field Type

The Toggle field type provides a modern on/off switch control for boolean values. It's a user-friendly alternative to checkboxes, offering a clear visual indication of the current state while taking up minimal space in the interface.

## Field Type: `toggle`

```php
array(
    'type'  => 'toggle',
    'id'    => 'example_toggle',
    'label' => 'Feature Setting',
    'title' => 'Enable this feature',
)
```

## Properties

**For Default Field Properties, see [Field Types Definition](../field-types.md)**.

### `title` _(string)_ - Required

The text displayed directly next to the toggle switch, explaining what the toggle controls. HTML tags are allowed in this property.

### `default` _(boolean)_ - Optional, default: `false`

The default state of the toggle (true for on, false for off).

## User Interface

The Toggle field renders as a switch control with:

1. A label above (from the `label` property)
2. A title next to the switch (from the `title` property)
3. An animated switch that slides between on and off states

## Stored Value

The field stores a boolean value in the database:
- `true` when the toggle is on
- `false` or empty when the toggle is off

## Example Usage

### Basic Feature Toggle

```php
'enable_feature' => array(
    'type'        => 'toggle',
    'id'          => 'enable_feature',
    'label'       => 'Feature Control',
    'title'       => 'Enable this feature',
    'description' => 'Turn this feature on or off.',
    'default'     => false,
),
```

### Toggle with HTML in Title

```php
'show_related' => array(
    'type'    => 'toggle',
    'id'      => 'show_related',
    'label'   => 'Related Content',
    'title'   => 'Show related content <span class="recommended">(Recommended)</span>',
    'default' => true,
),
```

### Using Toggle Values in Your Theme

```php
// Get the toggle value from the meta field
$enable_feature = get_post_meta(get_the_ID(), 'enable_feature', true);

// Convert to proper boolean if needed
$enable_feature = filter_var($enable_feature, FILTER_VALIDATE_BOOLEAN);

if ($enable_feature) {
    // Feature is enabled, implement the functionality
    echo '<div class="special-feature">';
    // Feature content...
    echo '</div>';
    
    // Add specific classes or functionality
    add_filter('body_class', function($classes) {
        $classes[] = 'feature-enabled';
        return $classes;
    });
}
```

### Toggle Field Controlling Other Fields

Toggles are commonly used with conditional logic to show/hide other fields:

```php
'custom_colors' => array(
    'type'    => 'toggle',
    'id'      => 'custom_colors',
    'label'   => 'Custom Colors',
    'title'   => 'Use custom colors instead of theme defaults',
    'default' => false,
),
'primary_color' => array(
    'type'        => 'color',
    'id'          => 'primary_color',
    'label'       => 'Primary Color',
    'description' => 'Select a custom primary color.',
    'conditions'  => array(
        array('field' => 'custom_colors', 'value' => true),
    ),
),
'secondary_color' => array(
    'type'        => 'color',
    'id'          => 'secondary_color',
    'label'       => 'Secondary Color',
    'description' => 'Select a custom secondary color.',
    'conditions'  => array(
        array('field' => 'custom_colors', 'value' => true),
    ),
),
```

## Notes

- The Toggle field automatically updates its title to match the `title` property when toggled on
- When toggled off, the field title is empty
- Toggle fields are particularly useful for:
  - Enabling/disabling features
  - Showing/hiding additional form fields (with conditional logic)
  - Boolean settings like yes/no or on/off options
- The field provides visual feedback when toggled, making it more intuitive than checkboxes
- The field validates as a boolean type when required
- Unlike checkboxes, the toggle UI clearly communicates its current state
- For multiple boolean options that should be toggled independently, use separate Toggle fields
- For selecting multiple options from a set, consider using the `multi_toggle` field type instead