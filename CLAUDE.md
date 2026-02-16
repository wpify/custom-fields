# CLAUDE.md

## Project Overview

WPify Custom Fields — WordPress plugin providing 58 field types across 15 integration points (metaboxes, options pages, taxonomy terms, users, WooCommerce products/orders/coupons, Gutenberg blocks, etc.). PHP 8.1+ / WordPress 6.2+ / React 18.

Entry point: `custom-fields.php` → singleton `wpify_custom_fields()` returns `CustomFields` instance.

## Directory Structure

```
src/                        # PHP source (PSR-4: Wpify\CustomFields)
  CustomFields.php          # Main class — factory methods, sanitization, type mapping
  Api.php                   # REST API endpoints (/wpifycf/v1/)
  FieldFactory.php          # Fluent PHP API for building field definitions
  Helpers.php               # URL fetching, post/term queries, file operations
  Fields/                   # PHP field type handlers (DirectFileField)
  Integrations/             # All 15 integration classes
  Exceptions/               # MissingArgumentException, CustomFieldsException
assets/                     # JS/React source (@ alias in imports)
  custom-fields.js          # Entry point — bootstraps React apps from DOM containers
  components/               # Shared: App, Field, AppContext, MultiField, GutenbergBlock, Tabs, Label, etc.
  fields/                   # 59 field type React components
  helpers/                  # hooks.js, functions.js, validators.js, field-types.js, generators.js
  styles/                   # SCSS with CSS custom properties and container queries
docs/                       # Markdown documentation (field-types/, integrations/, features/)
build/                      # Webpack output (generated)
```

## Build Commands

- Dev server: `npm run start`
- Production build: `npm run build`
- Bundle analysis: `npm run build:analyze`
- PHP code standards: `composer run phpcs`
- PHP auto-fix: `composer run phpcbf`

## Architecture

### PHP Integration Class Hierarchy

```
BaseIntegration (abstract)
│   normalize_items(), enqueue(), register_rest_options()
│
├── OptionsIntegration (abstract)
│   │   print_app(), prepare_items_for_js(), get/set_field(), set_fields_from_post_request()
│   │
│   ├── Options              — Admin menu pages (get_option / update_option)
│   ├── SiteOptions          — Multisite network options
│   ├── WooCommerceSettings  — WC settings tabs
│   │
│   └── ItemsIntegration (abstract)
│       │   Adds get_item_id() for item-bound storage
│       │
│       ├── Metabox                    — Post meta boxes
│       ├── Taxonomy                   — Term meta fields
│       ├── User                       — User profile fields
│       ├── Comment                    — Comment meta
│       ├── MenuItem                   — Nav menu item meta
│       ├── ProductOptions             — WC product data tabs
│       ├── ProductVariationOptions    — WC product variations
│       ├── CouponOptions              — WC coupon fields
│       ├── OrderMetabox               — WC orders (HPOS compatible)
│       ├── SubscriptionMetabox        — WC Subscriptions
│       └── WcMembershipPlanOptions    — WC Memberships
│
└── GutenbergBlock — Block attributes, server-side rendering, InnerBlocks
```

### Data Flow: PHP → JavaScript

1. **Normalize** — `normalize_items()` adds IDs, global_ids, resolves type aliases, registers async option endpoints
2. **Prepare** — `prepare_items_for_js()` builds input names, fetches current values from DB
3. **Render** — `print_app()` outputs a `.wpifycf-app-instance` container with all field data in `data-fields` JSON attribute
4. **Bootstrap** — JS entry reads `data-fields`, creates React root with `AppContextProvider`
5. **Render tree** — `App` → `RootFields` → `Field` (dispatcher) → specific field component
6. **Submit** — Hidden `<input>` elements carry values; PHP `set_fields_from_post_request()` sanitizes and saves
7. **Gutenberg** — Uses controlled state (`attributes` / `setAttributes`) instead of form submission

### Key JS Components

- **`Field.js`** — Central dispatcher: resolves type to component via `getFieldComponentByType()`, evaluates conditions (`useConditions`), runs validation (`checkValidity`), handles generators
- **`AppContext.js`** — Global state provider: values, fields, tabs, config. Supports both controlled (Gutenberg) and uncontrolled (form) modes
- **`MultiField.js`** — Generic repeater: add/remove/reorder (Sortable.js), min/max constraints. All `multi_*` types are thin wrappers around this
- **`GutenbergBlock.js`** — View/Edit mode toggle, server-side block rendering, InnerBlocks via HTML comment replacement
- **`functions.js`** — `evaluateConditions()`, `getValueByPath()` (dot notation + relative `#`/`##` paths), `interpolateFieldValues()`
- **`validators.js`** — `checkValidityStringType`, `checkValidityNumberType`, `checkValidityGroupType`, `checkValidityMultiFieldType()` factory
- **`hooks.js`** — `useConditions`, `useMulti`, `usePosts`, `useTerms`, `useOptions`, `useMediaLibrary`, `useValidity`, `useSortableList`

