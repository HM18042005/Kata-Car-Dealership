# Frontend State Management

Uses `useState`, `useEffect`, `useContext`, and `useCallback` only —
no Redux/Zustand, no TanStack Query/SWR. `AuthContext` is the only global
state; `Dashboard` and `Admin` own independent server data.

## AuthContext

Holds `{ token, user }` and exposes `login(token)` and `logout()`.
`user` is `{ sub, role }` decoded from the JWT payload.
Lazy `useState` initializers hydrate from `localStorage` before first render.

```jsx
// src/context/AuthContext.jsx
import { createContext, useState } from "react";

export const AuthContext = createContext(null);

function decodePayload(token) {
  const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64));
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("token");
    if (!stored) return null;
    try {
      const { sub, role } = decodePayload(stored);
      return { sub, role };
    } catch {
      return null; // corrupt/absent token → treat as logged out, don't crash
    }
  });

  function login(newToken) {
    try {
      const { sub, role } = decodePayload(newToken);
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser({ sub, role });
    } catch (e) {
      console.error("Invalid token format", e);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

```jsx
// src/main.jsx
<BrowserRouter>
  <AuthProvider>
    <App />
  </AuthProvider>
</BrowserRouter>
```

## useApi hook

`useApi(path, { method, body, auto })` returns
`{ data, loading, error, execute }`.

```js
// src/hooks/useApi.js
import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export function useApi(path, { method = "GET", body, auto = false } = {}) {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (overrides = {}) => {
    setLoading(true);
    setError(null);
    try {
      const reqBody = overrides.body ?? body;
      const res = await fetch(overrides.path ?? path, {
        method: overrides.method ?? method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: reqBody ? JSON.stringify(reqBody) : undefined,
      });
      if (res.status === 401 && token) { logout(); navigate("/login", { replace: true }); return; }
      const json = res.status === 204 ? null : await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.detail || "Request failed");
      setData(json);
      return json;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [path, method, body, token, logout, navigate]);

  useEffect(() => { if (auto) execute(); }, [auto, execute]);

  return { data, loading, error, execute };
}
```

401 handling: if a request returns 401 *and* `token` exists, `logout()` +
navigate to `/login` (with `{ replace: true }`, so the expired session isn't
left in history). If `token` is null (e.g. the login request itself), the
error falls through to `setError(json.detail)`.

On success `execute()` returns the parsed JSON (Login reads `access_token`
from the login response this way); on a caught error it returns `undefined`
and sets `error`. `res.json()` is guarded with `.catch(() => null)` so a
non-JSON error body surfaces the generic `"Request failed"` message rather
than a JSON-parse error. `overrides.method` lets a caller override the HTTP
method per `execute()` call.

## Data flow

`Dashboard` fetches on mount and refetches after search/filter changes,
debounced 300ms. Mutations (purchase/restock/delete) call `refetch()` after
completion.

```js
// src/pages/Dashboard.jsx (excerpt)
function buildQueryString(searchTerm, filters) {
  const params = new URLSearchParams();
  if (searchTerm) params.set("make", searchTerm);
  if (filters.category) params.set("category", filters.category);
  if (filters.minPrice) params.set("min_price", filters.minPrice);
  if (filters.maxPrice) params.set("max_price", filters.maxPrice);
  return params.toString();
}
```

```jsx
// src/pages/Dashboard.jsx (excerpt)
const [searchTerm, setSearchTerm] = useState("");
const [filters, setFilters] = useState({});
const [query, setQuery] = useState("");

useEffect(() => {
  const timer = setTimeout(() => {
    setQuery(buildQueryString(searchTerm, filters));
  }, 300);
  return () => clearTimeout(timer);
}, [searchTerm, filters]);

const { data: vehicles, loading, error, execute: refetch } =
  useApi(`/api/vehicles/search?${query}`, { auto: true });

const { execute: purchaseVehicle } = useApi("/api/vehicles", { method: "POST" });

async function handlePurchase(id) {
  try {
    await purchaseVehicle({ path: `/api/vehicles/${id}/purchase` });
    setToast({ type: "success", message: "Purchase successful!" });
    refetch();
  } catch {
    setToast({ type: "error", message: "Failed to purchase vehicle." });
  }
}
```

`SearchBar`'s free-text term is sent as `make`; a model-only term does not
match.

## Callback argument shapes

| Callback | Fired by | Called as |
|---|---|---|
| `onPurchase` | `VehicleCard` Purchase button | `onPurchase(vehicle.id)` |
| `onEdit` | `VehicleTable` row Edit button | `onEdit(vehicle)` — full Vehicle JSON |
| `onDelete` | `VehicleTable` row Delete button | `onDelete(vehicle.id)` |
| `onRestock` | `VehicleTable` row Restock button | `onRestock(vehicle.id, amount)` |

`onRestock` takes `amount` (the increment, not new total) from an inline
`<input type="number" min="1">` beside each row's Restock button:

```jsx
// src/components/VehicleTable.jsx (excerpt — one row)
function Row({ vehicle, onEdit, onDelete, onRestock }) {
  const [amount, setAmount] = useState(1);
  return (
    <tr>
      <td>
        <button onClick={() => onEdit(vehicle)}>Edit</button>
        <button onClick={() => onDelete(vehicle.id)}>Delete</button>
        <input type="number" min="1" value={amount}
               onChange={(e) => setAmount(Number(e.target.value))} />
        <button disabled={!(amount >= 1)}
                onClick={() => onRestock(vehicle.id, amount)}>Restock</button>
      </td>
    </tr>
  );
}
```

## Frontend testing note

Vitest + React Testing Library. The original three behavior tests, plus a
focused set covering the other stateful/logic-bearing pieces — presentational
components (`Navbar`, `Toast`, `Spinner`, `EmptyState`) and page-level
integration are still out of scope, see Not included.

- **Purchase disabled at quantity 0** — render `VehicleCard` with
  `vehicle.quantity === 0`; assert button is `disabled` and labeled
  "Out of stock".
- **`RequireAuth` redirect** — render with `AuthContext` `{ token: null }`;
  assert `<Navigate>` to `/login`.
- **`RequireAdmin` redirect** — render with `AuthContext` user role `"user"`;
  assert `<Navigate>` to `/`. Also assert an `"admin"` user renders `children`.
- **`AuthContext` persistence** — hydrate `{ token, user }` from `localStorage`
  on mount; `login(token)` decodes the JWT, updates state, and writes
  `localStorage`; `logout()` clears both.
- **`VehicleForm` validation and submit** — `price`/`quantity` inputs are
  `required`, `type="number"`, `min="0"`; submitting calls `onSubmit` with the
  entered fields as a Vehicle-shaped payload.
- **`VehicleTable` row callbacks** — `Edit` calls `onEdit(vehicle)`, `Delete`
  calls `onDelete(vehicle.id)`; the inline restock amount input updates local
  state and `Restock` calls `onRestock(vehicle.id, amount)`, disabled unless
  `amount >= 1`.
- **`useApi` 401 handling** — mock `fetch` to 401 with token set: assert
  `logout()` + navigate. With token null: assert `error` is set, no redirect.
- **`useApi` success path** — `loading` is `true` while in flight and `false`
  with `data` set after a `200`; `auto: true` calls `execute` on mount.

## Not included

- TanStack Query / SWR.
- Redux / Zustand.
- Optimistic UI.
