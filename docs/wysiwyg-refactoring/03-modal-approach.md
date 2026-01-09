# WYSIWYG Implementation: Modal Approach

## Overview

This approach (based on ACF/SCF patterns) shows a content preview inline, and opens the TinyMCE editor in a WordPress modal dialog when clicked. The modal completely isolates the editor from the block editor context, providing reliable editing without any event conflicts.

## Critical: Gutenberg Iframe Mode Handling

Since WordPress 5.9+, Gutenberg can render blocks inside an iframe (`editor-canvas`). The modal approach has specific considerations:

1. **Modal renders in iframe context** - When in iframe mode, the `@wordpress/components` Modal renders inside the iframe
2. **TinyMCE may be in parent** - `tinyMCEPreInit` and `tinymce` are in parent window
3. **Z-index needs adjustment** - Modal may need higher z-index to appear above Gutenberg UI

### Advantage of Modal in Iframe Mode

The WordPress Modal component from `@wordpress/components` is designed to work within the block editor context, so it handles the iframe situation automatically. The modal:
- Creates an overlay within the current document context
- Uses portal rendering to escape parent containers
- Manages focus appropriately

This makes the modal approach **more reliable** in iframe mode than inline approaches.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Gutenberg Block Editor                                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React Component                                      │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Content Preview (RawHTML)                      │  │  │
│  │  │  + Edit Button                                  │  │  │
│  │  │                                                 │  │  │
│  │  │  onClick → Opens Modal                          │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Modal (z-index: high, isolated overlay)              │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  TinyMCE Editor                                 │  │  │
│  │  │  - Full editing capabilities                    │  │  │
│  │  │  - No event conflicts                           │  │  │
│  │  │  - Saves on close                               │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  [Done Button]                                        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## This is What ACF/SCF Use

Both ACF and SCF explicitly recommend against using WYSIWYG in block contexts and use a modal approach:

- **ACF Documentation**: "WYSIWYG fields are not recommended for use in ACF Blocks"
- **SCF Code**: Uses modal for block editor context (see `block-editor-freeform-modal` class)

## Files to Modify

1. `assets/fields/Wysiwyg.js` - Complete implementation with modal
2. `src/Integrations/BaseIntegration.php` - Hidden editor and toolbar config
3. `assets/styles/components/field-wysiwyg.scss` - Modal and preview styles

---

## JavaScript Implementation

### 1. TinyMCE Manager Module

**File: `assets/fields/Wysiwyg.js`** (top of file)

