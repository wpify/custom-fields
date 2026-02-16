# Attachment Field Type

The attachment field type allows selecting a single file from the WordPress media library. It supports images as well as other file types such as documents, videos, and audio files.

## Field Type: `attachment`

```php
array(
	'type'            => 'attachment',
	'id'              => 'hero_image',
	'label'           => 'Hero Image',
	'attachment_type' => 'image',
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

#### `attachment_type` _(string)_ — Optional

Limits the type of files that can be selected from the media library. Common values include:

- Empty string (default) — allows all media types
- `image` — limits selection to images only
- `video` — limits selection to video files
- `audio` — limits selection to audio files
- `application/pdf` — limits selection to PDF documents

## Stored Value

The field stores the attachment ID (integer) in the database. This ID can be used with WordPress functions like `wp_get_attachment_url()` to retrieve the file URL or with `wp_get_attachment_image()` to generate an image tag.

## Example Usage

### Basic Image Field

```php
array(
	'type'            => 'attachment',
	'id'              => 'hero_image',
	'label'           => 'Hero Image',
	'attachment_type' => 'image',
	'description'     => 'Select an image to display in the header.',
),
```

### Document Attachment

```php
array(
	'type'            => 'attachment',
	'id'              => 'pdf_document',
	'label'           => 'PDF Document',
	'attachment_type' => 'application/pdf',
	'description'     => 'Upload a PDF document.',
),
```

### Using Values in Your Theme

```php
$image_id = get_post_meta( get_the_ID(), 'hero_image', true );

if ( ! empty( $image_id ) ) {
	// Display the image
	echo wp_get_attachment_image( $image_id, 'full', false, array( 'class' => 'hero-image' ) );

	// Or get the URL directly
	$image_url = wp_get_attachment_url( $image_id );
	if ( $image_url ) {
		echo '<img src="' . esc_url( $image_url ) . '" alt="' . esc_attr( get_post_meta( $image_id, '_wp_attachment_image_alt', true ) ) . '">';
	}
}
```

### With Conditional Logic

```php
'show_hero' => array(
	'type'  => 'toggle',
	'id'    => 'show_hero',
	'label' => 'Show Hero Image',
),
'hero_image' => array(
	'type'            => 'attachment',
	'id'              => 'hero_image',
	'label'           => 'Hero Image',
	'attachment_type' => 'image',
	'conditions'      => array(
		array( 'field' => 'show_hero', 'value' => true ),
	),
),
```

## User Interface

The attachment field provides:

1. An "Add attachment" button when no file is selected
2. A preview of the selected file (thumbnail for images, icon for other file types)
3. Edit and remove buttons for managing the selected attachment

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->attachment(
	label: 'Hero Image',
	attachment_type: 'image',
);
```

## Notes

- The stored attachment ID can be used with all standard WordPress attachment functions
- For selecting multiple attachments, use the [`multi_attachment`](multi_attachment.md) field type instead
- When an attachment is deleted from the media library, the field will show an empty state when edited
