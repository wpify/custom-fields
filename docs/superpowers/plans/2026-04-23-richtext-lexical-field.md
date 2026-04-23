# Rich Text Field (Lexical) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `richtext` field type (plus `multi_richtext`) to WPify Custom Fields, built on Lexical, with a fully configurable toolbar, visual ↔ code view toggle, floating link popover, special-character picker, and word/character counter. Coexists with the existing `wysiwyg` (TinyMCE) field.

**Architecture:** React component hierarchy rooted at `RichText.js` that composes a `<LexicalComposer>` editor, a data-driven `Toolbar` (dispatches to small per-button components by canonical ID), a swappable code view (CodeMirror reused from the `code` field), and a `WordCountPlugin`. HTML is the storage format — imported via `$generateNodesFromDOM` on load and serialized via `$generateHtmlFromNodes` on every change. PHP side extends the existing `wysiwyg` sanitization branch to include `richtext`.

**Tech Stack:** Lexical (`lexical`, `@lexical/react`, `@lexical/html`, `@lexical/list`, `@lexical/link`, `@lexical/rich-text`, `@lexical/selection`, `@lexical/utils`, `@lexical/history`, `@lexical/code`), CodeMirror 6 (already present), `@wordpress/components`, `@wordpress/icons`, `@wordpress/hooks`, React 18, SCSS.

**Branching rule:** This plan is executed directly on `master`. Per `~/.claude/CLAUDE.md`, there are **no intermediate commits** — the per-task workflow produces working changes, and a **single commit at the very end** (Task 29) bundles the spec file, plan file, and all code changes.

**Working directory:** All file paths in this plan are relative to `wp-content/plugins/wpify-custom-fields/` unless otherwise noted. Engineer should `cd` into that directory.

**Spec:** `docs/superpowers/specs/2026-04-23-richtext-lexical-field-design.md`

---

## File Structure

### Files to create

```
assets/fields/RichText.js                              # main component
assets/fields/MultiRichText.js                         # multi_richtext wrapper
assets/fields/RichText/index.js                        # barrel
assets/fields/RichText/config.js                       # toolbar presets, special chars, constants
assets/fields/RichText/nodes.js                        # ParagraphNode/HeadingNode alignment import patch
assets/fields/RichText/Editor.js                       # <LexicalComposer> + plugins
assets/fields/RichText/CodeView.js                     # CodeMirror HTML editor
assets/fields/RichText/Toolbar.js                      # toolbar renderer
assets/fields/RichText/useActiveFormat.js              # subscribe selection → active format state
assets/fields/RichText/useFloatingAnchor.js            # popover positioning helper
assets/fields/RichText/buttons/BlockFormat.js
assets/fields/RichText/buttons/InlineFormat.js         # bold, italic, strikethrough
assets/fields/RichText/buttons/Lists.js                # UL, OL
assets/fields/RichText/buttons/Blockquote.js
assets/fields/RichText/buttons/Alignment.js            # L/C/R/J
assets/fields/RichText/buttons/Link.js
assets/fields/RichText/buttons/HorizontalRule.js
assets/fields/RichText/buttons/Indent.js
assets/fields/RichText/buttons/PasteAsText.js
assets/fields/RichText/buttons/ClearFormatting.js
assets/fields/RichText/buttons/SpecialChar.js
assets/fields/RichText/buttons/History.js              # undo, redo
assets/fields/RichText/buttons/ViewToggle.js
assets/fields/RichText/plugins/HtmlSyncPlugin.js
assets/fields/RichText/plugins/PasteAsTextPlugin.js
assets/fields/RichText/plugins/WordCountPlugin.js
assets/fields/RichText/plugins/LinkPopoverPlugin.js
assets/fields/RichText/plugins/HorizontalRuleCommandPlugin.js  # registers INSERT_HORIZONTAL_RULE_COMMAND
assets/fields/RichText/Notice.js                       # inline notice component
assets/fields/RichText/Counter.js                      # word/char footer
assets/styles/components/_field-richtext.scss
docs/field-types/richtext.md
docs/field-types/multi_richtext.md
```

### Files to modify

```
package.json                                           # add Lexical deps
assets/fields/index.js                                 # register richtext, multi_richtext
assets/styles/custom-fields.scss                       # @use field-richtext
src/CustomFields.php                                   # sanitize_item_value branch
src/FieldFactory.php                                   # add richtext() method
CHANGELOG.md                                           # Unreleased entry
```

---

## Task 1: Install Lexical dependencies

**Files:**
- Modify: `package.json` (dependencies block)

- [ ] **Step 1: Add Lexical packages to `package.json`**

Open `package.json` and add these entries to the `dependencies` object (alphabetized alongside existing entries):

```json
"@lexical/code": "^0.21.0",
"@lexical/history": "^0.21.0",
"@lexical/html": "^0.21.0",
"@lexical/link": "^0.21.0",
"@lexical/list": "^0.21.0",
"@lexical/react": "^0.21.0",
"@lexical/rich-text": "^0.21.0",
"@lexical/selection": "^0.21.0",
"@lexical/utils": "^0.21.0",
"lexical": "^0.21.0",
```

- [ ] **Step 2: Install**

Run: `npm install`
Expected: no errors; `node_modules/lexical`, `node_modules/@lexical/*` directories present.

- [ ] **Step 3: Verify**

Run: `ls node_modules/lexical/package.json node_modules/@lexical/react/package.json`
Expected: both files exist.

- [ ] **Step 4: Do NOT commit** (single-commit-on-master rule — Task 29 commits everything).

---

## Task 2: PHP sanitization

**Files:**
- Modify: `src/CustomFields.php:495` (sanitize_item_value — existing wysiwyg branch)

- [ ] **Step 1: Extend the wysiwyg sanitize branch to include `richtext`**

In `src/CustomFields.php` find:

```php
} elseif ( 'wysiwyg' === $item['type'] ) {
    $sanitized_value = wp_kses_post( $value );
```

Replace with:

```php
} elseif ( in_array( $item['type'], array( 'wysiwyg', 'richtext' ), true ) ) {
    $sanitized_value = wp_kses_post( $value );
```

- [ ] **Step 2: Verify no other PHP change needed**

Confirm via inspection that `get_wp_type()` (line 569) falls through its final `else` to `'string'` for unknown types — so `richtext` gets `'string'` automatically. Confirm `get_default_value()` (line 605) derives from `get_wp_type()` → `''`. No explicit cases needed.

- [ ] **Step 3: Run PHP code standards check**

Run: `composer run phpcs -- src/CustomFields.php`
Expected: no new errors introduced. If existing file has pre-existing warnings, those are acceptable; only new ones must be fixed.

- [ ] **Step 4: Do NOT commit.**

---

## Task 3: FieldFactory method

**Files:**
- Modify: `src/FieldFactory.php` (add `richtext()` after `wysiwyg()` around line 1013)

- [ ] **Step 1: Add `richtext()` method**

Immediately after the closing brace of `wysiwyg()` (line 1013 or wherever it ends), add:

```php
	/**
	 * Creates a rich text (Lexical) field definition.
	 *
	 * @param string|array|null $toolbar        Preset name ('full'|'basic'|'minimal') or array of button IDs.
	 * @param int|null          $height         Editor body min-height in px.
	 * @param bool|null         $word_count     Show word/character counter footer.
	 * @param string|null       $default_view   Initial view ('visual'|'code').
	 * @param string|null       $label          Field label.
	 * @param string|null       $description    Field description.
	 * @param bool|null         $required       Whether the field is required.
	 * @param mixed             $default        Default value.
	 * @param bool|null         $disabled       Whether the field is disabled.
	 * @param string|null       $tab            Tab identifier.
	 * @param string|null       $class_name     HTML class name.
	 * @param array|null        $conditions     Conditional display rules.
	 * @param array|null        $attributes     HTML attributes.
	 * @param bool|null         $unfiltered     Whether to skip sanitization.
	 * @param array|null        $render_options Render options.
	 * @param string|null       $generator      Generator identifier.
	 *
	 * @return array Field definition array.
	 */
	public function richtext(
		string|array|null $toolbar = null,
		?int $height = null,
		?bool $word_count = null,
		?string $default_view = null,
		?string $label = null,
		?string $description = null,
		?bool $required = null,
		mixed $default = self::UNSET,
		?bool $disabled = null,
		?string $tab = null,
		?string $class_name = null,
		?array $conditions = null,
		?array $attributes = null,
		?bool $unfiltered = null,
		?array $render_options = null,
		?string $generator = null,
	): array {
		return $this->build_field(
			'richtext',
			array(
				'toolbar'     => $toolbar,
				'height'      => $height,
				'wordCount'   => $word_count,
				'defaultView' => $default_view,
			),
			$this->extract_common( get_defined_vars(), array( 'toolbar', 'height', 'word_count', 'default_view' ) ),
		);
	}
```

- [ ] **Step 2: Run PHP code standards**

Run: `composer run phpcs -- src/FieldFactory.php`
Expected: no new errors.

- [ ] **Step 3: Do NOT commit.**

---

## Task 4: Config module (button IDs, presets, special chars)

**Files:**
- Create: `assets/fields/RichText/config.js`

- [ ] **Step 1: Create the config module**

Create `assets/fields/RichText/config.js` with:

