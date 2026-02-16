# HTML Field Type

The HTML field type allows you to insert custom HTML content directly into your custom fields interface. This is useful for adding instructions, dividers, formatted text, or any other HTML elements without storing any values.

## Field Type: `html`

```php
array(
	'type'    => 'html',
	'content' => '<div class="notice">This is a custom HTML notice with <strong>formatted text</strong>.</div>',
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

- `content` _(string)_ — The HTML content to display. This can be any valid HTML markup, including tags, attributes, and inline styles.

## Stored Value

This field does not store any value.

## Example Usage

### Display Instructions

```php
'instructions' => array(
	'type'    => 'html',
	'content' => '<div class="instructions">
		<h3>Configuration Instructions</h3>
		<ol>
			<li>Enter your API key in the field below</li>
			<li>Choose your preferred settings</li>
			<li>Save the changes</li>
		</ol>
		<p class="note">Need help? <a href="https://example.com/support" target="_blank">Contact support</a></p>
	</div>',
),
```

### Add Section Divider

```php
'section_divider' => array(
	'type'    => 'html',
	'content' => '<hr class="section-divider"><h3 class="section-title">Additional Settings</h3>',
),
```

### Display Dynamic Content

```php
'status_info' => array(
	'type'    => 'html',
	'content' => sprintf(
		'<div class="connection-status %s">
			<p>Connection Status: <strong>%s</strong></p>
			<p>Last checked: %s</p>
		</div>',
		$is_connected ? 'connected' : 'disconnected',
		$is_connected ? 'Connected' : 'Disconnected',
		date_i18n( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), $last_checked )
	),
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->html(
	content: '<p>Custom HTML content here.</p>',
);
```

## Notes

- The HTML field does not have a label by default (the `noLabel` render option is enabled).
- The content is rendered directly using React's `dangerouslySetInnerHTML`, so be careful with user-provided content.
- An error boundary is included to prevent rendering failures from breaking the entire form.
- This field type is particularly useful for adding instructions or help text with rich formatting, creating visual separators or section headers, displaying dynamic information generated in PHP, and embedding small interactive elements.
- Unlike most field types, HTML fields do not participate in data storage or validation.
- For security reasons, JavaScript included in the HTML content might not execute correctly.
