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
    const { sub, role } = decodePayload(stored);
    return { sub, role };
  });

  function login(newToken) {
    const { sub, role } = decodePayload(newToken);
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser({ sub, role });
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
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: reqBody ? JSON.stringify(reqBody) : undefined,
      });
      if (res.status === 401 && token) { logout(); navigate("/login"); return; }
      const json = res.status === 204 ? null : await res.json();
      if (!res.ok) throw new Error(json?.detail || "Request failed");
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [path, method, body, token]);

  useEffect(() => { if (auto) execute(); }, [auto, execute]);

  return { data, loading, error, execute };
}
```

401 handling: if a request returns 401 *and* `token` exists, `logout()` +
navigate to `/login`. If `token` is null (e.g. the login request itself),
the error falls through to `setError(json.detail)`.

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

function handlePurchase(id) {
  purchaseVehicle({ path: `/api/vehicles/${id}/purchase` }).then(refetch);
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

Vitest + React Testing Library, three behavior tests:

- **Purchase disabled at quantity 0** — render `VehicleCard` with
  `vehicle.quantity === 0`; assert button is `disabled` and labeled
  "Out of stock".
- **`RequireAuth` redirect** — render with `AuthContext` `{ token: null }`;
  assert `<Navigate>` to `/login`.
- **`useApi` 401 handling** — mock `fetch` to 401 with token set: assert
  `logout()` + navigate. With token null: assert `error` is set, no redirect.

## Not included

- TanStack Query / SWR.
- Redux / Zustand.
- Optimistic UI.