```js
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';

export const VIEW_VISUAL = 'visual';
export const VIEW_CODE = 'code';

export const BLOCK_IDS = [
  'block:paragraph',
  'block:h1', 'block:h2', 'block:h3', 'block:h4', 'block:h5', 'block:h6',
  'block:pre', 'block:code-block',
  'block:blockquote',
];

export const SEPARATOR = '|';

const DEFAULT_PRESETS = {
  full: [
    'block:paragraph', 'block:h1', 'block:h2', 'block:h3', 'block:h4', 'block:h5', 'block:h6',
    'block:pre', 'block:code-block',
    '|',
    'format:bold', 'format:italic', 'format:strikethrough',
    '|',
    'list:ul', 'list:ol', 'block:blockquote',
    '|',
    'align:left', 'align:center', 'align:right', 'align:justify',
    '|',
    'insert:link', 'insert:hr',
    '|',
    'indent:decrease', 'indent:increase',
    '|',
    'action:paste-as-text', 'action:clear-formatting', 'insert:special-char',
    '|',
    'history:undo', 'history:redo',
    '|',
    'view:toggle-code',
  ],
  basic: [
    'block:paragraph', 'block:h2', 'block:h3',
    '|',
    'format:bold', 'format:italic',
    '|',
    'list:ul', 'list:ol',
    '|',
    'insert:link',
    '|',
    'history:undo', 'history:redo',
  ],
  minimal: [
    'format:bold', 'format:italic',
    '|',
    'insert:link',
  ],
};

export function getPresets() {
  return applyFilters('wpifycf_richtext_toolbar_presets', { ...DEFAULT_PRESETS });
}

export function resolveToolbar(toolbar) {
  const presets = getPresets();
  if (Array.isArray(toolbar)) return toolbar;
  if (typeof toolbar === 'string' && presets[toolbar]) return presets[toolbar];
  return presets.full;
}

const DEFAULT_SPECIAL_CHARS = [
  // Marks
  { char: '©', label: __('Copyright', 'wpify-custom-fields') },
  { char: '®', label: __('Registered', 'wpify-custom-fields') },
  { char: '™', label: __('Trademark', 'wpify-custom-fields') },
  { char: '§', label: __('Section', 'wpify-custom-fields') },
  { char: '¶', label: __('Pilcrow', 'wpify-custom-fields') },
  { char: '•', label: __('Bullet', 'wpify-custom-fields') },
  { char: '·', label: __('Middle dot', 'wpify-custom-fields') },
  { char: '…', label: __('Ellipsis', 'wpify-custom-fields') },
  // Punctuation
  { char: '–', label: __('En dash', 'wpify-custom-fields') },
  { char: '—', label: __('Em dash', 'wpify-custom-fields') },
  { char: '“', label: __('Left double quote', 'wpify-custom-fields') },
  { char: '”', label: __('Right double quote', 'wpify-custom-fields') },
  { char: '‘', label: __('Left single quote', 'wpify-custom-fields') },
  { char: '’', label: __('Right single quote', 'wpify-custom-fields') },
  { char: '«', label: __('Left guillemet', 'wpify-custom-fields') },
  { char: '»', label: __('Right guillemet', 'wpify-custom-fields') },
  { char: '‹', label: __('Left single guillemet', 'wpify-custom-fields') },
  { char: '›', label: __('Right single guillemet', 'wpify-custom-fields') },
  { char: '„', label: __('Double low quote', 'wpify-custom-fields') },
  { char: '‚', label: __('Single low quote', 'wpify-custom-fields') },
  // Arrows
  { char: '←', label: __('Left arrow', 'wpify-custom-fields') },
  { char: '→', label: __('Right arrow', 'wpify-custom-fields') },
  { char: '↑', label: __('Up arrow', 'wpify-custom-fields') },
  { char: '↓', label: __('Down arrow', 'wpify-custom-fields') },
  { char: '↔', label: __('Left-right arrow', 'wpify-custom-fields') },
  { char: '⇐', label: __('Double left arrow', 'wpify-custom-fields') },
  { char: '⇒', label: __('Double right arrow', 'wpify-custom-fields') },
  // Math
  { char: '×', label: __('Multiplication', 'wpify-custom-fields') },
  { char: '÷', label: __('Division', 'wpify-custom-fields') },
  { char: '±', label: __('Plus-minus', 'wpify-custom-fields') },
  { char: '≈', label: __('Approximately', 'wpify-custom-fields') },
  { char: '≠', label: __('Not equal', 'wpify-custom-fields') },
  { char: '≤', label: __('Less than or equal', 'wpify-custom-fields') },
  { char: '≥', label: __('Greater than or equal', 'wpify-custom-fields') },
  { char: '∞', label: __('Infinity', 'wpify-custom-fields') },
  // Currencies
  { char: '€', label: __('Euro', 'wpify-custom-fields') },
  { char: '£', label: __('Pound', 'wpify-custom-fields') },
  { char: '¥', label: __('Yen', 'wpify-custom-fields') },
  { char: '¢', label: __('Cent', 'wpify-custom-fields') },
  { char: '₹', label: __('Rupee', 'wpify-custom-fields') },
  { char: '₽', label: __('Ruble', 'wpify-custom-fields') },
];

export function getSpecialChars() {
  return applyFilters('wpifycf_richtext_special_chars', DEFAULT_SPECIAL_CHARS.slice());
}

export const HEADING_LABELS = {
  paragraph: __('Paragraph', 'wpify-custom-fields'),
  h1: __('Heading 1', 'wpify-custom-fields'),
  h2: __('Heading 2', 'wpify-custom-fields'),
  h3: __('Heading 3', 'wpify-custom-fields'),
  h4: __('Heading 4', 'wpify-custom-fields'),
  h5: __('Heading 5', 'wpify-custom-fields'),
  h6: __('Heading 6', 'wpify-custom-fields'),
  pre: __('Preformatted', 'wpify-custom-fields'),
  'code-block': __('Code block', 'wpify-custom-fields'),
  blockquote: __('Blockquote', 'wpify-custom-fields'),
};
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 5: Custom nodes (alignment import patch)

**Files:**
- Create: `assets/fields/RichText/nodes.js`

- [ ] **Step 1: Create node overrides**

Create `assets/fields/RichText/nodes.js`:

```js
import { ParagraphNode } from 'lexical';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';

function readAlignFromElement(el) {
  const style = (el.style?.textAlign || '').toLowerCase();
  if (['left', 'center', 'right', 'justify'].includes(style)) return style;
  const attr = (el.getAttribute?.('align') || '').toLowerCase();
  if (['left', 'center', 'right', 'justify'].includes(attr)) return attr;
  return null;
}

class RichTextParagraphNode extends ParagraphNode {
  static getType() { return 'paragraph'; }
  static clone(node) { return new RichTextParagraphNode(node.__key); }
  static importDOM() {
    return {
      p: () => ({
        conversion: (el) => {
          const node = new RichTextParagraphNode();
          const align = readAlignFromElement(el);
          if (align) node.setFormat(align);
          return { node };
        },
        priority: 1,
      }),
    };
  }
  static importJSON(json) { return RichTextParagraphNode.clone(ParagraphNode.importJSON(json)); }
}

class RichTextHeadingNode extends HeadingNode {
  static getType() { return 'heading'; }
  static clone(node) { return new RichTextHeadingNode(node.__tag, node.__key); }
  static importDOM() {
    const base = HeadingNode.importDOM();
    const wrap = (tag) => () => ({
      conversion: (el) => {
        const node = new RichTextHeadingNode(tag);
        const align = readAlignFromElement(el);
        if (align) node.setFormat(align);
        return { node };
      },
      priority: 1,
    });
    return {
      ...base,
      h1: wrap('h1'), h2: wrap('h2'), h3: wrap('h3'),
      h4: wrap('h4'), h5: wrap('h5'), h6: wrap('h6'),
    };
  }
  static importJSON(json) {
    const n = HeadingNode.importJSON(json);
    return new RichTextHeadingNode(n.getTag());
  }
}

export const RICHTEXT_NODES = [
  RichTextParagraphNode,
  { replace: ParagraphNode, with: () => new RichTextParagraphNode() },
  RichTextHeadingNode,
  { replace: HeadingNode, with: (n) => new RichTextHeadingNode(n.getTag()) },
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  CodeNode,
  CodeHighlightNode,
  HorizontalRuleNode,
];
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 6: HtmlSyncPlugin

**Files:**
- Create: `assets/fields/RichText/plugins/HtmlSyncPlugin.js`

- [ ] **Step 1: Create the plugin**

Create `assets/fields/RichText/plugins/HtmlSyncPlugin.js`:

```js
import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes } from 'lexical';

function htmlToNodes(editor, html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html || '', 'text/html');
  return $generateNodesFromDOM(editor, doc);
}

function isEmptyExport(html) {
  const trimmed = (html || '').trim();
  return trimmed === '' || trimmed === '<p><br></p>' || trimmed === '<p></p>';
}

export function serializeEditorToHtml(editor) {
  let html = '';
  editor.read(() => {
    html = $generateHtmlFromNodes(editor, null);
  });
  return isEmptyExport(html) ? '' : html;
}

export function loadHtmlIntoEditor(editor, html) {
  editor.update(() => {
    const root = $getRoot();
    root.clear();
    if (!html) return;
    const nodes = htmlToNodes(editor, html);
    root.select();
    $insertNodes(nodes);
  });
}

export function HtmlSyncPlugin({ value, onChange, onError, paused = false }) {
  const [editor] = useLexicalComposerContext();
  const lastEmittedRef = useRef(null);

  useEffect(() => {
    if (paused) return;
    if (lastEmittedRef.current === (value || '')) return;
    try {
      loadHtmlIntoEditor(editor, value || '');
      lastEmittedRef.current = value || '';
    } catch (err) {
      onError?.(err);
    }
  }, [editor, value, onError, paused]);

  useEffect(() => {
    if (paused) return undefined;
    return editor.registerUpdateListener(({ dirtyElements, dirtyLeaves }) => {
      if (!dirtyElements.size && !dirtyLeaves.size) return;
      const html = serializeEditorToHtml(editor);
      if (html === lastEmittedRef.current) return;
      lastEmittedRef.current = html;
      onChange?.(html);
    });
  }, [editor, onChange, paused]);

  return null;
}

export default HtmlSyncPlugin;
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 7: Paste-as-text plugin

**Files:**
- Create: `assets/fields/RichText/plugins/PasteAsTextPlugin.js`

- [ ] **Step 1: Create the plugin**

Create `assets/fields/RichText/plugins/PasteAsTextPlugin.js`:

```js
import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { PASTE_COMMAND, COMMAND_PRIORITY_HIGH, $getSelection, $isRangeSelection } from 'lexical';

export function PasteAsTextPlugin({ armedRef, onFired }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        if (!armedRef.current) return false;
        const text = event.clipboardData?.getData('text/plain') ?? '';
        event.preventDefault();
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertText(text);
          }
        });
        armedRef.current = false;
        onFired?.();
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor, armedRef, onFired]);
  return null;
}

export default PasteAsTextPlugin;
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 8: Word count plugin

**Files:**
- Create: `assets/fields/RichText/plugins/WordCountPlugin.js`

- [ ] **Step 1: Create the plugin**

Create `assets/fields/RichText/plugins/WordCountPlugin.js`:

