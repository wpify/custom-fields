# Direct File Field Type

The direct file field type allows uploading files directly to the filesystem without creating WordPress media library entries. Files are stored in a specified directory and the absolute file path is saved in the database. This is useful for internal files, system documents, or files that should not be managed through the WordPress media library.

## Field Type: `direct_file`

```php
array(
	'type'          => 'direct_file',
	'id'            => 'internal_document',
	'label'         => 'Internal Document',
	'directory'     => '/var/www/html/internal/',
	'allowed_types' => array( 'application/pdf' ),
	'max_size'      => 5242880,
)
```

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

#### `directory` _(string)_ — Required

The target directory where uploaded files will be stored. Can be either:

- **Absolute path**: `/var/www/html/internal/` — uses the exact path specified
- **Relative path**: `custom-uploads/` — resolved relative to `ABSPATH` (WordPress root directory)

The directory will be created automatically if it doesn't exist. For security, path traversal attempts (`../`) are automatically removed.

#### `replace_existing` _(boolean)_ — Optional

Controls behavior when a file with the same name already exists in the target directory:

- `true` — Replaces the existing file with the newly uploaded file
- `false` (default) — Appends `-n` to the filename to create a unique name (e.g., `document-1.pdf`, `document-2.pdf`)

#### `on_delete` _(string)_ — Optional

Determines what happens to the physical file when the field value is cleared or changed:

- `'keep'` (default) — Keeps the file on the filesystem even when removed from the field
- `'delete'` — Deletes the physical file from the filesystem when the field is cleared

#### `allowed_types` _(array)_ — Optional

Whitelist of allowed MIME types. If specified, only files matching these MIME types can be uploaded. Examples:

- `array( 'application/pdf' )` — only PDF files
- `array( 'image/jpeg', 'image/png' )` — only JPEG and PNG images
- `array( 'application/pdf', 'application/msword' )` — PDF and Word documents

If not specified, all file types allowed by WordPress will be accepted.

#### `max_size` _(integer)_ — Optional

Maximum file size in bytes. Files larger than this will be rejected during upload. If not specified, uses the WordPress maximum upload size (from `upload_max_filesize` PHP setting).

Example sizes:
- 1 MB = 1048576 bytes
- 5 MB = 5242880 bytes
- 10 MB = 10485760 bytes

## Stored Value

The field stores the absolute file path (string) in the database. For example: `/var/www/html/internal/document.pdf`

This allows direct access to the file for reading, processing, or serving via custom scripts without going through the WordPress media library.

## Example Usage

### Basic Configuration

```php
array(
	'type'      => 'direct_file',
	'id'        => 'internal_document',
	'label'     => 'Internal Document',
	'directory' => '/var/www/html/internal/',
),
```

### Restricting File Types

```php
array(
	'type'          => 'direct_file',
	'id'            => 'pdf_report',
	'label'         => 'PDF Report',
	'directory'     => 'reports/',
	'allowed_types' => array( 'application/pdf' ),
	'description'   => 'Upload a PDF report (max 10MB).',
	'max_size'      => 10485760,
),
```

### Auto-Delete Old Files

```php
array(
	'type'             => 'direct_file',
	'id'               => 'temp_upload',
	'label'            => 'Temporary Upload',
	'directory'        => '/var/www/html/temp/',
	'on_delete'        => 'delete',
	'replace_existing' => true,
),
```

### Using Values in Your Theme

```php
$file_path = get_post_meta( get_the_ID(), 'internal_document', true );

if ( ! empty( $file_path ) && file_exists( $file_path ) ) {
	$filename = basename( $file_path );
	echo '<p>File: ' . esc_html( $filename ) . '</p>';
}
```

### With Conditional Logic

```php
'has_document' => array(
	'type'  => 'toggle',
	'id'    => 'has_document',
	'label' => 'Attach Document',
),
'internal_document' => array(
	'type'          => 'direct_file',
	'id'            => 'internal_document',
	'label'         => 'Internal Document',
	'directory'     => '/var/www/html/internal/',
	'allowed_types' => array( 'application/pdf' ),
	'conditions'    => array(
		array( 'field' => 'has_document', 'value' => true ),
	),
),
```

## User Interface

The direct file field provides:

1. A "Choose File" button when no file is selected
2. Real-time upload progress bar showing percentage
3. File preview with filename and download link after upload
4. "Replace" button to upload a different file
5. "Remove" button to clear the field
6. Error messages for file size or type violations

## Field Factory

```php
$f = new \Wpify\CustomFields\FieldFactory();

$f->direct_file(
	label: 'Download File',
	allowed_types: array( 'application/pdf' ),
	max_size: 5242880,
);
```

## Notes

- Files are first uploaded to a temporary directory (`wp-content/uploads/wpifycf-temp/`) and moved to the final directory only when the post/option is saved
- If the form is not saved, temporary files remain in the temp directory — consider implementing a cleanup cron job
- The field validates MIME types on upload to prevent unauthorized file types
- Always use `esc_html()`, `esc_url()`, and other escaping functions when displaying file data
- Ensure the target directory has proper write permissions for the web server user
- Path traversal attempts (`../`) are automatically sanitized for security
- For uploading multiple files, use the `multi_direct_file` field type instead