```javascript
import { RawHTML } from '@wordpress/element';
import { useCallback, useContext, useEffect, useRef, useState, useMemo } from 'react';
import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { Code } from '@/fields/Code';
import { checkValidityStringType } from '@/helpers/validators';
import { AppContext } from '@/components/AppContext';
import { stripHtml } from '@/helpers/functions';
import {
	Modal,
	Button,
	Flex,
	FlexItem,
} from '@wordpress/components';
import { fullscreen } from '@wordpress/icons';

const VIEW_VISUAL = 'visual';
const VIEW_HTML = 'html';

/**
 * TinyMCE Manager - Centralized editor lifecycle management.
 */
const TinyMCEManager = {
	/**
	 * Get default TinyMCE settings from WordPress.
	 */
	getDefaults() {
		if (typeof tinyMCEPreInit === 'undefined') {
			return null;
		}

		const settings = tinyMCEPreInit.mceInit.wpifycf_content ||
			Object.values(tinyMCEPreInit.mceInit)[0];

		if (!settings) {
			return null;
		}

		return {
			tinymce: settings,
			quicktags: tinyMCEPreInit.qtInit?.wpifycf_content,
		};
	},

	/**
	 * Check if TinyMCE is available.
	 */
	isAvailable() {
		return typeof tinymce !== 'undefined' && this.getDefaults() !== null;
	},

	/**
	 * Initialize a new TinyMCE instance.
	 */
	initialize(id, options = {}) {
		const defaults = this.getDefaults();
		if (!defaults || typeof tinymce === 'undefined') {
			console.warn('TinyMCE not available');
			return null;
		}

		// Check if already exists.
		const existing = tinymce.get(id);
		if (existing) {
			return existing;
		}

		// Build configuration.
		const init = {
			...defaults.tinymce,
			...options,
			id,
			selector: '#' + id,
			wp_autoresize_on: false,
		};

		// Apply toolbar configuration.
		const toolbars = window.wpifycf_wysiwyg_toolbars || {};
		const toolbar = options.toolbar || 'full';
		if (toolbars[toolbar]) {
			Object.keys(toolbars[toolbar]).forEach((i) => {
				init['toolbar' + i] = toolbars[toolbar][i];
			});
		}

		// Store in WordPress global.
		tinyMCEPreInit.mceInit[id] = init;

		// Initialize.
		tinymce.init(init);

		return tinymce.get(id);
	},

	/**
	 * Destroy a TinyMCE instance.
	 */
	destroy(id) {
		if (typeof tinymce === 'undefined') {
			return false;
		}

		const ed = tinymce.get(id);
		if (!ed) {
			return false;
		}

		ed.save();
		ed.off();
		ed.destroy();

		if (tinyMCEPreInit?.mceInit?.[id]) {
			delete tinyMCEPreInit.mceInit[id];
		}

		return true;
	},

	/**
	 * Get editor instance.
	 */
	get(id) {
		return typeof tinymce !== 'undefined' ? tinymce.get(id) : null;
	},
};
```

### 2. Inline TinyMCE Component (for non-Gutenberg contexts)

```javascript
/**
 * TinyMCE - Inline editor for non-Gutenberg contexts.
 */
function TinyMCE({
	htmlId,
	value,
	onChange,
	height = 300,
	disabled = false,
	toolbar = 'full',
	delay = false,
}) {
	const editorRef = useRef(null);
	const [isInitialized, setIsInitialized] = useState(false);
	const [isDelayed, setIsDelayed] = useState(delay);
	const initTimeoutRef = useRef(null);

	const sanitizedId = useMemo(
		() => htmlId
			.replace(/\./g, '__')
			.replace(/\[/g, '_')
			.replace(/\]/g, '_')
			.replace(/[^a-zA-Z0-9_-]/g, '_'),
		[htmlId]
	);

	const initializeEditor = useCallback(() => {
		if (editorRef.current || disabled) {
			return;
		}

		if (!TinyMCEManager.isAvailable()) {
			initTimeoutRef.current = setTimeout(initializeEditor, 100);
			return;
		}

		const init = {
			height: Math.max(height, 300),
			toolbar,
			setup(ed) {
				editorRef.current = ed;

				ed.on('init', () => {
					if (value) {
						ed.setContent(value);
					}
					setIsInitialized(true);
				});

				ed.on('change keyup', () => {
					ed.save();
					onChange?.(ed.getContent());
				});
			},
		};

		TinyMCEManager.initialize(sanitizedId, init);
	}, [sanitizedId, height, toolbar, onChange, value, disabled]);

	const handleDelayedInit = useCallback(() => {
		setIsDelayed(false);
	}, []);

	useEffect(() => {
		if (!isDelayed && !disabled) {
			initTimeoutRef.current = setTimeout(initializeEditor, 50);
		}
		return () => {
			if (initTimeoutRef.current) {
				clearTimeout(initTimeoutRef.current);
			}
		};
	}, [isDelayed, disabled, initializeEditor]);

	useEffect(() => {
		return () => {
			if (editorRef.current) {
				TinyMCEManager.destroy(sanitizedId);
				editorRef.current = null;
			}
		};
	}, [sanitizedId]);

	useEffect(() => {
		const ed = editorRef.current;
		if (ed && isInitialized && value !== ed.getContent()) {
			ed.setContent(value || '');
		}
	}, [value, isInitialized]);

	if (isDelayed) {
		return (
			<div
				className="wpifycf-field-wysiwyg__delay-wrapper"
				style={{ minHeight: height + 94 }}
				onClick={handleDelayedInit}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => e.key === 'Enter' && handleDelayedInit()}
			>
				<div className="wpifycf-field-wysiwyg__delay-message">
					{__('Click to initialize editor', 'wpify-custom-fields')}
				</div>
				{value && (
					<RawHTML className="wpifycf-field-wysiwyg__delay-preview">
						{value}
					</RawHTML>
				)}
			</div>
		);
	}

	return (
		<textarea
			id={sanitizedId}
			defaultValue={value || ''}
			style={{ height }}
			disabled={disabled}
		/>
	);
}
```

