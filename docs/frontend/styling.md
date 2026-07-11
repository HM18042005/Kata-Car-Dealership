# Frontend Styling

Tailwind + Vite build setup, class conventions, responsive behavior, and
CSS animations. Tokens in `design-system.md`; components in `components.md`.

## Tailwind + Vite setup

Tailwind CSS v4 via the `@tailwindcss/vite` plugin — no `tailwind.config.js`,
no PostCSS config, no `content` array.

```bash
npm install tailwindcss @tailwindcss/vite
```

`vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

`frontend/src/index.css` (imported once in `main.jsx`):

```css
@import "tailwindcss";
```

## Conventions

**Mobile-first grid:**

```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

1 col default → 2 at `sm` (640px) → 3 at `lg` (1024px).

**Class order:** layout → spacing → color → state:

```jsx
className="flex flex-col gap-2 p-4 bg-white border border-slate-200 hover:shadow-lg"
```

**No `@apply`.** Repeated class strings become props-driven React components.

## CSS-only animations

Three animations, all CSS — no JS animation library.

**Spinner:** Tailwind built-in `animate-spin`.

**Card hover:**

```jsx
className="transition-shadow hover:shadow-lg hover:-translate-y-0.5"
```

**Page fade-in** (custom keyframe in `index.css`):

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 200ms ease-out;
}
```

Applied to each page root (`Dashboard.jsx`, `Login.jsx`, etc.).

**`prefers-reduced-motion` guard** (in `index.css`, after keyframes):

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Not included

- CSS modules / styled-components.
- JavaScript animation library.
