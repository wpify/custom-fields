# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.10.1] - 2026-07-17

### Fixed
- Gutenberg block lazy loading now actually defers off-screen blocks. The pre-render loading placeholder was only one line tall, so on editor open every block in a post fit inside the viewport and all server-side render requests fired at once. The loading placeholder now reserves height (`min-height: 500px`, overridable via the `--wpifycf-block-placeholder-height` CSS custom property), so blocks below the fold stay outside the viewport gate and render top-down as the content above them settles. Empty and error placeholders remain compact.

## [4.10.0] - 2026-07-16

### Added
- Lazy field data loading: fields now call the REST API only once they are visible — in the viewport (with a 200px preload margin and 200ms dwell against fast scrolling) and in a visible browser tab. Applies uniformly to `select`/`multi_select` async options and label resolution, `post`/`multi_post`, `term`/`multi_term`, `attachment`/`multi_attachment`, `link`, `direct_file`/`multi_direct_file`, and Gutenberg server-side block previews (which additionally skip re-renders while scrolled off-canvas and catch up on return). Focusing a field loads it immediately. Once loaded, a field never unloads. Documented in `docs/features/lazy-loading.md`; rationale in `docs/adr/0001-viewport-gated-data-loading.md`.

### Changed
- **Perceived behavior change**: admin pages opened in background browser tabs no longer preload field data; loading starts when the tab is first viewed. Stored `select`/`multi_select` values still display their labels immediately (server-side preresolution); `post`/`term`/`attachment`/`link`/`direct_file` value previews and collapsed `multi_group` item titles derived from them appear when the field first becomes visible.

## [4.9.3] - 2026-06-22

### Fixed
- Async option requests are now aborted when superseded. Typing a new search (or otherwise changing the query) cancels the previous in-flight `options`/`options-resolve` request via the React Query `AbortSignal`, which is now forwarded through `get()` to `apiFetch`. Prevents a slow earlier response from overwriting newer results and avoids wasted in-flight requests.

## [4.9.2] - 2026-06-22

### Fixed
- `select` async search now debounces (300ms) before requesting options, so typing a query no longer fires one REST request per keystroke. `multi_select` already debounced; `Select` was missing it.

## [4.9.1] - 2026-06-22

### Fixed
- `OptionsIntegration::build_preresolved_options()` now includes **every** stored async value in the embedded `data-preresolved-options` map, falling back to the raw value as its own label when the options callback cannot resolve it (e.g. a saved option that no longer exists in the source). Previously such values were absent from the map, so each one triggered its own client-side `resolve` request — producing one request per field on pages with many `select`/`multi_select` fields bound to the same list with stale or out-of-window values. The selected value still displays as before; only the redundant requests are eliminated.

## [4.9.0] - 2026-06-22

### Added
- `cache_options` option (default `true`) for `select` and `multi_select`. When enabled, an async option list is fetched once and shared across all fields using the same `options_key`/`async_params` instead of once per field. Set to `false` to restore the legacy per-field request — needed only for callbacks whose `async_params` use dynamic `{{field}}` placeholders or that otherwise depend on `value` when returning the browse list. Documented in `docs/field-types/select.md` and `docs/field-types/multi_select.md`.
- `list_id` is now accepted as an alias for `options_key` in field definitions (`BaseIntegration::normalize_items()`), for backward compatibility with integrations that used the older key name.

### Changed
- Async `select`/`multi_select` options requests no longer carry the field's `value`, so otherwise-identical fields share a single cached REST response instead of each firing its own request. Previously a page with N selects backed by the same list issued N near-identical `/wpifycf/v1/options/{key}?…&value=…` calls (one per field), which caused excessive load when many such fields were present. Selected-option labels are now resolved independently of the browse list: storage-backed integrations embed a preresolved value→label map in the app container's `data-preresolved-options` attribute (resolved server-side in one batched callback call per key, no extra request); the Gutenberg block editor resolves them via a batched `resolve` request on the same endpoint; and fetched browse slices are accumulated client-side so selected labels persist across searches. `staleTime`/`gcTime` were added to the options queries so identical requests are reused across remounts.

### Fixed
- Saving a field set that contains an empty `multi_email`, `multi_richtext`, `multi_url`, or `multi_number` repeater item no longer triggers a fatal `TypeError` (HTTP 500 on save). A new empty repeater item serializes as `[]`, which `sanitize_email()`, `wp_kses_post()`, and `esc_url()` reject — only `sanitize_text_field()`/`sanitize_textarea_field()` guard arrays internally. `CustomFields::sanitize_item_value()` now coerces non-string input to an empty string for the `email`, `url`, `wysiwyg`, and `richtext` branches and to `null` for `number`/`range`, so the save succeeds.
- `SubscriptionMetabox::render()` no longer fatals on classic (non-HPOS) order storage. Its signature required `WC_Order`, but WordPress passes a `WP_Post` to the metabox callback on the legacy subscription edit screen. It now accepts `WP_Post|WC_Abstract_Order` and resolves the order via `wc_get_order()`, matching the existing `OrderMetabox::render()` behaviour.