```js
import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';

export function countWords(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/u).filter(Boolean).length;
}

export function countCharacters(text, includeSpaces = false) {
  const source = text || '';
  if (includeSpaces) return [...source].length;
  return [...source.replace(/\s+/gu, '')].length;
}

export function WordCountPlugin({ onChange }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    let timeout = null;
    const emit = () => {
      editor.read(() => {
        const text = $getRoot().getTextContent();
        onChange?.({
          words: countWords(text),
          characters: countCharacters(text, false),
          charactersWithSpaces: countCharacters(text, true),
        });
      });
    };
    // Initial
    emit();
    const unregister = editor.registerUpdateListener(() => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(emit, 150);
    });
    return () => {
      if (timeout) clearTimeout(timeout);
      unregister();
    };
  }, [editor, onChange]);
  return null;
}

export default WordCountPlugin;
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 9: Floating anchor helper

**Files:**
- Create: `assets/fields/RichText/useFloatingAnchor.js`

- [ ] **Step 1: Create the helper**

Create `assets/fields/RichText/useFloatingAnchor.js`:

```js
import { useEffect, useState } from 'react';

export function useFloatingAnchor(getRect, deps) {
  const [pos, setPos] = useState(null);
  useEffect(() => {
    if (!deps?.open) { setPos(null); return; }
    const update = () => {
      const rect = getRect();
      if (!rect) { setPos(null); return; }
      setPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps?.open, deps?.anchorKey]);
  return pos;
}

export default useFloatingAnchor;
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 10: Link popover plugin

**Files:**
- Create: `assets/fields/RichText/plugins/LinkPopoverPlugin.js`

- [ ] **Step 1: Create the plugin**

Create `assets/fields/RichText/plugins/LinkPopoverPlugin.js`:

```js
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_LOW } from 'lexical';
import { TOGGLE_LINK_COMMAND, LinkNode } from '@lexical/link';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import useFloatingAnchor from '../useFloatingAnchor';

export function LinkPopoverPlugin({ requestOpen }) {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [newTab, setNewTab] = useState(false);
  const [anchorKey, setAnchorKey] = useState(0);
  const selectionRectRef = useRef(null);

  const close = useCallback(() => {
    setOpen(false);
    setUrl('');
    setNewTab(false);
  }, []);

  const readCurrentLink = useCallback(() => {
    let link = null;
    editor.read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      const node = selection.anchor.getNode();
      const linkNode = $getNearestNodeOfType(node, LinkNode);
      if (linkNode) {
        link = {
          url: linkNode.getURL() || '',
          newTab: linkNode.getTarget() === '_blank',
        };
      }
    });
    return link;
  }, [editor]);

  const captureSelectionRect = useCallback(() => {
    const domSelection = window.getSelection();
    if (domSelection && domSelection.rangeCount > 0) {
      selectionRectRef.current = domSelection.getRangeAt(0).getBoundingClientRect();
      setAnchorKey((n) => n + 1);
    }
  }, []);

  const openPopover = useCallback(() => {
    const current = readCurrentLink();
    setUrl(current?.url ?? '');
    setNewTab(current?.newTab ?? false);
    captureSelectionRect();
    setOpen(true);
  }, [readCurrentLink, captureSelectionRect]);

  useEffect(() => {
    if (!requestOpen) return;
    const fn = () => openPopover();
    requestOpen.current = fn;
    return () => { if (requestOpen.current === fn) requestOpen.current = null; };
  }, [requestOpen, openPopover]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
        editor.read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;
          const node = selection.anchor.getNode();
          const linkNode = $getNearestNodeOfType(node, LinkNode);
          if (linkNode) {
            setUrl(linkNode.getURL() || '');
            setNewTab(linkNode.getTarget() === '_blank');
            captureSelectionRect();
            setOpen(true);
          }
        });
        return false;
      }, COMMAND_PRIORITY_LOW),
    );
  }, [editor, captureSelectionRect]);

  const pos = useFloatingAnchor(
    () => selectionRectRef.current,
    { open, anchorKey },
  );

  const save = useCallback(() => {
    if (!url) { close(); return; }
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
      url,
      target: newTab ? '_blank' : null,
      rel: newTab ? 'noopener noreferrer' : null,
    });
    close();
  }, [editor, url, newTab, close]);

  const remove = useCallback(() => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    close();
  }, [editor, close]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    const onClickOutside = (e) => {
      if (!e.target.closest('.wpifycf-field-richtext__popover')) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [open, close]);

  if (!open || !pos) return null;

  return createPortal(
    <div
      className="wpifycf-field-richtext__popover wpifycf-field-richtext__popover--link"
      style={{ position: 'absolute', top: pos.top, left: pos.left }}
    >
      <label className="wpifycf-field-richtext__popover-field">
        <span>{__('URL', 'wpify-custom-fields')}</span>
        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} autoFocus />
      </label>
      <label className="wpifycf-field-richtext__popover-checkbox">
        <input type="checkbox" checked={newTab} onChange={(e) => setNewTab(e.target.checked)} />
        <span>{__('Open in new tab', 'wpify-custom-fields')}</span>
      </label>
      <div className="wpifycf-field-richtext__popover-actions">
        <Button variant="primary" onClick={save}>{__('Save', 'wpify-custom-fields')}</Button>
        <Button variant="tertiary" onClick={remove}>{__('Remove', 'wpify-custom-fields')}</Button>
        <Button variant="tertiary" onClick={close}>{__('Cancel', 'wpify-custom-fields')}</Button>
      </div>
    </div>,
    document.body,
  );
}

export default LinkPopoverPlugin;
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 11: Active-format subscription hook

**Files:**
- Create: `assets/fields/RichText/useActiveFormat.js`

- [ ] **Step 1: Create the hook**

Create `assets/fields/RichText/useActiveFormat.js`:

```js
import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
} from 'lexical';
import { $isHeadingNode, $isQuoteNode } from '@lexical/rich-text';
import { $isListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import { $isCodeNode } from '@lexical/code';

export function useActiveFormat() {
  const [editor] = useLexicalComposerContext();
  const [state, setState] = useState({
    bold: false, italic: false, strikethrough: false,
    blockType: 'paragraph',
    listType: null,            // 'ul' | 'ol' | null
    alignment: 'left',
    isLink: false,
    canUndo: false,
    canRedo: false,
  });

  useEffect(() => {
    const update = () => {
      editor.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        const anchorNode = selection.anchor.getNode();
        const element = anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
        let blockType = 'paragraph';
        let listType = null;
        if ($isHeadingNode(element)) blockType = element.getTag();
        else if ($isQuoteNode(element)) blockType = 'blockquote';
        else if ($isCodeNode(element)) blockType = 'code-block';
        else if (element.getType?.() === 'paragraph' && element.getTag?.() === 'pre') blockType = 'pre';
        if ($isListNode(element)) {
          listType = element.getListType() === 'number' ? 'ol' : 'ul';
        } else {
          // Walk up ancestors to find a containing ListNode (when anchor is inside a list item).
          let cursor = anchorNode;
          while (cursor && !cursor.isRoot?.()) {
            if ($isListNode(cursor)) {
              listType = cursor.getListType() === 'number' ? 'ol' : 'ul';
              break;
            }
            cursor = cursor.getParent?.();
          }
        }
        const format = element.getFormatType?.() || 'left';
        const linkNode = $getNearestNodeOfType(anchorNode, LinkNode);
        setState((prev) => ({
          ...prev,
          bold: selection.hasFormat('bold'),
          italic: selection.hasFormat('italic'),
          strikethrough: selection.hasFormat('strikethrough'),
          blockType,
          listType,
          alignment: format || 'left',
          isLink: !!linkNode,
        }));
      });
    };
    update();
    return mergeRegister(
      editor.registerCommand(SELECTION_CHANGE_COMMAND, () => { update(); return false; }, COMMAND_PRIORITY_LOW),
      editor.registerUpdateListener(() => update()),
      editor.registerCommand(CAN_UNDO_COMMAND, (payload) => { setState((p) => ({ ...p, canUndo: payload })); return false; }, COMMAND_PRIORITY_LOW),
      editor.registerCommand(CAN_REDO_COMMAND, (payload) => { setState((p) => ({ ...p, canRedo: payload })); return false; }, COMMAND_PRIORITY_LOW),
    );
  }, [editor]);

  return state;
}

export default useActiveFormat;
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 12: Button — History (undo/redo)

**Files:**
- Create: `assets/fields/RichText/buttons/History.js`

- [ ] **Step 1: Create the component**

Create `assets/fields/RichText/buttons/History.js`:

```js
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { undo as undoIcon, redo as redoIcon } from '@wordpress/icons';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { UNDO_COMMAND, REDO_COMMAND } from 'lexical';

export function UndoButton({ active, disabled, canUndo }) {
  const [editor] = useLexicalComposerContext();
  return (
    <Button
      className="wpifycf-field-richtext__button"
      icon={undoIcon}
      label={__('Undo', 'wpify-custom-fields')}
      disabled={disabled || !canUndo}
      onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
    />
  );
}

export function RedoButton({ active, disabled, canRedo }) {
  const [editor] = useLexicalComposerContext();
  return (
    <Button
      className="wpifycf-field-richtext__button"
      icon={redoIcon}
      label={__('Redo', 'wpify-custom-fields')}
      disabled={disabled || !canRedo}
      onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
    />
  );
}
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 13: Button — Inline format (bold/italic/strikethrough)

**Files:**
- Create: `assets/fields/RichText/buttons/InlineFormat.js`

- [ ] **Step 1: Create the component**

Create `assets/fields/RichText/buttons/InlineFormat.js`:

```js
import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { formatBold, formatItalic, formatStrikethrough } from '@wordpress/icons';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_TEXT_COMMAND } from 'lexical';

const MAP = {
  bold:          { icon: formatBold,          label: __('Bold', 'wpify-custom-fields'),          format: 'bold' },
  italic:        { icon: formatItalic,        label: __('Italic', 'wpify-custom-fields'),        format: 'italic' },
  strikethrough: { icon: formatStrikethrough, label: __('Strikethrough', 'wpify-custom-fields'), format: 'strikethrough' },
};

export function InlineFormatButton({ kind, active, disabled }) {
  const [editor] = useLexicalComposerContext();
  const spec = MAP[kind];
  if (!spec) return null;
  return (
    <Button
      className={clsx('wpifycf-field-richtext__button', active && 'wpifycf-field-richtext__button--active')}
      icon={spec.icon}
      label={spec.label}
      disabled={disabled}
      onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, spec.format)}
    />
  );
}
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 14: Button — Lists

**Files:**
- Create: `assets/fields/RichText/buttons/Lists.js`

- [ ] **Step 1: Create the component**

Create `assets/fields/RichText/buttons/Lists.js`:

