# Field types definitions

All fields are defined as an array with properties inside the integration definition. Here is an example:

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

Please note that the array with metabox integration definition has `items` property, which contains an associative array with field definitions. This shape is preferred because it is easier to read and understand and is prone to ID duplicities.

There is also an alternative shape of the `items` array, where it is not an associative array and each field has required `id` property with the unique identifier.

```php
...
'items' => array(
    array(
        'id' => 'example_text',
        'type' => 'text',
        'label' => 'Example text',
        'required' => true,
        'tab' => 'awesome',
    ),
    array(
        'id' => 'use_gallery',
        'type' => 'toggle',
        'label' => 'Use gallery',
        'title' => 'Show the gallery on the page',
        'tab' => 'awesome',
    ),
    ...
),
...
```

It's completely up to you, which array shape you prefer.

## Default field properties

Every field definition can contain the following properties:

### `id`

Unique identifier of the field. It is used to reference the field in conditions and other places.

### `type`

Type of the field. It defines the behavior and appearance of the field. The list of available field types is described below.

### `label`

Label of the field. It is displayed next to the field in the admin interface.

### `description`

Description of the field. It is displayed below the field in the admin interface.

### `required`

Whether the field is required. If set to `true`, the field must be filled in before saving.

### `tab`

Tab where the field should be displayed. It is a key from the `tabs` array in the metabox definition. This property must be set only in the root fields, not in fields that are part of `group` or `multi_group` field type.

### `className`

Additional class name for the field container. It can be used to style the field with custom CSS.

### `conditions`

Array of conditions that must be met for the field to be displayed. Please read the [Conditional Logic](features/conditions.md) documentation for more information.

### `disabled`

Whether the field is disabled. If set to `true`, the field is not editable.

### `default`

Default value of the field. It is used when the field is not set.

### `attributes`

Array of additional attributes for the simple field types. It can be used to set custom attributes like `placeholder`, `min`, `max`, etc.

## Simple field types

* Checkbox
* Multi Checkbox
* Color
* Date
* DateTime
* Email
* Month
* Number
* Password
* Range
* Select
* Multi Select
* Phone
* Text
* Textarea
* Time
* Toggle
* Multi Toggle
* URL
* Week

## Relational field types

* Attachment
* Multi Attachment (gallery)
* Link
* Multi Link
* Post
* Multi Post
* Term
* Multi Term

## Complex field types

* Code Editor
* Group
* Mapy.cz
* WYSIWYG editor (TinyMCE)
* Inner Blocks (for Gutenberg Blocks only)

## Repeater field types

* Multi Date
* Multi DateTime
* Multi Email
* Multi Group
* Multi Mapy.cz
* Multi Month
* Multi Number
* Multi Phone
* Multi Text
* Multi Textarea
* Multi Time
* Multi URL
* Multi Week

## Static field types

* Button
* Multi Button
* HTML
* Title
