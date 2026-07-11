# Frontend Accessibility

Target: **WCAG 2 Level AA**. No accessibility library — native HTML semantics
plus required `aria-*` attributes only.

## Semantic HTML map

| Page | Landmarks |
|---|---|
| `Login` | `<main>` wrapping one `<form>` — no `<nav>` |
| `Register` | same as `Login` |
| `Dashboard` | `<nav>` + `<main>` with `<section aria-label="Search and filters">` and `<section aria-label="Vehicle inventory">` |
| `Admin` | `<nav>` + `<main>` with `<section aria-label="Vehicle inventory management">`; modal is `<div role="dialog" aria-modal="true">` |
| `NotFound` | `<main>` only |

All interactive controls must be `<button type="button">` or `type="submit"`.
Never `<div onClick>`.

## Forms — labels and errors

Every input must have `<label htmlFor="<id>">`. Associate server errors with
`aria-describedby`:

```jsx
<label htmlFor="password">Password</label>
<input
  id="password"
  type="password"
  aria-describedby={error ? "password-error" : undefined}
/>
{error && <p id="password-error" role="alert">{error}</p>}
```

`VehicleForm` uses native constraints (`required`, `min="0"`, `type="number"`).

## Disabled Purchase button

```jsx
<button disabled={vehicle.quantity === 0}>
  {vehicle.quantity === 0 ? "Out of stock" : "Purchase"}
</button>
```

Visible text change required — do not communicate state with color alone
(WCAG 1.4.1).

## Focus and keyboard

Visible focus ring: `focus-visible:ring-2 ring-blue-600` (~5.2:1 contrast
on white, exceeds 3:1 WCAG 1.4.11 minimum).

Use native keyboard behavior — no custom `tabIndex` or key handlers except
the Admin modal trap.

### Admin modal focus trap

One `useEffect` in `Admin.jsx`:

- On open: focus first focusable element.
- `Escape`: close modal.
- `Tab`/`Shift+Tab`: cycle within modal.
- On unmount: return focus to the triggering button.

## SVGs

**Decorative** (adjacent text supplies meaning): `aria-hidden="true"`

```jsx
<img src="/svgs/sedan.svg" alt="" aria-hidden="true" />
<span>Sedan</span>
```

**Meaningful** (illustrations): descriptive `alt` text.

```jsx
<img src={image} alt="Empty inventory" />
```

`vehicle-placeholder.svg`: `alt=""` (card text identifies the vehicle).
Navbar logo link: `aria-label="Go to dashboard"`.

## Color contrast

| Pair | Computed ratio | Requirement | Result |
|---|---|---|---|
| `slate-900` on `white`/`slate-50` | ~17.9:1 / ~17.1:1 | 4.5:1 | pass |
| `white` on `blue-600` | ~5.2:1 | 4.5:1 | pass |

`red-600`, `green-600`, `amber-600` limited to small icon/text accents.

## Verification checklist

- [ ] Landmark map and accessible names correct per route.
- [ ] Every input has label; field errors use `aria-describedby`/`role="alert"`.
- [ ] Keyboard traversal: focus visible, correct order, Enter/Space work.
- [ ] Admin modal: focus trap, Escape, focus restoration.
- [ ] SVGs: decorative vs meaningful treatment correct.
- [ ] Contrast verified from rendered styles.
- [ ] Manual screen-reader pass before claiming AT validation.

## Known gaps

- No completed manual screen-reader audit yet.
- No skip-nav link (only one short `<nav>` per page currently).