```js
import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { formatListBullets, formatListNumbered } from '@wordpress/icons';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';

export function ListButton({ kind, active, disabled }) {
  const [editor] = useLexicalComposerContext();
  const isUl = kind === 'ul';
  const onClick = () => {
    if (active) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(
        isUl ? INSERT_UNORDERED_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND,
        undefined,
      );
    }
  };
  return (
    <Button
      className={clsx('wpifycf-field-richtext__button', active && 'wpifycf-field-richtext__button--active')}
      icon={isUl ? formatListBullets : formatListNumbered}
      label={isUl ? __('Bullet list', 'wpify-custom-fields') : __('Numbered list', 'wpify-custom-fields')}
      disabled={disabled}
      onClick={onClick}
    />
  );
}
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 15: Button — Blockquote

**Files:**
- Create: `assets/fields/RichText/buttons/Blockquote.js`

- [ ] **Step 1: Create the component**

Create `assets/fields/RichText/buttons/Blockquote.js`:

```js
import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { quote as quoteIcon } from '@wordpress/icons';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, $createParagraphNode } from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createQuoteNode } from '@lexical/rich-text';

export function BlockquoteButton({ active, disabled }) {
  const [editor] = useLexicalComposerContext();
  const onClick = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $setBlocksType(selection, () => (active ? $createParagraphNode() : $createQuoteNode()));
    });
  };
  return (
    <Button
      className={clsx('wpifycf-field-richtext__button', active && 'wpifycf-field-richtext__button--active')}
      icon={quoteIcon}
      label={__('Blockquote', 'wpify-custom-fields')}
      disabled={disabled}
      onClick={onClick}
    />
  );
}
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 16: Button — Alignment

**Files:**
- Create: `assets/fields/RichText/buttons/Alignment.js`

- [ ] **Step 1: Create the component**

Create `assets/fields/RichText/buttons/Alignment.js`:

```js
import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { alignLeft, alignCenter, alignRight, alignJustify } from '@wordpress/icons';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_ELEMENT_COMMAND } from 'lexical';

const MAP = {
  left:    { icon: alignLeft,    label: __('Align left', 'wpify-custom-fields') },
  center:  { icon: alignCenter,  label: __('Align center', 'wpify-custom-fields') },
  right:   { icon: alignRight,   label: __('Align right', 'wpify-custom-fields') },
  justify: { icon: alignJustify, label: __('Justify', 'wpify-custom-fields') },
};

export function AlignButton({ direction, active, disabled }) {
  const [editor] = useLexicalComposerContext();
  const spec = MAP[direction];
  if (!spec) return null;
  return (
    <Button
      className={clsx('wpifycf-field-richtext__button', active && 'wpifycf-field-richtext__button--active')}
      icon={spec.icon}
      label={spec.label}
      disabled={disabled}
      onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, direction)}
    />
  );
}
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 17: Button — Indent

**Files:**
- Create: `assets/fields/RichText/buttons/Indent.js`

- [ ] **Step 1: Create the component**

Create `assets/fields/RichText/buttons/Indent.js`:

```js
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { formatIndent, formatOutdent } from '@wordpress/icons';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INDENT_CONTENT_COMMAND, OUTDENT_CONTENT_COMMAND } from 'lexical';

export function IndentButton({ direction, disabled }) {
  const [editor] = useLexicalComposerContext();
  const isIncrease = direction === 'increase';
  return (
    <Button
      className="wpifycf-field-richtext__button"
      icon={isIncrease ? formatIndent : formatOutdent}
      label={isIncrease ? __('Increase indent', 'wpify-custom-fields') : __('Decrease indent', 'wpify-custom-fields')}
      disabled={disabled}
      onClick={() => editor.dispatchCommand(isIncrease ? INDENT_CONTENT_COMMAND : OUTDENT_CONTENT_COMMAND, undefined)}
    />
  );
}
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 18: Button — Horizontal rule

**Files:**
- Create: `assets/fields/RichText/buttons/HorizontalRule.js`

- [ ] **Step 1: Create the component**

Create `assets/fields/RichText/buttons/HorizontalRule.js`:

```js
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { separator as separatorIcon } from '@wordpress/icons';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';

export function HorizontalRuleButton({ disabled }) {
  const [editor] = useLexicalComposerContext();
  return (
    <Button
      className="wpifycf-field-richtext__button"
      icon={separatorIcon}
      label={__('Horizontal rule', 'wpify-custom-fields')}
      disabled={disabled}
      onClick={() => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)}
    />
  );
}
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 19: Button — Block format dropdown

**Files:**
- Create: `assets/fields/RichText/buttons/BlockFormat.js`

- [ ] **Step 1: Create the component**

Create `assets/fields/RichText/buttons/BlockFormat.js`:

```js
import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, $createParagraphNode } from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $createCodeNode } from '@lexical/code';
import { HEADING_LABELS } from '../config';
import useFloatingAnchor from '../useFloatingAnchor';

function makeNode(kind) {
  switch (kind) {
    case 'paragraph': return $createParagraphNode();
    case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
      return $createHeadingNode(kind);
    case 'pre': {
      const p = $createParagraphNode();
      // Render <pre> via paragraph with tag — Lexical's default paragraph has no tag; use code node as pre fallback:
      return $createCodeNode();
    }
    case 'code-block': return $createCodeNode();
    case 'blockquote': return $createQuoteNode();
    default: return $createParagraphNode();
  }
}

export function BlockFormatDropdown({ enabledIds, blockType, disabled }) {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const pos = useFloatingAnchor(
    () => anchorRef.current?.getBoundingClientRect() ?? null,
    { open, anchorKey: open ? 1 : 0 },
  );

  const items = enabledIds
    .map((id) => id.replace(/^block:/, ''))
    .filter((k) => HEADING_LABELS[k]);

  if (!items.length) return null;

  const currentLabel = HEADING_LABELS[blockType] || HEADING_LABELS.paragraph;

  const apply = (kind) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $setBlocksType(selection, () => makeNode(kind));
    });
    setOpen(false);
  };

  return (
    <>
      <Button
        ref={anchorRef}
        className="wpifycf-field-richtext__dropdown-trigger"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{currentLabel}</span>
        <span aria-hidden="true">▾</span>
      </Button>
      {open && pos && createPortal(
        <ul
          className="wpifycf-field-richtext__dropdown-menu"
          style={{ position: 'absolute', top: pos.top, left: pos.left }}
          onMouseLeave={() => setOpen(false)}
        >
          {items.map((k) => (
            <li key={k}>
              <button
                type="button"
                className="wpifycf-field-richtext__dropdown-item"
                onClick={() => apply(k)}
              >
                {HEADING_LABELS[k]}
              </button>
            </li>
          ))}
        </ul>,
        document.body,
      )}
    </>
  );
}
```

> Note: Lexical's default paragraph does not support a `pre` tag; `block:pre` maps to the same `CodeNode` as `block:code-block`. The spec lists both IDs for forward-compatibility, and the UI labels them distinctly. This is acceptable for v1; a future iteration may introduce a dedicated preformatted node.

- [ ] **Step 2: Do NOT commit.**

---

## Task 20: Button — Link

**Files:**
- Create: `assets/fields/RichText/buttons/Link.js`

- [ ] **Step 1: Create the component**

Create `assets/fields/RichText/buttons/Link.js`:

```js
import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { link as linkIcon } from '@wordpress/icons';

export function LinkButton({ active, disabled, onRequestOpen }) {
  return (
    <Button
      className={clsx('wpifycf-field-richtext__button', active && 'wpifycf-field-richtext__button--active')}
      icon={linkIcon}
      label={__('Insert/edit link', 'wpify-custom-fields')}
      disabled={disabled}
      onClick={() => onRequestOpen?.()}
    />
  );
}
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 21: Button — Paste as text

**Files:**
- Create: `assets/fields/RichText/buttons/PasteAsText.js`

- [ ] **Step 1: Create the component**

Create `assets/fields/RichText/buttons/PasteAsText.js`:

```js
import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

const PasteIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M19 2h-4.18A3 3 0 0 0 12 0a3 3 0 0 0-2.82 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Zm-7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm7 18H5V4h2v2h10V4h2v16Z"/>
    <text x="7.5" y="17" fontSize="8" fontFamily="sans-serif" fontWeight="bold" fill="currentColor">T</text>
  </svg>
);

export function PasteAsTextButton({ armed, disabled, onToggle }) {
  return (
    <Button
      className={clsx('wpifycf-field-richtext__button', armed && 'wpifycf-field-richtext__button--armed')}
      label={__('Paste as plain text (one-shot)', 'wpify-custom-fields')}
      disabled={disabled}
      onClick={onToggle}
    >
      {PasteIcon}
    </Button>
  );
}
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 22: Button — Clear formatting

**Files:**
- Create: `assets/fields/RichText/buttons/ClearFormatting.js`

- [ ] **Step 1: Create the component**

Create `assets/fields/RichText/buttons/ClearFormatting.js`:

```js
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { reset as resetIcon } from '@wordpress/icons';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, $createParagraphNode } from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $isLinkNode } from '@lexical/link';
import { $isHeadingNode, $isQuoteNode } from '@lexical/rich-text';
import { $isListNode } from '@lexical/list';
import { $isCodeNode } from '@lexical/code';

export function ClearFormattingButton({ disabled }) {
  const [editor] = useLexicalComposerContext();
  const onClick = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      // Strip text formats
      const nodes = selection.getNodes();
      nodes.forEach((node) => {
        if (node.getType() === 'text') {
          node.setFormat(0);
        }
      });
      // Unwrap links in selection
      nodes.forEach((node) => {
        let cursor = node;
        while (cursor) {
          if ($isLinkNode(cursor)) {
            const children = cursor.getChildren();
            children.forEach((c) => cursor.insertBefore(c));
            cursor.remove();
            break;
          }
          cursor = cursor.getParent();
        }
      });
      // Reset alignment / indent on each block
      const selectionAfter = $getSelection();
      if ($isRangeSelection(selectionAfter)) {
        const anchorNode = selectionAfter.anchor.getNode();
        const block = anchorNode.getKey() === 'root' ? null : anchorNode.getTopLevelElementOrThrow();
        if (block && block.setFormat) block.setFormat('');
        if (block && block.setIndent) block.setIndent(0);
        // Convert non-paragraph blocks to paragraph
        if (block && ($isHeadingNode(block) || $isQuoteNode(block) || $isListNode(block) || $isCodeNode(block))) {
          $setBlocksType(selectionAfter, () => $createParagraphNode());
        }
      }
    });
  };
  return (
    <Button
      className="wpifycf-field-richtext__button"
      icon={resetIcon}
      label={__('Clear formatting', 'wpify-custom-fields')}
      disabled={disabled}
      onClick={onClick}
    />
  );
}
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 23: Button — Special character picker

