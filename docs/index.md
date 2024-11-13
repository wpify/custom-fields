# WPify Custom fields

WPify Custom Fields is a powerful, developer-oriented WordPress library for creating custom fields. This library offers
maximum flexibility for developers to integrate custom fields into various parts of WordPress, ranging from post
metaboxes to WooCommerce product options. Built with React.js and requiring no additional composer dependencies, it is
designed to be highly extendable and future-proof.

## System requirements

In order to use WPify Custom Fields, you need to have the following system requirements:

* **PHP 8.1 or later**
* **WordPress 6.2 or later**

## Getting Started

To install WPify Custom Fields, you can use Composer:

```bash
composer require wpify/custom-fields
```

Don't forget to include composer dependencies in your project:

```php
require_once __DIR__ . '/vendor/autoload.php';
```

Then you can start creating the first metabox using WPify Custom Fields:

```php
wpify_custom_fields()->create_metabox(
    array(
        'id'         => 'test_metabox',
        'title'      => 'Test Metabox',
        'post_types' => array( 'page' ),
        'tabs'       => array(
            'awesome' => 'Awesome Tab',
        ),
        'items' => array(
            'example_text' => array(
                'type' => 'text',
                'label' => 'Example text',
                'required' => true,
                'tab' => 'awesome',
            ),
            'use_gallery' => array(
                'type' => 'toggle',
                'label' => 'Use gallery',
                'title' => 'Show the gallery on the page',
                'tab' => 'awesome',
            ),
            'gallery' => array(
                'type' => 'multi_attachment',
                'label' => 'Gallery',
                'tab' => 'awesome',
                'conditions' => array(
                    array( 'field' => 'use_gallery', 'value' => true ),
                ),
            ),
        ),
    )
);
```

There is plenty of integrations and field types you can use. Explore the documentation to find out more.

## Where to go next?

### [► Integrations](integrations.md)

Find where you can use custom fields in many places in WordPress or WooCommerce.

### [► Field types](field-types.md)

Learn about the available field types.

### [► Conditional logic](features/conditions.md)

Show or hide fields conditionally.

### [► Tabs](features/tabs.md)

Organize your custom fields into tabs.

### [► Extending custom fields](features/extending.md)

Learn how to create new custom field types.

## Migration guides

* [From v3.x to v4.x migration guide](migration-3-to-4.md)

## Notes for developers

* DO NOT upgrade @wordpress/scripts to v28.0+, as it would require WordPress 6.6+
