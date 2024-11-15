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

## Default Field Properties

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

* [Checkbox](field-types/checkbox.md) `checkbox`
* [Multi Checkbox](field-types/multi_checkbox.md) `multi_checkbox`
* Color `color`
* Date `date`
* DateTime `datetime`
* Email `email`
* Month `month`
* Number `number`
* Password `password`
* Range `range`
* Select `select`
* Multi Select `multi_select`
* Phone `tel`
* Text `text`
* Textarea `textarea`
* Time `time`
* Toggle `toggle`
* Multi Toggle `multi_toggle`
* URL `url`
* Week `week`

## Relational field types

* Attachment `attachment`
* Multi Attachment (gallery) `multi_attachment`
* Link `link`
* Multi Link `multi_link`
* Post `post`
* Multi Post `multi_post`
* Term `term`
* Multi Term `multi_term`

## Complex field types

* Code Editor `code`
* Group `group`
* Mapy.cz `mapycz`
* WYSIWYG editor (TinyMCE) `wysiwyg`
* [Inner Blocks](field-types/inner_blocks.md) `inner_blocks`

## Repeater field types

* Multi Date `multi_date`
* Multi DateTime `multi_datetime`
* Multi Email `multi_email`
* Multi Group (Repeater) `multi_group`
* Multi Mapy.cz `multi_mapycz`
* Multi Month `multi_month`
* Multi Number `multi_number`
* Multi Phone `multi_tel`
* Multi Text `multi_text`
* Multi Textarea `multi_textarea`
* Multi Time `multi_time`
* Multi URL `multi_url`
* Multi Week `multi_week`

## Static field types

* Button `button`
* Multi Button `multi_button`
* HTML `html`
* Title `title`
