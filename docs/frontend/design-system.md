# Frontend Design System

React + Vite + Tailwind CSS. Light theme; no component library.

## Tokens

Use Tailwind's default utility classes directly. No color remapping or CSS
custom-property layer.

| Token | Value | Usage rule |
|---|---|---|
| `blue-600` | `#2563eb` | Accent — primary actions (submit, purchase button) and links |
| `slate-50` | `#f8fafc` | The single page-background color, everywhere |
| `slate-200` | `#e2e8f0` | Card borders, dividers, input borders |
| `slate-500` | `#64748b` | Secondary text — meta, placeholders, helper copy |
| `slate-900` | `#0f172a` | Headings and primary body text |
| `red-600` | `#dc2626` | Danger — delete button, form validation errors, error toasts |
| `green-600` | `#16a34a` | Success toasts (created/updated/purchased confirmations) |
| `amber-600` | `#d97706` | Low-stock warning (quantity low but not zero) |

No `tailwind.config.js` color overrides. Class names are canonical; Tailwind
v4 rendered values can differ slightly from the listed sRGB approximations.

`amber-600` names the low-stock warning hue, but the low-stock badge renders
as an `amber-100` background with `amber-700` text — tints of the same amber
family — so its small badge text clears the 4.5:1 AA contrast bar that
`amber-600` text on a light chip would miss.

## Typography

Use Tailwind's default `font-sans` stack with no font import.
`text-2xl`: page titles; `text-lg`: card titles; `text-sm`: meta text.

## Spacing & breakpoints

Use Tailwind's default spacing scale and breakpoints: `sm` 640px, `md` 768px,
`lg` 1024px, `xl` 1280px. No custom spacing or breakpoint values.

## Iconography

Use the 39 SVGs in `frontend/public/svgs/`. The 8 category icons and 23 UI icons
use a 24×24 viewBox, `stroke="currentColor"`, `stroke-width="2"`, and no
`fill`. Branding and illustrations use their own sizes/colors.

**The concrete artifact — category icon mapping:**

| Category enum value | Icon filename |
|---|---|
| `sedan` | `sedan.svg` |
| `suv` | `suv.svg` |
| `hatchback` | `hatchback.svg` |
| `truck` | `truck.svg` |
| `coupe` | `coupe.svg` |
| `convertible` | `convertible.svg` |
| `van` | `van.svg` |
| `electric` | `electric.svg` |

The remaining files in `frontend/public/svgs/` split into three other groups:

- **UI icons** (`search.svg`, `filter.svg`, `sort.svg`, `cart.svg`,
  `plus.svg`, `pencil.svg`, `trash.svg`, `box.svg`, `shield.svg`,
  `user.svg`, `login.svg`, `logout.svg`, `eye.svg`, `eye-off.svg`,
  `menu.svg`, `close.svg`, `chevron.svg`, `check.svg`, `alert-circle.svg`,
  `alert-triangle.svg`, `spinner.svg`, `dollar.svg`, `layers.svg`) — same
  24×24/`currentColor` convention as the category icons, used for actions,
  nav, and status.
- **Branding** (`logo.svg` at 24×24, `favicon.svg` at 16×16) — both use
  `currentColor`, so they're already token-compatible: the logo renders in
  whatever text color its container sets (e.g. `text-slate-900` in the
  navbar) and needs no restyle.
- **Illustrations** (`empty-inventory.svg`, `no-search-results.svg`,
  `error-404.svg`, `auth-hero.svg`, `vehicle-placeholder.svg` — all
  200×150 — plus `homepage-hero.svg` at 400×150) — hardcoded stroke/fill
  colors rather than `currentColor`.

## Not included

- Dark mode.
- Custom brand font.
