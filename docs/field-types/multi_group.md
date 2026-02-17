# Multi Group Field Type

The Multi Group field type allows you to add, remove, reorder, and duplicate multiple instances of grouped fields. It is ideal for creating repeatable content sections such as team members, services, testimonials, or any structured content that needs multiple instances.

## Field Type: `multi_group`

```php
array(
	'type'  => 'multi_group',
	'label' => 'Team Members',
	'items' => array(
		'name' => array(
			'type'     => 'text',
			'label'    => 'Name',
			'required' => true,
		),
		'position' => array(
			'type'  => 'text',
			'label' => 'Position',
		),
		'bio' => array(
			'type'  => 'textarea',
			'label' => 'Biography',
		),
		'photo' => array(
			'type'  => 'attachment',
			'label' => 'Photo',
		),
	),
	'min' => 1,
	'max' => 10,
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

- `items` _(array)_ — An array of field configurations that define the structure of each group. Each item should be a complete field definition.
- `min` _(integer)_ — The minimum number of group items. If set, the user cannot remove items below this number.
- `max` _(integer)_ — The maximum number of group items. If set, the user cannot add more items beyond this number.
- `buttons` _(array)_ — Customize button labels:
  - `add` _(string)_ — Custom label for the add button. Default is "Add item".
  - `remove` _(string)_ — Custom label for the remove button. Default is an icon button.
  - `duplicate` _(string)_ — Custom label for the duplicate button. Default is an icon button.
- `disabled_buttons` _(array)_ — Array of buttons to disable. Options: `'move'`, `'delete'`, `'duplicate'`.
- `collapse` _(boolean)_ — Whether group items can be collapsed. Default `true`. When `false`, all items are always expanded and cannot be collapsed.
- `setTitle` _(function)_ — Function that sets a custom title for each group item in the UI.

## Stored Value

The Multi Group field stores data as an array of objects, where each object contains the values for one group item:

```php
array(
	array(
		'name'     => 'John Doe',
		'position' => 'CEO',
		'bio'      => 'John has been with the company since 2010...',
		'photo'    => 123,
	),
	array(
		'name'     => 'Jane Smith',
		'position' => 'CTO',
		'bio'      => 'Jane joined our team in 2015...',
		'photo'    => 456,
	),
)
```

## Example Usage

### Retrieving Data

```php
$team_members = get_post_meta( get_the_ID(), 'team_members', true );

if ( ! empty( $team_members ) && is_array( $team_members ) ) {
	foreach ( $team_members as $member ) {
		$name     = $member['name'] ?? '';
		$position = $member['position'] ?? '';
		$bio      = $member['bio'] ?? '';
		$photo_id = $member['photo'] ?? 0;

		echo '<div class="team-member">';
		if ( $photo_id ) {
			echo wp_get_attachment_image( $photo_id, 'thumbnail' );
		}
		echo '<h3>' . esc_html( $name ) . '</h3>';
		echo '<p class="position">' . esc_html( $position ) . '</p>';
		echo '<div class="bio">' . esc_html( $bio ) . '</div>';
		echo '</div>';
	}
}
```

### Using Values in Your Theme

```php
function display_team_members() {
	$team_members = get_post_meta( get_the_ID(), 'team_members', true );

	if ( empty( $team_members ) || ! is_array( $team_members ) ) {
		return;
	}

	echo '<section class="team-section">';
	echo '<div class="team-grid">';

	foreach ( $team_members as $member ) {
		$name     = $member['name'] ?? '';
		$position = $member['position'] ?? '';
		$bio      = $member['bio'] ?? '';
		$photo_id = $member['photo'] ?? 0;

		echo '<div class="team-card">';
		if ( $photo_id ) {
			echo '<div class="team-photo">';
			echo wp_get_attachment_image( $photo_id, 'medium' );
			echo '</div>';
		}
		echo '<div class="team-info">';
		echo '<h3 class="team-name">' . esc_html( $name ) . '</h3>';
		if ( $position ) {
			echo '<p class="team-position">' . esc_html( $position ) . '</p>';
		}
		if ( $bio ) {
			echo '<div class="team-bio">' . wp_kses_post( $bio ) . '</div>';
		}
		echo '</div>';
		echo '</div>';
	}

	echo '</div>';
	echo '</section>';
}
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->multi_group(
	label: 'Team Members',
	items: array(
		$f->text( label: 'Name', required: true ),
		$f->text( label: 'Position' ),
		$f->textarea( label: 'Biography' ),
		$f->attachment( label: 'Photo', attachment_type: 'image' ),
	),
	min: 1,
	max: 10,
	collapse: false,
);
```

## Notes

- Each group item can be collapsed and expanded to save space in the admin interface. Set `collapse` to `false` to keep all items always expanded.
- Users can reorder group items using drag and drop.
- Users can duplicate existing items to create new ones with the same values.
- The field can display dynamic titles for each group item based on their content (using the first text field's value by default).
- Each field within the group can have its own validation rules.
- You can enforce a minimum or maximum number of group items using `min` and `max`.
- You can nest groups within Multi Group fields to create complex hierarchical data structures.
