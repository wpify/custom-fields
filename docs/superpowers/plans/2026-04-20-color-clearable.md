# Clearable Color Field Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Color field type clearable through the UI when `field.required` is falsy, with a checkerboard visual indicator for the empty state.

**Architecture:** Scoped change to `assets/fields/Color.js` only — wrap the native `<input type="color">` and an `IconButton` clear control in a new flex wrapper, derive clearability from the existing `required` prop, and add a `--empty` modifier class that drives a CSS-gradient checkerboard on the swatch. No PHP, no validator, no new shared component, no new field prop.

**Tech Stack:** React 18, WordPress `@wordpress/hooks` / `@wordpress/icons` / `@wordpress/i18n`, SCSS, Webpack via `@wordpress/scripts`.

**Branch note:** This plan runs on `master`. Per the user's global CLAUDE.md, do **not** commit at the end of individual tasks. Make exactly one commit at the very end (Task 7) that includes the spec file under `docs/superpowers/specs/` plus all code / SCSS / docs changes.

**Spec:** `docs/superpowers/specs/2026-04-20-color-clearable-design.md`

---

## File Structure

| Path | Create / Modify | Responsibility |
|---|---|---|
| `assets/fields/Color.js` | Modify | Add wrapper span, `required` destructure, `handleClear` callback, conditional `IconButton`, empty-state modifier class, DOM-value fallback. |
| `assets/styles/components/field-color.scss` | Create | Wrapper layout + checkerboard empty-state styling for `::-webkit-color-swatch` and `::-moz-color-swatch`. |
| `assets/styles/custom-fields.scss` | Modify | Add `@use "components/field-color";` line. |
| `docs/field-types/color.md` | Modify | Append one paragraph under **Notes** describing clearability. |

All paths are relative to `wp-content/plugins/wpify-custom-fields/`.

---

## Task 1: Update `Color.js` to render the clear affordance

**Files:**
- Modify: `assets/fields/Color.js` (full file rewrite — it is only ~35 lines)

- [ ] **Step 1: Replace the file with the clearable implementation**

Overwrite `wp-content/plugins/wpify-custom-fields/assets/fields/Color.js` with:

```jsx
import { useCallback } from 'react';
import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { checkValidityStringType } from '@/helpers/validators';
import { useFieldTitle } from '@/helpers/hooks';
import { IconButton } from '@/components/IconButton';

function Color ({
  id,
  htmlId,
  onChange,
  value = '',
  attributes = {},
  disabled = false,
  required = false,
  className,
  setTitle,
}) {
  useFieldTitle(setTitle, value);
  const handleChange = useCallback(event => onChange(event.target.value), [onChange]);
  const handleClear = useCallback(() => onChange(''), [onChange]);
  const isEmpty = !value;
  const showClear = !required && !disabled && !isEmpty;

  return (
    <span
      className={clsx(
        'wpifycf-field-color-wrapper',
        { 'wpifycf-field-color-wrapper--empty': isEmpty },
      )}
    >
      <input
        type="color"
        id={htmlId}
        onChange={handleChange}
        value={value || '#000000'}
        className={clsx('wpifycf-field-color', `wpifycf-field-color--${id}`, attributes.class, className)}
        disabled={disabled}
        {...attributes}
      />
      {showClear && (
        <IconButton
          icon="trash"
          onClick={handleClear}
          className="wpifycf-field-color__clear"
          style="light"
        />
      )}
    </span>
  );
}

Color.checkValidity = checkValidityStringType;

export default Color;
```

Notes for the implementer:
- `IconButton` is imported from `@/components/IconButton`; its `icon` prop maps `"trash"` to `@wordpress/icons`' `trash` (see `assets/components/IconButton.js`). There is no `title` prop on `IconButton` — do not pass one. A11y label can be added in a follow-up if needed; scope here is the clearability behavior.
- `required` defaults to `false` so existing usages (that do not pass it) behave as "clearable allowed". `required` is forwarded from the field definition through `Field.js`' `{...props}` spread (see `assets/components/Field.js:103-117`).
- The `value || '#000000'` fallback applies **only** to the rendered DOM attribute to prevent React warnings about invalid `value=""` on `type="color"`. The stored value (in `AppContext`) stays `""`. Do not pipe the fallback back through `onChange`.
- The previous `addFilter('wpifycf_field_color', …)` registration (if it was present in the old file you are replacing) is already handled elsewhere — this file is imported from `assets/fields/index.js` and wired via `getFieldComponentByType`. Do not add a fresh `addFilter` call here; the original file did not have one either.
- Remove the unused `addFilter` import; the new file does not need it.

