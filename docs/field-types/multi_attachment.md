# Multi Attachment Field Type

The Multi Attachment field type allows selecting and arranging multiple files from the WordPress media library. It's commonly used for creating image galleries, document collections, or any feature requiring multiple media items.

## Field Type: `multi_attachment`

```php
array(
    'type'           => 'multi_attachment',
    'id'             => 'example_gallery',
    'label'          => 'Image Gallery',
    'attachment_type' => 'image', // Optional, limit to specific media types
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `multi_attachment` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have at least one item
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(array)_ - Default attachment IDs for the field
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `attachment_type` _(string)_ - Optional

Limits the type of files that can be selected from the media library. Common values include:

- Empty string (default) - allows all media types
- `image` - limits selection to images only
- `video` - limits selection to video files
- `audio` - limits selection to audio files
- `application/pdf` - limits selection to PDF documents

## User Interface

The Multi Attachment field provides an interactive interface with:

1. **Add Button**: Opens the WordPress media library for selecting files
2. **Thumbnail Grid**: Displays selected files with thumbnails or icons
3. **Drag & Drop**: Allows reordering of attachments by dragging
4. **Item Controls**: Each item has edit and remove buttons

## Stored Value

The field stores an array of attachment IDs (integers) in the database. For example:

```php
[23, 45, 67, 89]
```

## Validation

The Multi Attachment field validates that:
- If the field is required, at least one valid attachment ID must be selected
- All values must be non-zero integers (valid attachment IDs)

## Example Usage

### Basic Image Gallery

```php
'product_gallery' => array(
    'type'           => 'multi_attachment',
    'id'             => 'product_gallery',
    'label'          => 'Product Gallery',
    'description'    => 'Select images for the product gallery. Drag to reorder.',
    'attachment_type' => 'image',
    'required'       => true,
),
```

### Document Collection

```php
'project_documents' => array(
    'type'           => 'multi_attachment',
    'id'             => 'project_documents',
    'label'          => 'Project Documents',
    'description'    => 'Upload project-related documents (PDF, DOC, XLS).',
    'attachment_type' => '',  // Allow any file type
),
```

### Using Multi Attachment Values in Your Theme

```php
// Get the array of attachment IDs
$gallery_ids = get_post_meta(get_the_ID(), 'product_gallery', true);

if (!empty($gallery_ids) && is_array($gallery_ids)) {
    echo '<div class="product-gallery">';
    
    foreach ($gallery_ids as $attachment_id) {
        // For images
        echo wp_get_attachment_image($attachment_id, 'medium', false, array(
            'class' => 'gallery-image',
        ));
        
        // Alternative for any attachment type
        $attachment = get_post($attachment_id);
        $attachment_url = wp_get_attachment_url($attachment_id);
        
        echo '<div class="attachment-item">';
        
        // Display thumbnail or icon based on file type
        if (wp_attachment_is_image($attachment_id)) {
            echo wp_get_attachment_image($attachment_id, 'thumbnail');
        } else {
            // Get file type icon
            $type = get_post_mime_type($attachment_id);
            echo '<img src="' . esc_url(wp_mime_type_icon($type)) . '" alt="File icon">';
        }
        
        // Display attachment title and link
        echo '<div class="attachment-title">' . esc_html($attachment->post_title) . '</div>';
        echo '<a href="' . esc_url($attachment_url) . '" target="_blank">View/Download</a>';
        
        echo '</div>';
    }
    
    echo '</div>';
}
```

### Multi Attachment Field with Conditional Logic

```php
'include_documents' => array(
    'type'   => 'toggle',
    'id'     => 'include_documents',
    'label'  => 'Include Documents',
    'title'  => 'Add supporting documents to this post',
),
'supporting_documents' => array(
    'type'        => 'multi_attachment',
    'id'          => 'supporting_documents',
    'label'       => 'Supporting Documents',
    'description' => 'Add PDF documents that support this content.',
    'attachment_type' => 'application/pdf',
    'conditions'  => array(
        array('field' => 'include_documents', 'value' => true),
    ),
),
```

## Features

1. **Media Library Integration**: Uses WordPress's native media library for selecting files
2. **Drag & Drop Reordering**: Users can easily change the order of attachments
3. **Type Filtering**: Can be restricted to specific file types
4. **Visual Preview**: Shows thumbnails for images and icons for other file types
5. **Edit Links**: Direct access to the WordPress media editor for each attachment

## Notes

- Uses the standard WordPress media library interface for selecting attachments
- Stores only the attachment IDs, not the full attachment data
- The order of attachments is preserved when saved
- For single file selection, use the regular `attachment` field type
- Dragging and dropping for reordering requires JavaScript to be enabled in the browser
- When retrieving attachment IDs, always verify they exist before trying to display them
- For displaying image galleries, consider using WordPress functions like `gallery_shortcode()` or creating a custom gallery layout