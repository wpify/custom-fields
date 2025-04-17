# WPify Custom Fields

WPify Custom Fields is a powerful, developer-oriented WordPress library for creating custom fields. It provides a comprehensive solution for integrating custom fields into various parts of WordPress and WooCommerce, from post metaboxes to product options, options pages, taxonomies, and much more.

Built with modern React.js and PHP 8.1+, this library offers maximum flexibility for developers while maintaining a clean, intuitive interface for end-users.

## Key Features

- **Extensive Integration Options**: Add custom fields to 14+ different contexts:
  - WordPress Core: Post Metaboxes, Taxonomies, Options Pages, Menu Items, Gutenberg Blocks, User Profiles, Comments
  - WooCommerce: Product Options, Product Variations, Order Metaboxes, Settings Pages, Subscriptions, Membership Plans
  - Multisite: Site Options, Network Options

- **50+ Field Types**: Build anything from simple forms to complex interfaces:
  - Simple Fields: Text, Textarea, Number, Select, Toggle, Checkbox, Date/Time, Color, etc.
  - Relational Fields: Post, Term, Attachment, Links
  - Complex Fields: Group, Code Editor, WYSIWYG, Map integration
  - Repeater Fields: Multi versions of all field types
  - Static Fields: HTML, Button, Title, Hidden

- **Powerful Conditional Logic**: Dynamically show/hide fields based on complex conditions:
  - Multiple comparison operators (equals, contains, greater than, etc.)
  - Complex AND/OR logic and nested condition groups
  - Advanced path references with dot notation for nested fields

- **Organized Field Groups**: Create better user experiences:
  - Tabbed interface for organizing related fields
  - Nested tabs for complex hierarchies
  - Collapsible field groups

- **Developer-Friendly**:
  - Strong typing with PHP 8.1+ features
  - Clean, standardized API
  - Extendable architecture for custom field types
  - Well-documented with consistent examples

## Requirements

- PHP 8.1 or later
- WordPress 6.2 or later
- Modern browser (Chrome, Firefox, Safari, Edge)

## Installation

### Via Composer (Recommended)

```bash
composer require wpify/custom-fields
```

### Manual Installation

1. Download the latest release from the [Releases page](https://github.com/wpify/custom-fields/releases)
2. Upload to your `/wp-content/plugins/` directory
3. Activate through the WordPress admin interface

## Quick Example

```php
// Create a custom metabox for posts
wpify_custom_fields()->create_metabox(
	array(
		'id'        => 'demo_metabox',
		'title'     => __( 'Demo Metabox', 'textdomain' ),
		'post_type' => 'post',
		'items'     => array(
			'text_field' => array(
				'type'        => 'text',
				'label'       => __( 'Text Field', 'textdomain' ),
				'description' => __( 'This is a simple text field', 'textdomain' ),
				'required'    => true,
			),
			'select_field' => array(
				'type'    => 'select',
				'label'   => __( 'Select Field', 'textdomain' ),
				'options' => array(
					'option1' => __( 'Option 1', 'textdomain' ),
					'option2' => __( 'Option 2', 'textdomain' ),
				),
				'conditions' => array(
					array(
						'field'     => 'text_field',
						'condition' => '!=',
						'value'     => '',
					),
				),
			),
		),
	)
);
```

## Why Choose WPify Custom Fields?

- **Flexible API**: Provides a consistent API across all WordPress and WooCommerce contexts
- **Modern Architecture**: Built with React and modern PHP principles
- **Performance Optimized**: Loads only the resources needed for each context
- **Comprehensive Solution**: No need for multiple plugins to handle different field contexts
- **Future-Proof**: Regularly updated and maintained
- **Extendable**: Create custom field types when needed

## Documentation

For comprehensive documentation, visit:

- [Main Documentation](docs/index.md)
- [Field Types](docs/field-types.md)
- [Integrations](docs/integrations.md)
- [Conditional Logic](docs/features/conditions.md)
- [Tabs System](docs/features/tabs.md)
- [Extending](docs/features/extending.md)
- [Migration from 3.x to 4.x](docs/migration-3-to-4.md)

## Support & Issues

If you encounter any issues or have questions, please [open an issue](https://github.com/wpify/custom-fields/issues) on our GitHub repository.

## License

WPify Custom Fields is released under the GPL v2 or later license.
