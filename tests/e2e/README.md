# E2E Smoke set

Browser end-to-end tests for WPify Custom Fields, run with Playwright against a
real WordPress install. This is the top of the test hourglass (see
`docs/adr/0002-two-axis-test-strategy.md`): the only layer that runs in a real
browser, kept deliberately small.

## The Smoke-set contract

The Smoke set is **exactly eight specs**. It is a fixed contract, not a
catch-all — each spec covers a distinct surface or Named exception that the PHP
and JS layers cannot reach:

| Spec | What it proves |
|---|---|
| `all-types-render.spec.js` | The whole field-type catalogue mounts on the Options surface with zero console errors. |
| `options-round-trip.spec.js` | Options save/reload persists text, number, toggle, async select, date. |
| `metabox-round-trip.spec.js` | Post metabox fields save and reload. |
| `gutenberg-block.spec.js` | Gutenberg controlled-state path: edit an attribute, server-side preview, persist. |
| `multi-group.spec.js` | `multi_group` nested value shape: add, reorder, remove, persist. |
| `wc-variation-round-trip.spec.js` | WooCommerce variation index-suffixed names, saved via WC AJAX. |
| `conditions.spec.js` | Conditional hide + the `data-hide-field` submit contract. |
| `validation.spec.js` | Required-field validation blocks submission. |

**Growth requires removing or justifying a spec, not appending.** Adding a ninth
spec means either dropping one, or updating the ADR and CONTEXT.md "Smoke set"
definition with the rationale. If a spec needs a field/condition the fixture
lacks, extend the fixture (`tests/fixtures/wcf-demo`) minimally rather than
contorting the spec.

## Running locally

### Against wp-env (canonical)

wp-env is the canonical environment; it runs alongside DDEV on its own ports
(dev `8888`, tests `8889`). The plugin is mounted as a live directory, so its
built assets must exist first.

```bash
npm run build            # build/ must exist — wp-env mounts the plugin live
npm run wp-env start     # first run downloads WordPress core + WooCommerce
npm run test:e2e         # runs all 8 specs against http://localhost:8889
```

Useful extras:

```bash
npm run test:e2e -- multi-group   # a single spec
npm run test:e2e:ui               # Playwright UI mode
npm run wp-env stop               # stop the containers
```

Default admin credentials are `admin` / `password` (wp-env).

### Against the DDEV dev site

Point the suite at any other WordPress install with `WP_BASE_URL`, and override
the admin credentials (DDEV seeds `admin` / `admin`):

```bash
WP_BASE_URL="https://customfields.wpmn.cz" \
WP_USERNAME=admin WP_PASSWORD=admin \
npm run test:e2e
```

The DDEV site already has the plugin and the `wcf-demo` fixture active (see
`dev/README.md`), so no wp-env is needed for that path.

## How it is wired

- `../../.wp-env.json` — WordPress core pin, PHP 8.1, WooCommerce, and the two
  local plugins mapped in (`.` as `wpify-custom-fields`, `tests/fixtures/wcf-demo`).
- `../../playwright.config.js` — single chromium project, serial (one worker,
  shared site state), `baseURL` from `WP_BASE_URL` (default `http://localhost:8889`),
  retries + trace-on-retry in CI.
- `config/global-setup.js` — logs in once, stores the auth state, activates the
  mapped plugins (WCF before the demo, which requires it), sets pretty permalinks.
- `helpers/` — shared selectors and flows for the showcase options page and the
  block editor.

Artifacts (reports, traces, the stored auth state) are written to
`tests/e2e/artifacts/` (gitignored).
