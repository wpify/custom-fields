# Field Factory

The Field Factory provides a fluent, IDE-friendly PHP API for building field definition arrays. Instead of writing associative arrays by hand, you can use named parameters with full autocomplete and type checking in your IDE.

## Overview

The Field Factory is a stateless helper that exposes one method per field type. Each method returns a plain array that is fully compatible with the existing `items` structure. You can mix Field Factory calls with hand-written arrays freely.

## Getting Started

Access the Field Factory via the `field_factory` property on the main `CustomFields` instance:

```php
$custom_fields = new \Wpify\CustomFields\CustomFields();
$f = $custom_fields->field_factory;
```

Or using the helper function:

```php
$f = wpify_custom_fields()->field_factory;
```

## Common Parameters

Every field method accepts these common parameters in addition to its type-specific ones:

| Parameter | Type | Description |
|---|---|---|
| `label` | `string\|null` | Field label displayed in the admin interface |
| `description` | `string\|null` | Help text displayed below the field |
| `required` | `bool\|null` | Whether the field must have a value |
| `default` | `mixed` | Default value for the field |
| `disabled` | `bool\|null` | Whether the field is disabled |
| `tab` | `string\|null` | Tab identifier for organizing fields |
| `class_name` | `string\|null` | CSS class name (mapped to `className` in output) |
| `conditions` | `array\|null` | Conditional display rules |
| `attributes` | `array\|null` | HTML attributes for the field element |
| `unfiltered` | `bool\|null` | Whether to skip sanitization |
| `render_options` | `array\|null` | Options for customizing field rendering |
| `generator` | `string\|null` | Generator identifier (e.g. `'uuid'`) |

Parameters set to `null` are omitted from the output array, so only explicitly set values are included.

## Field Methods Reference

### Basic Input

| Method | Type-specific Parameters |
|---|---|
| `text()` | `counter` _(bool)_ |
| `textarea()` | `counter` _(bool)_ |
| `email()` | — |
| `password()` | — |
| `tel()` | — |
| `url()` | — |
| `hidden()` | — |

### Numeric

| Method | Type-specific Parameters |
|---|---|
| `number()` | `min` _(float)_, `max` _(float)_, `step` _(float)_ |
| `range()` | `min` _(float)_, `max` _(float)_, `step` _(float)_ |

### Date / Time

| Method | Type-specific Parameters |
|---|---|
| `date()` | — |
| `datetime()` | — |
| `time()` | — |
| `month()` | — |
| `week()` | — |
| `date_range()` | `min` _(string)_, `max` _(string)_ |

### Selection

| Method | Type-specific Parameters |
|---|---|
| `select()` | `options` _(array)_, `options_key` _(string)_, `async_params` _(array)_ |
| `radio()` | `options` _(array)_ |
| `checkbox()` | `title` _(string)_ |
| `toggle()` | `title` _(string)_ |
| `color()` | — |

### Rich Content

| Method | Type-specific Parameters |
|---|---|
| `wysiwyg()` | `height` _(int)_, `toolbar` _(string)_, `delay` _(bool)_, `tabs` _(string)_, `force_modal` _(bool)_ |
| `code()` | `language` _(string)_, `height` _(int)_, `theme` _(string)_ |
| `html()` | `content` _(string)_ |

### File / Media

| Method | Type-specific Parameters |
|---|---|
| `attachment()` | `attachment_type` _(string)_ |
| `direct_file()` | `allowed_types` _(array)_, `max_size` _(int)_ |

### WordPress Objects

| Method | Type-specific Parameters |
|---|---|
| `post()` | `post_type` _(string\|array)_ |
| `term()` | `taxonomy` _(string)_ |
| `link()` | `post_type` _(string\|array)_ |

### Special

| Method | Type-specific Parameters |
|---|---|
| `mapycz()` | `lang` _(string)_ |
| `button()` | `title` _(string)_, `action` _(string)_, `url` _(string)_, `target` _(string)_, `primary` _(bool)_ |
| `multi_button()` | `buttons` _(array)_ |
| `title()` | `title` _(string)_ |

### Container

| Method | Type-specific Parameters |
|---|---|
| `group()` | `items` _(array, required)_ |
| `wrapper()` | `items` _(array, required)_, `tag` _(string)_, `classname` _(string)_ |
| `inner_blocks()` | `allowed_blocks` _(array)_, `template` _(array)_, `template_lock` _(string)_, `orientation` _(string)_ |

### Multi-field Variants

All multi-field methods accept the base type-specific parameters plus these additional parameters:

