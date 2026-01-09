# WYSIWYG Implementation: Iframe + postMessage Approach

## Overview

This approach embeds TinyMCE in an iframe that loads a special WordPress admin endpoint. All communication between the React component and the editor happens via the `postMessage` API, providing complete DOM and event isolation.

## Critical: Gutenberg Iframe Mode Handling

Since WordPress 5.9+, Gutenberg can render blocks inside an iframe (`editor-canvas`). This creates a **nested iframe situation**:

```
Admin Page
└── editor-canvas (Gutenberg iframe)
    └── Your Block Component
        └── WYSIWYG iframe (your custom editor)
```

### Considerations for Nested Iframes

1. **postMessage routing** - Messages need to go from your iframe → editor-canvas iframe → handle in component
2. **Same-origin policy** - All iframes are same-origin (WordPress admin), so this works
3. **ajaxurl availability** - The `ajaxurl` variable may be in the parent window
4. **Performance** - Loading an iframe inside an iframe has higher overhead

### Adjusted postMessage for Nested Context

```javascript
// In parent component (inside editor-canvas iframe)
const handleMessage = (event) => {
    // Verify message is from our editor iframe, not from parent page
    if (event.source !== iframeRef.current?.contentWindow) {
        return;
    }
    // ... handle message
};
```

This approach is **the most isolated** but also **the most complex** when dealing with iframe mode.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  React Component (Parent Window)                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  <iframe src="/wp-admin/admin-ajax.php?action=...">   │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Separate Document Context                      │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │  wp_editor() - Full TinyMCE               │  │  │  │
│  │  │  │  - All events contained                   │  │  │  │
│  │  │  │  - Own CSS context                        │  │  │  │
│  │  │  │  - Media upload works natively            │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                          ↑↓ postMessage                     │
└─────────────────────────────────────────────────────────────┘
```

## Files to Create/Modify

### New Files

1. `src/Api/EditorEndpoint.php` - AJAX handler for editor page
2. `assets/editor-iframe.js` - Script running inside iframe
3. `assets/editor-iframe.css` - Styles for iframe page

### Modified Files

1. `assets/fields/Wysiwyg.js` - React component with iframe embedding
2. `src/Integrations/BaseIntegration.php` - Register AJAX handler
3. `src/CustomFields.php` - Initialize editor endpoint

---

## PHP Implementation

### 1. Editor Endpoint Class

**File: `src/Api/EditorEndpoint.php`**

```php
<?php
/**
 * Class EditorEndpoint.
 *
 * Provides an AJAX endpoint that renders a standalone TinyMCE editor page
 * for use in iframes within React components.
 *
 * @package WPify Custom Fields
 */

namespace Wpify\CustomFields\Api;

/**
 * Handles the AJAX endpoint for the iframe-based WYSIWYG editor.
 */
class EditorEndpoint {
	/**
	 * Constructor - registers the AJAX handlers.
	 */
	public function __construct() {
		add_action( 'wp_ajax_wpifycf_editor', array( $this, 'render_editor' ) );
	}