- [ ] **Step 2: Verify diagnostics on the edited file**

Use the `mcp__cclsp__get_diagnostics` tool on `wp-content/plugins/wpify-custom-fields/assets/fields/Color.js`.

Expected: zero errors / zero warnings attributable to this change. If cclsp reports unresolved imports for `@/components/IconButton`, `@/helpers/hooks`, `@/helpers/validators`, or `@wordpress/i18n`, those are pre-existing alias/resolver limitations in the language server — ignore them as long as similar imports in sibling files (e.g. `Attachment.js`) produce the same advisories.

- [ ] **Step 3: Do not commit.** Per the branch rule at the top of this plan, this task ends without a commit. Leave the modified file in the working tree.

---

## Task 2: Create `field-color.scss`

**Files:**
- Create: `assets/styles/components/field-color.scss`

- [ ] **Step 1: Write the new SCSS partial**

Create `wp-content/plugins/wpify-custom-fields/assets/styles/components/field-color.scss` with the exact contents:

```scss
.wpifycf-field-color-wrapper {
  display: inline-flex;
  align-items: center;
  gap: var(--wpifycf-gap-1);
}

.wpifycf-field-color-wrapper--empty {
  input[type="color"]::-webkit-color-swatch {
    background:
      linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%) 0 0 / 10px 10px,
      linear-gradient(45deg, #ccc 25%, #fff     25%, #fff     75%, #ccc 75%) 5px 5px / 10px 10px;
  }

  input[type="color"]::-moz-color-swatch {
    background:
      linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%) 0 0 / 10px 10px,
      linear-gradient(45deg, #ccc 25%, #fff     25%, #fff     75%, #ccc 75%) 5px 5px / 10px 10px;
  }
}
```

Notes:
- The checkerboard uses two 45° gradients offset against each other — a standard CSS-only transparency indicator. 10px tile size looks correct on the default WP admin swatch; no need to parameterise.
- `--wpifycf-gap-1` resolves to `4px` (see `assets/styles/components/variables.scss:4`). The token is already imported at the root of `custom-fields.scss` via `@use "components/variables";`, so referencing it here works without an explicit `@use` because CSS custom properties are runtime, not scoped by Sass modules.
- Webkit and Firefox need separate selectors — they cannot be combined into one rule (any browser that does not understand a selector invalidates the whole rule).
- No dark-mode / container-query overrides — the solid `#ccc`/`#fff` pair is readable on both `--wpifycf-grey` and white backgrounds used elsewhere in the plugin.

- [ ] **Step 2: Do not commit.** Leave the new file in the working tree.

---

## Task 3: Register the new partial in `custom-fields.scss`

**Files:**
- Modify: `assets/styles/custom-fields.scss`

- [ ] **Step 1: Add the `@use` line**

In `wp-content/plugins/wpify-custom-fields/assets/styles/custom-fields.scss`, add a single new line after the existing `@use "components/field-checkbox";` line (line 14 in the current file), so the imports stay roughly alphabetical within the `field-*` group:

Exact insertion — place this new line between line 14 and line 15:

```scss
@use "components/field-color";
```

The resulting file should contain (partial excerpt for orientation):

```scss
@use "components/field-attachment";
@use "components/field-columns";
@use "components/field-checkbox";
@use "components/field-color";
@use "components/field-cloudflare";
@use "components/field-date-range";
```

- [ ] **Step 2: Do not commit.**

---

## Task 4: Document the new behavior

**Files:**
- Modify: `docs/field-types/color.md`

- [ ] **Step 1: Append a clearability note under the existing "Notes" section**

Find the `## Notes` section at the end of `wp-content/plugins/wpify-custom-fields/docs/field-types/color.md`. After the existing bullet "`This field is useful for creating customizable color schemes for themes or for allowing users to specify custom brand colors`", add a new bullet:

```markdown
- When `required` is not set (or is `false`), the field displays a clear icon next to the swatch once a color has been picked. Clicking it resets the stored value to an empty string. Required fields do not show the clear icon.
```

No other changes to this file.