### 3. Modal Editor Component (for Gutenberg contexts)

```javascript
/**
 * ModalTinyMCE - Shows preview inline, opens editor in modal.
 * This is the approach used by ACF/SCF for Gutenberg compatibility.
 */
function ModalTinyMCE({
	htmlId,
	value,
	onChange,
	height = 300,
	disabled = false,
	toolbar = 'full',
}) {
	const [isOpen, setOpen] = useState(false);
	const [isFullScreen, setIsFullScreen] = useState(false);
	const [localValue, setLocalValue] = useState(value);
	const editorRef = useRef(null);
	const [isInitialized, setIsInitialized] = useState(false);

	// Generate unique ID for modal editor.
	const modalEditorId = useMemo(
		() => `wpifycf_modal_${htmlId}`
			.replace(/\./g, '__')
			.replace(/\[/g, '_')
			.replace(/\]/g, '_')
			.replace(/[^a-zA-Z0-9_-]/g, '_'),
		[htmlId]
	);

	// Sync external value to local.
	useEffect(() => {
		setLocalValue(value);
	}, [value]);

	// Handle modal open.
	const handleOpen = useCallback(() => {
		setLocalValue(value);
		setOpen(true);
	}, [value]);

	// Handle modal close - save changes.
	const handleClose = useCallback(() => {
		// Get final content from editor.
		const ed = editorRef.current;
		if (ed) {
			const content = ed.getContent();
			onChange?.(content);
		}
		setOpen(false);
		setIsInitialized(false);
	}, [onChange]);

	// Toggle fullscreen.
	const handleToggleFullscreen = useCallback(() => {
		setIsFullScreen((prev) => !prev);
	}, []);

	// Initialize editor when modal opens.
	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const initEditor = () => {
			if (!TinyMCEManager.isAvailable()) {
				setTimeout(initEditor, 100);
				return;
			}

			const init = {
				height: Math.max(height, 300),
				toolbar,
				setup(ed) {
					editorRef.current = ed;

					ed.on('init', () => {
						ed.setContent(localValue || '');
						setIsInitialized(true);
						ed.focus();
					});

					ed.on('change keyup', () => {
						ed.save();
						setLocalValue(ed.getContent());
					});
				},
			};

			TinyMCEManager.initialize(modalEditorId, init);
		};

		// Small delay for modal to render.
		const timeout = setTimeout(initEditor, 100);

		return () => {
			clearTimeout(timeout);
			if (editorRef.current) {
				TinyMCEManager.destroy(modalEditorId);
				editorRef.current = null;
			}
		};
	}, [isOpen, modalEditorId, height, toolbar, localValue]);

	// Calculate preview height.
	const previewHeight = Math.max(height, 100) + 44;

	return (
		<>
			{/* Preview / Trigger */}
			<div
				className={clsx(
					'wpifycf-field-wysiwyg__preview-wrapper',
					disabled && 'is-disabled'
				)}
				style={{ minHeight: previewHeight }}
			>
				<div
					className="wpifycf-field-wysiwyg__preview"
					onClick={disabled ? undefined : handleOpen}
					role={disabled ? undefined : 'button'}
					tabIndex={disabled ? undefined : 0}
					onKeyDown={(e) => !disabled && e.key === 'Enter' && handleOpen()}
				>
					{value ? (
						<RawHTML>{value}</RawHTML>
					) : (
						<span className="wpifycf-field-wysiwyg__placeholder">
							{__('Click to add content...', 'wpify-custom-fields')}
						</span>
					)}
				</div>

				{!disabled && (
					<Button
						onClick={handleOpen}
						variant="primary"
						className="wpifycf-field-wysiwyg__edit-button"
					>
						{__('Edit', 'wpify-custom-fields')}
					</Button>
				)}
			</div>

			{/* Modal with Editor */}
			{isOpen && (
				<Modal
					title={__('Edit Content', 'wpify-custom-fields')}
					onRequestClose={handleClose}
					shouldCloseOnClickOutside={false}
					overlayClassName="wpifycf-wysiwyg-modal-overlay"
					isFullScreen={isFullScreen}
					className={clsx(
						'wpifycf-wysiwyg-modal',
						isFullScreen && 'is-fullscreen'
					)}
					headerActions={
						<Button
							size="small"
							onClick={handleToggleFullscreen}
							icon={fullscreen}
							isPressed={isFullScreen}
							label={
								isFullScreen
									? __('Exit fullscreen', 'wpify-custom-fields')
									: __('Enter fullscreen', 'wpify-custom-fields')
							}
						/>
					}
				>
					<div className="wpifycf-wysiwyg-modal__editor">
						<textarea
							id={modalEditorId}
							defaultValue={localValue || ''}
							style={{ height: isFullScreen ? 'calc(100vh - 200px)' : height }}
						/>
					</div>

					<Flex
						className="wpifycf-wysiwyg-modal__actions"
						justify="flex-end"
						expanded={false}
					>
						<FlexItem>
							<Button
								variant="tertiary"
								onClick={() => {
									setLocalValue(value);
									setOpen(false);
									setIsInitialized(false);
								}}
							>
								{__('Cancel', 'wpify-custom-fields')}
							</Button>
						</FlexItem>
						<FlexItem>
							<Button
								__next40pxDefaultSize
								variant="primary"
								onClick={handleClose}
							>
								{__('Done', 'wpify-custom-fields')}
							</Button>
						</FlexItem>
					</Flex>
				</Modal>
			)}
		</>
	);
}
```

