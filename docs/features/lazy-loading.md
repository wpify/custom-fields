# Lazy Data Loading

WPify Custom Fields loads remote field data lazily: a field only calls the REST API once it is actually visible to the user. This minimizes server load when an admin page contains many fields, or when several admin pages are opened at the same time in background browser tabs.

Lazy loading is built in, always on, and requires no configuration.

## What is lazy-loaded

All field types that fetch data on mount are gated the same way:

- `select` / `multi_select` with `options_key` — the async option list and the label resolution for stored values
- `post` / `multi_post` — the post option list
- `term` / `multi_term` — the term list
- `attachment` / `multi_attachment` — attachment details from the media library
- `link` — URL title resolution
- `direct_file` / `multi_direct_file` — file info
- Gutenberg blocks — the server-side render preview (see below)

Calls triggered directly by user input (for example typing a search query) are not delayed — interacting with a field always loads its data immediately.

## When a field starts loading

A field becomes *loadable* when all of the following hold:

1. **It is rendered** — fields on an inactive tab or hidden by [conditional logic](conditions.md) are not mounted and never fetch (this was already the case before lazy loading).
2. **It is in the viewport** — the field intersects the visible area of the page, extended by a 200px vertical margin so data starts loading shortly before the field scrolls into view. Fields inside collapsed metaboxes, collapsed repeater items, or other hidden containers do not count as in the viewport.
3. **The browser tab is visible** — pages opened in background browser tabs load no field data until they are first shown.

To avoid loading everything when the user quickly scrolls past (for example jumping to a Save button at the bottom of a long page), a field must stay in the viewport for 200ms before it starts loading.

Focusing a field (by click or keyboard) loads it immediately, bypassing all of the above.

Once a field has started loading, it stays active for good: scrolling away or switching browser tabs does not unload data or cause refetching.

## Gutenberg block previews

The server-side render preview of a Gutenberg block is gated *continuously* instead of once: render requests are only made while the block is visible in the editor canvas. Editing a block's attributes (for example from the sidebar inspector) while the block is scrolled off-canvas does not trigger renders; the preview catches up with a single request when the block scrolls back into view. The previous preview stays on screen while a new one is being rendered.

## What you may notice

- A page opened in a background browser tab shows loading placeholders until it is first viewed; data then loads for the fields in view.
- `select` / `multi_select` fields always display the correct label for their stored value immediately, because labels are pre-resolved server-side during page render — no request needed.
- `post`, `term`, `attachment`, `link`, and `direct_file` fields show their stored value's preview only after the field becomes visible. Collapsed `multi_group` item headers whose title comes from such a field show the `#1`, `#2`, … fallback until the item is expanded.

## For custom field types

Custom field components rendered through the standard `Field` dispatcher inherit lazy loading automatically when they use the shared data hooks (`useOptions`, `usePosts`, `useTerms`, `useAttachment`, and so on) from `assets/helpers/hooks.js` — see [Extending](extending.md). When these hooks are used outside a field context, they load eagerly as before.

To gate a custom data source the same way, read the loadable state directly:

```js
import { useLoadable } from '@/helpers/visibility';

function MyField ( props ) {
	const loadable = useLoadable();
	// Only start fetching when `loadable` is true.
}
```
