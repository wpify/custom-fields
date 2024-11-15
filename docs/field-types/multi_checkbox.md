# Multi Checkbox Field Type

The multi checkbox field type is used to create a set of checkboxes.

## Field Type: `checkbox`

```php
array(
    'type'    => 'multi_checkbox',
    'id'      => 'example_multi_checkbox',
    'label'   => 'Example Multi Checkbox',
    'options' => array(
        array( 'value' => 'option1', 'label' => 'Option 1 Title', 'disabled' => false ),
        array( 'value' => 'option2', 'label' => 'Option 2 Title', 'disabled' => false ),
        array( 'value' => 'option3', 'label' => 'Option 3 Title', 'disabled' => false ),
    ),
)
```

## Properties

**For Default Field Properties, see [Field Types Definition](../field-types.md)**.

### `$options` _(array)_

The options property is used to define the set of checkboxes. It is an associative array where the key is the option
value and the value is the option title.

```php
$options => array(
    'option1' => 'Option 1 Title',
    'option2' => 'Option 2 Title',
    'option3' => 'Option 3 Title',
),
```

Another possible shape of the options array is array of arrays. Each array should contain `value` and `label` keys.
Optionally, you can set the `disabled` key to `true` to disable the checkbox.

```php
'options' => array(
    array( 'value' => 'option1', 'label' => 'Option 1 Title', 'disabled' => false ),
    array( 'value' => 'option2', 'label' => 'Option 2 Title', 'disabled' => false ),
    array( 'value' => 'option3', 'label' => 'Option 3 Title', 'disabled' => false ),
),
```
