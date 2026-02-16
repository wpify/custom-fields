# Button Field Type

The Button field type allows you to add interactive buttons to your custom fields interface. These buttons can trigger actions through WordPress hooks or navigate to specific URLs.

## Field Type: `button`

```php
array(
	'type'    => 'button',
	'title'   => 'Click Me',
	'action'  => 'my_custom_action',
	'url'     => 'https://example.com',
	'target'  => '_blank',
	'primary' => true,
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

- `title` _(string)_ — The text to display on the button.
- `action` _(string)_ — Name of a WordPress hook action to trigger when the button is clicked. When the action is triggered, the field properties are passed as a parameter to the action callback.
- `url` _(string)_ — URL to navigate to when the button is clicked. This property is ignored if `action` is specified. Also accepts `href` as an alias.
- `target` _(string)_ — The target attribute for the link, specifying where to open the URL (e.g., `_blank`, `_self`). Defaults to `_blank`. This property is ignored if `action` is specified.
- `primary` _(boolean)_ — Whether to style the button as a primary action button with highlight color. Defaults to `false`.

## Stored Value

This field does not store any value.

## Example Usage

### Action Button

```php
'regenerate_button' => array(
	'type'    => 'button',
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
	'type'   => 'button',
	'title'  => 'View Documentation',
	'url'    => 'https://docs.example.com',
	'target' => '_blank',
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->button(
	title: 'Click Me',
	url: 'https://example.com',
	target: '_blank',
	primary: true,
);
```

## Notes

- The Button field type is a static field that does not store any data.
- It is useful for triggering JavaScript actions or providing quick navigation links.
- You can combine it with conditional logic to show or hide buttons based on other field values.
- To make buttons work with custom JavaScript actions, register your action handlers using the WordPress hooks API.
