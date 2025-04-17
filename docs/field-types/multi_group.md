# MultiGroup

MultiGroup allows you to add, remove, reorder, and duplicate multiple instances of grouped fields.

## Field Configuration

```php
[
    'id' => 'team_members',
    'type' => 'multi_group',
    'label' => 'Team Members',
    'description' => 'Add multiple team members with their details',
    'items' => [
        [
            'id' => 'name',
            'type' => 'text',
            'label' => 'Name',
            'required' => true,
        ],
        [
            'id' => 'position',
            'type' => 'text',
            'label' => 'Position',
        ],
        [
            'id' => 'bio',
            'type' => 'textarea',
            'label' => 'Biography',
        ],
        [
            'id' => 'photo',
            'type' => 'attachment',
            'label' => 'Photo',
        ],
    ],
    'min' => 1,
    'max' => 10,
]
```

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `code` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have a value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(string)_ - Default value for the field
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

- **items** (array, required): An array of field configurations that define the structure of each group. Each item in this array should be a complete field configuration.
- **min** (number, optional): Sets the minimum number of group items. If set, the user won't be able to remove items below this number.
- **max** (number, optional): Sets the maximum number of group items. If set, the user won't be able to add more items beyond this number.
- **buttons** (array, optional): Customize button labels.
  - **add** (string, optional): Custom label for the add button. Default is "Add item".
  - **remove** (string, optional): Custom label for the remove button. Default is an icon button.
  - **duplicate** (string, optional): Custom label for the duplicate button. Default is an icon button.
- **disabled_buttons** (array, optional): Array of buttons to disable. Options: 'move', 'delete', 'duplicate'.
- **setTitle** (function, optional): Function that sets a custom title for each group item in the UI.

## Stored Value Format

The MultiGroup field stores data as an array of objects, where each object contains the values for each group item:

```php
[
    [
        'name' => 'John Doe',
        'position' => 'CEO',
        'bio' => 'John has been with the company since 2010...',
        'photo' => 123
    ],
    [
        'name' => 'Jane Smith',
        'position' => 'CTO',
        'bio' => 'Jane joined our team in 2015...',
        'photo' => 456
    ]
]
```

## Usage Examples

### Retrieving Data

```php
// Get the field value
$team_members = get_post_meta(get_the_ID(), 'team_members', true);

// Loop through each team member
if (!empty($team_members) && is_array($team_members)) {
    foreach ($team_members as $member) {
        $name = $member['name'] ?? '';
        $position = $member['position'] ?? '';
        $bio = $member['bio'] ?? '';
        $photo_id = $member['photo'] ?? 0;
        
        // Use the data as needed
        echo '<div class="team-member">';
        if ($photo_id) {
            echo wp_get_attachment_image($photo_id, 'thumbnail');
        }
        echo '<h3>' . esc_html($name) . '</h3>';
        echo '<p class="position">' . esc_html($position) . '</p>';
        echo '<div class="bio">' . esc_html($bio) . '</div>';
        echo '</div>';
    }
}
```

### Theme Implementation

```php
// Template part for team members section
function display_team_members() {
    $team_members = get_post_meta(get_the_ID(), 'team_members', true);
    
    if (empty($team_members) || !is_array($team_members)) {
        return;
    }
    
    echo '<section class="team-section">';
    echo '<div class="team-grid">';
    
    foreach ($team_members as $member) {
        $name = $member['name'] ?? '';
        $position = $member['position'] ?? '';
        $bio = $member['bio'] ?? '';
        $photo_id = $member['photo'] ?? 0;
        
        echo '<div class="team-card">';
        if ($photo_id) {
            echo '<div class="team-photo">';
            echo wp_get_attachment_image($photo_id, 'medium');
            echo '</div>';
        }
        echo '<div class="team-info">';
        echo '<h3 class="team-name">' . esc_html($name) . '</h3>';
        if ($position) {
            echo '<p class="team-position">' . esc_html($position) . '</p>';
        }
        if ($bio) {
            echo '<div class="team-bio">' . wp_kses_post($bio) . '</div>';
        }
        echo '</div>'; // .team-info
        echo '</div>'; // .team-card
    }
    
    echo '</div>'; // .team-grid
    echo '</section>'; // .team-section
}
```

## Features and Notes

- **Collapsible Interface**: Each group item can be collapsed/expanded to save space in the admin interface.
- **Drag and Drop Reordering**: Users can easily reorder group items using drag and drop.
- **Item Duplication**: Users can duplicate existing items to create new ones with the same values.
- **Dynamic Titles**: The field can display dynamic titles for each group item based on their content (using the first text field's value by default).
- **Validation**: Each field within the group can have its own validation rules.
- **Minimum/Maximum Items**: Enforce a minimum or maximum number of group items.
- **Nested Groups**: You can nest groups within MultiGroup fields to create complex hierarchical data structures.

The MultiGroup field is ideal for creating repeatable content sections with multiple fields, such as team members, services, testimonials, or any other content that follows a consistent structure but needs multiple instances.