**Files:**
- Create: `assets/fields/RichText/buttons/SpecialChar.js`

- [ ] **Step 1: Create the component**

Create `assets/fields/RichText/buttons/SpecialChar.js`:

```js
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { symbol as symbolIcon } from '@wordpress/icons';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection } from 'lexical';
import { getSpecialChars } from '../config';
import useFloatingAnchor from '../useFloatingAnchor';

export function SpecialCharButton({ disabled }) {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const chars = getSpecialChars();

  const pos = useFloatingAnchor(
    () => anchorRef.current?.getBoundingClientRect() ?? null,
    { open, anchorKey: open ? 1 : 0 },
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onClickOutside = (e) => {
      if (!e.target.closest('.wpifycf-field-richtext__popover--special-chars')
          && !e.target.closest('.wpifycf-field-richtext__special-chars-trigger')) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [open]);

  const insert = (c) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) selection.insertText(c);
    });
    setOpen(false);
  };

  return (
    <>
      <Button
        ref={anchorRef}
        className="wpifycf-field-richtext__button wpifycf-field-richtext__special-chars-trigger"
        icon={symbolIcon}
        label={__('Insert special character', 'wpify-custom-fields')}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      />
      {open && pos && createPortal(
        <div
          className="wpifycf-field-richtext__popover wpifycf-field-richtext__popover--special-chars"
          style={{ position: 'absolute', top: pos.top, left: pos.left }}
        >
          <div className="wpifycf-field-richtext__special-chars-grid">
            {chars.map(({ char, label }) => (
              <button
                key={char}
                type="button"
                className="wpifycf-field-richtext__special-chars-item"
                title={label}
                onClick={() => insert(char)}
              >
                {char}
              </button>
            ))}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 24: Button — View toggle

**Files:**
- Create: `assets/fields/RichText/buttons/ViewToggle.js`

- [ ] **Step 1: Create the component**

Create `assets/fields/RichText/buttons/ViewToggle.js`:

```js
import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { code as codeIcon, edit as editIcon } from '@wordpress/icons';
import { VIEW_VISUAL, VIEW_CODE } from '../config';

export function ViewToggleButton({ view, disabled, onToggle }) {
  const inCode = view === VIEW_CODE;
  return (
    <Button
      className={clsx('wpifycf-field-richtext__button', inCode && 'wpifycf-field-richtext__button--active')}
      icon={inCode ? editIcon : codeIcon}
      label={inCode ? __('Switch to visual', 'wpify-custom-fields') : __('Switch to code', 'wpify-custom-fields')}
      disabled={disabled}
      onClick={onToggle}
    />
  );
}
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 25: Toolbar renderer

**Files:**
- Create: `assets/fields/RichText/Toolbar.js`

- [ ] **Step 1: Create the component**

Create `assets/fields/RichText/Toolbar.js`:

```js
import { Fragment } from 'react';
import { applyFilters } from '@wordpress/hooks';
import { SEPARATOR, BLOCK_IDS, VIEW_CODE } from './config';
import useActiveFormat from './useActiveFormat';
import { UndoButton, RedoButton } from './buttons/History';
import { InlineFormatButton } from './buttons/InlineFormat';
import { ListButton } from './buttons/Lists';
import { BlockquoteButton } from './buttons/Blockquote';
import { AlignButton } from './buttons/Alignment';
import { IndentButton } from './buttons/Indent';
import { HorizontalRuleButton } from './buttons/HorizontalRule';
import { BlockFormatDropdown } from './buttons/BlockFormat';
import { LinkButton } from './buttons/Link';
import { PasteAsTextButton } from './buttons/PasteAsText';
import { ClearFormattingButton } from './buttons/ClearFormatting';
import { SpecialCharButton } from './buttons/SpecialChar';
import { ViewToggleButton } from './buttons/ViewToggle';

export function Toolbar({
  toolbar,
  view,
  armedPasteAsText,
  onTogglePasteAsText,
  onToggleView,
  onOpenLink,
  disabled,
}) {
  const active = useActiveFormat();
  const inCode = view === VIEW_CODE;
  const blockIdsInConfig = toolbar.filter((id) => id.startsWith('block:'));
  const firstBlockIndex = toolbar.findIndex((id) => id.startsWith('block:'));
  const dropdownRendered = { value: false };

  const customButtons = applyFilters('wpifycf_richtext_buttons', {});

  return (
    <div className="wpifycf-field-richtext__toolbar" role="toolbar">
      {toolbar.map((id, idx) => {
        // Separator
        if (id === SEPARATOR) {
          return <span key={`sep-${idx}`} className="wpifycf-field-richtext__toolbar-separator" aria-hidden="true" />;
        }
        // Block dropdown — render once, at first block:* position
        if (id.startsWith('block:')) {
          if (dropdownRendered.value || idx !== firstBlockIndex) return null;
          dropdownRendered.value = true;
          return (
            <BlockFormatDropdown
              key="block-dropdown"
              enabledIds={blockIdsInConfig}
              blockType={active.blockType}
              disabled={disabled || inCode}
            />
          );
        }
        // All non-view-toggle buttons are disabled in code view
        const btnDisabled = disabled || (inCode && id !== 'view:toggle-code');

        switch (id) {
          case 'format:bold':
          case 'format:italic':
          case 'format:strikethrough':
            return (
              <InlineFormatButton
                key={id}
                kind={id.split(':')[1]}
                active={active[id.split(':')[1]]}
                disabled={btnDisabled}
              />
            );
          case 'list:ul':
          case 'list:ol': {
            const kind = id.split(':')[1];
            return (
              <ListButton key={id} kind={kind} active={active.listType === kind} disabled={btnDisabled} />
            );
          }
          case 'align:left':
          case 'align:center':
          case 'align:right':
          case 'align:justify': {
            const direction = id.split(':')[1];
            return (
              <AlignButton
                key={id}
                direction={direction}
                active={active.alignment === direction}
                disabled={btnDisabled}
              />
            );
          }
          case 'indent:increase':
          case 'indent:decrease':
            return <IndentButton key={id} direction={id.split(':')[1]} disabled={btnDisabled} />;
          case 'insert:link':
            return <LinkButton key={id} active={active.isLink} disabled={btnDisabled} onRequestOpen={onOpenLink} />;
          case 'insert:hr':
            return <HorizontalRuleButton key={id} disabled={btnDisabled} />;
          case 'insert:special-char':
            return <SpecialCharButton key={id} disabled={btnDisabled} />;
          case 'action:paste-as-text':
            return (
              <PasteAsTextButton
                key={id}
                armed={armedPasteAsText}
                disabled={btnDisabled}
                onToggle={onTogglePasteAsText}
              />
            );
          case 'action:clear-formatting':
            return <ClearFormattingButton key={id} disabled={btnDisabled} />;
          case 'history:undo':
            return <UndoButton key={id} disabled={btnDisabled} canUndo={active.canUndo} />;
          case 'history:redo':
            return <RedoButton key={id} disabled={btnDisabled} canRedo={active.canRedo} />;
          case 'view:toggle-code':
            return <ViewToggleButton key={id} view={view} disabled={disabled} onToggle={onToggleView} />;
          default: {
            if (customButtons[id]) {
              const Btn = customButtons[id].render;
              if (Btn) return <Btn key={id} disabled={btnDisabled} />;
              // eslint-disable-next-line no-console
              if (process.env.NODE_ENV !== 'production') console.warn(`[richtext] custom button "${id}" has no render()`);
              return null;
            }
            // eslint-disable-next-line no-console
            if (process.env.NODE_ENV !== 'production') console.warn(`[richtext] unknown button id: ${id}`);
            return null;
          }
        }
      })}
    </div>
  );
}

export default Toolbar;
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 26: Inline notice component

**Files:**
- Create: `assets/fields/RichText/Notice.js`

- [ ] **Step 1: Create the component**

Create `assets/fields/RichText/Notice.js`:

```js
import { useState } from 'react';
import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { close as closeIcon } from '@wordpress/icons';

