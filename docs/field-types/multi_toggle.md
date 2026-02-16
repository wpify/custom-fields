# Multi Toggle Field Type

The Multi Toggle field type provides a repeatable set of toggle switch inputs. Each toggle has a text label and stores a boolean value, offering a clear visual on/off interface for managing a dynamic list of settings.

## Field Type: `multi_toggle`

```php
array(
	'type'  => 'multi_toggle',
	'id'    => 'example_multi_toggle',
	'label' => 'Feature Toggles',
	'title' => 'Enable',
	'min'   => 1,
	'max'   => 5,
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

- `title` _(string)_ — Text displayed next to each toggle switch
- `min` _(integer)_ — Optional: Minimum number of items
- `max` _(integer)_ — Optional: Maximum number of items
- `buttons` _(array)_ — Optional: Custom button labels (add, remove, duplicate)
- `disabled_buttons` _(array)_ — Optional: Buttons to disable (move, delete, duplicate)

## Stored Value

The field stores an array of boolean values in the database:

```php
array( true, false, true )
```

## Example Usage

### Basic Multi Toggle

```php
'feature_flags' => array(
	'type'        => 'multi_toggle',
	'id'          => 'feature_flags',
	'label'       => 'Feature Flags',
	'description' => 'Manage feature toggles',
	'title'       => 'Enable this feature',
),
```

### Multi Toggle with Min/Max Constraints

```php
'service_toggles' => array(
	'type'        => 'multi_toggle',
	'id'          => 'service_toggles',
	'label'       => 'Service Settings',
	'description' => 'Enable or disable services',
	'title'       => 'Active',
	'min'         => 1,
	'max'         => 8,
),
```

### Multi Toggle with Custom Buttons

```php
'notification_settings' => array(
	'type'        => 'multi_toggle',
	'id'          => 'notification_settings',
	'label'       => 'Notification Settings',
	'title'       => 'Enabled',
	'buttons'     => array(
		'add'    => 'Add Notification Channel',
		'remove' => 'Remove Channel',
	),
),
```

### Using Values in Your Theme

```php
$feature_flags = get_post_meta( get_the_ID(), 'feature_flags', true );

if ( ! empty( $feature_flags ) && is_array( $feature_flags ) ) {
	$active_count = count( array_filter( $feature_flags ) );

	echo '<p>' . esc_html(
		sprintf( '%d of %d features enabled', $active_count, count( $feature_flags ) )
	) . '</p>';

	echo '<ul>';
	foreach ( $feature_flags as $index => $enabled ) {
		$status = $enabled ? 'On' : 'Off';
		echo '<li>' . esc_html( sprintf( 'Feature %d: %s', $index + 1, $status ) ) . '</li>';
	}
	echo '</ul>';
}
```

### With Conditional Logic

```php
'use_custom_features' => array(
	'type'  => 'toggle',
	'id'    => 'use_custom_features',
	'label' => 'Use custom features?',
	'title' => 'Enable custom feature management',
),
'custom_features' => array(
	'type'       => 'multi_toggle',
	'id'         => 'custom_features',
	'label'      => 'Custom Features',
	'title'      => 'Active',
	'min'        => 1,
	'max'        => 5,
	'conditions' => array(
		array( 'field' => 'use_custom_features', 'value' => true ),
	),
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->multi_toggle(
	label: 'Feature Toggles',
	title: 'Enable',
	min: 1,
	max: 5,
);
```

## Notes

- Each item in the repeater is a single toggle switch with the `title` text displayed next to it
- Toggle switches provide a clearer visual indication of on/off states compared to checkboxes
- The stored value is always an array of booleans, one per toggle item
- Items can be reordered by dragging
- The minimum/maximum constraints control how many toggle items can be added or removed
- Use `disabled_buttons` to restrict which actions are available to the user
