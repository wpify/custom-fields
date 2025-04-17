# Attachment Field Type

The attachment field type allows selecting a single file from the WordPress media library. It supports images as well as other file types such as documents, videos, and audio files.

## Field Type: `attachment`

```php
array(
	'type'           => 'attachment',
	'id'             => 'example_attachment',
	'label'          => 'Example Attachment',
	'attachment_type' => '', // Optional, limit to specific media types
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `attachment` for this field type
- `label` _(string)_ - The field label displayed in the admin interface
- `description` _(string)_ - Help text displayed below the field
- `required` _(boolean)_ - Whether the field must have a value
- `tab` _(string)_ - The tab ID where this field should appear (if using tabs)
- `className` _(string)_ - Additional CSS class for the field container
- `conditions` _(array)_ - Conditions that determine when to show this field
- `disabled` _(boolean)_ - Whether the field should be disabled
- `default` _(mixed)_ - Default value for the field
- `attributes` _(array)_ - HTML attributes to add to the field
- `unfiltered` _(boolean)_ - Whether the value should remain unfiltered when saved
- `render_options` _(array)_ - Options for customizing field rendering

### Specific Properties

#### `attachment_type` _(string)_

Optional parameter that limits the type of files that can be selected from the media library. Common values include:

- Empty string (default) - allows all media types
- `image` - limits selection to images only
- `video` - limits selection to video files
- `audio` - limits selection to audio files
- `application/pdf` - limits selection to PDF documents

## Stored Value

The field stores the attachment ID (integer) in the database. This ID can be used with WordPress functions like `wp_get_attachment_url()` to retrieve the file URL or with `wp_get_attachment_image()` to generate an image tag.

## Example Usage

```php
// Define the field
'hero_image' => array(
	'type'           => 'attachment',
	'id'             => 'hero_image',
	'label'          => 'Hero Image',
	'attachment_type' => 'image',
	'description'    => 'Select an image to display in the header.',
),

// Retrieve and use the attachment in your theme
$image_id = get_post_meta( get_the_ID(), 'hero_image', true );
if ( ! empty( $image_id ) ) {
	echo wp_get_attachment_image( $image_id, 'full', false, array( 'class' => 'hero-image' ) );
}
```

## User Interface

The attachment field provides:

1. An "Add attachment" button when no file is selected
2. A preview of the selected file (thumbnail for images, icon for other file types)
3. Edit and remove buttons for managing the selected attachment