## Code Style

- **PHP**: WordPress Coding Standards (WPCS) — see `phpcs.xml` for project customizations
- **JS**: WordPress scripts standards via `@wordpress/scripts`
- **CSS**: SCSS, BEM-style with `wpifycf-` prefix, CSS custom properties (`--wpifycf-*`), container queries on `.wpifycf-app-instance` and `.wpifycf-field__control`
- **Naming**: PHP namespace `Wpify\CustomFields` (PSR-4), React components PascalCase, JS helpers camelCase
- **Prefix**: PHP globals `wpifycf`, text domain `wpify-custom-fields`
- **JS imports**: `@` alias = `assets/` directory
- **Docs**: PHPDoc in code, markdown in `docs/`. Follow WordPress Coding Standards in PHP examples (tabs, spaces in parentheses/functions). Always escape output: `esc_html()`, `esc_attr()`, `esc_url()`, `wp_kses()`

## Key Patterns

### Integration Lifecycle
- **Render**: `normalize_items()` → `prepare_items_for_js()` → `print_app(context, tabs, attrs, items)`
- **Save**: `normalize_items()` → `set_fields_from_post_request(items)`
- **Register meta**: `normalize_items()` → `flatten_items()` → `register_{type}_meta()` per field

### Field Type Aliases (backward compatibility)
`switch` → `toggle`, `multiswitch` → `multi_toggle`, `multiselect` → `multi_select`, `colorpicker` → `color`, `gallery` → `multi_attachment`, `repeater` → `multi_group`

### PHP Extensibility Filters
- `wpifycf_sanitize_{type}` — custom sanitization
- `wpifycf_wp_type_{type}` — WordPress data type mapping (integer, number, boolean, object, array, string)
- `wpifycf_default_value_{type}` — default values
- `wpifycf_items` — filter normalized items

### JS Extensibility Filters (@wordpress/hooks)
- `wpifycf_field_{type}` — register custom field component
- `wpifycf_definition` — filter field definitions before render
- `wpifycf_generator_{name}` — auto-generate field values (e.g., UUID)

### Extending Field Types
- **PHP**: Register `wpifycf_sanitize_{type}`, `wpifycf_wp_type_{type}`, `wpifycf_default_value_{type}` filters
- **JS**: Create component in `assets/fields/`, add static `checkValidity(value, field)` method, register with `addFilter('wpifycf_field_{type}', ...)`
- **Multi-version**: Wrap with `MultiField`, use `checkValidityMultiFieldType(type)` helper
- Full guide: `docs/features/extending.md`

### Conditional Logic
Conditions array with operators (`==`, `!=`, `>`, `>=`, `<`, `<=`, `between`, `contains`, `not_contains`, `in`, `not_in`, `empty`, `not_empty`), `and`/`or` combinators, nested groups, relative path refs (`#` parent, `##` grandparent). Hidden fields still submit values with `data-hide-field="true"`. Full docs: `docs/features/conditions.md`

### Validation
Field components export static `checkValidity(value, field)` → array of error strings. Form submission blocked if errors. Validators in `assets/helpers/validators.js`. Full docs: `docs/features/validation.md`

## Documentation

When writing or updating docs in `docs/`:
- Follow existing templates — consistent structure for field types, integrations, and features (see any existing file as reference)
- PHP examples: WordPress Coding Standards with tabs, spaces in parentheses/functions
- Always escape output in examples (`esc_html()`, `esc_attr()`, `esc_url()`, `wp_kses()`)
- Parameter format: `name` _(type)_ — description
- File organization: `docs/field-types/`, `docs/integrations/`, `docs/features/`

## Self-Maintenance

When your changes invalidate or create gaps in this file, update it as part of the same task. Typical triggers:
- Build commands or scripts change
- New integrations, field types, or major features are added
- Class hierarchy or data flow changes
- File/directory structure changes

Keep updates minimal, match existing style, do not add session-specific or speculative content.
