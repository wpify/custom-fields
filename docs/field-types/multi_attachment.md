# Multi Attachment Field Type

The Multi Attachment field type allows selecting and arranging multiple files from the WordPress media library. It is commonly used for creating image galleries, document collections, or any feature requiring multiple media items.

## Field Type: `multi_attachment`

```php
array(
	'type'            => 'multi_attachment',
	'id'              => 'example_gallery',
	'label'           => 'Gallery',
	'attachment_type' => 'image',
	'min'             => 1,
	'max'             => 20,
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

- `attachment_type` _(string)_ — Optional: Limits the type of files that can be selected. Common values: `'image'`, `'video'`, `'audio'`, `'application/pdf'`. Leave empty to allow all media types
- `min` _(integer)_ — Optional: Minimum number of items
- `max` _(integer)_ — Optional: Maximum number of items
- `buttons` _(array)_ — Optional: Custom button labels (add, remove, duplicate)
- `disabled_buttons` _(array)_ — Optional: Buttons to disable (move, delete, duplicate)

## Stored Value

The field stores an array of attachment IDs (integers) in the database:

```php
array( 23, 45, 67, 89 )
```

## Example Usage

### Basic Image Gallery

```php
'product_gallery' => array(
	'type'            => 'multi_attachment',
	'id'              => 'product_gallery',
	'label'           => 'Product Gallery',
	'description'     => 'Select images for the product gallery. Drag to reorder.',
	'attachment_type' => 'image',
	'required'        => true,
),
```

### Document Collection

```php
'project_documents' => array(
	'type'            => 'multi_attachment',
	'id'              => 'project_documents',
	'label'           => 'Project Documents',
	'description'     => 'Upload project-related documents (PDF, DOC, XLS).',
	'attachment_type' => '',
),
```

### Gallery with Min/Max Constraints

```php
'slider_images' => array(
	'type'            => 'multi_attachment',
	'id'              => 'slider_images',
	'label'           => 'Slider Images',
	'description'     => 'Select 3 to 10 images for the homepage slider.',
	'attachment_type' => 'image',
	'min'             => 3,
	'max'             => 10,
),
```

### Using Values in Your Theme

```php
$gallery_ids = get_post_meta( get_the_ID(), 'product_gallery', true );

if ( ! empty( $gallery_ids ) && is_array( $gallery_ids ) ) {
	echo '<div class="product-gallery">';

	foreach ( $gallery_ids as $attachment_id ) {
		if ( wp_attachment_is_image( $attachment_id ) ) {
			echo wp_get_attachment_image( $attachment_id, 'medium', false, array(
				'class' => 'gallery-image',
			) );
		} else {
			$attachment_url = wp_get_attachment_url( $attachment_id );
			$attachment     = get_post( $attachment_id );

			if ( $attachment && $attachment_url ) {
				echo '<div class="attachment-item">';
				echo '<a href="' . esc_url( $attachment_url ) . '" target="_blank">';
				echo esc_html( $attachment->post_title );
				echo '</a>';
				echo '</div>';
			}
		}
	}

	echo '</div>';
}
```

### With Conditional Logic

```php
'include_documents' => array(
	'type'  => 'toggle',
	'id'    => 'include_documents',
	'label' => 'Include Documents',
	'title' => 'Add supporting documents to this post',
),
'supporting_documents' => array(
	'type'            => 'multi_attachment',
	'id'              => 'supporting_documents',
	'label'           => 'Supporting Documents',
	'description'     => 'Add PDF documents that support this content.',
	'attachment_type' => 'application/pdf',
	'conditions'      => array(
		array( 'field' => 'include_documents', 'value' => true ),
	),
),
```

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->multi_attachment(
	label: 'Gallery',
	attachment_type: 'image',
	min: 1,
	max: 20,
);
```

## Notes

- Uses the standard WordPress media library interface for selecting attachments
- Attachments can be reordered by drag and drop
- Stores only attachment IDs, not the full attachment data
- The order of attachments is preserved when saved
- For single file selection, use the `attachment` field type instead
- When retrieving attachment IDs, always verify they exist before displaying them
- Each item shows a thumbnail preview for images and an icon for other file types