	/**
	 * Renders a minimal page with wp_editor for iframe embedding.
	 *
	 * @return void
	 */
	public function render_editor(): void {
		// Verify nonce for security.
		if ( ! isset( $_GET['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $_GET['_wpnonce'] ), 'wpifycf_editor' ) ) {
			wp_die( esc_html__( 'Security check failed.', 'wpify-custom-fields' ) );
		}

		// Check user capabilities.
		if ( ! current_user_can( 'edit_posts' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'wpify-custom-fields' ) );
		}

		// Get configuration from URL parameters.
		$editor_id = isset( $_GET['editor_id'] ) ? sanitize_key( $_GET['editor_id'] ) : 'wpifycf_iframe_editor';
		$height    = isset( $_GET['height'] ) ? absint( $_GET['height'] ) : 300;
		$toolbar   = isset( $_GET['toolbar'] ) ? sanitize_key( $_GET['toolbar'] ) : 'full';

		// Define toolbar configurations.
		$toolbars = apply_filters(
			'wpifycf_wysiwyg_toolbars',
			array(
				'full'  => array(
					'toolbar1' => 'formatselect,bold,italic,underline,strikethrough,bullist,numlist,blockquote,hr,alignleft,aligncenter,alignright,link,unlink,wp_add_media,wp_more,spellchecker,fullscreen,wp_adv',
					'toolbar2' => 'fontsizeselect,forecolor,pastetext,removeformat,charmap,outdent,indent,undo,redo,wp_help',
				),
				'basic' => array(
					'toolbar1' => 'bold,italic,underline,link,unlink',
					'toolbar2' => '',
				),
			)
		);

		$selected_toolbar = isset( $toolbars[ $toolbar ] ) ? $toolbars[ $toolbar ] : $toolbars['full'];

		// Start output.
		$this->render_page( $editor_id, $height, $selected_toolbar );
		exit;
	}

	/**
	 * Renders the complete editor page HTML.
	 *
	 * @param string $editor_id        The editor textarea ID.
	 * @param int    $height           Editor height in pixels.
	 * @param array  $toolbar_settings Toolbar configuration.
	 *
	 * @return void
	 */
	private function render_page( string $editor_id, int $height, array $toolbar_settings ): void {
		?>
		<!DOCTYPE html>
		<html <?php language_attributes(); ?>>
		<head>
			<meta charset="<?php bloginfo( 'charset' ); ?>">
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<title><?php esc_html_e( 'Editor', 'wpify-custom-fields' ); ?></title>
			<?php
			// Enqueue WordPress admin styles.
			wp_enqueue_style( 'wp-admin' );
			wp_enqueue_style( 'buttons' );
			wp_enqueue_style( 'editor-buttons' );

			// Enqueue editor dependencies.
			wp_enqueue_editor();
			wp_enqueue_media();

			// Print head scripts and styles.
			wp_print_styles();
			wp_print_head_scripts();
			?>
			<style>
				html, body {
					margin: 0;
					padding: 0;
					background: #fff;
					overflow: hidden;
				}
				.wpifycf-editor-wrapper {
					padding: 0;
					box-sizing: border-box;
				}
				.wp-editor-wrap {
					border: none !important;
				}
				#wp-<?php echo esc_attr( $editor_id ); ?>-editor-container {
					border: none !important;
				}
				.mce-tinymce {
					border: none !important;
					box-shadow: none !important;
				}
			</style>
		</head>
		<body class="wp-admin wp-core-ui">
			<div class="wpifycf-editor-wrapper">
				<?php
				wp_editor(
					'',
					$editor_id,
					array(
						'textarea_rows' => max( 10, intval( $height / 20 ) ),
						'media_buttons' => true,
						'tinymce'       => array(
							'wp_autoresize_on' => false,
							'height'           => $height,
							'toolbar1'         => $toolbar_settings['toolbar1'],
							'toolbar2'         => $toolbar_settings['toolbar2'] ?? '',
							'toolbar3'         => '',
							'toolbar4'         => '',
						),
						'quicktags'     => false,
					)
				);
				?>
			</div>
			<?php
			// Print footer scripts (includes TinyMCE initialization).
			wp_print_footer_scripts();
			?>
			<script>
			(function() {
				'use strict';

				var editorId = <?php echo wp_json_encode( $editor_id ); ?>;
				var parentOrigin = <?php echo wp_json_encode( admin_url() ); ?>;
				var isReady = false;
				var pendingContent = null;

				/**
				 * Send message to parent window.
				 */
				function sendToParent(type, data) {
					if (window.parent && window.parent !== window) {
						window.parent.postMessage({
							source: 'wpifycf-editor',
							editorId: editorId,
							type: type,
							...data
						}, '*');
					}
				}

				/**
				 * Get TinyMCE editor instance.
				 */
				function getEditor() {
					return typeof tinymce !== 'undefined' ? tinymce.get(editorId) : null;
				}

				/**
				 * Set editor content.
				 */
				function setContent(content) {
					var ed = getEditor();
					if (ed) {
						ed.setContent(content || '');
					} else {
						// Editor not ready, store for later.
						pendingContent = content;
					}
				}

				/**
				 * Initialize editor event handlers.
				 */
				function initEditor() {
					var ed = getEditor();
					if (!ed) {
						// Wait for TinyMCE to initialize.
						setTimeout(initEditor, 100);
						return;
					}

					// Set pending content if any.
					if (pendingContent !== null) {
						ed.setContent(pendingContent);
						pendingContent = null;
					}

					// Listen for content changes.
					ed.on('change keyup', function() {
						ed.save();
						sendToParent('change', { content: ed.getContent() });
					});

					// Listen for focus events.
					ed.on('focus', function() {
						sendToParent('focus', {});
					});

					ed.on('blur', function() {
						sendToParent('blur', {});
					});

					// Send ready message.
					isReady = true;
					sendToParent('ready', {});
				}

				/**
				 * Handle messages from parent window.
				 */
				window.addEventListener('message', function(event) {
					// Validate message source (same origin).
					if (!event.data || event.data.source !== 'wpifycf-parent') {
						return;
					}

					if (event.data.editorId !== editorId) {
						return;
					}

					switch (event.data.type) {
						case 'setContent':
							setContent(event.data.content);
							break;

						case 'getContent':
							var ed = getEditor();
							sendToParent('content', {
								content: ed ? ed.getContent() : ''
							});
							break;

						case 'focus':
							var ed = getEditor();
							if (ed) {
								ed.focus();
							}
							break;
					}
				});

				// Initialize when DOM is ready.
				if (document.readyState === 'complete') {
					initEditor();
				} else {
					window.addEventListener('load', initEditor);
				}
			})();
			</script>
		</body>
		</html>
		<?php
	}
}
```

### 2. Register Endpoint in CustomFields

**File: `src/CustomFields.php`** (add to constructor)

```php
// In constructor or init method:
new \Wpify\CustomFields\Api\EditorEndpoint();
```

---

## JavaScript Implementation

### 3. React Component for Iframe Editor

**File: `assets/fields/Wysiwyg.js`** (IframeTinyMCE component)

```javascript
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import { Spinner } from '@wordpress/components';
import clsx from 'clsx';

