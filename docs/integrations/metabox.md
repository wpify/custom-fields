# Metabox

## Example

```php
wpify_custom_fields()->create_metabox(
    array(
        'id'    => 'example_metabox',
        'title' => 'Example Metabox',
        'items' => array( /* fields definitions */ ),
        /* other arguments */
    ),
);
```

## Arguments

#### `$id` *string*

Meta box ID (used in the 'id' attribute for the meta box).

#### `$title` *string*

Title of the meta box.

#### `$priority` *string*

The priority within the context where the box should show.
You can use constants:

```php
\Wpify\CustomFields\Integrations\Comment::PRIORITY_HIGH    = 'high'
\Wpify\CustomFields\Integrations\Comment::PRIORITY_CORE    = 'core'
\Wpify\CustomFields\Integrations\Comment::PRIORITY_LOW     = 'low'
\Wpify\CustomFields\Integrations\Comment::PRIORITY_DEFAULT = 'default'
```

#### `$callback_args` *array*

Data that should be set as the `$args` property of the box array (which is the second parameter passed to your
callback).

#### `$meta_key` *string*

Meta key used to store the custom fields values. If meta key is empty, the individual fields will be stored as separate
meta.
