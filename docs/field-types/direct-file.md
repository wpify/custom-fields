# Direct File Field Type

The direct file field type allows uploading files directly to the filesystem without creating WordPress media library entries. Files are stored in a specified directory and the absolute file path is saved in the database. This is useful for internal files, system documents, or files that should not be managed through the WordPress media library.

## Field Type: `direct_file`

```php
array(
	'type'             => 'direct_file',
	'id'               => 'example_direct_file',
	'label'            => 'Example Direct File',
	'directory'        => '/var/www/html/internal/', // Required: target directory
	'replace_existing' => true, // Optional: replace vs append -n to filename
	'on_delete'        => 'delete', // Optional: 'delete' or 'keep' file on clear
	'allowed_types'    => array( 'application/pdf', 'image/jpeg' ), // Optional: MIME types whitelist
	'max_size'         => 5242880, // Optional: max file size in bytes (5MB)
)
```

## Properties

### Default Field Properties

These properties are available for all field types:

- `id` _(string)_ - Unique identifier for the field
- `type` _(string)_ - Must be set to `direct_file` for this field type
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

#### `directory` _(string)_ **Required**

The target directory where uploaded files will be stored. Can be either:

- **Absolute path**: `/var/www/html/internal/` - uses the exact path specified
- **Relative path**: `custom-uploads/` - resolved relative to `ABSPATH` (WordPress root directory)

The directory will be created automatically if it doesn't exist. For security, path traversal attempts (`../`) are automatically removed.

#### `replace_existing` _(boolean)_

Controls behavior when a file with the same name already exists in the target directory:

- `true` - Replaces the existing file with the newly uploaded file
- `false` (default) - Appends `-n` to the filename to create a unique name (e.g., `document-1.pdf`, `document-2.pdf`)

#### `on_delete` _(string)_

Determines what happens to the physical file when the field value is cleared or changed:

- `'keep'` (default) - Keeps the file on the filesystem even when removed from the field
- `'delete'` - Deletes the physical file from the filesystem when the field is cleared

#### `allowed_types` _(array)_

Optional whitelist of allowed MIME types. If specified, only files matching these MIME types can be uploaded. Examples:

- `array( 'application/pdf' )` - only PDF files
- `array( 'image/jpeg', 'image/png' )` - only JPEG and PNG images
- `array( 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' )` - PDF and Word documents

If not specified, all file types allowed by WordPress will be accepted.

#### `max_size` _(integer)_

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
// Define the field in a metabox
$custom_fields->create_metabox( array(
	'id'        => 'internal_files',
	'title'     => 'Internal Files',
	'post_type' => array( 'post', 'page' ),
	'items'     => array(
		array(
			'type'      => 'direct_file',
			'id'        => 'internal_document',
			'label'     => 'Internal Document',
			'directory' => '/var/www/html/internal/',
		),
	),
) );

// Retrieve and use the file path in your theme
$file_path = get_post_meta( get_the_ID(), 'internal_document', true );
if ( ! empty( $file_path ) && file_exists( $file_path ) ) {
	$filename = basename( $file_path );
	echo '<p>File: ' . esc_html( $filename ) . '</p>';
}
```

### Restricting File Types

```php
// Only allow PDF files
array(
	'type'          => 'direct_file',
	'id'            => 'pdf_report',
	'label'         => 'PDF Report',
	'directory'     => 'reports/',
	'allowed_types' => array( 'application/pdf' ),
	'description'   => 'Upload a PDF report (max 10MB)',
	'max_size'      => 10485760, // 10MB
)
```

### Auto-Delete Old Files

```php
// Delete old file when replaced or removed
array(
	'type'             => 'direct_file',
	'id'               => 'temp_upload',
	'label'            => 'Temporary Upload',
	'directory'        => '/var/www/html/temp/',
	'on_delete'        => 'delete', // File will be deleted from filesystem
	'replace_existing' => true, // Replace file instead of creating new versions
)
```

### Multiple File Upload

```php
// Use multi_direct_file for multiple files
array(
	'type'          => 'multi_direct_file',
	'id'            => 'attachments',
	'label'         => 'Attachments',
	'directory'     => 'attachments/',
	'allowed_types' => array( 'application/pdf', 'image/jpeg', 'image/png' ),
	'on_delete'     => 'delete',
)