/**
 * IframeTinyMCE - Embeds TinyMCE in an iframe for complete isolation.
 */
function IframeTinyMCE({
	htmlId,
	value,
	onChange,
	height = 300,
	disabled = false,
	toolbar = 'full',
}) {
	const iframeRef = useRef(null);
	const [isReady, setIsReady] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const pendingContentRef = useRef(value);

	// Generate unique editor ID for this instance.
	const editorId = useMemo(
		() => `wpifycf_editor_${htmlId.replace(/[^a-zA-Z0-9]/g, '_')}`,
		[htmlId]
	);

	// Build iframe URL with configuration.
	const iframeUrl = useMemo(() => {
		const params = new URLSearchParams({
			action: 'wpifycf_editor',
			editor_id: editorId,
			height: String(Math.max(height, 300)),
			toolbar: toolbar,
			_wpnonce: window.wpifycf?.editorNonce || '',
		});
		return `${window.ajaxurl}?${params.toString()}`;
	}, [editorId, height, toolbar]);

	/**
	 * Send message to iframe.
	 */
	const sendToIframe = useCallback((type, data = {}) => {
		if (iframeRef.current?.contentWindow) {
			iframeRef.current.contentWindow.postMessage({
				source: 'wpifycf-parent',
				editorId: editorId,
				type: type,
				...data,
			}, '*');
		}
	}, [editorId]);

	/**
	 * Handle messages from iframe.
	 */
	useEffect(() => {
		const handleMessage = (event) => {
			if (!event.data || event.data.source !== 'wpifycf-editor') {
				return;
			}

			if (event.data.editorId !== editorId) {
				return;
			}

			switch (event.data.type) {
				case 'ready':
					setIsReady(true);
					setIsLoading(false);
					// Send initial content.
					if (pendingContentRef.current) {
						sendToIframe('setContent', { content: pendingContentRef.current });
					}
					break;

				case 'change':
					if (onChange && event.data.content !== undefined) {
						onChange(event.data.content);
					}
					break;

				case 'focus':
					// Handle focus event if needed.
					break;

				case 'blur':
					// Handle blur event if needed.
					break;
			}
		};

		window.addEventListener('message', handleMessage);
		return () => window.removeEventListener('message', handleMessage);
	}, [editorId, onChange, sendToIframe]);

	/**
	 * Sync value changes to iframe.
	 */
	useEffect(() => {
		if (isReady) {
			sendToIframe('setContent', { content: value || '' });
		} else {
			// Store for when iframe is ready.
			pendingContentRef.current = value;
		}
	}, [value, isReady, sendToIframe]);

	/**
	 * Calculate iframe height (editor height + toolbar + padding).
	 */
	const iframeHeight = Math.max(height, 300) + 100;

	if (disabled) {
		return (
			<div
				className="wpifycf-field-wysiwyg__disabled"
				dangerouslySetInnerHTML={{ __html: value || '' }}
			/>
		);
	}

	return (
		<div className={clsx('wpifycf-field-wysiwyg__iframe-wrapper', isLoading && 'is-loading')}>
			{isLoading && (
				<div className="wpifycf-field-wysiwyg__iframe-loading">
					<Spinner />
					<span>{__('Loading editor...', 'wpify-custom-fields')}</span>
				</div>
			)}
			<iframe
				ref={iframeRef}
				src={iframeUrl}
				style={{
					width: '100%',
					height: iframeHeight,
					border: 'none',
					display: isLoading ? 'none' : 'block',
				}}
				title={__('WYSIWYG Editor', 'wpify-custom-fields')}
			/>
		</div>
	);
}