### 4. Main Wysiwyg Component

```javascript
/**
 * Wysiwyg - Main WYSIWYG field component.
 * Uses modal for Gutenberg context, inline editor for others.
 */
export function Wysiwyg({
	id,
	htmlId,
	value,
	onChange,
	height = 300,
	className,
	disabled = false,
	setTitle,
	toolbar = 'full',
	delay = false,
	tabs = 'all',
}) {
	const [view, setView] = useState(VIEW_VISUAL);
	const { context } = useContext(AppContext);

	// Update field title.
	useEffect(() => {
		setTitle?.(stripHtml(value || '').replace(/\n/g, ' ').substring(0, 50));
	}, [setTitle, value]);

	// Tab visibility.
	const canShowVisual = tabs === 'all' || tabs === 'visual';
	const canShowText = tabs === 'all' || tabs === 'text';
	const showTabs = tabs === 'all';

	// Force view based on tabs.
	useEffect(() => {
		if (tabs === 'visual' && view === VIEW_HTML) {
			setView(VIEW_VISUAL);
		} else if (tabs === 'text' && view === VIEW_VISUAL) {
			setView(VIEW_HTML);
		}
	}, [tabs, view]);

	// Use modal approach for Gutenberg.
	const useModal = context === 'gutenberg';

	return (
		<div className={clsx('wpifycf-field-wysiwyg', `wpifycf-field-wysiwyg--${id}`, className)}>
			{showTabs && (
				<div className="wpifycf-field-wysiwyg__tabs">
					{canShowVisual && (
						<button
							type="button"
							className={clsx('wpifycf-field-wysiwyg__tab', view === VIEW_VISUAL && 'active')}
							onClick={() => setView(VIEW_VISUAL)}
						>
							{__('Visual', 'wpify-custom-fields')}
						</button>
					)}
					{canShowText && (
						<button
							type="button"
							className={clsx('wpifycf-field-wysiwyg__tab', view === VIEW_HTML && 'active')}
							onClick={() => setView(VIEW_HTML)}
						>
							{__('HTML', 'wpify-custom-fields')}
						</button>
					)}
				</div>
			)}

			{view === VIEW_VISUAL && (
				disabled ? (
					<RawHTML className="wpifycf-field-wysiwyg__raw">
						{value}
					</RawHTML>
				) : useModal ? (
					<ModalTinyMCE
						htmlId={htmlId}
						value={value}
						onChange={onChange}
						height={height}
						disabled={disabled}
						toolbar={toolbar}
					/>
				) : (
					<TinyMCE
						htmlId={htmlId}
						value={value}
						onChange={onChange}
						height={height}
						disabled={disabled}
						toolbar={toolbar}
						delay={delay}
					/>
				)
			)}

			{view === VIEW_HTML && (
				<Code
					value={value}
					onChange={onChange}
					height={height + 94}
					id={id}
					htmlId={htmlId}
					language="html"
					theme="light"
					disabled={disabled}
				/>
			)}
		</div>
	);
}

Wysiwyg.checkValidity = checkValidityStringType;
Wysiwyg.VIEW_VISUAL = VIEW_VISUAL;
Wysiwyg.VIEW_HTML = VIEW_HTML;

export default Wysiwyg;
```