// Retrieve multiple files
$file_paths = get_post_meta( get_the_ID(), 'attachments', true );
if ( ! empty( $file_paths ) && is_array( $file_paths ) ) {
	echo '<ul>';
	foreach ( $file_paths as $file_path ) {
		if ( file_exists( $file_path ) ) {
			$filename = basename( $file_path );
			echo '<li>' . esc_html( $filename ) . '</li>';
		}
	}
	echo '</ul>';
}
```

### Serving Files Securely

```php
// Create a custom endpoint to serve files with access control
add_action( 'init', function() {
	add_rewrite_rule( '^internal-files/([0-9]+)/?', 'index.php?internal_file_id=$1', 'top' );
} );

add_filter( 'query_vars', function( $vars ) {
	$vars[] = 'internal_file_id';
	return $vars;
} );

add_action( 'template_redirect', function() {
	$file_id = get_query_var( 'internal_file_id' );

	if ( ! empty( $file_id ) ) {
		// Check user permissions
		if ( ! current_user_can( 'read' ) ) {
			wp_die( 'Access denied' );
		}

		// Get file path
		$file_path = get_post_meta( $file_id, 'internal_document', true );

		if ( ! empty( $file_path ) && file_exists( $file_path ) ) {
			// Set headers
			$filetype = wp_check_filetype( $file_path );
			$mime_type = ! empty( $filetype['type'] ) ? $filetype['type'] : 'application/octet-stream';
			header( 'Content-Type: ' . $mime_type );
			header( 'Content-Disposition: inline; filename="' . basename( $file_path ) . '"' );
			header( 'Content-Length: ' . filesize( $file_path ) );

			// Output file
			readfile( $file_path );
			exit;
		}

		wp_die( 'File not found' );
	}
} );
```

## User Interface

The direct file field provides:

1. A "Choose File" button when no file is selected
2. Real-time upload progress bar showing percentage
3. File preview with filename and download link after upload
4. "Replace" button to upload a different file
5. "Remove" button to clear the field
6. Error messages for file size or type violations

## Security Considerations

### Directory Permissions

Ensure the target directory has proper write permissions for the web server user:

```bash
sudo chown -R www-data:www-data /var/www/html/internal/
sudo chmod 755 /var/www/html/internal/
```

### Path Traversal Protection

The plugin automatically sanitizes directory paths to prevent path traversal attacks. However, always validate that the directory is within your intended file structure.

### File Type Validation

Always use the `allowed_types` property to restrict uploads to expected file types:

```php
'allowed_types' => array( 'application/pdf' ), // Only PDFs
```

### Access Control

Files uploaded via direct_file are stored outside the WordPress uploads directory and may not be directly accessible via URL. If you need to serve these files:

1. Create a custom endpoint with authentication (see example above)
2. Check user permissions before serving files
3. Use proper Content-Disposition headers to control browser behavior

### Cleanup Strategy

Consider your file retention strategy:

- Use `'on_delete' => 'delete'` for temporary files
- Use `'on_delete' => 'keep'` for permanent records
- Implement a scheduled cleanup task for orphaned files

## Troubleshooting

### Upload Fails Silently

- Check directory permissions (web server must have write access)
- Verify PHP `upload_max_filesize` and `post_max_size` settings
- Check disk space on the server

### Files Not Accessible

- Verify the file path is correct and absolute
- Check file permissions (must be readable by web server)
- If serving files, ensure rewrite rules are flushed (`flush_rewrite_rules()`)

### Old Files Not Deleted

- Verify `'on_delete' => 'delete'` is set
- Check that the file exists and has proper permissions
- Ensure the file path stored in the database is accurate

## Notes

- Files are first uploaded to a temporary directory (`wp-content/uploads/wpifycf-temp/`)
- Files are moved to the final directory only when the post/option is saved
- If the form is not saved, temporary files remain in the temp directory
- Consider implementing a cleanup cron job to remove old temporary files
- The field validates MIME types on upload to prevent unauthorized file types
- Always use `esc_html()`, `esc_url()`, and other escaping functions when displaying file data
