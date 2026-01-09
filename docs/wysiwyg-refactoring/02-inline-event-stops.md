# WYSIWYG Implementation: Inline + Event Stops Approach

> **RECOMMENDED** - This is the recommended approach for inline WYSIWYG editing. See [README.md](./README.md#final-recommendation) for rationale.

## Overview

This approach renders TinyMCE directly inline within the React component, but wraps it in an event-catching container that prevents events from propagating to Gutenberg's block editor. This is the simplest implementation that provides inline editing UX.

## Critical: Gutenberg Iframe Mode Handling

Since WordPress 5.9+, Gutenberg can render blocks inside an iframe (`editor-canvas`). When this happens:

1. **Your component is inside the iframe** - `window` refers to the iframe's window
2. **TinyMCE settings may be in parent** - `tinyMCEPreInit` is in the parent admin page
3. **TinyMCE library may not be loaded** - `tinymce` global might not exist in iframe

### Solution: Access Parent Window Resources

```javascript
/**
 * Check if we're inside Gutenberg's editor-canvas iframe.
 */
function isInsideEditorIframe() {
    try {
        return window.self !== window.top &&
               window.frameElement?.name === 'editor-canvas';
    } catch (e) {
        return false;
    }
}

/**
 * Get the window containing TinyMCE resources.
 * In iframe mode, this is the parent window.
 */
function getTinyMCEWindow() {
    if (isInsideEditorIframe()) {
        try {
            // Check if parent has tinymce
            if (window.parent.tinymce) {
                return window.parent;
            }
        } catch (e) {
            // Cross-origin or access denied
        }
    }
    return window;
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Gutenberg Block Editor                                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React Component                                      │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Event-Stopping Wrapper                         │  │  │
│  │  │  onMouseDown={stopPropagation}                  │  │  │
│  │  │  onMouseUp={stopPropagation + dispatch}         │  │  │
│  │  │  onClick={stopPropagation}                      │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │  TinyMCE Editor                           │  │  │  │
│  │  │  │  - Events contained by wrapper            │  │  │  │
│  │  │  │  - Synthetic mouseup dispatched           │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Key Insight from SCF

Secure Custom Fields uses this specific fix to prevent Gutenberg conflicts:

```javascript
// FIX: Dispatch mouseup to window to prevent Gutenberg
// from trying to select multiple blocks
ed.on('mouseup', function(e) {
    const event = new MouseEvent('mouseup');
    window.dispatchEvent(event);
});
```

We extend this with additional event isolation.

## Files to Modify

1. `assets/fields/Wysiwyg.js` - Complete rewrite with event isolation
2. `src/Integrations/BaseIntegration.php` - Add hidden editor and toolbar localization
3. `assets/styles/components/field-wysiwyg.scss` - Minor style updates

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

const VIEW_VISUAL = 'visual';
const VIEW_HTML = 'html';

/**
 * Check if we're inside Gutenberg's editor-canvas iframe.
 */
function isInsideEditorIframe() {
	try {
		return window.self !== window.top &&
			window.frameElement?.name === 'editor-canvas';
	} catch (e) {
		return false;
	}
}

/**
 * Get the window containing TinyMCE resources.
 * In iframe mode, TinyMCE is loaded in the parent window.
 */
function getTinyMCEWindow() {
	if (isInsideEditorIframe()) {
		try {
			if (window.parent.tinymce) {
				return window.parent;
			}
		} catch (e) {
			// Cross-origin or access denied
		}
	}
	return window;
}

/**
 * TinyMCE Manager - Centralized editor lifecycle management.
 * Based on patterns from SCF/ACF for reliable TinyMCE handling.
 * Handles both iframe and non-iframe Gutenberg modes.
 */
const TinyMCEManager = {
	/**
	 * Get the window where TinyMCE lives.
	 */
	getWindow() {
		return getTinyMCEWindow();
	},

	/**
	 * Get TinyMCE instance from correct window context.
	 */
	getTinyMCE() {
		const win = this.getWindow();
		return win.tinymce;
	},

	/**
	 * Get tinyMCEPreInit from correct window context.
	 */
	getPreInit() {
		const win = this.getWindow();
		return win.tinyMCEPreInit;
	},

	/**
	 * Get default TinyMCE settings from WordPress.
	 * Handles both iframe and non-iframe contexts.
	 */
	getDefaults() {
		const preInit = this.getPreInit();
		if (!preInit) {
			return null;
		}

		// Try to get settings from our hidden editor.
		const settings = preInit.mceInit.wpifycf_content ||
			Object.values(preInit.mceInit)[0];

		if (!settings) {
			return null;
		}

		return {
			tinymce: settings,
			quicktags: preInit.qtInit?.wpifycf_content,
		};
	},

	/**
	 * Check if TinyMCE is available.
	 */
	isAvailable() {
		return this.getTinyMCE() !== undefined && this.getDefaults() !== null;
	},

	/**
	 * Initialize a new TinyMCE instance.
	 * Handles iframe context by using parent window's TinyMCE.
	 */
	initialize(id, options = {}) {
		const defaults = this.getDefaults();
		const tinymce = this.getTinyMCE();
		const preInit = this.getPreInit();
		const win = this.getWindow();

		if (!defaults || !tinymce) {
			console.warn('TinyMCE not available for initialization');
			return null;
		}

		// Check if already exists.
		const existing = tinymce.get(id);
		if (existing) {
			return existing;
		}

		// Build configuration.
		// IMPORTANT: In iframe mode, the textarea is in the iframe,
		// but TinyMCE runs in parent. We need to tell TinyMCE where to find the element.
		const init = {
			...defaults.tinymce,
			...options,
			id,
			wp_autoresize_on: false,
		};

		// If in iframe, we need to specify the document context
		if (isInsideEditorIframe()) {
			// TinyMCE needs to know to look in iframe document for the textarea
			init.selector = null; // Don't use selector
			init.target = document.getElementById(id); // Direct element reference
		} else {
			init.selector = '#' + id;
		}

		// Apply toolbar from correct window context.
		const toolbars = win.wpifycf_wysiwyg_toolbars || window.wpifycf_wysiwyg_toolbars || {};
		const toolbar = options.toolbar || 'full';
		if (toolbars[toolbar]) {
			Object.keys(toolbars[toolbar]).forEach((i) => {
				init['toolbar' + i] = toolbars[toolbar][i];
			});
		}

		// Store in WordPress global (in correct window).
		preInit.mceInit[id] = init;

		// Initialize TinyMCE.
		tinymce.init(init);

		return tinymce.get(id);
	},

	/**
	 * Destroy a TinyMCE instance.
	 */
	destroy(id) {
		const tinymce = this.getTinyMCE();
		const preInit = this.getPreInit();

		if (!tinymce) {
			return false;
		}

		const ed = tinymce.get(id);
		if (!ed) {
			return false;
		}

		// Save content to textarea before destroying.
		ed.save();

		// Remove all event listeners.
		ed.off();

		// Destroy the instance.
		ed.destroy();

		// Clean up WordPress global.
		if (preInit?.mceInit?.[id]) {
			delete preInit.mceInit[id];
		}

		return true;
	},

	/**
	 * Get editor instance.
	 */
	get(id) {
		const tinymce = this.getTinyMCE();
		return tinymce ? tinymce.get(id) : null;
	},
};
```

### 2. Event Isolation Wrapper Component

```javascript
/**
 * EventIsolationWrapper - Prevents events from propagating to parent (Gutenberg).
 * This is crucial for making TinyMCE work in block editor context.
 */
function EventIsolationWrapper({ children, className }) {
	/**
	 * Stop event propagation and dispatch synthetic mouseup.
	 * The synthetic mouseup satisfies Gutenberg's block selection logic.
	 */
	const handleMouseUp = useCallback((e) => {
		e.stopPropagation();
		// Dispatch synthetic event to window - this is the SCF fix.
		window.dispatchEvent(new MouseEvent('mouseup'));
	}, []);

	const handleMouseDown = useCallback((e) => {
		e.stopPropagation();
	}, []);

	const handleClick = useCallback((e) => {
		e.stopPropagation();
	}, []);

	const handleKeyDown = useCallback((e) => {
		// Only stop propagation for certain keys that might interfere.
		// Allow Tab to propagate for accessibility.
		if (e.key !== 'Tab' && e.key !== 'Escape') {
			e.stopPropagation();
		}
	}, []);

	const handleFocus = useCallback((e) => {
		e.stopPropagation();
	}, []);

	return (
		<div
			className={clsx('wpifycf-event-isolation-wrapper', className)}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			onFocus={handleFocus}
		>
			{children}
		</div>
	);
}
```

### 3. TinyMCE Component

```javascript
/**
 * TinyMCE - Inline TinyMCE editor with proper lifecycle management.
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
	const textareaRef = useRef(null);
	const [isInitialized, setIsInitialized] = useState(false);
	const [isDelayed, setIsDelayed] = useState(delay);
	const initTimeoutRef = useRef(null);

	// Sanitize ID for use as HTML ID and TinyMCE selector.
	const sanitizedId = useMemo(
		() => htmlId
			.replace(/\./g, '__')
			.replace(/\[/g, '_')
			.replace(/\]/g, '_')
			.replace(/[^a-zA-Z0-9_-]/g, '_'),
		[htmlId]
	);

	/**
	 * Initialize TinyMCE editor.
	 */
	const initializeEditor = useCallback(() => {
		if (editorRef.current || disabled) {
			return;
		}

		if (!TinyMCEManager.isAvailable()) {
			console.warn('TinyMCE not ready, retrying...');
			initTimeoutRef.current = setTimeout(initializeEditor, 100);
			return;
		}

		const init = {
			height: Math.max(height, 300),
			toolbar,
			setup(ed) {
				editorRef.current = ed;

				ed.on('init', () => {
					// Set initial content.
					if (value) {
						ed.setContent(value);
					}
					setIsInitialized(true);
				});

				// Sync content changes to React state.
				ed.on('change keyup', () => {
					ed.save();
					const content = ed.getContent();
					onChange?.(content);
				});

				// Gutenberg block selection fix - dispatch mouseup to window.
				ed.on('mouseup', () => {
					window.dispatchEvent(new MouseEvent('mouseup'));
				});

				// Prevent mousedown from deselecting block.
				ed.on('mousedown', (e) => {
					e.stopPropagation();
				});
			},
		};

		TinyMCEManager.initialize(sanitizedId, init);
	}, [sanitizedId, height, toolbar, onChange, value, disabled]);

	/**
	 * Handle delayed initialization click.
	 */
	const handleDelayedInit = useCallback(() => {
		setIsDelayed(false);
	}, []);

	/**
	 * Initialize on mount (if not delayed).
	 */
	useEffect(() => {
		if (!isDelayed && !disabled) {
			// Small delay to ensure DOM is ready.
			initTimeoutRef.current = setTimeout(initializeEditor, 50);
		}

		return () => {
			if (initTimeoutRef.current) {
				clearTimeout(initTimeoutRef.current);
			}
		};
	}, [isDelayed, disabled, initializeEditor]);

	/**
	 * Cleanup on unmount.
	 */
	useEffect(() => {
		return () => {
			if (editorRef.current) {
				TinyMCEManager.destroy(sanitizedId);
				editorRef.current = null;
			}
		};
	}, [sanitizedId]);

	/**
	 * Sync external value changes to editor.
	 */
	useEffect(() => {
		const ed = editorRef.current;
		if (ed && isInitialized) {
			const currentContent = ed.getContent();
			// Only update if actually different to avoid cursor jumping.
			if (value !== currentContent && value !== undefined) {
				const bookmark = ed.selection.getBookmark(2, true);
				ed.setContent(value || '');
				try {
					ed.selection.moveToBookmark(bookmark);
				} catch (e) {
					// Bookmark may be invalid after content change.
				}
			}
		}
	}, [value, isInitialized]);

	// Delayed initialization UI.
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
		<div className="wpifycf-field-wysiwyg__editor-container">
			<textarea
				ref={textareaRef}
				id={sanitizedId}
				defaultValue={value || ''}
				style={{ height }}
				disabled={disabled}
			/>
		</div>
	);
}
```

### 4. Main Wysiwyg Component

```javascript
/**
 * Wysiwyg - Main WYSIWYG field component with Visual/HTML tabs.
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
	tabs = 'all', // 'all', 'visual', 'text'
}) {
	const [view, setView] = useState(VIEW_VISUAL);
	const { context } = useContext(AppContext);

	// Update field title from content.
	useEffect(() => {
		setTitle?.(stripHtml(value || '').replace(/\n/g, ' ').substring(0, 50));
	}, [setTitle, value]);

	// Determine which tabs to show.
	const canShowVisual = tabs === 'all' || tabs === 'visual';
	const canShowText = tabs === 'all' || tabs === 'text';
	const showTabs = tabs === 'all';

	// Force view based on tabs setting.
	useEffect(() => {
		if (tabs === 'visual' && view === VIEW_HTML) {
			setView(VIEW_VISUAL);
		} else if (tabs === 'text' && view === VIEW_VISUAL) {
			setView(VIEW_HTML);
		}
	}, [tabs, view]);

	// Determine if we need event isolation (Gutenberg context).
	const needsIsolation = context === 'gutenberg';

	const editorComponent = (
		<TinyMCE
			htmlId={htmlId}
			value={value}
			onChange={onChange}
			height={height}
			disabled={disabled}
			toolbar={toolbar}
			delay={delay}
		/>
	);

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
				) : needsIsolation ? (
					<EventIsolationWrapper>
						{editorComponent}
					</EventIsolationWrapper>
				) : (
					editorComponent
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

### 5. Hidden Editor and Toolbar Localization

**File: `src/Integrations/BaseIntegration.php`** (add methods)

```php
/**
 * Print hidden wp_editor for TinyMCE initialization.
 * This ensures TinyMCE settings are properly loaded.
 *
 * @return void
 */
public function print_wysiwyg_scripts(): void {
	static $printed = false;

	if ( $printed ) {
		return;
	}

	$printed = true;

	?>
	<div id="wpifycf-hidden-wp-editor" style="display: none !important; visibility: hidden; position: absolute; left: -9999px;">
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
 * Localize toolbar configurations for JavaScript.
 *
 * @return void
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

	$handle = $this->custom_fields->get_script_handle();

	wp_add_inline_script(
		$handle,
		'window.wpifycf_wysiwyg_toolbars = ' . wp_json_encode( $toolbars ) . ';',
		'before'
	);
}
```

### 6. Update enqueue() Method

**File: `src/Integrations/BaseIntegration.php`** (modify enqueue)

```php
public function enqueue(): void {
	if ( ! is_admin() ) {
		return;
	}

	$handle = $this->custom_fields->get_script_handle();
	$js     = $this->custom_fields->get_js_asset( 'wpify-custom-fields' );
	$data   = array(
		'instance'   => $this->custom_fields->get_script_handle(),
		'stylesheet' => $this->custom_fields->get_css_asset( 'wpify-custom-fields' ),
		'api_path'   => $this->custom_fields->api->get_rest_namespace(),
		'abspath'    => ABSPATH,
		'site_url'   => get_site_url(),
	);

	// Dependencies for WYSIWYG field.
	wp_enqueue_editor();
	wp_tinymce_inline_scripts();

	$current_screen = get_current_screen();

	if ( ! $current_screen || ! $current_screen->is_block_editor() ) {
		wp_enqueue_script( 'wp-block-library' );
		wp_enqueue_media();
		wp_enqueue_style( 'wp-components' );
	}

	wp_enqueue_script(
		$handle,
		$js['src'],
		$js['dependencies'],
		$js['version'],
		array( 'in_footer' => false ),
	);

	wp_add_inline_script(
		$handle,
		'window.wpifycf=' . wp_json_encode( $data ) . ';',
		'before',
	);

	// Add hidden editor and toolbar config.
	add_action( 'admin_print_footer_scripts', array( $this, 'print_wysiwyg_scripts' ), 5 );
	add_action( 'admin_print_footer_scripts', array( $this, 'localize_wysiwyg_toolbars' ), 6 );
}
```

---

## CSS Styles

**File: `assets/styles/components/field-wysiwyg.scss`** (additions)

```scss
// Event isolation wrapper.
.wpifycf-event-isolation-wrapper {
	position: relative;
}

// Delay initialization styles.
.wpifycf-field-wysiwyg__delay-wrapper {
	border: 1px solid #dcdcde;
	border-radius: 4px;
	background: #f6f7f7;
	cursor: pointer;
	display: flex;
	flex-direction: column;
	transition: border-color 0.2s ease;

	&:hover {
		border-color: #2271b1;
	}

	&:focus {
		outline: 2px solid #2271b1;
		outline-offset: -2px;
	}
}

.wpifycf-field-wysiwyg__delay-message {
	padding: 12px;
	text-align: center;
	color: #646970;
	font-size: 14px;
	border-bottom: 1px solid #dcdcde;
}

.wpifycf-field-wysiwyg__delay-preview {
	padding: 12px;
	flex: 1;
	overflow: auto;
	max-height: 300px;
}

// Editor container.
.wpifycf-field-wysiwyg__editor-container {
	.mce-tinymce {
		border-radius: 0 0 4px 4px;
	}
}
```

---

## Pros and Cons Summary

### Advantages

1. **Simplest implementation** - No nested iframe, no modal, just event handling
2. **Best UX** - Inline editing, no extra clicks needed
3. **Fast performance** - No additional page loads
4. **Media upload works** - Standard WordPress media handling
5. **Auto-height possible** - No iframe constraints
6. **Easy debugging** - All in same document context
7. **Full TinyMCE features** - No restrictions
8. **Works in both Gutenberg modes** - With iframe-aware TinyMCE manager

### Disadvantages

1. **Event isolation not 100%** - Edge cases may still leak through
2. **Requires testing** - Need to verify all event types are handled
3. **CSS conflicts possible** - TinyMCE styles may conflict with Gutenberg
4. **May need more events** - Could need to stop more event types over time
5. **Depends on SCF technique** - Based on their mouseup dispatch fix
6. **Iframe mode complexity** - Need to access parent window for TinyMCE in iframe mode
7. **Cross-frame element reference** - TinyMCE in parent needs to target element in iframe

---

## Testing Checklist

### Gutenberg Block Tests (Critical)

- [ ] Click inside editor - block remains selected
- [ ] Type text - no interference with block editor
- [ ] Select text with mouse - no block selection issues
- [ ] Drag to select text - no multi-block selection
- [ ] Use keyboard shortcuts (Ctrl+B, Ctrl+I) - work correctly
- [ ] Press Enter for new paragraph - works in editor
- [ ] Press Tab - moves focus appropriately
- [ ] Press Escape - handled correctly
- [ ] Click outside editor - proper blur behavior

### General Tests

- [ ] Editor initializes in metabox context
- [ ] Editor initializes in options page
- [ ] Content saves and loads correctly
- [ ] Visual/HTML tabs switch properly
- [ ] Media upload button works
- [ ] Multiple editors on same page
- [ ] Delay initialization works
- [ ] Disabled state displays correctly
- [ ] Very long content performance

### Edge Cases

- [ ] Rapid tab switching
- [ ] Adding/removing in repeater
- [ ] Nested inside other blocks (Group, Columns)
- [ ] Inspector sidebar placement

### Iframe Mode Tests (Critical)

These tests must pass in BOTH modes. Toggle iframe mode in WordPress settings or test with different WP versions.

**To check current mode**: Open browser DevTools, look for `<iframe name="editor-canvas">` in the DOM.

- [ ] **Detect iframe mode correctly** - `isInsideEditorIframe()` returns true/false appropriately
- [ ] **TinyMCE loads in iframe mode** - Editor initializes when inside editor-canvas iframe
- [ ] **TinyMCE loads in non-iframe mode** - Editor initializes in direct rendering
- [ ] **Content syncs in iframe mode** - Changes saved correctly
- [ ] **Events isolated in iframe mode** - No block selection conflicts
- [ ] **Media upload in iframe mode** - Media library opens and works
- [ ] **Multiple editors in iframe mode** - All work independently

### How to Test Both Modes

**Force iframe mode** (WordPress 6.0+):
```php
// In theme's functions.php or plugin
add_filter('block_editor_settings_all', function($settings) {
    // Force iframe mode
    $settings['__unstableIsBlockBasedTheme'] = true;
    return $settings;
});
```

**Force non-iframe mode**:
```php
add_filter('block_editor_settings_all', function($settings) {
    $settings['__unstableIsBlockBasedTheme'] = false;
    return $settings;
});
```
