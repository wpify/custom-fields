# Context: WPify Custom Fields

Glossary of domain terms. Terms are capitalized when used in their glossary sense.

## Field visibility & lazy data loading

- **Hidden field** — a field whose component is not mounted at all: it is on an
  inactive WCF tab, its conditions evaluate false, or its type is `hidden`.
  Only its hidden `<input>` is rendered. A Hidden field makes no API calls.
- **Loadable** — the state in which a field is allowed to start fetching remote
  data. A field is Loadable when it is (1) mounted (not Hidden), (2) its
  sentinel element intersects the viewport extended by the Preload margin, and
  (3) the document is visible (browser tab/window in foreground).
- **Preload margin** — the distance around the viewport within which a field
  already counts as intersecting, so it starts loading shortly before it
  scrolls into actual view.
- **Dwell** — the short period a field must remain intersecting before it
  becomes Loadable. Prevents fast scrolling from activating every field passed
  along the way.
- **Latch** — once a field has become Loadable, it stays activated permanently
  for its lifetime; scrolling away or backgrounding the tab never disables or
  refetches its data. Applies to all field data loading. Exception: the
  Gutenberg block preview (render-block) is continuously gated instead,
  because it re-fires on attribute changes rather than loading once.
- **Focus bypass** — user interaction (focus) with a field latches it
  immediately, skipping both Dwell and viewport intersection. An interacted
  field is by definition visible and must never wait for its data.
- **Placeholder reserve** — the height a not-yet-rendered Gutenberg block
  preview reserves on screen, so the blocks below it stay outside the viewport
  gate instead of all counting as visible at once. Applies only before a
  block's first render; once real content arrives it takes over the space.