- [ ] **Step 2: Do not commit.**

---

## Task 5: Build assets

**Files:** None — generated output will land in `build/`.

- [ ] **Step 1: Run the production build**

From `wp-content/plugins/wpify-custom-fields/`:

```bash
npm run build
```

Expected: webpack exits `0`. Build artifacts under `build/` will update. These are already under `git status` modification (pre-existing dirty state), so the final commit will include them as part of the normal bundle refresh.

If webpack errors: read the trace, fix the offending file, re-run. Likely culprits if something fails:
- Typo in the JSX in Task 1.
- Sass parse error in Task 2 (e.g. missing semicolon).
- Missed the `@use` line in Task 3 (would not error, but the checkerboard would be missing in the browser).

- [ ] **Step 2: Do not commit yet.**

---

## Task 6: Manual verification

**Files:** None — this is runtime / visual check only.

No JS test suite exists for field components; this is the substitute.

- [ ] **Step 1: Load an admin screen that renders a non-required Color field with no stored value.**

Expected: swatch shows checkerboard (not solid black), no clear icon visible.

- [ ] **Step 2: Click the swatch, pick a color, close the picker, save the screen.**

Expected: after save, the page reloads (or the field re-renders) with the picked color as a solid swatch, and a small trash-icon button now appears to the right of the swatch. Value persists in the database.

- [ ] **Step 3: Click the clear (trash) icon, then save.**

Expected: after save, the page reloads with checkerboard swatch again, no clear icon, stored value in DB is `''` (empty string).

- [ ] **Step 4: Load a required Color field.**

Expected: clear icon never appears, regardless of whether a value is set.

- [ ] **Step 5: Load a disabled Color field with a value.**

Expected: clear icon does not appear (disabled suppresses it per the `showClear` guard).

- [ ] **Step 6: If any of the above fails, do not proceed to Task 7.** Fix the cause, re-run `npm run build`, repeat verification from Step 1.

---

## Task 7: Single bundled commit

**Files:** All changes from Tasks 1–5 plus the spec file.

- [ ] **Step 1: Review what will be committed**

From `wp-content/plugins/wpify-custom-fields/`:

```bash
git status --short
```

Expected new / modified entries (pre-existing `build/*` modifications will also be included — that is acceptable because they have been refreshed by Task 5):

```
 M assets/fields/Color.js
 M assets/styles/custom-fields.scss
?? assets/styles/components/field-color.scss
 M docs/field-types/color.md
?? docs/superpowers/plans/2026-04-20-color-clearable.md
?? docs/superpowers/specs/2026-04-20-color-clearable-design.md
 M build/...            (refreshed by npm run build)
```

- [ ] **Step 2: Stage the specific files**

Do not use `git add -A` — there are unrelated `build/*.map` files already present. Stage only the deliberate paths plus the freshly refreshed build outputs:

```bash
git add \
  assets/fields/Color.js \
  assets/styles/custom-fields.scss \
  assets/styles/components/field-color.scss \
  docs/field-types/color.md \
  docs/superpowers/specs/2026-04-20-color-clearable-design.md \
  docs/superpowers/plans/2026-04-20-color-clearable.md \
  build/
```

- [ ] **Step 3: Create the single commit**

Use a conventional commit message describing the whole feature:

```bash
git commit -m "$(cat <<'EOF'
feat(color): make non-required color field clearable

Adds a trash-icon clear control and checkerboard empty-state indicator
to the Color field. Clearability is derived from the existing `required`
prop — non-required fields become clearable, required fields are
unchanged. No PHP, validator, or API changes.

Includes the brainstorming spec and implementation plan under
docs/superpowers/.
EOF
)"
```

- [ ] **Step 4: Verify the commit**

```bash
git log --oneline -1
git show --stat HEAD
```

Expected: one new commit listing all the files from Step 2 as modified or added.

---

## Self-review notes (for the implementer)

This plan intentionally departs from the superpowers default "commit per task" structure because the user's global CLAUDE.md overrides that default on `master` (single final commit bundling the spec + code). The `Step: Commit` sub-step that the plan template usually ends each task with has been replaced by explicit `Do not commit` reminders. Task 7 is the only commit step.

No automated tests are added. The project has no JS test suite for field components and this change is narrowly visual/behavioral — the manual verification steps in Task 6 are the acceptance criteria.