export function Notice({ variant = 'info', message, details, actionLabel, onAction, onDismiss }) {
  const [expanded, setExpanded] = useState(false);
  if (!message) return null;
  return (
    <div className={clsx('wpifycf-field-richtext__notice', `wpifycf-field-richtext__notice--${variant}`)}>
      <div className="wpifycf-field-richtext__notice-main">
        <span className="wpifycf-field-richtext__notice-message">{message}</span>
        {details && (
          <button
            type="button"
            className="wpifycf-field-richtext__notice-toggle"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? __('Hide changes', 'wpify-custom-fields') : __('View changes', 'wpify-custom-fields')}
          </button>
        )}
        {actionLabel && (
          <Button variant="tertiary" size="small" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        <Button
          className="wpifycf-field-richtext__notice-close"
          icon={closeIcon}
          label={__('Dismiss', 'wpify-custom-fields')}
          onClick={onDismiss}
        />
      </div>
      {expanded && details && (
        <div className="wpifycf-field-richtext__notice-details">
          <div>
            <strong>{__('Source', 'wpify-custom-fields')}</strong>
            <pre>{details.source}</pre>
          </div>
          <div>
            <strong>{__('Normalized', 'wpify-custom-fields')}</strong>
            <pre>{details.normalized}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notice;
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 27: Counter component

**Files:**
- Create: `assets/fields/RichText/Counter.js`

- [ ] **Step 1: Create the component**

Create `assets/fields/RichText/Counter.js`:

```js
import { useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';

export function Counter({ words, characters, charactersWithSpaces }) {
  const [withSpaces, setWithSpaces] = useState(false);
  const chars = withSpaces ? charactersWithSpaces : characters;
  const label = withSpaces
    ? __('Characters including whitespace — click to toggle', 'wpify-custom-fields')
    : __('Characters excluding whitespace — click to toggle', 'wpify-custom-fields');
  return (
    <button
      type="button"
      className="wpifycf-field-richtext__counter"
      title={label}
      onClick={() => setWithSpaces((v) => !v)}
    >
      {sprintf(
        /* translators: %1$d is the word count, %2$d is the character count. */
        __('%1$d words · %2$d characters', 'wpify-custom-fields'),
        words,
        chars,
      )}
    </button>
  );
}

export default Counter;
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 28: Code view (CodeMirror HTML)

**Files:**
- Create: `assets/fields/RichText/CodeView.js`

- [ ] **Step 1: Create the component**

Create `assets/fields/RichText/CodeView.js`:

```js
import { ErrorBoundary } from 'react-error-boundary';
import CodeMirror from '@uiw/react-codemirror';
import { html as htmlLang } from '@codemirror/lang-html';
import { EditorView } from '@codemirror/view';

export function CodeView({ value, onChange, height = 300, disabled = false }) {
  return (
    <ErrorBoundary
      fallback={(
        <textarea
          className="wpifycf-field-richtext__code-fallback"
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          style={{ width: '100%', height: height + 'px' }}
          disabled={disabled}
        />
      )}
    >
      <CodeMirror
        className="wpifycf-field-richtext__code-view"
        value={value || ''}
        onChange={onChange}
        height={height + 'px'}
        extensions={[EditorView.lineWrapping, htmlLang()]}
        editable={!disabled}
      />
    </ErrorBoundary>
  );
}

export default CodeView;
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 29: Editor composer + plugins

**Files:**
- Create: `assets/fields/RichText/Editor.js`

- [ ] **Step 1: Create the component**

Create `assets/fields/RichText/Editor.js`:

```js
import { useMemo } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { RICHTEXT_NODES } from './nodes';

const theme = {
  paragraph: 'wpifycf-richtext-paragraph',
  heading: {
    h1: 'wpifycf-richtext-h1', h2: 'wpifycf-richtext-h2', h3: 'wpifycf-richtext-h3',
    h4: 'wpifycf-richtext-h4', h5: 'wpifycf-richtext-h5', h6: 'wpifycf-richtext-h6',
  },
  list: {
    ul: 'wpifycf-richtext-ul',
    ol: 'wpifycf-richtext-ol',
    listitem: 'wpifycf-richtext-li',
  },
  quote: 'wpifycf-richtext-blockquote',
  link: 'wpifycf-richtext-link',
  text: {
    bold: 'wpifycf-richtext-bold',
    italic: 'wpifycf-richtext-italic',
    strikethrough: 'wpifycf-richtext-strikethrough',
    underline: 'wpifycf-richtext-underline',
  },
};

export function Editor({ children, height, disabled, onLexicalError }) {
  const initialConfig = useMemo(() => ({
    namespace: 'wpifycf-richtext',
    theme,
    nodes: RICHTEXT_NODES,
    editable: !disabled,
    onError: (err) => {
      // eslint-disable-next-line no-console
      console.error('[richtext] lexical error', err);
      onLexicalError?.(err);
    },
  }), [disabled, onLexicalError]);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="wpifycf-field-richtext__editor" style={{ minHeight: height }}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="wpifycf-field-richtext__content"
              style={{ minHeight: height }}
            />
          }
          placeholder={<div className="wpifycf-field-richtext__placeholder" />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <LinkPlugin />
        <ListPlugin />
        <TabIndentationPlugin />
        <HorizontalRulePlugin />
        {children}
      </div>
    </LexicalComposer>
  );
}

export default Editor;
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 30: Main RichText component

**Files:**
- Create: `assets/fields/RichText.js`

- [ ] **Step 1: Create the component**

Create `assets/fields/RichText.js`:

```js
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { RawHTML } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ErrorBoundary } from 'react-error-boundary';
import { AppContext } from '@/components/AppContext';
import { stripHtml } from '@/helpers/functions';
import { checkValidityStringType } from '@/helpers/validators';
import { Editor } from './RichText/Editor';
import { Toolbar } from './RichText/Toolbar';
import { CodeView } from './RichText/CodeView';
import { Counter } from './RichText/Counter';
import { Notice } from './RichText/Notice';
import { resolveToolbar, VIEW_VISUAL, VIEW_CODE } from './RichText/config';
import { HtmlSyncPlugin, serializeEditorToHtml, loadHtmlIntoEditor } from './RichText/plugins/HtmlSyncPlugin';
import { PasteAsTextPlugin } from './RichText/plugins/PasteAsTextPlugin';
import { WordCountPlugin, countWords, countCharacters } from './RichText/plugins/WordCountPlugin';
import { LinkPopoverPlugin } from './RichText/plugins/LinkPopoverPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

function EditorBridge({ value, onChange, armedRef, onPasteFired, onLexicalErrorRuntime, onCounts, onExposeEditor, onOpenLinkRef, paused }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => { onExposeEditor?.(editor); }, [editor, onExposeEditor]);
  return (
    <>
      <HtmlSyncPlugin value={value} onChange={onChange} onError={onLexicalErrorRuntime} paused={paused} />
      <PasteAsTextPlugin armedRef={armedRef} onFired={onPasteFired} />
      <WordCountPlugin onChange={onCounts} />
      <LinkPopoverPlugin requestOpen={onOpenLinkRef} />
    </>
  );
}

function EventIsolationWrapper({ children, className }) {
  const stop = useCallback((e) => e.stopPropagation(), []);
  const onMouseUp = useCallback((e) => { e.stopPropagation(); window.dispatchEvent(new MouseEvent('mouseup')); }, []);
  const onKeyDown = useCallback((e) => { if (e.key !== 'Tab' && e.key !== 'Escape') e.stopPropagation(); }, []);
  return (
    <div
      className={clsx('wpifycf-event-isolation-wrapper', className)}
      onMouseDown={stop}
      onMouseUp={onMouseUp}
      onClick={stop}
      onKeyDown={onKeyDown}
      onFocus={stop}
    >
      {children}
    </div>
  );
}

export function RichText({
  id,
  htmlId,
  value,
  onChange,
  height = 300,
  className,
  disabled = false,
  setTitle,
  toolbar = 'full',
  word_count: wordCountProp = true,
  default_view: defaultView = VIEW_VISUAL,
}) {
  const { context } = useContext(AppContext);
  const resolvedToolbar = resolveToolbar(toolbar);
  const hasViewToggle = resolvedToolbar.includes('view:toggle-code');
  const [view, setView] = useState(hasViewToggle && defaultView === VIEW_CODE ? VIEW_CODE : VIEW_VISUAL);
  const [notice, setNotice] = useState(null);
  const [counts, setCounts] = useState({ words: 0, characters: 0, charactersWithSpaces: 0 });
  const [armedPasteAsText, setArmedPasteAsText] = useState(false);
  const armedRef = useRef(false);
  const editorRef = useRef(null);
  const openLinkRef = useRef(null);
  // Code-view buffer: string that the user is typing in code view but has not yet synced to editor.
  const [codeBuffer, setCodeBuffer] = useState(value || '');

  // Reset code buffer when external value changes while in visual view.
  useEffect(() => {
    if (view === VIEW_VISUAL) setCodeBuffer(value || '');
  }, [value, view]);

  // Keep title updated.
  useEffect(() => {
    setTitle?.(stripHtml(value || '').replace(/\n/g, ' ').substring(0, 50));
  }, [setTitle, value]);

  // Keep armedRef in sync with state
  useEffect(() => { armedRef.current = armedPasteAsText; }, [armedPasteAsText]);

  const onPasteFired = useCallback(() => setArmedPasteAsText(false), []);
  const onTogglePasteAsText = useCallback(() => setArmedPasteAsText((v) => !v), []);

  const onOpenLink = useCallback(() => { openLinkRef.current?.(); }, []);

  const onToggleView = useCallback(() => {
    if (view === VIEW_VISUAL) {
      // Visual → Code: capture current html from editor
      const html = editorRef.current ? serializeEditorToHtml(editorRef.current) : (value || '');
      setCodeBuffer(html);
      setView(VIEW_CODE);
      setNotice(null);
    } else {
      // Code → Visual: parse codeBuffer, check normalization
      const source = codeBuffer;
      try {
        if (editorRef.current) {
          loadHtmlIntoEditor(editorRef.current, source);
          const normalized = serializeEditorToHtml(editorRef.current);
          const trimA = (source || '').trim();
          const trimB = (normalized || '').trim();
          if (trimA && trimA !== trimB) {
            setNotice({
              variant: 'info',
              message: __('Some HTML was normalized by the editor.', 'wpify-custom-fields'),
              details: { source, normalized },
            });
          } else {
            setNotice(null);
          }
          onChange?.(normalized);
        }
        setView(VIEW_VISUAL);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[richtext] code→visual parse failed', err);
        setNotice({
          variant: 'error',
          message: __('The editor could not parse the HTML.', 'wpify-custom-fields'),
        });
      }
    }
  }, [view, codeBuffer, value, onChange]);

  // Update counts while in code view based on stripped HTML text.
  useEffect(() => {
    if (view !== VIEW_CODE) return;
    const text = stripHtml(codeBuffer || '');
    setCounts({
      words: countWords(text),
      characters: countCharacters(text, false),
      charactersWithSpaces: countCharacters(text, true),
    });
  }, [view, codeBuffer]);

  // Sync code buffer edits back to hidden input via onChange.
  useEffect(() => {
    if (view !== VIEW_CODE) return;
    onChange?.(codeBuffer);
  }, [view, codeBuffer, onChange]);

  const onLexicalError = useCallback((err) => {
    setNotice({
      variant: 'error',
      message: __('The editor could not parse the HTML. You can edit it as raw HTML instead.', 'wpify-custom-fields'),
      actionLabel: hasViewToggle ? __('Switch to code view', 'wpify-custom-fields') : null,
      onAction: hasViewToggle ? () => setView(VIEW_CODE) : null,
    });
  }, [hasViewToggle]);

  // Disabled: render raw HTML preview
  if (disabled) {
    return (
      <div className={clsx('wpifycf-field-richtext', `wpifycf-field-richtext--${id}`, 'wpifycf-field-richtext--disabled', className)}>
        <RawHTML className="wpifycf-field-richtext__raw">{value || ''}</RawHTML>
      </div>
    );
  }

  const editorComponent = (
    <Editor height={height} disabled={disabled} onLexicalError={onLexicalError}>
      <EditorBridge
        value={value}
        onChange={onChange}
        paused={view !== VIEW_VISUAL}
        armedRef={armedRef}
        onPasteFired={onPasteFired}
        onLexicalErrorRuntime={onLexicalError}
        onCounts={view === VIEW_VISUAL ? setCounts : () => {}}
        onExposeEditor={(ed) => { editorRef.current = ed; }}
        onOpenLinkRef={openLinkRef}
      />
    </Editor>
  );

  const wrappedEditor = context === 'gutenberg'
    ? <EventIsolationWrapper>{editorComponent}</EventIsolationWrapper>
    : editorComponent;

  return (
    <ErrorBoundary
      fallback={(
        <textarea
          className="wpifycf-field-richtext__editor-fallback"
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          style={{ width: '100%', height: (height + 100) + 'px' }}
        />
      )}
    >
      <div
        className={clsx(
          'wpifycf-field-richtext',
          `wpifycf-field-richtext--${id}`,
          view === VIEW_CODE ? 'wpifycf-field-richtext--view-code' : 'wpifycf-field-richtext--view-visual',
          className,
        )}
      >
        <Toolbar
          toolbar={resolvedToolbar}
          view={view}
          armedPasteAsText={armedPasteAsText}
          onTogglePasteAsText={onTogglePasteAsText}
          onToggleView={onToggleView}
          onOpenLink={onOpenLink}
          disabled={disabled}
        />
        {notice && (
          <Notice
            variant={notice.variant}
            message={notice.message}
            details={notice.details}
            actionLabel={notice.actionLabel}
            onAction={notice.onAction}
            onDismiss={() => setNotice(null)}
          />
        )}
        <div className="wpifycf-field-richtext__body">
          {/* Keep visual editor always mounted (so editorRef stays valid for code↔visual transitions); just hide it */}
          <div style={{ display: view === VIEW_VISUAL ? 'block' : 'none' }}>
            {wrappedEditor}
          </div>
          {view === VIEW_CODE && (
            <CodeView
              value={codeBuffer}
              onChange={setCodeBuffer}
              height={height}
            />
          )}
        </div>
        {wordCountProp && (
          <div className="wpifycf-field-richtext__footer">
            <Counter
              words={counts.words}
              characters={counts.characters}
              charactersWithSpaces={counts.charactersWithSpaces}
            />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

RichText.checkValidity = checkValidityStringType;
RichText.VIEW_VISUAL = VIEW_VISUAL;
RichText.VIEW_CODE = VIEW_CODE;

export default RichText;
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 31: MultiRichText

**Files:**
- Create: `assets/fields/MultiRichText.js`

- [ ] **Step 1: Create the component**

Create `assets/fields/MultiRichText.js`:

```js
import { MultiField } from '@/components/MultiField';
import { checkValidityMultiFieldType } from '@/helpers/validators';

const MultiRichText = (props) => <MultiField {...props} type="richtext" />;

MultiRichText.checkValidity = checkValidityMultiFieldType('richtext');

export default MultiRichText;
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 32: Register fields in dispatcher

**Files:**
- Modify: `assets/fields/index.js`

- [ ] **Step 1: Add imports and registry entries**

In `assets/fields/index.js`, add the imports (alphabetical among existing imports):

```js
import RichText from './RichText';
import MultiRichText from './MultiRichText';
```

Then in the default export object, add (alphabetical among existing keys):

```js
  multi_richtext: MultiRichText,
  richtext: RichText,
```

The final structure should place `multi_richtext` alphabetically between `multi_post` and `multi_select`, and `richtext` alphabetically between `radio` and `range`.

- [ ] **Step 2: Run diagnostics on the dispatcher**

Run cclsp `get_diagnostics` on `assets/fields/index.js`.
Expected: no new errors.

- [ ] **Step 3: Do NOT commit.**

---

## Task 33: SCSS partial + registration

**Files:**
- Create: `assets/styles/components/_field-richtext.scss`
- Modify: `assets/styles/custom-fields.scss`

- [ ] **Step 1: Create the partial**

Create `assets/styles/components/_field-richtext.scss`:

```scss
.wpifycf-field-richtext {
  border: 1px solid var(--wpifycf-border-color, #ddd);
  border-radius: 4px;
  background: #fff;
  display: flex;
  flex-direction: column;

  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    padding: 6px;
    border-bottom: 1px solid var(--wpifycf-border-color, #ddd);
    background: #f6f7f7;
    align-items: center;
  }

  &__toolbar-separator {
    width: 1px;
    height: 22px;
    background: var(--wpifycf-border-color, #ddd);
    margin: 0 4px;
    align-self: center;
  }

  &__button {
    &--active {
      background: #e0e0e0 !important;
      box-shadow: inset 0 0 0 1px #8c8f94;
    }
    &--armed {
      background: #fff8c5 !important;
      box-shadow: inset 0 0 0 1px #eab308;
    }
  }

  &__dropdown-trigger {
    display: inline-flex !important;
    align-items: center;
    gap: 4px;
    min-width: 140px;
    justify-content: space-between;
    padding: 0 8px !important;
  }

  &__dropdown-menu {
    list-style: none;
    margin: 0;
    padding: 4px 0;
    min-width: 180px;
    background: #fff;
    border: 1px solid var(--wpifycf-border-color, #ddd);
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    z-index: 100000;
  }

  &__dropdown-item {
    display: block;
    width: 100%;
    text-align: left;
    padding: 6px 12px;
    border: 0;
    background: transparent;
    cursor: pointer;
    &:hover { background: #f0f0f1; }
  }

  &__editor {
    position: relative;
  }

  &__content {
    padding: 12px 16px;
    outline: none;
    min-height: inherit;

    p { margin: 0 0 1em; }
    h1, h2, h3, h4, h5, h6 { margin: 1em 0 0.5em; }
    blockquote {
      margin: 1em 0;
      padding-left: 1em;
      border-left: 3px solid #ddd;
      color: #555;
    }
    ul, ol { margin: 0 0 1em 1.5em; padding: 0; }
    li { margin: 0.25em 0; }
    pre {
      background: #f6f8fa;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    a { color: #2271b1; text-decoration: underline; }
    hr { border: 0; border-top: 1px solid #ddd; margin: 1em 0; }
  }

  &__body {
    min-height: 0;
  }

  &__code-view,
  &__code-fallback {
    border: 0;
    outline: none;
    width: 100%;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    padding: 6px 12px;
    border-top: 1px solid var(--wpifycf-border-color, #ddd);
    background: #f6f7f7;
    font-size: 12px;
    color: #555;
  }

  &__counter {
    background: transparent;
    border: 0;
    cursor: pointer;
    color: inherit;
    font: inherit;
  }

  &__notice {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--wpifycf-border-color, #ddd);
    background: #f0f6fc;
    color: #1d2327;
    font-size: 13px;

    &--error { background: #fcf0f1; color: #b32d2e; }

    &-main {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    &-message { flex: 1; }

    &-toggle {
      background: transparent;
      border: 0;
      cursor: pointer;
      text-decoration: underline;
      color: inherit;
      font: inherit;
      padding: 0;
    }

    &-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;

      pre {
        max-height: 180px;
        overflow: auto;
        padding: 8px;
        background: #fff;
        border: 1px solid var(--wpifycf-border-color, #ddd);
        border-radius: 4px;
        font-size: 11px;
      }
    }
  }

  &__popover {
    z-index: 100001;
    background: #fff;
    border: 1px solid var(--wpifycf-border-color, #ddd);
    border-radius: 4px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    padding: 10px 12px;
    min-width: 280px;
  }

  &__popover-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 8px;
    font-size: 12px;

    input[type='url'] {
      width: 100%;
      padding: 6px 8px;
    }
  }

  &__popover-checkbox {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    margin-bottom: 8px;
  }

  &__popover-actions {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
  }

  &__popover--special-chars {
    padding: 8px;
  }

  &__special-chars-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 2px;
    max-width: 320px;
  }

  &__special-chars-item {
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    font-size: 16px;
    padding: 6px 8px;
    border-radius: 3px;
    &:hover { background: #f0f0f1; border-color: #ddd; }
  }

  &--view-code {
    .wpifycf-field-richtext__footer { border-top-color: var(--wpifycf-border-color, #ddd); }
  }

  &--disabled {
    opacity: 0.7;
  }

  &__editor-fallback {
    padding: 12px;
    font-family: inherit;
    font-size: inherit;
  }
}
```

- [ ] **Step 2: Register the partial in the main SCSS entry**

In `assets/styles/custom-fields.scss` find:

```scss
@use "components/field-wysiwyg";
@use "components/field-code";
```

Add immediately after:

```scss
@use "components/field-richtext";
```

- [ ] **Step 3: Do NOT commit.**

---

## Task 34: Documentation — richtext.md

**Files:**
- Create: `docs/field-types/richtext.md`

- [ ] **Step 1: Create the doc**

Create `docs/field-types/richtext.md`:

```markdown
# Rich Text Field Type

The Rich Text field type provides a modern rich text editor powered by [Lexical](https://lexical.dev/) with a fully configurable toolbar, visual ↔ code view toggle, floating link editor, and word/character counter.

## Field Type: `richtext`

	array(
		'type'    => 'richtext',
		'id'      => 'example_richtext',
		'label'   => 'Content',
		'toolbar' => 'full',
	)

## Properties

For Default Field Properties, see [Field Types Definition](../field-types.md).

### Specific Properties

#### `toolbar` _(string|array)_ — Optional

Preset name or explicit array of button IDs. Accepts `'full'` (default), `'basic'`, `'minimal'`, or an array like `array( 'format:bold', 'format:italic', '|', 'insert:link' )`. Unknown button IDs are silently skipped.

Available button IDs:

- Blocks: `block:paragraph`, `block:h1`–`block:h6`, `block:pre`, `block:code-block`, `block:blockquote` (render as a single dropdown)
- Inline format: `format:bold`, `format:italic`, `format:strikethrough`
- Lists: `list:ul`, `list:ol`
- Alignment: `align:left`, `align:center`, `align:right`, `align:justify`
- Inserts: `insert:link`, `insert:hr`, `insert:special-char`
- Indent: `indent:increase`, `indent:decrease`
- Actions: `action:paste-as-text`, `action:clear-formatting`
- History: `history:undo`, `history:redo`
- View: `view:toggle-code`
- Separator: `'|'`

#### `height` _(integer)_ — Optional

The minimum height of the editor body in pixels. Defaults to `300`.

#### `word_count` _(boolean)_ — Optional

Show the word/character counter footer. Defaults to `true`.

#### `default_view` _(string)_ — Optional

Initial view — `'visual'` (default) or `'code'`. Ignored if the toolbar does not include `view:toggle-code`.

## Stored Value

The field stores the content as an HTML string sanitized with `wp_kses_post()` on save.

## Example Usage

### Basic Content Editor

	array(
		'type'        => 'richtext',
		'id'          => 'product_description',
		'label'       => 'Product Description',
		'description' => 'Add a detailed product description with formatting.',
		'height'      => 300,
	)

### Minimal Toolbar

	array(
		'type'    => 'richtext',
		'id'      => 'intro',
		'label'   => 'Intro',
		'toolbar' => 'minimal',
	)

### Explicit Toolbar

	array(
		'type'    => 'richtext',
		'id'      => 'body',
		'label'   => 'Body',
		'toolbar' => array(
			'block:paragraph', 'block:h2', 'block:h3',
			'|',
			'format:bold', 'format:italic',
			'|',
			'list:ul', 'insert:link',
			'|',
			'history:undo', 'history:redo',
			'|',
			'view:toggle-code',
		),
	)

### Using Values in Your Theme

	$body = get_post_meta( get_the_ID(), 'body', true );
	if ( ! empty( $body ) ) {
		echo '<div class="body">';
		echo wp_kses_post( apply_filters( 'the_content', $body ) );
		echo '</div>';
	}

## Field Factory

	$f = new \Wpify\CustomFields\FieldFactory();
	$f->richtext(
		label: 'Content',
		toolbar: 'full',
		height: 300,
	);

## Extensibility

### Register a custom toolbar button (JavaScript)

	import { addFilter } from '@wordpress/hooks';

	addFilter( 'wpifycf_richtext_buttons', 'my-plugin/buttons', ( buttons ) => ( {
		...buttons,
		'my:insert-sig': {
			render: ( { disabled } ) => (
				<button disabled={ disabled } onClick={ /* ... */ }>Sig</button>
			),
		},
	} ) );

Then include `'my:insert-sig'` in your `toolbar` array.

### Override presets

	addFilter( 'wpifycf_richtext_toolbar_presets', 'my-plugin/presets', ( presets ) => ( {
		...presets,
		brand_minimal: [ 'format:bold', 'insert:link' ],
	} ) );

### Curate the special-character set

	addFilter( 'wpifycf_richtext_special_chars', 'my-plugin/chars', ( chars ) => [
		...chars,
		{ char: '½', label: 'One half' },
	] );

## Notes

- The Rich Text field coexists with the [`wysiwyg`](wysiwyg.md) field; choose `richtext` for new fields and keep `wysiwyg` for existing TinyMCE-based fields.
- Content is stored as HTML and sanitized with `wp_kses_post()`.
- The Code view lets you edit the underlying HTML directly; switching back to Visual re-parses the HTML and may normalize it (a non-blocking notice explains any changes).
- The counter defaults to "characters excluding whitespace" — click the counter to toggle "including whitespace".
- For code editing with syntax highlighting of languages other than HTML, use the [`code`](code.md) field type instead.
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 35: Documentation — multi_richtext.md

**Files:**
- Create: `docs/field-types/multi_richtext.md`

- [ ] **Step 1: Create the doc**

Create `docs/field-types/multi_richtext.md`:

```markdown
# Multi Rich Text Field Type

A repeater variant of the [`richtext`](richtext.md) field — an ordered list of rich text editors that can be added, removed, and reordered.

## Field Type: `multi_richtext`

	array(
		'type'  => 'multi_richtext',
		'id'    => 'sections',
		'label' => 'Sections',
	)

## Properties

For Default Field Properties and multi-field properties (`min`, `max`, etc.), see [Field Types Definition](../field-types.md).

All properties of the [`richtext`](richtext.md) field apply to each item, including `toolbar`, `height`, `word_count`, and `default_view`.

## Stored Value

An ordered array of HTML strings.

## Example Usage

	array(
		'type'    => 'multi_richtext',
		'id'      => 'sections',
		'label'   => 'Sections',
		'toolbar' => 'basic',
		'min'     => 1,
		'max'     => 10,
	)

### Reading Values in Your Theme

	$sections = (array) get_post_meta( get_the_ID(), 'sections', true );
	foreach ( $sections as $html ) {
		echo '<section>';
		echo wp_kses_post( apply_filters( 'the_content', $html ) );
		echo '</section>';
	}

## Field Factory

	$f->multi_richtext(
		label: 'Sections',
		toolbar: 'basic',
		min: 1,
		max: 10,
	);

## Notes

- Each item is an independent rich text editor; collapsing/expanding items works the same as other multi-fields.
- Word counters are per-item.
```

- [ ] **Step 2: Do NOT commit.**

---

## Task 36: CHANGELOG entry

**Files:**
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Add Unreleased entry**

Open `CHANGELOG.md`. Under the `[Unreleased]` section (create the section at the top if it doesn't exist, following whatever format is already in the file — check the file first), add:

```markdown
- Added `richtext` and `multi_richtext` field types — modern rich text editor built on Lexical, with a configurable toolbar, visual/code view toggle, floating link editor, special-character picker, and word/character counter. Coexists with the existing `wysiwyg` field.
```

If the file uses a different format (e.g. versioned sections without `[Unreleased]`), match that format. Do not reformat the rest of the file.

- [ ] **Step 2: Do NOT commit.**

---

## Task 37: Build + diagnostics + manual QA

**Files:**
- Touched indirectly: all of the above

- [ ] **Step 1: Run the production build**

Run: `npm run build`
Expected: exits with code 0. A `build/` directory is updated. If webpack reports missing modules, address them before proceeding (typically a mistyped import path).

- [ ] **Step 2: Run PHP code standards on modified PHP files**

Run: `composer run phpcs -- src/CustomFields.php src/FieldFactory.php`
Expected: no new errors beyond pre-existing baseline.

- [ ] **Step 3: Run cclsp diagnostics on modified / created JS files**

For each JS file created or modified in Tasks 4–32, call `get_diagnostics`. Fix any errors introduced by your changes. Acceptable pre-existing warnings are fine.

- [ ] **Step 4: Manual QA — local smoke test**

In a local WP install with this plugin active:

1. Add a `richtext` field to a post metabox via your test harness / example plugin.
2. Load the post editor, verify the toolbar renders with the full preset.
3. Type some content, apply each inline format (bold/italic/strikethrough), switch between paragraph/H2/H3 via the block dropdown, create a list, create a blockquote, align center, insert a link via the popover (verify new-tab checkbox sets `target="_blank" rel="noopener noreferrer"`), insert a horizontal rule, insert a special character.
4. Save the post. Reload. Verify the content round-trips.
5. Toggle to code view — verify HTML shows. Edit raw HTML (e.g. add `<em>hello</em>`). Toggle back — verify it appears in the editor and (if normalization happened) the inline info notice appears.
6. Click "Paste as text" button — verify it highlights (armed). Paste something with formatting — verify it lands as plain text and the button disarms.
7. Click "Clear formatting" on a formatted selection — verify formatting drops in one undo.
8. Click the counter — verify it toggles between "excluding" and "including" whitespace.
9. Resize the browser below ~520px — verify the toolbar still functions (buttons may wrap).
10. Disable the field — verify it renders as read-only HTML.

- [ ] **Step 5: Manual QA — Gutenberg smoke test**

1. Register a block that uses a `richtext` field via the `GutenbergBlock` integration.
2. Insert the block in a post using a non-iframe theme — verify the editor works inside the block, clicking inside doesn't deselect the block, the link popover appears in the right place.
3. Repeat with an iframe-mode theme (e.g. a block theme). Verify the same.

- [ ] **Step 6: Manual QA — `multi_richtext`**

1. Add a `multi_richtext` field to a taxonomy term.
2. Add 3 items with different content. Reorder them. Delete one. Save. Reload. Verify order and content preserved.

- [ ] **Step 7: Verify all spec QA checklist items**

Cross-reference the "Manual QA checklist" section of `docs/superpowers/specs/2026-04-23-richtext-lexical-field-design.md`. Check off each item. For anything that fails, open an issue in the working notes and fix before committing.

- [ ] **Step 8: Do NOT commit yet.**

---

## Task 38: Final single commit

**Files:**
- All created/modified files listed in "File Structure" above
- `docs/superpowers/specs/2026-04-23-richtext-lexical-field-design.md`
- `docs/superpowers/plans/2026-04-23-richtext-lexical-field.md` (this file)

- [ ] **Step 1: Review git status**

Run: `git status`
Expected: the untracked spec/plan, the new asset files (JS, SCSS, docs), and modified files (`package.json`, `package-lock.json`, `assets/fields/index.js`, `assets/styles/custom-fields.scss`, `src/CustomFields.php`, `src/FieldFactory.php`, `CHANGELOG.md`).

- [ ] **Step 2: Stage everything by name (never `git add -A`)**

```bash
git add \
  package.json package-lock.json \
  assets/fields/RichText.js \
  assets/fields/MultiRichText.js \
  assets/fields/RichText/ \
  assets/fields/index.js \
  assets/styles/components/_field-richtext.scss \
  assets/styles/custom-fields.scss \
  src/CustomFields.php \
  src/FieldFactory.php \
  CHANGELOG.md \
  docs/field-types/richtext.md \
  docs/field-types/multi_richtext.md \
  docs/superpowers/specs/2026-04-23-richtext-lexical-field-design.md \
  docs/superpowers/plans/2026-04-23-richtext-lexical-field.md
```

- [ ] **Step 3: Create the commit**

```bash
git commit -m "$(cat <<'EOF'
feat: add richtext field type (Lexical) with multi_richtext

Adds a new `richtext` field (and `multi_richtext` repeater) built on
Lexical, coexisting with the existing TinyMCE-based `wysiwyg` field.
Features a data-driven toolbar with presets (`full`, `basic`, `minimal`)
and explicit button-array config, visual ↔ code view toggle with
normalization notice, floating link popover, special-character picker,
one-shot paste-as-text, clear-formatting, and a word/character counter.

Content is stored as HTML and sanitized via `wp_kses_post()` by extending
the existing `sanitize_item_value()` branch.

Includes brainstorming spec and implementation plan.
EOF
)"
```

- [ ] **Step 4: Verify**

Run: `git status`
Expected: clean working tree.

Run: `git log -1 --stat | head -40`
Expected: the commit is present and contains every file from Step 2.

---

## Completion criteria

- Single commit on `master` containing spec, plan, and all code/doc changes.
- `npm run build` exits 0.
- `composer run phpcs` on modified PHP files introduces no new errors.
- cclsp `get_diagnostics` on modified JS files shows no errors introduced by this change.
- Every item in Task 37 manual QA steps passes.

## Post-implementation (out of scope for this plan)

- Hand off to `superpowers:finishing-a-development-branch` skill for merge/PR decision.
- Monitor for user-reported issues with specific themes / integrations that weren't exercised in the manual QA.
- Track bundle size in a follow-up issue if the Lexical addition pushes the entry bundle over an acceptable threshold.
