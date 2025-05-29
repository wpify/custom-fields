# Button Field Type

The Button field type allows you to add interactive buttons to your custom fields interface. These buttons can be used for triggering actions through WordPress hooks or navigating to specific URLs.

## Field Type: `button`

```php
array(
    'type'    => 'button',
    'id'      => 'example_button',
    'title'   => 'Click Me',
    'action'  => 'my_custom_action',  // Optional WordPress hook to trigger
    'url'     => 'https://example.com', // Optional URL to navigate to
    'primary' => true, // Optional styling
    'target' => '_blank',
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `button` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the button should be disabled
- `attributes` _(array)_ - HTML attributes to add to the field
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `title` _(string)_ - Required

The text to display on the button.

#### `action` _(string)_ - Optional

Name of a WordPress hook action to trigger when the button is clicked. When the action is triggered, the field properties are passed as a parameter to the action callback.

#### `url` or `href` _(string)_ - Optional

URL to navigate to when the button is clicked. This property is ignored if `action` is specified.

#### `target` _(string)_ - Optional, default: `_blank`

The target attribute for the link, specifying where to open the URL. Common values are `_blank` (new tab) or `_self` (same tab). This property is ignored if `action` is specified.

#### `primary` _(boolean)_ - Optional, default: `false`

Whether to style the button as a primary action button (with highlight color).

## Example Usage

### Action Button

```php
'regenerate_button' => array(
    'type'    => 'button',
    'id'      => 'regenerate_button',
    'title'   => 'Regenerate Thumbnails',
    'action'  => 'my_regenerate_thumbnails_action',
    'primary' => true,
),
```

With JavaScript handler:

```javascript
// Add your action handler in your custom JS file
wp.hooks.addAction('my_regenerate_thumbnails_action', 'my-plugin', function(props) {
  // Your action code here
  console.log('Button clicked with props:', props);
  // e.g., start a regeneration process via AJAX
});
```

### URL Button

```php
'documentation_button' => array(
    'type'  => 'button',
    'id'    => 'documentation_button',
    'title' => 'View Documentation',
    'url'   => 'https://docs.example.com',
),
```

## Notes

- The Button field type is a static field that does not store any data
- It's useful for triggering JavaScript actions or providing quick navigation links
- You can combine it with conditional logic to show/hide buttons based on other field values
- To make buttons work with custom JavaScript actions, you need to register your action handlers using WordPress hooks API