---

## PHP Implementation

### 5. Same as Other Approaches

**File: `src/Integrations/BaseIntegration.php`**

```php
/**
 * Print hidden wp_editor for TinyMCE initialization.
 */
public function print_wysiwyg_scripts(): void {
	static $printed = false;

	if ( $printed ) {
		return;
	}

	$printed = true;

	?>
	<div id="wpifycf-hidden-wp-editor" style="display: none !important;">
		<?php
		wp_editor(
			'',
			'wpifycf_content',
			array(
				'tinymce'   => array(
					'wp_autoresize_on' => false,
				),
				'quicktags' => false,
			)
		);
		?>
	</div>
	<?php
}

/**
 * Localize toolbar configurations.
 */
public function localize_wysiwyg_toolbars(): void {
	$toolbars = apply_filters(
		'wpifycf_wysiwyg_toolbars',
		array(
			'full'  => array(
				1 => 'formatselect,bold,italic,underline,strikethrough,bullist,numlist,blockquote,hr,alignleft,aligncenter,alignright,link,unlink,wp_add_media,wp_more,spellchecker,fullscreen,wp_adv',
				2 => 'fontsizeselect,forecolor,pastetext,removeformat,charmap,outdent,indent,undo,redo,wp_help',
			),
			'basic' => array(
				1 => 'bold,italic,underline,link,unlink',
			),
		)
	);

	wp_add_inline_script(
		$this->custom_fields->get_script_handle(),
		'window.wpifycf_wysiwyg_toolbars = ' . wp_json_encode( $toolbars ) . ';',
		'before'
	);
}
```

---

## CSS Styles

**File: `assets/styles/components/field-wysiwyg.scss`**