## [4.8.0] - 2026-05-07

### Security
- Fix arbitrary file upload via the `direct-file-upload` REST endpoint (CVSS 9.9, CVE-TBD). The endpoint previously accepted any file type from any user with `edit_posts` (Contributor and above) and stored it in a web-accessible directory under `wp-content/uploads/wpifycf-temp/`. A Contributor could upload `.php` and execute it. Now requires `upload_files`, validates uploads via `wp_handle_upload()` (which uses WordPress's built-in MIME allowlist, blocking executables), and writes `.htaccess` + `web.config` hardening files into the temp and target directories on every upload. See [docs/security/CVE-TBD-direct-file-upload.md](docs/security/CVE-TBD-direct-file-upload.md). Affected versions: 4.1.0–4.7.0.
- Restrict `direct-file-info` REST endpoint to file paths under `WP_CONTENT_DIR` (resolved via `realpath()`) to prevent filesystem information disclosure.
- Restrict `mapycz-api-key` POST and `cloudflare/zones` REST endpoints to `manage_options`. The `mapycz-api-key` GET stays at `edit_posts` so the map field continues to render for editor users.
- Restrict `direct_file` field `directory` parameter to paths under `WP_CONTENT_DIR` (with `wpifycf_direct_file_directory_allowed` filter for legitimate exotic cases). Symlink-safe via `realpath()`.
- Add capability-aware UI: fields requiring a capability the current user lacks (`direct_file`, `multi_direct_file` → `upload_files`; `cloudflare` → `manage_options`) render disabled, and their values are preserved on save. Filterable via `wpifycf_field_required_capability`.

### Changed
- `Api::register_rest_route()` now requires a per-route `$permission_callback` parameter. The previous global `permissions_callback` is removed. Internal callsites in `BaseIntegration::register_options_route()` and `GutenbergBlock::register_routes()` are updated to pass appropriate per-route capabilities.

### Fixed
- `direct_file` and `multi_direct_file` fields now correctly move uploaded files from the temp directory to the configured `directory` on the very first save. Previously, when no prior value was stored in the database, the equality short-circuit in `DirectFileField::sanitize_direct_file()` returned the temp-directory path verbatim, leaving the file in `wpifycf-temp/` instead of relocating it.

## [4.7.0] - 2026-04-23

### Added
- `richtext` and `multi_richtext` field types — a modern rich text editor built on [Lexical](https://lexical.dev/) that coexists with the existing `wysiwyg` field. Highlights:
  - Configurable toolbar with three presets (`full`, `basic`, `minimal`) or an explicit button-ID array; extensible via the `wpifycf_richtext_toolbar_presets` and `wpifycf_richtext_buttons` filters.
  - Block format dropdown (paragraph, H1–H6, preformatted, code block, blockquote), inline formatting (bold, italic, strikethrough), lists, alignment, indent/outdent, link with floating popover, horizontal rule, special-character picker, undo/redo, clear formatting, one-shot paste-as-text.
  - Tables: insert via a grid-size picker with a floating contextual toolbar that adds/removes rows and columns, merges selected cells (respecting pre-existing colspan/rowspan), unmerges merged cells, and deletes the whole table. Drag-to-select highlights cells in blue.
  - Images: insert from the WordPress media library via the existing `useMediaLibrary` hook (extended non-breakingly with an optional `onSelect` callback); auto-picks the best registered size (`medium_large → large → medium → full`); contextual popover for Replace / Alt text / Delete. Emits clean semantic `<img src alt width height data-id>` with no `[caption]` shortcode or legacy alignment classes.
  - Visual ↔ code view toggle with an inline normalization notice, word/character counter, and standard keyboard shortcuts inherited from Lexical.
- `FieldFactory::richtext()` method mirroring `FieldFactory::wysiwyg()` plus `toolbar`, `height`, `word_count`, and `default_view` parameters.
- Documentation: `docs/field-types/richtext.md` and `docs/field-types/multi_richtext.md`.

## [4.6.9] - 2026-04-20

### Added
- Clear control on the Color field when `required` is not set — clicking the trash icon resets the stored value to an empty string, and empty swatches render with a checkerboard indicator so "no color" is distinguishable from a solid black value

## [4.6.8] - 2026-03-27

### Fixed
- Fix initial values not loading for fields inside `group` and `multi_group` containers
- Fix WYSIWYG editors inside groups overwriting each other's content when switching between editors

## [4.6.7] - 2026-03-26

### Fixed
- Fix fields inside wrapper/columns not receiving saved values on initial render (initialValues extraction now recurses into nested items)
- Inconsistent `classname` attribute naming in wrapper and columns fields — now consistently uses `className` (camelCase) in JS like all other fields, with backward-compatible support for `classname` and `class_name` variants in PHP

## [4.6.6] - 2026-03-19

### Fixed
- Fixed multiple TinyMCE instances failing to initialize in non-iframe Gutenberg mode when multiple blocks of the same type contain a Wysiwyg field

## [4.6.5] - 2026-03-05

### Fixed
- Properly set up global `$post` in `render_from_api` for Gutenberg block editor previews
- Pass `postId` context to `WP_Block` in `render_from_api`

## [4.6.4] - 2026-03-04

### Fixed
- Option value sanitization now handles non-array values gracefully instead of throwing a type error

## [4.6.3] - 2026-03-04

### Fixed
- Do not render Gutenberg block in REST requests

## [4.6.0] - 2026-02-20

### Added
- Cloudflare field type for Cloudflare zone connection

## [4.5.1] - 2026-02-18

### Added
- Custom column widths support for Columns field via array syntax

### Fixed
- Child normalization in Columns field

## [4.5.0] - 2026-02-17

### Added
- `collapse` prop for MultiGroup field to control item collapsibility
- `wrapper` field type for visual grouping of fields without value nesting
- `columns` field type for multi-column grid layout
- `FieldFactory` class for programmatic field creation
- `setTitle` support for all field components

### Changed
- Removed React portals and render fields inside a single app container
- Switched field layout to CSS grid
- Cleaned up CSS/SCSS styles and React classnames
- Wrapped root fields in container div for layout targeting
- Applied flex layout to app instance fields wrapper
- Rewrote README with comprehensive field types, examples, and integration reference
- Standardized all 57 field type docs with consistent template

### Fixed
- Active tab now preserved after saving options page
- Grid layout for fields without label text
- Explicit props now properly override spread props in Label and FieldComponent

## [4.4.2] - 2026-02-05

### Fixed
- Field controls in Gutenberg blocks now properly receive pointer events for improved interaction

## [4.4.1] - 2026-01-09

### Changed
- Refactored WYSIWYG field component with improved Gutenberg iframe mode support
- Added event isolation to prevent TinyMCE event propagation issues in Gutenberg editor
- Improved WYSIWYG modal editor for Gutenberg context with fullscreen support

### Fixed
- Link field post_type select now handles undefined values correctly

## [4.4.0] - 2025-12-19

### Added
- `date_range` field type for selecting start and end dates
- `multi_date_range` field type for managing multiple date ranges

## [4.3.1] - 2025-12-14

### Fixed
- Inner blocks field type functionality

## [4.3.0] - 2025-11-25

### Added
- InnerBlocks placeholder support in Gutenberg block preview

## [4.2.1] - 2025-11-25

### Added
- Counter property documentation for textarea field

## [4.2.0] - 2025-11-25

### Added
- getValue helper passed to field components for enhanced field interaction

## [4.1.2] - 2025-11-12

### Fixed
- register_deactivation_hook implementation

## [4.1.1] - 2025-11-10

### Added
- Multi direct file field type with Promise-based uploads

## [4.1.0] - 2025-11-09

### Added
- Direct file field type with filesystem storage

## [4.0.74] - 2025-10-29

### Added
- Coupon options support

## [4.0.73] - 2025-10-29

### Added
- Coupon options support

## [4.0.72] - 2025-09-22

### Added
- Counter feature for text field

## [4.0.71] - 2025-09-01

### Added
- Underline button to WYSIWYG editor

## [4.0.70] - 2025-08-28

### Fixed
- Default values handling

## [4.0.69] - 2025-08-11

### Fixed
- Actions implementation

## [4.0.68] - 2025-08-11

### Added
- Missing actions

## [4.0.67] - 2025-08-11

### Added
- Missing actions

## [4.0.66] - 2025-07-17

### Added
- Dynamic field value replacement for select async params

### Changed
- Renamed processAsyncParams to interpolateFieldValues

## [4.0.65] - 2025-06-10

### Fixed
- Default values handling

## [4.0.64] - 2025-06-10

### Fixed
- Default values handling

## [4.0.63] - 2025-06-09

### Fixed
- Default values handling
- Pre-commit hook update

## [4.0.62] - 2025-06-07

### Fixed
- SVG icon for Gutenberg blocks
- Documentation updates

## [4.0.61] - 2025-06-06

### Fixed
- Metabox save functionality

## [4.0.60] - 2025-06-06

### Added
- Radio field type

## [4.0.59] - 2025-05-29

### Fixed
- Conditions evaluation
- Disabled post submit button behavior

## [4.0.58] - 2025-05-29

### Fixed
- General bug fixes

## [4.0.57] - 2025-05-29

### Fixed
- General bug fixes

## [4.0.56] - 2025-05-07

### Fixed
- General bug fixes

## [4.0.55] - 2025-05-07

### Fixed
- Scoping issues

## [4.0.54] - 2025-05-07

### Fixed
- Scoping issues

## [4.0.53] - 2025-05-07

### Fixed
- Scoping issues

## [4.0.52] - 2025-05-07

### Fixed
- Scoping issues

## [4.0.51] - 2025-05-07

### Added
- wpifycf_before_options_form filter
- wpifycf_after_options_form filter

## [4.0.50] - 2025-05-02

### Added
- wpifycf_before_options_form filter
- wpifycf_after_options_form filter

## [4.0.49] - 2025-04-28

### Added
- Print app filter

## [4.0.48] - 2025-04-28

### Added
- All field values as prop to field components

## [4.0.47] - 2025-04-03

### Added
- Option to render option page on existing admin page

## [4.0.46] - 2025-04-03

### Added
- Option to render option page on existing admin page

## [4.0.45] - 2025-04-02

### Changed
- Set unique handle for script enqueuing

## [4.0.44] - 2025-03-26

### Fixed
- Taxonomy save functionality

## [4.0.43] - 2025-03-24

### Fixed
- Multi group field behavior

## [4.0.42] - 2025-03-23

### Fixed
- Network save action

## [4.0.41] - 2025-03-23

### Added
- Unfiltered option to item fields

## [4.0.40] - 2025-03-22

### Added
- Unfiltered option to item fields

## [4.0.39] - 2025-03-21

### Added
- render_options functionality

## [4.0.38] - 2025-03-21

### Added
- render_options functionality

## [4.0.37] - 2025-03-21

### Fixed
- Default value for multi group fields

## [4.0.36] - 2025-03-21

### Fixed
- General bug fixes

## [4.0.35] - 2025-03-21

### Fixed
- General bug fixes

## [4.0.34] - 2025-03-20

### Fixed
- General bug fixes

## [4.0.33] - 2025-03-19

### Fixed
- General bug fixes

## [4.0.32] - 2025-03-19

### Fixed
- General bug fixes

## [4.0.31] - 2025-02-21

### Fixed
- Undefined array key error

## [4.0.30] - 2025-02-20

### Fixed
- Adding items to existing WooCommerce product tabs

## [4.0.29] - 2025-02-19

### Fixed
- Multigroup field behavior

## [4.0.28] - 2025-02-19

### Fixed
- Exception handling

## [4.0.27] - 2025-02-12

### Added
- Filter to fields

## [4.0.26] - 2025-02-12

### Changed
- Expanded static fields to the whole table row

## [4.0.25] - 2025-02-03

### Fixed
- GPS coordinates handling for Mapy.cz field type

## [4.0.24] - 2025-01-30

### Added
- async_params parameter to select field option

## [4.0.23] - 2025-01-30

### Added
- async_params parameter to select field option
- Various actions for enhanced extensibility

## [4.0.22] - 2025-01-02

### Changed
- Improved post search functionality

## [4.0.21] - 2024-12-18

### Fixed
- Disabled hooks for WP-CLI to prevent conflicts

## [4.0.20] - 2024-12-17

### Fixed
- Order metabox functionality

## [4.0.19] - 2024-12-16

### Fixed
- Numeric values handling in select fields

## [4.0.18] - 2024-12-06

### Fixed
- Group title display
- Link field functionality

## [4.0.17] - 2024-12-05

### Fixed
- Gutenberg block rendering

## [4.0.16] - 2024-12-04

### Fixed
- Multi select field behavior
- Draggable items functionality

### Changed
- Updated field styles

## [4.0.15] - 2024-12-02

### Added
- Direct GPS coordinates setting in Mapy.cz field

## [4.0.14] - 2024-12-02

### Fixed
- Options normalization

## [4.0.13] - 2024-11-28

### Fixed
- WYSIWYG editor functionality

## [4.0.12] - 2024-11-28

### Fixed
- Code sniffer issues

## [4.0.11] - 2024-11-28

### Fixed
- Order implementation

## [4.0.10] - 2024-11-26

### Fixed
- Options handling

## [4.0.9] - 2024-11-26

### Fixed
- Options functionality

## [4.0.8] - 2024-11-25

### Changed
- Mapy.cz API key option name

## [4.0.7] - 2024-11-20

### Added
- Hidden field type
- Field value generators
- Backward compatibility improvements

## [4.0.6] - 2024-11-19

### Fixed
- Order metabox implementation

## [4.0.5] - 2024-11-19

### Fixed
- Order metabox functionality

## [4.0.4] - 2024-11-15

### Fixed
- Options page functionality

## [4.0.3] - 2024-11-15

### Fixed
- Options page functionality

## [4.0.2] - 2024-11-15

### Fixed
- Options page functionality

## [4.0.1] - 2024-11-14

### Added
- Documentation improvements

## [4.0.0] - 2024-11-13

### Added
- Comprehensive documentation structure
- Field types documentation
- Integration guides for Comment, Gutenberg Block, Menu Items, Metabox, and Options Page
- New integrations: WooCommerce Settings, Memberships, Menu Item, Site Options, User Options, Comment
- Gutenberg blocks support with InnerBlocks field
- Product variation support
- Subscription metabox integration
- Term custom fields
- State management refactoring

### Changed
- Complete plugin architecture overhaul
- Improved sanitization system
- Default value handling refactored
- Product and order options code review
- Enhanced styling system

### Fixed
- Multiple PHPCS compliance fixes
- register_post_meta implementation
- Various bug fixes and stability improvements

## [3.14.2] - 2024-08-30

### Fixed
- Escaping in Options, SiteOptions, and WooCommerceSettings implementations

## [3.14.1] - 2024-08-26

### Fixed
- Tel field implementation and added int-tel-input-utils build files

## [3.14.0] - 2024-03-25

### Added
- Register meta hook in Metabox implementation

## [3.13.0] - 2024-03-15

### Added
- Action for blocks registration in GutenbergBlock implementation

## [3.12.14] - 2024-03-08

### Fixed
- Compatibility with older WordPress versions

## [3.12.13] - 2024-03-08

### Removed
- GitHub workflows and GitLab CI files

## [3.12.12] - 2024-03-08

### Fixed
- Compatibility with older WordPress versions

## [3.12.11] - 2024-03-08

### Changed
- Removed automated build process - builds must now be pushed with commits

## [3.12.10] - 2024-03-08

### Fixed
- Compatibility with older React versions

## [3.12.9] - 2024-03-08

### Fixed
- Compatibility with older React versions

## [3.12.8] - 2024-02-13

### Fixed
- Title field for taxonomy

## [3.12.7] - 2024-02-08

### Fixed
- Composer dependencies

## [3.12.6] - 2024-02-08

### Fixed
- Composer dependencies

## [3.12.5] - 2024-02-05

### Fixed
- Taxonomy default value handling

## [3.12.4] - 2024-01-24

### Fixed
- WYSIWYG editor toolbar
- Typo in documentation

### Changed
- Improved README with advanced usage section and better table of contents

## [3.12.3] - 2024-01-18

### Fixed
- Inner blocks functionality and styling

## [3.12.2] - 2024-01-18

### Fixed
- Inner blocks in GutenbergBlock component

## [3.12.1] - 2024-01-16

### Fixed
- Metabox row styling and functionality

## [3.12.0] - 2023-12-12

### Added
- wpifycf_field_props filter for customizing field properties

## [3.11.22] - 2023-12-12

### Added
- wpifycf_field_props filter for all field types
- GitHub Actions workflow for automated asset building

## [3.11.21] - 2023-12-08

### Fixed
- Attachment field functionality

## [3.11.20] - 2023-12-08

### Fixed
- WYSIWYG field styling

## [3.11.19] - 2023-12-05

### Fixed
- Script loading in GutenbergBlock implementation

## [3.11.18] - 2023-12-04

### Fixed
- Post field type handling for Gutenberg blocks

## [3.11.17] - 2023-12-04

### Fixed
- Post field type for Gutenberg blocks

## [3.11.16] - 2023-12-01

### Changed
- Refactored appContext handling in Gutenberg components

## [3.11.15] - 2023-12-01

### Fixed
- Loading of editor assets in Gutenberg blocks

## [3.11.14] - 2023-11-30

### Fixed
- Compatibility with WordPress Block Editor Canvas

## [3.11.13] - 2023-11-29

### Fixed
- Compatibility with WordPress Block Editor Canvas
- Select field styling improvements

## [3.11.12] - 2023-11-13

### Added
- Made multi-select fields sortable

### Changed
- Upgraded dependencies to latest versions

### Fixed
- Product variation options functionality

## [3.11.1] - 2023-11-03

### Fixed
- Various component and field type issues
- Updated composer dependencies

## [3.11.0] - 2023-10-26

### Changed
- Completely redesigned UI for better user experience
- Improved multi-group field styling and functionality
- Enhanced link field interface
- Redesigned attachment field display
- Improved button components
- Added new SCSS component structure for better maintainability

## [3.10.1] - 2023-10-20

### Added
- Subscription metabox implementation for WooCommerce Subscriptions

## [3.10.0] - 2023-09-01

### Changed
- Updated minimum requirements (PHP 8.1+, WordPress 6.2+)

## [3.9.18] - 2023-08-31

### Fixed
- Compatibility with WooCommerce Subscriptions

## [3.9.17] - 2023-08-28

### Added
- Settings notices for options pages

## [3.9.16] - 2023-08-23

### Changed
- Reverted render parameter changes from 3.9.14

## [3.9.15] - 2023-08-23

### Added
- Order Metabox implementation for WooCommerce orders

## [3.9.14] - 2023-08-22

### Added
- Render parameter for customizing field row rendering across all implementations

## [3.9.13] - 2023-08-18

### Added
- initial_country property for tel field
- className support for group field
- Ability to reset link field

### Changed
- Improved TinyMCE toolbar customization

### Fixed
- WooCommerce field duplicates warning
- Multigroup max value handling
- Group title display

## [3.9.12] - 2023-08-09

### Fixed
- Spacing issue before buttons after hidden input fields
- Updated compatibility with WordPress 6.3

## [3.9.11] - 2023-08-08

### Fixed
- Multi_group max value when min is 0

## [3.9.10] - 2023-08-07

### Fixed
- WooCommerce field collision issues

## [3.9.9] - 2023-08-07

### Added
- Helpers.php utility class

### Changed
- Improved select field handling with value 0
- Added new select options shape format

## [3.9.8] - 2023-08-07

### Fixed
- Select field with value 0

## [3.9.7] - 2023-08-05

### Added
- Buttons attribute to multi_group field type

### Changed
- Improved select field to handle value 0 correctly
- Added new select options shape

### Fixed
- disable_buttons in multi_group documentation

## [3.9.6] - 2023-06-15

### Added
- SiteOptions implementation for multisite network-wide options

## [3.9.5] - 2023-06-15

### Added
- Support for network options in multisite installations

## [3.9.4] - 2023-05-07

### Fixed
- Product variation options functionality

### Changed
- Updated Node.js version to match development requirements

## [3.9.3] - 2023-04-20

### Fixed
- Code field in multigroup within Gutenberg blocks

## [3.9.2] - 2023-04-19

### Fixed
- Code field styling in multigroup within Gutenberg blocks

## [3.9.1] - 2023-03-24

### Added
- Documentation for Comments metabox and custom getters/setters

### Changed
- Optimized API calls and assets loading

## [3.9.0] - 2023-03-20

### Added
- ProductVariationOptions implementation for WooCommerce product variations
- Custom fields support for product variations

## [3.8.0] - 2023-02-28

### Added
- WcMembershipPlanOptions implementation for WooCommerce Memberships plugin

## [3.7.7] - 2023-02-20

### Added
- Basic WPML support for multilingual fields

### Fixed
- Number field input handling

### Removed
- WPML integration (replaced with basic support)

## [3.7.6] - 2022-12-30

### Fixed
- AbstractImplementation functionality

## [3.7.5] - 2022-12-29

### Fixed
- InnerBlocksField component

## [3.7.4] - 2022-12-12

### Added
- Comment implementation for adding custom fields to comments

## [3.7.2] - 2022-12-08

### Changed
- Edit link behavior on attachments

## [3.7.1] - 2022-11-28

### Fixed
- Attachment field functionality and styling

## [3.7.0] - 2022-11-09

### Added
- MapyczField field type for Mapy.cz map integration

## [3.6.0] - 2022-11-08

### Added
- InnerBlocksField field type for Gutenberg inner blocks support

## [3.5.14] - 2022-10-26

### Changed
- Minor updates to build files

## [3.5.13] - 2022-10-26

### Fixed
- WYSIWYG field change handler
- Updated all component files for consistency

## [3.5.12] - 2022-10-20

### Fixed
- PostField component

## [3.5.11] - 2022-10-20

### Fixed
- GutenbergBlock implementation

## [3.5.10] - 2022-10-18

### Fixed
- Sanitization in Sanitizer class

## [3.5.9] - 2022-10-18

### Fixed
- Sanitization in Sanitizer class

## [3.5.8] - 2022-10-14

### Changed
- Optimized async select fields API calls

## [3.5.7] - 2022-10-14

### Fixed
- Async selects to hit the API only once instead of twice

## [3.5.6] - 2022-10-06

### Fixed
- GutenbergBlock implementation

## [3.5.5] - 2022-10-06

### Fixed
- GutenbergBlock implementation

## [3.5.4] - 2022-10-05

### Changed
- Minor version bump with no changes

## [3.5.3] - 2022-10-05

### Changed
- Optimized Gutenberg blocks performance

## [3.5.2] - 2022-09-29

### Fixed
- Parser for boolean values

## [3.5.1] - 2022-09-29

### Fixed
- Custom getter/setter functionality in AbstractImplementation

## [3.5.0] - 2022-09-29

### Added
- Support for custom get and set methods in all implementations

## [3.4.8] - 2022-09-19

### Fixed
- Code field functionality

## [3.4.7] - 2022-09-12

### Fixed
- Title display in GroupField and MultiGroupFieldRow

## [3.4.6] - 2022-09-12

### Added
- Async parameters support for select fields

## [3.4.5] - 2022-09-12

### Fixed
- Multi_toggle field handling

## [3.4.4] - 2022-09-08

### Fixed
- Default values across all field types
- Improved helper functions for default value handling

## [3.4.3] - 2022-09-07

### Fixed
- Sanitization in Sanitizer class

## [3.4.2] - 2022-09-07

### Fixed
- Sanitization in Sanitizer class

## [3.4.1] - 2022-09-05

### Fixed
- Parser.php and sanitization issues

## [3.4.0] - 2022-08-23

### Added
- GitLab CI/CD pipeline
- Multigroup item title support

### Changed
- Updated build process
- Bumped minimum PHP version requirement

### Fixed
- Sanitization across multiple field types
- Conditional fields functionality
- React fragment warnings
- Tel input field
- Conditional display in WooCommerce fields

## [3.3.8] - 2022-08-12

### Added
- Conditional display support for all implementations

### Fixed
- Link field functionality

## [3.3.7] - 2022-07-12

### Fixed
- Documentation issues

## [3.3.6] - 2022-07-12

### Added
- WYSIWYG field type documentation

### Changed
- Moved select menu to portal for better positioning

## [3.3.5] - 2022-05-05

### Fixed
- WYSIWYG field in multigroup
- Improved field ID handling for CodeField, ColorField, InputField, TextareaField, and WysiwygField

## [3.3.4] - 2022-05-05

### Added
- Conditional display support for all field implementations

### Fixed
- Multigroup field being cleared when containing HTML code in textarea

## [3.3.3] - 2022-05-03

### Fixed
- ProductOptions row handling
- Group field default value

## [3.3.2] - 2022-05-02

### Fixed
- Select field functionality
- Improved select control and helper functions

## [3.3.1] - 2022-04-26

### Fixed
- WYSIWYG field issues

### Changed
- Updated composer dependencies

## [3.3.0] - 2022-04-12

### Changed
- Improved multigroup field functionality
- Enhanced sortable control
- Improved link field and WYSIWYG field handling

## [3.2.7] - 2022-03-24

### Changed
- Refactored GroupFieldRow to components directory
- Improved GutenbergRootWrapper and ScreenContext

## [3.2.6] - 2022-03-23

### Added
- GutenbergRootWrapper component

### Fixed
- Group field functionality

### Changed
- Improved MetaboxRow and ScreenContext components

## [3.2.5] - 2022-03-10

### Changed
- Improved titles in multigroups for date, datetime, and time field values

## [3.2.4] - 2022-03-09

### Added
- CloneButton component for multigroup fields

### Changed
- Improved link field, multigroup field, and select control functionality

## [3.2.3] - 2022-03-09

### Fixed
- Link lists in AbstractImplementation

## [3.2.2] - 2022-03-09

### Fixed
- Link lists in WYSIWYG field and Gutenberg implementation

## [3.2.1] - 2022-03-08

### Fixed
- Select All capture in WYSIWYG field
- Removed debug console.log statements

## [3.2.0] - 2022-03-07

### Added
- Color picker improvements

### Changed
- Enhanced WYSIWYG field functionality
- Improved ColorField interface
- Updated Gutenberg block implementation
- Improved sanitization

## [3.1.1] - 2022-03-01

### Fixed
- AbstractImplementation for post types support

## [3.1.0] - 2022-02-25

### Added
- Support for more post types in Gutenberg blocks
- InspectorGutenbergBlock component for moving attributes to inspector panel

## [3.0.0] - 2022-02-18

### Changed
- Reworked select controls and components
- Updated link field functionality
- Improved SelectControl, PostField, and SelectField components

### Removed
- SearchableSelectControl component (replaced with improved SelectControl)

## [2.3.5] - 2022-02-15

### Changed
- Improved link field type implementation in Gutenberg blocks

## [2.3.4] - 2022-02-15

### Added
- Link field type support in Gutenberg blocks and AbstractImplementation

## [2.3.3] - 2022-02-15

### Added
- Link field type with URL, label, and target properties
- New LinkField component with full URL builder interface
- Link field integration with parser and implementations

## [2.3.2] - 2022-02-15

### Added
- `init_priority` option for controlling initialization order of integrations

### Changed
- Updated dependencies in package.json

### Fixed
- WYSIWYG editor initialization issues
- Default value handling in WYSIWYG field (returns empty string instead of undefined)
- Console logging removed from WYSIWYG field component

## [2.3.1] - 2022-02-03

### Fixed
- Toggle field behavior within group fields
- Default value handling for fields inside group fields

## [2.3.0] - 2022-02-03

### Changed
- Replaced custom WYSIWYG editor implementation with WordPress TinyMCE editor
- Updated build system and asset management

## [2.2.5] - 2022-02-01

### Fixed
- Select field issues in Gutenberg blocks

## [2.2.4] - 2022-01-13

### Fixed
- Multi_post field data handling and API integration

## [2.2.3] - 2022-01-11

### Fixed
- JSON escaping issues in Assets and AbstractImplementation
- JSON escaping in GutenbergBlock implementation

## [2.2.2] - 2022-01-10

### Fixed
- Post and multi_post field implementation in AbstractImplementation

## [2.2.1] - 2022-01-10

### Changed
- Improved post and multi_post field components
- Refactored PostField component code structure

## [2.2.0] - 2022-01-07

### Changed
- Improved select field components with better searchable select control
- Enhanced JSON encoding handling throughout the codebase

## [2.1.1] - 2021-12-09

### Fixed
- Attachment field handling and display issues

## [2.1.0] - 2021-12-09

### Changed
- General stability improvements and bug fixes
- Updated build artifacts and asset management
- Improved Gutenberg block integration

### Fixed
- Various minor issues across field implementations

## [2.0.4] - 2021-10-27

### Fixed
- SVN peg revision issues with asset file naming (renamed flags@2x.png to flags-2x.png)

## [2.0.3] - 2021-09-16

### Fixed
- Multi_post field handling of empty items
- Asset rebuilds and updates

## [2.0.2] - 2021-09-16

### Fixed
- Multi_post field with empty item handling
- PostField component improvements
- Styling updates for better empty state handling

## [2.0.1] - 2021-09-10

### Fixed
- AbstractImplementation updates for better stability

## [2.0.0] - 2021-09-08

### Changed
- **Major refactoring**: Complete core rewrite
- Renamed main class from `WpifyCustomFields` to `CustomFields`
- Updated namespace structure across all implementations
- Refactored all implementation classes (Metabox, Options, ProductOptions, Taxonomy, User, WooCommerceSettings, GutenbergBlock)
- Updated API, Assets, Parser, and Sanitizer classes
- Improved code organization following PSR-4 standards
- Updated function prefixes and hooks
- Breaking changes: This is a major version with potential breaking changes from 1.x

## [1.5.7] - 2021-08-06

### Fixed
- Removed data from data-attribute to improve performance and prevent issues

## [1.5.6] - 2021-08-05

### Fixed
- Removed data from data-attribute and improved data handling

## [1.5.5] - 2021-08-03

### Fixed
- WordPress 5.8 compatibility issues

## [1.5.4] - 2021-08-02

### Fixed
- WordPress 5.8 compatibility issues

## [1.5.3] - 2021-08-02

### Fixed
- Various bug fixes

## [1.5.2] - 2021-08-02

### Fixed
- Various bug fixes

## [1.5.1] - 2021-08-02

### Fixed
- Various bug fixes

## [1.5.0] - 2021-07-14

### Added
- User profile custom fields implementation

### Fixed
- Options page two-level groups rendering

## [1.4.8] - 2021-07-06

### Fixed
- Options page two-level groups display

## [1.4.7] - 2021-06-30

### Fixed
- Various bug fixes

## [1.4.6] - 2021-06-28

### Fixed
- Multi-select field type functionality

## [1.4.5] - 2021-05-17

### Fixed
- Multi-attachment field type functionality

## [1.4.4] - 2021-05-11

### Changed
- Updated readme documentation

### Fixed
- Various bug fixes

## [1.4.3] - 2021-05-11

### Changed
- Better sanitization for field values
- Custom field types improvements

## [1.4.2] - 2021-05-07

### Fixed
- Various bug fixes and improvements

## [1.4.1] - 2021-05-05

### Changed
- Async components loading for better performance

## [1.4.0] - 2021-05-04

### Added
- WYSIWYG (rich text editor) field type

## [1.3.14] - 2021-05-03

### Added
- Clear button on select fields for better UX

## [1.3.13] - 2021-05-03

### Fixed
- Select field functionality

## [1.3.12] - 2021-05-03

### Fixed
- Select field functionality

## [1.3.11] - 2021-04-25

### Fixed
- Select field functionality

## [1.3.10] - 2021-04-22

### Fixed
- Non-searchable select fields

## [1.3.9] - 2021-04-21

### Changed
- Improved multi-group field display

## [1.3.8] - 2021-04-21

### Added
- LICENSE file (MIT License)

### Fixed
- Async select fields functionality

## [1.3.7] - 2021-04-15

### Added
- Better error handling throughout the plugin

## [1.3.6] - 2021-04-15

### Fixed
- Various small fixes and improvements

## [1.3.5] - 2021-04-14

### Changed
- WooCommerce integration improvements

### Fixed
- Various bug fixes

## [1.3.4] - 2021-04-13

### Added
- WooCommerce integration support
- Multi-toggle field type

### Changed
- Improved options component
- Enhanced options row functionality

## [1.3.3] - 2021-04-10

### Changed
- Improved default renderer

## [1.3.2] - 2021-04-10

### Fixed
- Various bug fixes

## [1.3.1] - 2021-04-09

### Fixed
- Various bug fixes

## [1.3.0] - 2021-04-08

### Added
- Gutenberg blocks support

## [1.2.3] - 2021-04-07

### Changed
- Register fields with filters for better extensibility

### Fixed
- Move button functionality

## [1.2.2] - 2021-04-06

### Added
- Documentation improvements

### Fixed
- Various bug fixes

## [1.2.1] - 2021-04-06

### Fixed
- Various bug fixes

## [1.2.0] - 2021-04-06

### Added
- Attachment field type
- Multi-attachment field type

### Fixed
- Attachment field functionality

## [1.1.8] - 2021-04-04

### Added
- Post field type for selecting WordPress posts

## [1.1.7] - 2021-04-03

### Fixed
- Various bug fixes

## [1.1.6] - 2021-04-03

### Added
- Post field type
- Multi-post field type for selecting multiple posts

## [1.1.5] - 2021-04-03

### Added
- Multi-select searchable functionality

## [1.1.4] - 2021-04-03

### Changed
- Improved telephone field
- Fixed first level group appearance

## [1.1.3] - 2021-04-02

### Changed
- Better group field handling

## [1.1.2] - 2021-04-02

### Changed
- Better group fields implementation
- Load custom fields scripts only when needed

### Fixed
- Code field improvements

## [1.1.1] - 2021-04-01

### Changed
- Load custom fields scripts only when needed

### Fixed
- Code field improvements

## [1.1.0] - 2021-04-01

### Added
- Select field type
- Multi-select field type
- Toggle field type
- Checkbox field type
- Code field type

## [1.0.0] - 2021-04-01

### Added
- Initial release
- Core custom fields framework
- Sanitizer and parser functionality
- Group field support
- Basic field types (text, textarea, number, email, url, tel, etc.)
- WordPress integration for post meta, term meta, and options pages
