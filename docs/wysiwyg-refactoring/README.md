# WYSIWYG Field Refactoring

This folder contains detailed implementation plans for three different approaches to rewriting the WYSIWYG field in WPify Custom Fields. Each approach addresses the core issue: **TinyMCE conflicts with Gutenberg's block editor event handling**.

## The Problem

When using TinyMCE inside Gutenberg blocks:
1. Click events propagate to Gutenberg, causing block selection issues
2. Drag events can trigger multi-block selection
3. Focus management conflicts between editor systems
4. Keyboard shortcuts may be intercepted by Gutenberg

## Critical: Gutenberg Iframe vs Non-Iframe Mode

Since WordPress 5.9+ (default in 6.0+), Gutenberg can render the block editor in two modes:

1. **Direct rendering**: Block editor renders directly in admin page DOM
2. **Iframe rendering** (`editor-canvas`): Block editor content renders inside an iframe

When using iframe mode, your WYSIWYG component is **inside** that iframe, which affects:

- `window` refers to the iframe's window, not the parent admin page
- `tinyMCEPreInit` and other WordPress globals may be in the **parent** window
- Media library dialogs may render in the parent context
- Event propagation stays within the iframe

### Detection Code

```javascript
/**
 * Detect if we're inside Gutenberg's editor-canvas iframe.
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
 * Get TinyMCE settings - handles iframe context.
 */
function getTinyMCESettings() {
    // First try current window
    if (typeof tinyMCEPreInit !== 'undefined') {
        return tinyMCEPreInit;
    }

    // If in iframe, try parent window
    if (isInsideEditorIframe()) {
        try {
            return window.parent.tinyMCEPreInit;
        } catch (e) {
            console.warn('Cannot access parent tinyMCEPreInit');
        }
    }

    return null;
}
```

### Approach Compatibility with Iframe Mode

| Approach | Iframe Mode | Issues | Solution |
|----------|-------------|--------|----------|
| **Iframe + postMessage** | ⚠️ Partial | Nested iframe complexity | May need to communicate with parent window |
| **Inline + Event Stops** | ⚠️ Partial | TinyMCE settings in parent | Access settings from parent window |
| **Modal** | ⚠️ Partial | Modal may clip to iframe | Use parent window's modal or adjust z-index |

**All three approaches need modification to handle both modes.**

## Implementation Approaches

### 1. [Iframe + postMessage](./01-iframe-postmessage.md)

Embeds TinyMCE in an iframe that loads a special WordPress AJAX endpoint. Communication happens via `postMessage` API.

| Aspect | Rating |
|--------|--------|
| **Isolation** | Complete |
| **UX** | Inline editing |
| **Complexity** | High |
| **Performance** | Slower (page load per editor) |

**Best for**: Maximum reliability when other approaches fail.

---

### 2. [Inline + Event Stops](./02-inline-event-stops.md)

Renders TinyMCE directly inline but wraps in an event-catching container that prevents propagation to Gutenberg.

| Aspect | Rating |
|--------|--------|
| **Isolation** | Partial |
| **UX** | Inline editing |
| **Complexity** | Low |
| **Performance** | Fast |

**Best for**: Simplest solution with best user experience.

---

### 3. [Modal Approach](./03-modal-approach.md)

Shows content preview inline, opens TinyMCE in a WordPress modal dialog when clicked. This is what ACF/SCF use.

| Aspect | Rating |
|--------|--------|
| **Isolation** | Complete |
| **UX** | Click-to-edit |
| **Complexity** | Medium |
| **Performance** | Fast |

**Best for**: Proven reliability, following established patterns.

---

## Quick Comparison

| Feature | Iframe | Inline + Events | Modal |
|---------|--------|-----------------|-------|
| Event isolation | 100% | ~95% | 100% |
| Inline editing | Yes | Yes | No |
| Click to edit | No | No | Yes |
| Media upload | Challenging | Works | Works |
| Performance | Slow | Fast | Fast |
| Implementation | Complex | Simple | Medium |
| Battle-tested | No | Partial (SCF fix) | Yes (ACF/SCF) |

---

## Shared Components

All three approaches share these PHP components:

### Hidden Editor Pattern

```php
public function print_wysiwyg_scripts(): void {
    ?>
    <div id="wpifycf-hidden-wp-editor" style="display: none;">
        <?php wp_editor( '', 'wpifycf_content', array( ... ) ); ?>
    </div>
    <?php
}
```

### Toolbar Configuration

```php
public function localize_wysiwyg_toolbars(): void {
    $toolbars = apply_filters( 'wpifycf_wysiwyg_toolbars', array(
        'full' => array( ... ),
        'basic' => array( ... ),
    ) );

    wp_add_inline_script( $handle, 'window.wpifycf_wysiwyg_toolbars = ...' );
}
```

### TinyMCE Manager (JavaScript)

All approaches use a similar `TinyMCEManager` object for lifecycle management:

```javascript
const TinyMCEManager = {
    getDefaults(),
    isAvailable(),
    initialize(id, options),
    destroy(id),
    get(id),
};
```

---

## Testing Recommendations

1. **Test all contexts**: Gutenberg block, metabox, options page, taxonomy, repeater
2. **Test interactions**: Click, drag, type, keyboard shortcuts
3. **Test lifecycle**: Mount, unmount, rapid add/remove
4. **Test content**: Empty, short, very long, special characters
5. **Test performance**: Multiple editors on same page

---

## Files to Modify (All Approaches)

1. `assets/fields/Wysiwyg.js` - Main field component
2. `src/Integrations/BaseIntegration.php` - PHP hooks and configuration
3. `assets/styles/components/field-wysiwyg.scss` - Styles

---

## Final Recommendation

For **inline editing** (no modal), the recommended approach is:

### **Inline + Event Stops** ([02-inline-event-stops.md](./02-inline-event-stops.md))

This provides the best balance of:

| Factor | Assessment |
|--------|------------|
| **UX** | Best - true inline editing, no extra clicks |
| **Complexity** | Low - simpler than iframe approach |
| **Performance** | Fast - no additional page loads |
| **Reliability** | Good - based on proven SCF technique |
| **Iframe mode support** | Yes - with iframe-aware TinyMCE manager |

### Why Not the Others?

| Approach | Reason to Avoid |
|----------|-----------------|
| **Iframe + postMessage** | Too complex for the benefit; nested iframes in Gutenberg iframe mode; performance overhead |
| **Modal** | Good fallback, but UX compromise (requires click to open) |

### Key Implementation Points

1. **Iframe-aware TinyMCE access** - Use `getTinyMCEWindow()` to access parent window in iframe mode
2. **Event isolation wrapper** - Stop propagation + dispatch synthetic mouseup (SCF fix)
3. **Direct element targeting** - Use `init.target` instead of `init.selector` in iframe mode
4. **Hidden editor pattern** - Ensure TinyMCE settings are available

### Risk Mitigation

If inline has issues in specific edge cases, implement a fallback to Modal:

```javascript
if (context === 'gutenberg' && forceModal) {
    return <ModalTinyMCE {...props} />;
}
return <EventIsolationWrapper><TinyMCE {...props} /></EventIsolationWrapper>;
```

---

## Implementation Steps

1. Implement **Inline + Event Stops** from `02-inline-event-stops.md`
2. Test in both Gutenberg modes (iframe and non-iframe)
3. Test in all other contexts (metabox, options page, etc.)
4. If issues arise, consider Modal fallback for specific contexts