```scss
// Preview wrapper for modal approach.
.wpifycf-field-wysiwyg__preview-wrapper {
	position: relative;
	border: 1px solid #dcdcde;
	border-radius: 4px;
	background: #fff;
	overflow: hidden;

	&.is-disabled {
		background: #f6f7f7;
	}
}

.wpifycf-field-wysiwyg__preview {
	padding: 12px;
	min-height: 100px;
	cursor: pointer;
	transition: background-color 0.2s ease;

	.is-disabled & {
		cursor: default;
	}

	&:hover:not(.is-disabled &) {
		background: #f9f9f9;
	}

	&:focus {
		outline: 2px solid #2271b1;
		outline-offset: -2px;
	}

	// Style content similarly to TinyMCE.
	p {
		margin: 0 0 1em;
	}

	h1, h2, h3, h4, h5, h6 {
		margin: 1em 0 0.5em;
	}

	ul, ol {
		margin: 0 0 1em;
		padding-left: 2em;
	}
}

.wpifycf-field-wysiwyg__placeholder {
	color: #757575;
	font-style: italic;
}

.wpifycf-field-wysiwyg__edit-button {
	position: absolute;
	top: 8px;
	right: 8px;
}

// Modal styles.
.wpifycf-wysiwyg-modal-overlay {
	z-index: 100001; // Above Gutenberg's modals.
}

.wpifycf-wysiwyg-modal {
	max-width: 900px;
	width: 90%;

	&.is-fullscreen {
		max-width: none;
		width: 100%;
	}

	.components-modal__content {
		padding: 0;
	}
}

.wpifycf-wysiwyg-modal__editor {
	padding: 16px;
	padding-bottom: 0;

	// Remove TinyMCE border in modal context.
	.mce-tinymce {
		border: none;
		box-shadow: none;
	}
}

.wpifycf-wysiwyg-modal__actions {
	padding: 16px;
	border-top: 1px solid #dcdcde;
	background: #f6f7f7;
}

// Delay wrapper (same as other approaches).
.wpifycf-field-wysiwyg__delay-wrapper {
	border: 1px solid #dcdcde;
	border-radius: 4px;
	background: #f6f7f7;
	cursor: pointer;
	display: flex;
	flex-direction: column;

	&:hover {
		border-color: #2271b1;
	}
}

.wpifycf-field-wysiwyg__delay-message {
	padding: 12px;
	text-align: center;
	color: #646970;
	border-bottom: 1px solid #dcdcde;
}

.wpifycf-field-wysiwyg__delay-preview {
	padding: 12px;
	flex: 1;
	overflow: auto;
	max-height: 300px;
}
```

---

## Pros and Cons Summary

### Advantages

1. **100% reliable** - No event conflicts possible, modal is completely isolated
2. **Battle-tested** - This is exactly what ACF and SCF use
3. **Clean architecture** - Clear separation between preview and editor
4. **Media upload works** - Standard WordPress media in modal context
5. **Fullscreen support** - Easy to implement with WordPress Modal
6. **Cancel support** - User can cancel changes before saving

### Disadvantages

1. **Extra click required** - Users must click to open modal
2. **Context switch** - Editing happens in modal, not inline
3. **Preview may differ** - Preview styling may not match editor
4. **Slower workflow** - More clicks for simple edits
5. **Modal fatigue** - Users may find frequent modal opening tedious

---

## Testing Checklist

### Gutenberg Block Tests

- [ ] Preview shows content correctly
- [ ] Click on preview opens modal
- [ ] Edit button opens modal
- [ ] Editor initializes in modal
- [ ] Content loads correctly in editor
- [ ] Changes save on Done click
- [ ] Cancel discards changes
- [ ] Fullscreen toggle works
- [ ] Media upload works in modal
- [ ] Post saves with WYSIWYG content
- [ ] No block selection issues

### General Tests

- [ ] Inline editor works in metabox context
- [ ] Inline editor works in options page
- [ ] Visual/HTML tabs work
- [ ] Multiple editors on same page
- [ ] Delay initialization works (non-Gutenberg)
- [ ] Disabled state displays correctly

### Modal-Specific Tests

- [ ] Modal closes with X button
- [ ] Modal closes with Done button
- [ ] Modal closes with Cancel button
- [ ] Escape key behavior (should not close by default)
- [ ] Click outside modal (should not close)
- [ ] Multiple WYSIWYG fields - opening one doesn't affect others
- [ ] Rapid open/close cycles
