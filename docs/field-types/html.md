# HTML Field Type

The HTML field type allows you to insert custom HTML content directly into your custom fields interface. This is useful for adding instructions, dividers, formatted text, or any other HTML elements without storing any values.

## Field Type: `html`

```php
array(
	'type'    => 'html',
	'id'      => 'example_html',
	'content' => '<div class="notice">This is a custom HTML notice with <strong>formatted text</strong>.</div>',
)
```

## Properties

**For Default Field Properties, see [Field Types Definition](../field-types.md)**.

### `content` _(string)_ - Required

The HTML content to display. This can be any valid HTML markup, including tags, attributes, and inline styles.

### `attributes` _(array)_ - Optional

You can pass HTML attributes to the container div that wraps your HTML content. For example:

```php
'attributes' => array(
	'class' => 'custom-html-container',
	'id'    => 'special-notice',
),
```

## Stored Value

The HTML field type does not store any values in the database. It is solely for display purposes.

## Example Usage

### Display Instructions

```php
'instructions' => array(
	'type'    => 'html',
	'id'      => 'setup_instructions',
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
	'id'      => 'section_divider',
	'content' => '<hr class="section-divider"><h3 class="section-title">Additional Settings</h3>',
),
```

### Display Dynamic Content

```php
'status_info' => array(
	'type'    => 'html',
	'id'      => 'connection_status',
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

## Notes

- The HTML field does not have a label by default (the `noLabel` render option is enabled)
- The content is rendered directly using React's `dangerouslySetInnerHTML`, so be careful with user-provided content
- An error boundary is included to prevent rendering failures from breaking the entire form
- This field type is particularly useful for:
  - Adding instructions or help text with rich formatting
  - Creating visual separators or section headers
  - Displaying dynamic information generated in PHP
  - Embedding small interactive elements
- Unlike most field types, HTML fields don't participate in data storage or validation
- For security reasons, JavaScript included in the HTML content might not execute correctly