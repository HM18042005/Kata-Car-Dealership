# Frontend Routing

Use `react-router-dom` v6 with `Routes`, `Route`, `Navigate`, and
`AuthContext`.

## Route table

Declare five routes in `App.jsx`; wrap two with guards.

| Path | Page | Wrapper |
|---|---|---|
| `/login` | `Login` | none |
| `/register` | `Register` | none |
| `/` | `Dashboard` | `RequireAuth` |
| `/admin` | `Admin` | `RequireAdmin` |
| `*` | `NotFound` | none |

**The concrete artifact:**

```jsx
// src/main.jsx — the app's single <BrowserRouter>, wrapping <App />
// AuthProvider sits inside it so RequireAuth/RequireAdmin can read the
// context (see state-management.md)
<BrowserRouter>
  <AuthProvider>
    <App />
  </AuthProvider>
</BrowserRouter>
```

```jsx
// src/App.jsx — routes only; the Router lives in main.jsx above
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
  <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

## RequireAuth and RequireAdmin

Both wrappers read `AuthContext` with `useContext` and render `children` or
return `<Navigate>`.

**The concrete artifact:**

```jsx
// src/components/RequireAuth.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function RequireAuth({ children }) {
  const { token } = useContext(AuthContext);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
```

```jsx
// src/components/RequireAdmin.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function RequireAdmin({ children }) {
  const { user } = useContext(AuthContext);
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return children;
}
```

Use `replace` on both `<Navigate>` redirects.

## Redirect rules

| Trigger | Redirect target |
|---|---|
| Unauthenticated user hits `/` (or any future `RequireAuth` route) | `/login` |
| Authenticated non-admin user hits `/admin` | `/` |
| Successful login submit | `/` |

On successful login, call `navigate("/", { replace: true })` after storing
the token.

## BrowserRouter

Render one `<BrowserRouter>` in `main.jsx`, wrapping `AuthProvider` and
`App`. Configure the static host to rewrite unmatched paths to `index.html`
(Netlify: `/* /index.html 200`; Vercel: `rewrites`; nginx:
`try_files $uri /index.html`).

## Not included

- Route lazy loading/code splitting.
- Nested layouts.