- `min` _(int)_ — Minimum number of items
- `max` _(int)_ — Maximum number of items
- `buttons` _(array)_ — Custom button labels
- `disabled_buttons` _(array)_ — Buttons to disable

Available multi-field methods: `multi_text`, `multi_textarea`, `multi_email`, `multi_tel`, `multi_url`, `multi_number`, `multi_date`, `multi_datetime`, `multi_time`, `multi_month`, `multi_week`, `multi_date_range`, `multi_select`, `multi_checkbox`, `multi_toggle`, `multi_post`, `multi_term`, `multi_attachment`, `multi_direct_file`, `multi_link`, `multi_mapycz`, `multi_group`.

## Usage Examples

### Basic Usage with Named Parameters

```php
$f = wpify_custom_fields()->field_factory;

wpify_custom_fields()->create_metabox(
	array(
		'id'         => 'my_metabox',
		'title'      => 'My Metabox',
		'post_types' => array( 'page' ),
		'items'      => array(
			'title' => $f->text(
				label: 'Title',
				required: true,
				counter: true,
			),
			'description' => $f->textarea(
				label: 'Description',
				description: 'Enter a short description.',
			),
			'category' => $f->select(
				label: 'Category',
				options: array(
					'news'    => 'News',
					'blog'    => 'Blog',
					'product' => 'Product',
				),
			),
		),
	)
);
```

### Integration Example — Options Page

```php
$f = wpify_custom_fields()->field_factory;

wpify_custom_fields()->create_options_page(
	array(
		'page_title' => 'Theme Settings',
		'menu_title' => 'Theme Settings',
		'menu_slug'  => 'theme-settings',
		'tabs'       => array(
			'general' => 'General',
			'social'  => 'Social Media',
		),
		'items'      => array(
			'site_logo' => $f->attachment(
				label: 'Site Logo',
				attachment_type: 'image',
				tab: 'general',
			),
			'footer_text' => $f->wysiwyg(
				label: 'Footer Text',
				height: 200,
				tab: 'general',
			),
			'twitter_url' => $f->url(
				label: 'Twitter URL',
				tab: 'social',
			),
			'facebook_url' => $f->url(
				label: 'Facebook URL',
				tab: 'social',
			),
		),
	)
);
```

### Group with Nested Fields

```php
$f = wpify_custom_fields()->field_factory;

'address' => $f->group(
	label: 'Address',
	items: array(
		'street' => $f->text( label: 'Street' ),
		'city'   => $f->text( label: 'City' ),
		'zip'    => $f->text( label: 'ZIP Code' ),
		'country' => $f->select(
			label: 'Country',
			options: array(
				'us' => 'United States',
				'ca' => 'Canada',
				'uk' => 'United Kingdom',
			),
		),
	),
),
```

### Conditional Fields

```php
$f = wpify_custom_fields()->field_factory;

'enable_cta' => $f->toggle(
	label: 'Enable CTA',
	title: 'Show a call-to-action button',
),
'cta_text' => $f->text(
	label: 'CTA Text',
	conditions: array(
		array( 'field' => 'enable_cta', 'value' => true ),
	),
),
'cta_url' => $f->url(
	label: 'CTA URL',
	conditions: array(
		array( 'field' => 'enable_cta', 'value' => true ),
	),
),
```

### Multi-field Variants

```php
$f = wpify_custom_fields()->field_factory;

'gallery' => $f->multi_attachment(
	label: 'Photo Gallery',
	attachment_type: 'image',
	min: 1,
	max: 10,
),
'team_members' => $f->multi_group(
	label: 'Team Members',
	min: 1,
	max: 20,
	items: array(
		'name'  => $f->text( label: 'Name', required: true ),
		'role'  => $f->text( label: 'Role' ),
		'photo' => $f->attachment( label: 'Photo', attachment_type: 'image' ),
	),
),
```

## How It Works

Each field method:

1. Accepts type-specific parameters first, followed by common parameters.
2. Calls `build_field()` which assembles a plain array with `'type' => '{type}'` plus all non-null parameters.
3. Uses `extract_common()` to separate type-specific from common parameters and remap snake_case PHP names to camelCase JS keys (e.g., `class_name` → `className`, `force_modal` → `forceModal`).
4. Uses a sentinel value for the `default` parameter to distinguish "not passed" from "passed as null".

## Notes

- Field Factory returns plain arrays — the output is fully compatible with existing array-based definitions and can be mixed freely.
- Only explicitly set parameters are included in the output. Passing `null` (the default for most parameters) omits the key entirely.
- Use PHP 8.0+ named arguments for the best developer experience. Positional arguments also work but are less readable.
- The `$f->group()` and `$f->multi_group()` methods require the `items` parameter.
