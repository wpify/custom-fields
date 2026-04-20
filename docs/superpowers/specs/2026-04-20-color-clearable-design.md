# Clearable Color Field — Design Spec

**Date:** 2026-04-20
**Scope:** `assets/fields/Color.js` (and one new SCSS file)

## Problem

The Color field type wraps a native `<input type="color">`. Native color inputs always carry a value (browsers default to `#000000` when none is provided), so users have no way to return a Color field to an empty state through the UI. The PHP side already accepts empty values — `sanitize_hex_color('')` returns `null`, and stored empty strings round-trip fine — but there is no UI affordance to reach that state after a color has been picked.

## Goal

Make the Color field clearable through the UI when the field is not required, with an unambiguous visual indicator for the empty state.

## Non-goals

- No change to the PHP sanitization or storage pipeline.
- No new field prop or PHP API. Clearability is derived from the existing `required` prop.
- No new shared component or abstraction. The fix is scoped to the Color field only; other native-input fields (Date, Number, Text, etc.) are not affected.
- No changes to validation helpers.

## Decisions

1. **Clearable when `!field.required`.** Required Color fields show no clear affordance and behave exactly as today. Non-required fields become clearable.
2. **Clear affordance is an `IconButton`** rendered next to the swatch, matching the visual language of `Attachment.js`. Icon: `trash` (already mapped in `components/IconButton.js`).
3. **Empty state is a checkerboard overlay on the swatch.** The swatch stays visible (picker one click away), but its inner color patch shows a CSS-gradient checkerboard so "no value set" is distinguishable from "value is black".

## Design

### Component shape (`assets/fields/Color.js`)

```jsx
<span
  className={clsx(
    'wpifycf-field-color-wrapper',
    { 'wpifycf-field-color-wrapper--empty': !value },
  )}
>
  <input
    type="color"
    id={htmlId}
    onChange={handleChange}
    value={value || '#000000'}
    className={clsx(
      'wpifycf-field-color',
      `wpifycf-field-color--${id}`,
      attributes.class,
      className,
    )}
    disabled={disabled}
    {...attributes}
  />
  {!required && value && !disabled && (
    <IconButton
      icon="trash"
      onClick={handleClear}
      className="wpifycf-field-color__clear"
      style="light"
    />
  )}
</span>
```

- Destructure `required` from props (matches the pattern used in `Number.js`, etc.).
- `handleClear = useCallback(() => onChange(''), [onChange])`.
- The empty-state wrapper class drives the checkerboard styling (see SCSS below).
- `value || '#000000'` is passed to the native input so React does not warn about an invalid/empty `value` attribute on `type="color"`. The *stored* value stays `""`; the fallback is only for the DOM attribute when empty.
- `disabled` still suppresses the clear icon — clearing a disabled field would be surprising.

### Styles (new file `assets/styles/components/field-color.scss`)

- `.wpifycf-field-color-wrapper` — `display: inline-flex; align-items: center; gap: var(--wpifycf-gap-1);` (4px token defined in `assets/styles/components/variables.scss`).
- `.wpifycf-field-color-wrapper--empty` — apply checkerboard to the native swatch's inner color patch via:
  - `::-webkit-color-swatch` (Chromium / Safari)
  - `::-moz-color-swatch` (Firefox)
  - Checkerboard via two `linear-gradient(45deg, ...)` backgrounds offset with `background-position` — standard CSS-only transparency indicator, ~8 lines.
- Single import added to `assets/styles/custom-fields.scss`.

### PHP

No changes. Verified:
- `src/CustomFields.php:424` runs `sanitize_hex_color()`, which returns `null` for empty or invalid input. Empty strings are written as empty meta values and read back as `''`, which React renders as "no value" → empty-state styling.
- `src/FieldFactory.php:640` already accepts the shared field definition; `required` flows through.

### Validation

`Color.checkValidity = checkValidityStringType` stays. The existing implementation already returns a "This field is required" error when `field.required && value === ''`, so:
- Required → clear icon hidden → cannot reach empty via UI → validator fires only on programmatic/default-missing cases (unchanged behavior).
- Not required → clear icon shown → clearing yields `''` → validator passes (no `required`).

No validator changes.

### Docs

Amend `docs/field-types/color.md` with a short note under **Notes**: non-required Color fields display a clear icon that resets the stored value to an empty string. Required fields cannot be cleared through the UI.

## Files touched

| File | Change |
|---|---|
| `assets/fields/Color.js` | Add clear affordance, empty-state wrapper, `required` prop destructure, `handleClear` callback, DOM-value fallback. |
| `assets/styles/components/field-color.scss` | **New.** Wrapper layout + checkerboard empty state. |
| `assets/styles/custom-fields.scss` | Add one `@use` / `@import` line for the new partial. |
| `docs/field-types/color.md` | Add short note about clearability. |

## Verification plan

No automated test suite exists for field components. Manual verification after `npm run build`:

1. Non-required Color field, no stored value → swatch shows checkerboard, no clear icon.
2. Pick a color → checkerboard disappears, clear icon appears, value saves to DB.
3. Click clear icon → value returns to `""`, checkerboard returns, clear icon hidden, save persists empty.
4. Required Color field → no clear icon regardless of value; behavior matches current production.
5. `disabled` Color field → no clear icon.
6. Run `get_diagnostics` on `Color.js` after edit to confirm no introduced errors.

## Risks

- **Browser rendering of `::-webkit-color-swatch` / `::-moz-color-swatch` padding.** Some browsers apply internal padding to the swatch; checkerboard may show a small gutter. Acceptable — the gutter is typically the system border color, and the empty state is still clearly different from a solid color. If it proves distracting during verification, we can extend the checkerboard to the input background as well.
- **Existing stored `#000000` values become indistinguishable from "black by default"** only for fields that had a value cleared after this ships. Since the stored value is the authoritative source and `#000000` renders as a solid black swatch (no checkerboard), this is not actually ambiguous — the UI distinguishes "value == #000000" from "value == ''" correctly.

## Out of scope / deferred

- Generalizing clearability to other native-input field types. Only Color has the "always has a value" quirk; other fields (Date, Number, Text) already render as empty when the value is empty. If a second field ever needs this treatment, extract a shared wrapper at that point.
