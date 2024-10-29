# Comments Metabox

Comments metabox integrates custom fields into comment edit screen:

Example URL: `/wp-admin/comment.php?action=editcomment&c=1`

## Preview

![Integration of custom fields into comment metabox.](../images/integration-comment.png)

## Example

```php
wpify_custom_fields()->create_comment_metabox(
    array(
        'id'    => 'example_comment_metabox',
        'title' => 'Example Comment Metabox',
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

#### `$callback_args` *array*

Data that should be set as the `$args` property of the box array (which is the second parameter passed to your
callback).

#### `$meta_key` *string*

Meta key used to store the custom fields values. If meta key is not set, the individual fields will be stored as separate
meta values.

#### `$tabs` *array*

Tabs used for the custom fields.

#### `$items` *array*

List of the fields to be shown.