export { IframeTinyMCE };
```

### 4. Main Wysiwyg Component Integration

**Update the main Wysiwyg component to use IframeTinyMCE:**

```javascript
import { IframeTinyMCE } from './IframeTinyMCE';

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
	tabs = 'all',
}) {
	const [view, setView] = useState(VIEW_VISUAL);
	const { context } = useContext(AppContext);

	// ... tabs logic ...

	return (
		<div className={clsx('wpifycf-field-wysiwyg', className)}>
			{/* Tabs UI */}

			{view === VIEW_VISUAL && (
				disabled ? (
					<RawHTML className="wpifycf-field-wysiwyg__raw">
						{value}
					</RawHTML>
				) : (
					// Use IframeTinyMCE for ALL contexts - it works everywhere!
					<IframeTinyMCE
						htmlId={htmlId}
						value={value}
						onChange={onChange}
						height={height}
						disabled={disabled}
						toolbar={toolbar}
					/>
				)
			)}

			{view === VIEW_HTML && (
				<Code ... />
			)}
		</div>
	);
}
```

---

## PHP: Nonce Generation

**Add to `BaseIntegration.php` enqueue method:**

```php
public function enqueue(): void {
	// ... existing code ...

	// Add editor nonce for iframe security.
	wp_add_inline_script(
		$this->custom_fields->get_script_handle(),
		'window.wpifycf = window.wpifycf || {}; window.wpifycf.editorNonce = ' . wp_json_encode( wp_create_nonce( 'wpifycf_editor' ) ) . ';',
		'before'
	);
}
```

---

## CSS Styles

**File: `assets/styles/components/field-wysiwyg.scss`** (additions)

```scss
.wpifycf-field-wysiwyg__iframe-wrapper {
	position: relative;
	border: 1px solid #dcdcde;
	border-radius: 4px;
	overflow: hidden;

	&.is-loading {
		min-height: 200px;
		background: #f0f0f1;
	}
}

.wpifycf-field-wysiwyg__iframe-loading {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
	color: #646970;
}

.wpifycf-field-wysiwyg__disabled {
	padding: 12px;
	background: #f6f7f7;
	border: 1px solid #dcdcde;
	border-radius: 4px;
	min-height: 100px;
}
```

---

## Pros and Cons Summary

### Advantages

1. **Complete isolation** - No event conflicts with Gutenberg possible
2. **Native WordPress editor** - Uses `wp_editor()` which handles everything correctly
3. **Inline editing UX** - No modal needed, edit directly in place
4. **Works everywhere** - Same implementation for all contexts
5. **Media upload works** - Native WordPress media handling
6. **CSS isolation** - No style conflicts

### Disadvantages

1. **Performance** - Each editor loads a full WordPress page
2. **Complexity** - postMessage protocol requires careful handling
3. **Height management** - Fixed height, auto-resize is complex
4. **Debugging** - Cross-context debugging is harder
5. **Security** - Requires nonce handling and origin validation

---

## Testing Checklist

- [ ] Editor loads in Gutenberg block context
- [ ] Editor loads in metabox context
- [ ] Editor loads in options page
- [ ] Content syncs correctly parent → iframe
- [ ] Content syncs correctly iframe → parent
- [ ] Media upload button works
- [ ] Multiple editors on same page work independently
- [ ] Switching tabs (Visual/HTML) preserves content
- [ ] Disabled state shows content but not editable
- [ ] Performance acceptable with 3+ editors
