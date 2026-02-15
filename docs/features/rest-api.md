# REST API

WPify Custom Fields registers internal REST API endpoints used by field components to fetch data, upload files, and manage configuration.

## Overview

The REST API is primarily consumed by the JavaScript field components (Post, Term, Link, Mapy.cz, DirectFile). You generally do not need to call these endpoints directly, but they are documented here for reference and debugging.

## Namespace

All endpoints are registered under:

```
{plugin-basename}/wpifycf/v1
```

The `{plugin-basename}` is derived from the directory name of the plugin or theme that instantiated `CustomFields`. For example, if the plugin directory is `my-plugin`, the full namespace would be `my-plugin/wpifycf/v1`.

## Permission

All endpoints require the `edit_posts` capability. Unauthenticated or unauthorized requests receive a `403 Forbidden` response.

## Endpoints

### GET `url-title`

Fetches the page title from a given URL. Used by the Link field to display a human-readable title.

**Parameters:**

| Parameter | Required | Description |
|---|---|---|
| `url` | Yes | The URL to fetch the title from |

**Response:** The page title as a string.

**Error cases:**
- Missing `url` parameter returns a WP_Error.
- Unreachable URL returns an empty or error response.

---

### GET `posts`

Searches and retrieves posts with pagination. Used by the Post, Multi Post, and Link fields.

**Parameters:**

| Parameter | Required | Description |
|---|---|---|
| `post_type` | Yes | Post type slug (or array of slugs) to search |
| `search` | No | Search query string |
| `page` | No | Page number for pagination |
| `per_page` | No | Number of results per page |
| `include` | No | Array of specific post IDs to include |

**Response:** Array of post objects with `id`, `title`, and other relevant fields.

---

### GET `terms`

Retrieves taxonomy terms as a tree structure. Used by the Term and Multi Term fields.

**Parameters:**

| Parameter | Required | Description |
|---|---|---|
| `taxonomy` | Yes | Taxonomy slug to retrieve terms from |

**Response:** Array of term objects arranged in a hierarchical tree.

---

### GET `mapycz-api-key`

Retrieves the stored Mapy.cz API key from the WordPress options table.

**Parameters:** None.

**Response:** The API key string, or empty if not set.

---

### POST `mapycz-api-key`

Saves a Mapy.cz API key to the WordPress options table.

**Parameters:**

| Parameter | Required | Description |
|---|---|---|
| `api_key` | Yes | The API key to store |

**Response:** `true` on success.

---

### POST `direct-file-upload`

Uploads a file to a temporary directory on the server. Used by the Direct File field for file uploads that bypass the WordPress media library.

**Parameters:**

| Parameter | Required | Description |
|---|---|---|
| `file` | Yes | The file to upload (multipart form data) |
| `field_id` | No | The field ID associated with the upload |

**Response:**

```json
{
  "temp_path": "/path/to/wp-content/uploads/wpifycf-tmp/unique-filename.pdf",
  "filename": "unique-filename.pdf",
  "size": 102400,
  "type": "application/pdf"
}
```

**Error cases:**

| Error Code | Description |
|---|---|
| `no_file` | No file was included in the request |
| `upload_error` | The file upload failed at the PHP level |
| `file_too_large` | File exceeds `wp_max_upload_size()` |
| `directory_creation_failed` | Temp directory could not be created |
| `move_failed` | Uploaded file could not be moved to temp directory |

---

### GET `direct-file-info`

Retrieves metadata about a file at a given path. Used by the Direct File field to display file information.

**Parameters:**

| Parameter | Required | Description |
|---|---|---|
| `file_path` | Yes | Absolute path to the file |

**Response:**

```json
{
  "size": 102400,
  "type": "application/pdf",
  "filename": "document.pdf"
}
```

**Error cases:**

| Error Code | Description |
|---|---|
| `no_file_path` | No file path was provided |
| `file_not_found` | The file does not exist at the given path |
