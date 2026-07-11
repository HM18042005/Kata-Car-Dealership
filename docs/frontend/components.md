# Frontend Components

Component and page responsibilities with their props contracts.

## Component tree

```
frontend/src/
├── main.jsx, App.jsx, index.css
├── context/AuthContext.jsx
├── hooks/useApi.js
├── pages/Dashboard.jsx, Login.jsx, Register.jsx, Admin.jsx, NotFound.jsx
└── components/Navbar.jsx, VehicleCard.jsx, SearchBar.jsx, FilterPanel.jsx,
    VehicleForm.jsx, VehicleTable.jsx, RequireAuth.jsx, RequireAdmin.jsx,
    Spinner.jsx, EmptyState.jsx, Toast.jsx
```

16 components/pages total: 11 in `components/` and 5 in `pages/`.

## Components

### Navbar

Logo, nav links that change by auth state, and a logout button.

**Props:** none — reads `AuthContext` directly for the current user and role.

### VehicleCard

One vehicle: category icon, make/model, price, and a quantity badge.

**Props:** `{ vehicle, onPurchase }`

- `vehicle` — Vehicle JSON (Shared Contracts shape).
- `onPurchase` — callback fired when the Purchase button is clicked.

Purchase button: `disabled={vehicle.quantity === 0}`, and its label switches
to "Out of stock" whenever it's disabled.

### SearchBar

Controlled text input for the free-text search term; send it as the `make`
query parameter.

**Props:** `{ value, onChange }`

### FilterPanel

Category select plus min/max price inputs.

**Props:** `{ filters, onChange }`

### VehicleForm

Add and edit vehicle form.

**Props:** `{ initial?, onSubmit }`

- `initial` — optional Vehicle JSON to prefill; omitted for add, passed for edit.
- `onSubmit` — callback receiving the form's Vehicle-shaped payload.

Use native HTML validation: `required`, `min="0"`, `type="number"` on
price/quantity.

### VehicleTable

Admin listing of vehicles as rows, with per-row action buttons.

**Props:** `{ vehicles, onEdit, onDelete, onRestock }`

### RequireAuth

Route wrapper: authenticated users render the route; others redirect to
`/login`.

**Props:** none — reads `AuthContext`; wraps route children (exact JSX in
`routing.md`).

### RequireAdmin

Route wrapper: admins render the route; others redirect to `/`.

**Props:** none — reads `AuthContext`; wraps route children (exact JSX in
`routing.md`).

### Spinner

Loading indicator, shown while a `useApi` call is in flight.

**Props:** none.

### EmptyState

Illustration plus message for an empty list — no vehicles at all, or no
search results.

**Props:** `{ image, message }`

- `image` — path to one of the illustration SVGs (`design-system.md`).
- `message` — text shown under the image.

### Toast

Ephemeral status message for success/error feedback after a mutation
(create, update, delete, purchase, restock).

**Props:** `{ type, message, onClose? }`

- `type` — `"success" | "error"`, maps to `design-system.md`'s
  `green-600`/`red-600` tokens.
- `message` — text shown.
- `onClose` — optional dismiss callback. When provided, Toast auto-dismisses
  after 3s and renders a close button wired to it; the page owner passes
  `onClose={() => setToast(null)}`.

## Pages

### Dashboard

Fetches the vehicle list on mount, wires `SearchBar` + `FilterPanel` to
refetch on change, renders results as a `VehicleCard` grid. Mounted at `/`,
wrapped in `RequireAuth`.

### Login

Email/password form; on submit calls the login endpoint and stores the
returned token via `AuthContext`.

### Register

Email/password form; on submit calls the register endpoint, then redirects
to `/login`.

### Admin

`VehicleTable` plus a `VehicleForm` shown in a modal for add/edit. Mounted
at `/admin`, wrapped in `RequireAdmin`.

### NotFound

Catch-all page for the `*` route — shown for any unmatched path.

## Not included

- Modal/portal library.
- Form library.
