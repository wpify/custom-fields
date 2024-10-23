# WPify Custom Fields

WPify Custom Fields is a powerful, developer-oriented WordPress library for creating custom fields. This library offers maximum flexibility for developers to integrate custom fields into various parts of WordPress, ranging from post metaboxes to WooCommerce product options. Built with React.js and requiring no additional composer dependencies, it is designed to be highly extendable and future-proof.

## Features

- **Developer-Oriented**: WPify Custom Fields provides maximum control for developers who need flexibility in their WordPress projects.
- **Composer Support**: Easily integrate WPify Custom Fields into your project with Composer:  
  ```composer require wpify/custom-fields@next```
- **Broad Integration**: Custom fields can be implemented in a wide variety of locations, including but not limited to:
    - Custom Options Pages
    - Custom Network Option Pages
    - Comments
    - Custom Gutenberg Blocks
    - Menu Items
    - Post Metaboxes
    - WooCommerce Order Metabox
    - WooCommerce Product Options
    - WooCommerce Variable Product Options
    - WooCommerce Subscription Options
    - Site Options
    - Term Options
    - User Options
    - Woo Membership Plan Options
    - WooCommerce Settings
- **50+ Field Types**: A wide range of field types is available, allowing you to build anything from simple input fields to complex multi-attachment galleries.
- **Highly Expandable**: WPify Custom Fields is designed to be easily extended. You can create new custom field types and add them to custom implementations.
- **Conditional Logic**: Show or hide fields conditionally based on the current data, giving you more control over the display and functionality of your custom fields.
- **Tabbed Field Organization**: Organize your custom fields into tabs for better user experience and cleaner UI.
- **Required Fields**: Make fields required to ensure important data is captured.
- **React.js Powered**: Built using React.js for a modern and dynamic user interface.
- **No Composer Dependencies**: WPify Custom Fields is built to work without any additional composer dependencies.
- **System Requirements**:
    - PHP 8.1 or later
    - WordPress 6.2 or later

## Getting Started

Here’s how to easily create your first metabox using WPify Custom Fields:

```php
wpify_custom_fields()->create_metabox(
    array(
        'id'         => 'test_metabox',
        'title'      => 'Test Metabox',
        'post_types' => array( 'page' ),
        'tabs'       => array(
            'awesome' => 'Awesome Tab',
        ),
        'items'      => array(
            array(
                'label'       => 'Awesome Gallery',
                'description' => 'This is an awesome gallery of images. Pick some nice ones!',
                'type'        => 'multi_attachment',
                'required'    => true,
                'tab'         => 'awesome',
            ),
        ),
    )
);
```

### Installation

1. Install via Composer:
```bash
composer require wpify/custom-fields@next
```

2. Use in your theme or plugin by initializing the library and creating fields with simple and clean PHP syntax.

## Why WPify Custom Fields?

- **Flexibility**: WPify Custom Fields integrates with multiple parts of WordPress and WooCommerce, offering flexibility that surpasses most other custom field plugins.
- **Ease of Use**: While developer-focused, the library is designed to be straightforward, allowing you to implement custom fields with minimal code.
- **Extendable**: With the ability to create custom field types and implementations, you are never limited by the built-in features.
- **Future-Proof**: Built with React.js and PHP 8.1+, WPify Custom Fields is ready for modern WordPress development.

## Documentation & Support

For full documentation, examples, and advanced usage, please visit the [WPify Custom Fields documentation](https://github.com/wpify/custom-fields/tree/next/docs). If you encounter any issues or have questions, feel free to [open an issue](https://github.com/wpify/custom-fields/issues) on GitHub or reach out for support.
