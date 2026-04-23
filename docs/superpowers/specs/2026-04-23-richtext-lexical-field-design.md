# Rich Text Field (Lexical) — Design Spec

**Status:** Approved (brainstorming phase)
**Date:** 2026-04-23
**Author:** Daniel Mejta
**Supersedes:** n/a
**Related:** existing `wysiwyg` field (TinyMCE), `code` field (CodeMirror)

---

## Goal

Add a new field type `richtext` to WPify Custom Fields — a modern rich-text editor built on [Lexical](https://lexical.dev/) — that coexists with the existing `wysiwyg` (TinyMCE) field. Ship it with a full, configurable toolbar, a visual ↔ code view toggle, and a word/character counter.

## Non-goals

- Replacing or deprecating the `wysiwyg` field.
- Image / media embed UI inside the editor (use separate `attachment` fields).
- Collaborative editing, table editing, mentions, emoji picker.
- Automated test harness (project has none today; manual QA checklist is the acceptance gate for v1).
- Bundle-size gating. Size is tracked, not gated.

---

## Field type summary

| Key | Value |
|---|---|
| PHP type | `richtext` (and `multi_richtext`) |
| JS dispatcher key | `richtext`, `multi_richtext` |
| Stored format | HTML string (`wp_kses_post`-sanitized on save) |
| WP meta type | `string` |
| Default value | `''` |
| Validation | `checkValidityStringType` (single), `checkValidityMultiFieldType('richtext')` (multi) |

### Field-definition properties

| Property | Type | Default | Description |
|---|---|---|---|
| `toolbar` | `string \| string[]` | `'full'` | Preset name (`'full' \| 'basic' \| 'minimal'`) or explicit array of button IDs |
| `height` | `integer` | `300` | Editor body min-height in px |
| `word_count` | `boolean` | `true` | Show word/character counter footer |
| `default_view` | `'visual' \| 'code'` | `'visual'` | Initial view (ignored if `view:toggle-code` not in toolbar) |

No `delay`, no `force_modal`, no `tabs` — not needed with Lexical.

### Example usage

```php
// Full toolbar (default)
array( 'type' => 'richtext', 'id' => 'body', 'label' => 'Body' )

// Preset
array( 'type' => 'richtext', 'id' => 'intro', 'toolbar' => 'basic' )

// Explicit toolbar
array(
  'type'    => 'richtext',
  'id'      => 'body',
  'toolbar' => array( 'format:bold', 'format:italic', '|', 'insert:link', 'history:undo', 'history:redo' ),
)

// Multi version
array(
  'type'       => 'multi_richtext',
  'id'         => 'sections',
  'toolbar'    => 'basic',
  'min'        => 1,
  'max'        => 10,
)
```

---

## Architecture

### File layout

```
assets/fields/
  RichText.js                    # main component (default export)
  MultiRichText.js               # multi_richtext wrapper (MultiField)
  RichText/
    index.js                     # barrel
    config.js                    # toolbar presets, special-char set, format map
    nodes.js                     # custom node overrides (alignment import)
    Editor.js                    # <LexicalComposer> + plugins + ContentEditable
    Toolbar.js                   # toolbar renderer (takes button-id array)
    buttons/
      BlockFormat.js             # paragraph / h1-h6 / pre / code-block dropdown
      InlineFormat.js            # bold, italic, strikethrough
      Lists.js                   # UL, OL
      Blockquote.js
      Alignment.js               # left/center/right/justify
      Link.js                    # button + floating popover
      HorizontalRule.js
      Indent.js                  # increase / decrease
      PasteAsText.js             # one-shot
      ClearFormatting.js
      SpecialChar.js             # popover picker
      History.js                 # undo / redo
      ViewToggle.js              # visual ↔ code
    plugins/
      HtmlSyncPlugin.js          # HTML import/export ↔ Lexical state
      PasteAsTextPlugin.js       # one-shot paste handler
      WordCountPlugin.js         # words + characters
      LinkPopoverPlugin.js       # floating link editor
      FloatingAnchorPlugin.js    # shared positioning helper
      SpecialCharPlugin.js       # insert at caret
    CodeView.js                  # CodeMirror (language="html") wrapping
    useHtmlRoundtrip.js          # parse/normalize/diff helpers
assets/styles/
  _field-richtext.scss           # new partial imported by main entry
```

### Integration with the plugin

**JS registration** — `assets/fields/index.js` adds:
```js
import RichText from './RichText';
import MultiRichText from './MultiRichText';
// ...
richtext: RichText,
multi_richtext: MultiRichText,
```

**PHP sanitization** — `src/CustomFields.php::sanitize_item_value()`, extending the existing `wysiwyg` branch:
```php
} elseif ( in_array( $item['type'], array( 'wysiwyg', 'richtext' ), true ) ) {
    $sanitized_value = wp_kses_post( $value );
}
```
`multi_richtext` is handled by the existing `str_starts_with( $item['type'], 'multi_' )` branch that recurses into `sanitize_item_value()`.

**PHP wp_type / default** — wherever `wysiwyg` is currently switched in `CustomFields.php` (verified during implementation), `richtext` is added alongside with the same values (`string`, `''`). No new filters.

**FieldFactory** — `src/FieldFactory.php` gains a `richtext()` method mirroring `wysiwyg()` plus the new `toolbar` / `word_count` / `default_view` parameters.

### Data flow

```
PHP value (HTML) ──► AppContext ──► RichText props.value
                                         │
                          ┌──────────────┴──────────────┐
                    view === visual              view === code
                          │                             │
                   <Editor value=html>         <CodeView value=html>
                          │                             │
                HtmlSyncPlugin parses HTML       user edits raw HTML
                          │                             │
                  user edits via toolbar                │
                          │                             │
                on change → $generateHtmlFromNodes      │
                          │                             │
                          └──────────────┬──────────────┘
                                         ▼
                             props.onChange(html)
                                         │
                                         ▼
                   AppContext state → hidden <input> → PHP wp_kses_post on save
```

---

## HTML round-trip

### Import (HTML → Lexical state)

1. `new DOMParser().parseFromString(html, 'text/html')` (detached document).
2. Inside `editor.update()`: `$generateNodesFromDOM(editor, doc)` → nodes.
3. Replace root children with generated nodes.

### Export (Lexical state → HTML)

1. Inside `editor.read()`: `$generateHtmlFromNodes(editor, null)`.
2. If result matches empty-editor pattern (`<p><br></p>`), emit `''`.
3. Call `props.onChange(html)`.

### Registered nodes

Built-in only:
```
ParagraphNode, TextNode, HeadingNode, QuoteNode,
ListNode, ListItemNode, LinkNode,
HorizontalRuleNode, CodeNode, CodeHighlightNode
```
Image / table / mention nodes are intentionally not registered. Unknown nodes in imported HTML degrade to text or paragraphs via Lexical's default fallback.

### Alignment import patch

`ParagraphNode` and `HeadingNode` get `importDOM()` overrides (in `RichText/nodes.js`) that read both `style="text-align: …"` and legacy `align="…"` attributes and call `setFormat(direction)` on the imported node. Export is unchanged (Lexical always emits `style="text-align: …"`).

### Empty value handling

- Initial value `''` → empty root → renders as single blank paragraph.
- Round-trip of empty editor → emits `''` (not `<p><br></p>`), so WP considers the meta empty.

---

## Toolbar

### Canonical button IDs

```
block:paragraph   block:h1   block:h2   block:h3   block:h4   block:h5   block:h6
block:pre         block:code-block
format:bold       format:italic        format:strikethrough
list:ul           list:ol              block:blockquote
align:left        align:center         align:right        align:justify
insert:link       insert:hr            insert:special-char
indent:increase   indent:decrease
action:paste-as-text    action:clear-formatting
history:undo      history:redo
view:toggle-code
```

Separator: `'|'` literal.

**Block-format dropdown:** the `block:paragraph | h1..h6 | pre | code-block | blockquote` IDs, when present, collapse into a single dropdown labeled by current block. The dropdown appears at the position of the first `block:*` ID in the array; other `block:*` IDs merely populate the menu.

### Presets (`RichText/config.js`)

- **full** — every button ID above, in the order shown, with sensible separator groups. (Default when `toolbar` key is omitted.)
- **basic** — paragraph/h2/h3 (as dropdown) · bold, italic · UL, OL · link · undo, redo.
- **minimal** — bold, italic · link.

### Extensibility filters

```js
// Override / extend presets
addFilter('wpifycf_richtext_toolbar_presets', 'my-plugin/presets', (presets) => ({ ... }));

// Register custom button
addFilter('wpifycf_richtext_buttons', 'my-plugin/buttons', (buttons) => ({
  ...buttons,
  'my:custom': { icon, label, onClick(editor), isActive?(editor, selection), render?(editor) },
}));

// Curate special-character set
addFilter('wpifycf_richtext_special_chars', 'my-plugin/chars', (chars) => [...chars, '½']);
```

Unknown button IDs skipped silently (with `console.warn` in dev builds).

### Button behaviors (detailed)

| ID | Behavior |
|---|---|
| `block:*` | Single dropdown; `$setBlocksType` with appropriate node constructor; "Paragraph" always enabled as reset. `block:code-block` = `<pre><code>`. |
| `format:bold` / `italic` / `strikethrough` | `FORMAT_TEXT_COMMAND` with format key; active via `selection.hasFormat(...)`. |
| `list:ul` / `list:ol` | `INSERT_UNORDERED_LIST_COMMAND` / `INSERT_ORDERED_LIST_COMMAND` / `REMOVE_LIST_COMMAND`; active when nearest list matches type. |
| `block:blockquote` | `$setBlocksType` → `$createQuoteNode`; toggles back to paragraph when already active. |
| `align:*` | `FORMAT_ELEMENT_COMMAND` with direction; active reflects nearest block's element format. |
| `insert:link` | Toggles link on selection or opens floating popover; uses `TOGGLE_LINK_COMMAND`. |
| `insert:hr` | `INSERT_HORIZONTAL_RULE_COMMAND`. |
| `indent:*` | `INDENT_CONTENT_COMMAND` / `OUTDENT_CONTENT_COMMAND`; outdent disabled at indent 0. |
| `action:paste-as-text` | One-shot arm; next paste strips formatting; button shows armed state until fired or re-clicked. Implemented via `PASTE_COMMAND` handler at `COMMAND_PRIORITY_HIGH`. |
| `action:clear-formatting` | Single `editor.update()` transaction: strip text formats, unwrap links, reset alignment/indent, convert block to paragraph. |
| `insert:special-char` | Popover anchored to button; 40-char curated grid; insert via `$insertText`; tooltip shows char name. |
| `history:undo` / `redo` | `UNDO_COMMAND` / `REDO_COMMAND`; disabled via `CAN_UNDO_COMMAND` / `CAN_REDO_COMMAND` subscription. |
| `view:toggle-code` | Flips local `view` state between `visual` / `code`; icon swaps; other toolbar buttons render disabled while in code view. |

### Curated special-character set (40 chars, 5 groups)

```
Marks:       © ® ™ § ¶ • · …
Punctuation: – — " " ' ' « » ‹ › „ ‚
Arrows:      ← → ↑ ↓ ↔ ⇐ ⇒
Math:        × ÷ ± ≈ ≠ ≤ ≥ ∞ √ ∑ ∏ ∂
Currencies:  € £ ¥ ¢ ₹ ₽ ¤
```

---

## Link popover

Floating popover appears when:
- Caret is inside a `LinkNode`, or
- User clicks `insert:link` with any text selected.

Fields: URL input, "Open in new tab" checkbox (sets `target="_blank" rel="noopener noreferrer"`).
Buttons: Save, Remove link, Cancel.
Dismiss: Esc, click outside, Save action, or caret leaving the link.

Positioning: computed against the selection's client rect; fixed-positioned React portal; repositions on scroll/resize. If `@floating-ui/react` is already in the dependency graph (checked at implementation time), use it; otherwise hand-rolled.

---

## View toggle

### `visual → code`
1. Call `$generateHtmlFromNodes` once → capture current HTML.
2. Mount `<CodeView>` (CodeMirror with `language="html"`, light theme) with the captured HTML.
3. Disable all non-`view:toggle-code` toolbar buttons (greyed, not hidden).

### `code → visual`
1. Capture CodeView's current HTML (source).
2. Parse via `$generateNodesFromDOM` into Lexical state.
3. Call `$generateHtmlFromNodes` on the resulting state → normalized HTML.
4. If `source !== normalized` (after whitespace trim), set inline notice:
   `{ variant: 'info', message: 'Some HTML was normalized by the editor.', details: { source, normalized } }`
5. If parse throws: set `{ variant: 'error', message: 'The editor could not parse the HTML. You can edit it as raw HTML instead.' }` plus "Switch to code view" action (if the button is in the toolbar).

Notice rendered as `.wpifycf-field-richtext__notice` inline between toolbar and editor body. Dismisses on close click, any edit, or view switch. "View changes" expands a `<details>` with side-by-side (or stacked) `<pre>` blocks.

---

## Word / character counter

- Plugin: `WordCountPlugin` subscribes via `editor.registerTextContentListener` (visual view) or re-runs on CodeMirror `onChange` + `stripHtml` (code view).
- Words: Unicode-aware split (`.trim().split(/\s+/u).filter(Boolean).length`).
- Characters: excluding whitespace by default.
- Click counter → toggle "incl. spaces" mode (local state, not persisted).
- Debounced to 150ms.
- Footer bar: `{ words } words · { characters } characters` (tooltip: "Characters excluding whitespace — click to toggle").
- Hidden when `word_count: false`.

---

## Sanitization & error handling

| Layer | Behavior |
|---|---|
| PHP save | Added to `sanitize_item_value()` in the `wysiwyg` branch → `wp_kses_post()`. |
| PHP wp_type / default | Added alongside `wysiwyg` with `'string'` / `''`. |
| JS on paste / change | No client-side sanitization; server is source of truth. |
| JS bundle failure | `ErrorBoundary` around `<Editor>` falls back to raw `<textarea>` (same pattern as `Code.js`). |
| HTML parse failure on load | Empty paragraph + inline error notice offering "Switch to code view" (if toggle is available). |
| Code-view normalization | Inline info notice with details disclosure. |
| Unknown clipboard HTML | Lexical's default paste falls back to text content for unknown nodes; formats preserved where possible. |

---

## Gutenberg compatibility

- Lexical renders through React; no document-identity / iframe issues like TinyMCE.
- Still wrap in `EventIsolationWrapper` (reused from `Wysiwyg.js`) when `AppContext.context === 'gutenberg'` to prevent block-selection interference.
- No modal fallback needed.

---

## Styling

- New partial `assets/styles/_field-richtext.scss` imported by main stylesheet.
- BEM: `.wpifycf-field-richtext` with elements `__toolbar`, `__toolbar-group`, `__button`, `__dropdown`, `__dropdown-menu`, `__editor`, `__content`, `__code-view`, `__footer`, `__counter`, `__notice`, `__popover`, `__special-chars-grid`.
- Modifiers: `--active`, `--disabled`, `--armed`, `--view-code`, `--view-visual`, `--notice-error`, `--notice-info`.
- Reuses existing CSS custom properties (`--wpifycf-*`) — inherits admin theme.
- Content area: minimal reset of margins for `p`, `h1-h6`, `blockquote`, `ul`, `ol`, `pre`, `code`, `hr`.
- Container queries on `.wpifycf-field-richtext` collapse toolbar into a "more" overflow menu below ~520px. Lower priority — if time-boxed, buttons simply wrap.
- Popover/dropdown positioning: `position: fixed` with manual coordinate computation; uses `@floating-ui/react` if already in graph.

---

## Dependencies (added to `package.json` → `dependencies`)

```
lexical
@lexical/react
@lexical/html
@lexical/list
@lexical/link
@lexical/rich-text
@lexical/selection
@lexical/utils
@lexical/history
@lexical/code
```

Version ranges consistent with existing deps (caret). CodeMirror, React, clsx, `@wordpress/icons`, `@wordpress/components` already present.

---

## Documentation

- `docs/field-types/richtext.md` (follow `wysiwyg.md` template)
- `docs/field-types/multi_richtext.md`
- `CHANGELOG.md` — entry under `[Unreleased]`
- No `CLAUDE.md` update required (field count derivable; JS component list doesn't enumerate fields)

---

## Manual QA checklist (acceptance criteria for v1)

### Integration contexts
- [ ] Renders and saves correctly in Metabox, Options, Taxonomy, User, Comment, MenuItem
- [ ] Renders and saves in WooCommerce product/variation/coupon/order
- [ ] Renders and saves in Gutenberg block (iframe theme + non-iframe theme)
- [ ] `multi_richtext`: add/remove/reorder, min/max constraints, per-item save
- [ ] Conditional fields: show/hide preserves value; submits correctly via `data-hide-field`

### Toolbar behaviors
- [ ] Each button in `full` preset exercised; produces correct HTML; survives save → reload → re-edit
- [ ] `basic` and `minimal` presets render only declared buttons
- [ ] Explicit array config works; unknown IDs skipped (with dev `console.warn`)
- [ ] Custom button registration via `wpifycf_richtext_buttons` filter renders and fires
- [ ] Preset override via `wpifycf_richtext_toolbar_presets` filter works

### View toggle
- [ ] Visual → code shows current HTML
- [ ] Code → visual: clean HTML round-trips silently
- [ ] Code → visual: normalized HTML shows inline info notice with diff
- [ ] Code → visual: invalid HTML shows error notice with "Switch to code view" action (if available)
- [ ] Code view disables other toolbar buttons (greyed, still rendered)
- [ ] `default_view: 'code'` opens in code view initially

### Specific behaviors
- [ ] Paste-as-text: button arms; next paste strips formatting; re-click disarms
- [ ] Special-character picker: opens, inserts at caret, closes on Esc/outside/selection, tooltip shows char name
- [ ] Counter: words + characters update correctly; click toggles "incl. spaces"; hidden when `word_count: false`
- [ ] Link popover: opens on link click / selected-text link button; Save/Remove/Cancel all work; Esc dismisses
- [ ] Block dropdown: mixed selection shows "—"; paragraph reset works from any block
- [ ] Clear formatting: one undo restores everything

### Edge cases
- [ ] Initial non-HTML plain text wraps in paragraph
- [ ] `<script>` / event attrs stripped server-side on save
- [ ] RTL / bidi content: alignment buttons emit `text-align`; Lexical handles caret correctly
- [ ] Gutenberg preview (non-edit) renders HTML directly
- [ ] Disabled field: editor read-only; toolbar inert; no popovers
- [ ] External value reset re-syncs editor
- [ ] Very large content (>100k chars) parses synchronously without crashing

### Error paths
- [ ] Malformed stored HTML → error notice on load
- [ ] Simulated Lexical bundle failure → `<textarea>` fallback

---

## Open questions / deferred

- Bundle-size target / code-splitting strategy — measure after v1, optimize if needed.
- Automated tests — deferred until the plugin adopts a JS test harness.
- Paste-from-Word / Google Docs smart cleanup — v2 feature if demand.
- Keyboard shortcuts (Ctrl+B / Ctrl+K etc.) — inherited from Lexical defaults; explicit shortcut map v2.
- Accessibility audit (ARIA roles on toolbar, keyboard toolbar navigation) — high priority, included in manual QA; formal audit deferred.
