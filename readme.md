# WPify Custom Fields

![PHP 8.1+](https://img.shields.io/badge/PHP-8.1%2B-7A86B8)
![WordPress 6.2+](https://img.shields.io/badge/WordPress-6.2%2B-21759B)
![License](https://img.shields.io/badge/License-GPL--3.0--or--later-blue)
![Packagist Version](https://img.shields.io/packagist/v/wpify/custom-fields)

A developer-oriented WordPress library for custom fields. 58 field types, 15 integration points (metaboxes, options pages, taxonomies, users, Gutenberg blocks, WooCommerce products/orders/coupons, and more), zero PHP dependencies, native WordPress storage — values are plain `get_post_meta()` / `get_option()` calls with no proprietary getters.

## Quick Start

```php
// Register a metabox with custom fields.
wpify_custom_fields()->create_metabox(
	array(
		'id'         => 'project_details',
		'title'      => __( 'Project Details', 'my-plugin' ),
		'post_types' => array( 'post' ),
		'items'      => array(
			'project_name' => array(
				'type'     => 'text',
				'label'    => __( 'Project Name', 'my-plugin' ),
				'required' => true,
			),
			'budget' => array(
				'type'  => 'number',
				'label' => __( 'Budget', 'my-plugin' ),
			),
			'is_featured' => array(
				'type'  => 'toggle',
				'label' => __( 'Featured', 'my-plugin' ),
				'title' => __( 'Show on the homepage', 'my-plugin' ),
			),
			'cover_image' => array(
				'type'       => 'attachment',
				'label'      => __( 'Cover Image', 'my-plugin' ),
				'conditions' => array(
					array( 'field' => 'is_featured', 'value' => true ),
				),
			),
		),
	)
);
```

Reading values — standard WordPress functions, no proprietary API required:

```php
$name  = get_post_meta( $post_id, 'project_name', true );
$image = get_post_meta( $post_id, 'cover_image', true ); // Attachment ID.
```

## Why This Library

- **58 field types** in 6 categories — from simple inputs to repeaters, groups, maps, code editors, and more
- **15 integration points** — post metaboxes, options pages, taxonomies, users, comments, menu items, Gutenberg blocks, WooCommerce products/variations/orders/coupons/settings/subscriptions/memberships, multisite
- **Native WordPress storage** — uses `post_meta`, `term_meta`, `options`, block attributes; no custom tables, no lock-in
- **Zero PHP dependencies** — a single Composer package, nothing extra to manage
- **Modern stack** — PHP 8.1+ with strict typing, React 18 UI, container queries, CSS custom properties
- **Conditional logic** — show/hide fields with 12 operators, AND/OR groups, nested conditions, dot-notation paths
- **Fluent FieldFactory API** — IDE-friendly PHP 8 named parameters with full autocomplete
- **Extensible** — register custom field types via PHP filters and JS hooks

## Field Types

### Simple (22)

| Type | Description |
|---|---|
| `text` | Single-line text input |
| `textarea` | Multi-line text input |
| `number` | Numeric input with min/max/step |
| `email` | Email address input |
| `password` | Password input |
| `tel` | Phone number input |
| `url` | URL input |
| `date` | Date picker |
| `datetime` | Date and time picker |
| `time` | Time picker |
| `month` | Month picker |
| `week` | Week picker |
| `date_range` | Start and end date pair |
| `select` | Dropdown select (sync or async options) |
| `multi_select` | Multiple selection dropdown |
| `radio` | Radio button group |
| `checkbox` | Single checkbox |
| `multi_checkbox` | Checkbox group |
| `toggle` | On/off switch |
| `multi_toggle` | Toggle group |
| `color` | Color picker |
| `range` | Range slider |

### Relational (10)

| Type | Description |
|---|---|
| `post` | Single post selector |
| `multi_post` | Multiple post selector |
| `term` | Single term selector |
| `multi_term` | Multiple term selector |
| `attachment` | Media library file picker |
| `multi_attachment` | Gallery / multiple files |
| `direct_file` | Direct file upload (no media library) |
| `multi_direct_file` | Multiple direct file uploads |
| `link` | Link with URL, title, and target |
| `multi_link` | Multiple links |

### Complex (5)

| Type | Description |
|---|---|
| `group` | Field group (nested fields) |
| `code` | Code editor with syntax highlighting |
| `wysiwyg` | TinyMCE rich text editor |
| `mapycz` | Mapy.cz map with coordinates |
| `inner_blocks` | Gutenberg InnerBlocks |

### Repeater (14)

| Type | Description |
|---|---|
| `multi_group` | Repeatable field group |
| `multi_text` | Repeatable text |
| `multi_textarea` | Repeatable textarea |
| `multi_number` | Repeatable number |
| `multi_email` | Repeatable email |
| `multi_tel` | Repeatable phone |
| `multi_url` | Repeatable URL |
| `multi_date` | Repeatable date |
| `multi_datetime` | Repeatable datetime |
| `multi_time` | Repeatable time |
| `multi_month` | Repeatable month |
| `multi_week` | Repeatable week |
| `multi_date_range` | Repeatable date range |
| `multi_mapycz` | Repeatable map |

### Static (5)

| Type | Description |
|---|---|
| `html` | Custom HTML content |
| `button` | Action button |
| `multi_button` | Button group |
| `title` | Section title / heading |
| `hidden` | Hidden input |

### Visual (2)

| Type | Description |
|---|---|
| `wrapper` | Visual wrapper around fields |
| `columns` | Multi-column layout |

## Integration Points

### WordPress Core

| Method | Context |
|---|---|
| `create_metabox()` | Post / CPT meta box |
| `create_gutenberg_block()` | Gutenberg block |
| `create_options_page()` | Admin options page |
| `create_taxonomy_options()` | Taxonomy term fields |
| `create_user_options()` | User profile fields |
| `create_comment_metabox()` | Comment meta fields |
| `create_menu_item_options()` | Nav menu item fields |

### WooCommerce

| Method | Context |
|---|---|
| `create_product_options()` | Product data tab |
| `create_product_variation_options()` | Product variation fields |
| `create_order_metabox()` | Order meta box (HPOS compatible) |
| `create_woocommerce_settings()` | WooCommerce settings tab |
| `create_coupon_options()` | Coupon fields |
| `create_subscription_metabox()` | Subscription meta box |
| `create_membership_plan_options()` | Membership plan fields |

### Multisite

| Method | Context |
|---|---|
| `create_site_options()` | Site options page |

All methods are called on the `wpify_custom_fields()` singleton instance.

## Features

### Conditional Logic

Show or hide fields based on other field values:

```php
'show_subtitle' => array(
	'type'  => 'toggle',
	'label' => __( 'Show Subtitle', 'my-plugin' ),
),
'subtitle' => array(
	'type'       => 'text',
	'label'      => __( 'Subtitle', 'my-plugin' ),
	'conditions' => array(
		array( 'field' => 'show_subtitle', 'value' => true ),
	),
),
```

Supported operators: `==`, `!=`, `>`, `>=`, `<`, `<=`, `between`, `contains`, `not_contains`, `in`, `not_in`, `empty`, `not_empty`. Conditions support AND/OR logic, nested groups, and dot-notation paths for nested fields.

### Tabs

Organize fields into a tabbed interface:

```php
wpify_custom_fields()->create_metabox(
	array(
		'id'    => 'my_metabox',
		'title' => __( 'Settings', 'my-plugin' ),
		'tabs'  => array(
			'general' => __( 'General', 'my-plugin' ),
			'advanced' => __( 'Advanced', 'my-plugin' ),
		),
		'items' => array(
			'title' => array(
				'type'  => 'text',
				'label' => __( 'Title', 'my-plugin' ),
				'tab'   => 'general',
			),
			'custom_css' => array(
				'type'     => 'code',
				'label'    => __( 'Custom CSS', 'my-plugin' ),
				'language' => 'css',
				'tab'      => 'advanced',
			),
		),
	)
);
```

### Fluent FieldFactory API

Build field definitions with PHP 8 named parameters and full IDE autocomplete:

```php
$f = wpify_custom_fields()->field_factory;

wpify_custom_fields()->create_metabox(
	array(
		'id'         => 'team_metabox',
		'title'      => __( 'Team', 'my-plugin' ),
		'post_types' => array( 'page' ),
		'items'      => array(
			'team_members' => $f->multi_group(
				label: __( 'Team Members', 'my-plugin' ),
				min: 1,
				max: 20,
				items: array(
					'name'  => $f->text( label: __( 'Name', 'my-plugin' ), required: true ),
					'role'  => $f->text( label: __( 'Role', 'my-plugin' ) ),
					'photo' => $f->attachment( label: __( 'Photo', 'my-plugin' ), attachment_type: 'image' ),
				),
			),
		),
	)
);
```

### Extensibility

- **PHP filters**: `wpifycf_sanitize_{type}`, `wpifycf_wp_type_{type}`, `wpifycf_default_value_{type}`, `wpifycf_items`
- **JS hooks** (`@wordpress/hooks`): `wpifycf_field_{type}`, `wpifycf_definition`, `wpifycf_generator_{name}`

See the [Extending documentation](docs/features/extending.md) for a full guide on creating custom field types.

## Installation

### Via Composer (Recommended)

```bash
composer require wpify/custom-fields
```

Include the Composer autoloader in your plugin or theme:

```php
require_once __DIR__ . '/vendor/autoload.php';
```

### As a WordPress Plugin

Download from the [Releases page](https://github.com/wpify/custom-fields/releases), upload to `/wp-content/plugins/`, and activate.

## Requirements

- PHP 8.1+
- WordPress 6.2+
- `ext-json`
- Modern browser (Chrome, Firefox, Safari, Edge)
- WooCommerce 8.0+ (optional, for WooCommerce integrations)

## Documentation

- [Getting Started](docs/index.md)
- [Field Types](docs/field-types.md)
- [Integrations](docs/integrations.md)
- [Conditional Logic](docs/features/conditions.md)
- [Tabs](docs/features/tabs.md)
- [Validation](docs/features/validation.md)
- [Field Factory](docs/features/field-factory.md)
- [Generators](docs/features/generators.md)
- [Extending](docs/features/extending.md)
- [REST API](docs/features/rest-api.md)
- [Type Aliases](docs/features/type-aliases.md)
- [Migration from 3.x to 4.x](docs/migration-3-to-4.md)

## License

WPify Custom Fields is released under the [GPL-3.0-or-later](https://www.gnu.org/licenses/gpl-3.0.html) license.
