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

### `unfiltered`

Boolean value that determines whether the field value should be unfiltered. If set to `true`, the field value is not sanitized.

### `render_options`

Array of options that are passed to the field renderer. It can be used to customize the field rendering. Possible options:

* `noLabel`: Boolean value that determines whether the field label should be hidden.
* `noControlWrapper`: Boolean value that determines whether the field control should be wrapped in a div element.
* `noFieldWrapper`: Boolean value that determines whether the field should be wrapped in a div element.

## Simple field types

* [Checkbox](field-types/checkbox.md) `checkbox`
* [Multi Checkbox](field-types/multi_checkbox.md) `multi_checkbox`
* [Color](field-types/color.md) `color`
* [Date](field-types/date.md) `date`
* [Datetime](field-types/datetime.md) `datetime`
* [Email](field-types/email.md) `email`
* [Month](field-types/month.md) `month`
* [Number](field-types/number.md) `number`
* [Password](field-types/password.md) `password`
* [Radio](field-types/radio.md) `radio`
* [Range](field-types/range.md) `range`
* [Select](field-types/select.md) `select`
* [Multi Select](field-types/multi_select.md) `multi_select`
* [Tel (Phone)](field-types/tel.md) `tel`
* [Text](field-types/text.md) `text`
* [Textarea](field-types/textarea.md) `textarea`
* [Time](field-types/time.md) `time`
* [Toggle](field-types/toggle.md) `toggle`
* [Multi Toggle](field-types/multi_toggle.md) `multi_toggle`
* [URL](field-types/url.md) `url`
* [Week](field-types/week.md) `week`

## Relational field types

* [Attachment](field-types/attachment.md) `attachment`
* [Multi Attachment (gallery)](field-types/multi_attachment.md) `multi_attachment`
* [Direct File](field-types/direct-file.md) `direct_file`
* [Multi Direct File](field-types/direct-file.md) `multi_direct_file`
* [Link](field-types/link.md) `link`
* [Multi Link](field-types/multi_link.md) `multi_link`
* [Post](field-types/post.md) `post`
* [Multi Post](field-types/multi_post.md) `multi_post`
* [Term](field-types/term.md) `term`
* [Multi Term](field-types/multi_term.md) `multi_term`

## Complex field types

* [Code Editor](field-types/code.md) `code`
* [Group](field-types/group.md) `group`
* [Mapy.cz](field-types/mapycz.md) `mapycz`
* [WYSIWYG editor (TinyMCE)](field-types/wysiwyg.md) `wysiwyg`
* [Inner Blocks](field-types/inner_blocks.md) `inner_blocks`

## Repeater field types

* [Multi Date](field-types/multi_date.md) `multi_date`
* [Multi Datetime](field-types/multi_datetime.md) `multi_datetime`
* [Multi Email](field-types/multi_email.md) `multi_email`
* [Multi Group (Repeater)](field-types/multi_group.md) `multi_group`
* [Multi Mapy.cz](field-types/multi_mapycz.md) `multi_mapycz`
* [Multi Month](field-types/multi_month.md) `multi_month`
* [Multi Number](field-types/multi_number.md) `multi_number`
* [Multi Phone](field-types/multi_tel.md) `multi_tel`
* [Multi Text](field-types/multi_text.md) `multi_text`
* [Multi Textarea](field-types/multi_textarea.md) `multi_textarea`
* [Multi Time](field-types/multi_time.md) `multi_time`
* [Multi URL](field-types/multi_url.md) `multi_url`
* [Multi Week](field-types/multi_week.md) `multi_week`

## Static field types

* [Button](field-types/button.md) `button`
* [Multi Button](field-types/multi_button.md) `multi_button`
* [HTML](field-types/html.md) `html`
* [Title](field-types/title.md) `title`
* [Hidden](field-types/hidden.md) `hidden`