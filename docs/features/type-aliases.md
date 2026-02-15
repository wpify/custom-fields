# Type Aliases (Backward Compatibility)

WPify Custom Fields maps several legacy field type names to their current equivalents. This ensures backward compatibility with older configurations and with the WPify Woo plugin.

## Overview

When field definitions are normalized, any legacy type name is automatically replaced with the current name. This happens transparently — you do not need to update existing code.

## Alias Table

| Legacy Name | Current Name | Notes |
|---|---|---|
| `multiswitch` | `multi_toggle` | Multi toggle field |
| `switch` | `toggle` | Single toggle field |
| `multiselect` | `multi_select` | Multi select field |
| `colorpicker` | `color` | Color picker field |
| `gallery` | `multi_attachment` | Multiple attachment field |
| `repeater` | `multi_group` | Repeatable group field |

## Example

These two definitions produce identical results:

```php
// Legacy name (still works)
'my_field' => array(
	'type'  => 'switch',
	'label' => 'Enable Feature',
	'title' => 'Turn on the feature',
),

// Current name (preferred for new code)
'my_field' => array(
	'type'  => 'toggle',
	'label' => 'Enable Feature',
	'title' => 'Turn on the feature',
),
```

## Notes

- Legacy names work indefinitely and will not be removed.
- Use the current names in new code for clarity and consistency.
- The alias mapping exists primarily for compatibility with the WPify Woo plugin.
- Aliases are resolved during item normalization in `BaseIntegration::normalize_item()`.
