# AGENTS.md — pkwt-web

## Project Overview

React 19 + TypeScript 5.9 + Vite 7 SPA for **E-PKWT** (electronic contract agreement system). Multi-role: `candidate`, `company`, `super_admin`, `disnaker`. Tailwind CSS 4 for styling, Lucide React for icons, React Router 7.9 for routing.

## Commands

```bash
npm run dev          # Vite dev server (HMR)
npm run build        # tsc -b && vite build
npm run lint         # ESLint on **/*.{ts,tsx}
npm run preview      # Preview production build

# Testing (Vitest)
npm test                    # Run all tests once (vitest run)
npm run test:watch          # Watch mode
npm run test:ui             # Vitest UI dashboard

# Run a single test file
npx vitest run tests/date.test.ts
npx vitest run tests/excel.test.ts
npx vitest run src/path/to/file.test.ts

# Run a single test by name
npx vitest run -t "should accept valid 16-digit NIK"
```

Test files live in `tests/` and `src/**/*.test.{ts,tsx}` (configured in `vitest.config.ts`).

## File Structure

```
src/
├── components/        # Reusable presentational components
│   ├── dashboard/     # Dashboard cards/charts
│   ├── config/        # Admin config sections
│   ├── landing-config/# Landing page config sections
│   └── welcome/       # Welcome page sections
├── hooks/             # Custom hooks (use*.ts)
├── layouts/           # AppLayout (sidebar shell)
├── lib/               # Utilities: api.ts, http.ts, errors.ts, date.ts, excel.ts, csv.ts, utils.ts
├── pages/
│   ├── admin/         # Admin/disnaker pages
│   ├── company/       # Company pages
│   └── public/        # Unauthenticated pages
├── router/            # guards.tsx (RequireAuth, RequireGuest)
├── store/             # auth.ts (localStorage-backed)
├── App.tsx            # Routes
└── main.tsx           # Entry point
```

## Code Style

### Imports
- Use `type` keyword for type-only imports: `import type { ReactNode } from 'react'`
- Relative imports within `src/`: `'../lib/api'`, `'./errors'`
- No path aliases configured
- Group imports: (1) React/framework, (2) third-party libs, (3) internal `lib/`, (4) internal `hooks/`, (5) internal `components/`, (6) types

### TypeScript
- **Strict mode** enabled (`tsconfig.app.json`)
- `verbatimModuleSyntax: true` — always use `import type` for type-only imports
- Prefer `type` over `interface` for most definitions
- `@typescript-eslint/no-explicit-any` is `warn` (not error) — `any` is used at API/error boundaries
- `noUnusedLocals` and `noUnusedParameters` are enforced
- Avoid `as` type assertions; prefer type guards or narrowing

### Naming
- **Files**: PascalCase for components (`CompanySidebar.tsx`), camelCase for utilities (`api.ts`, `http.ts`)
- **Hooks**: `use` prefix (`useDialog.ts`, `useEmployees.ts`)
- **Props types**: `{ComponentName}Props` or inline `type Props = { ... }`
- **API types**: `{Verb}{Entity}Request`, `{Verb}{Entity}Response`
- **Functions**: camelCase (`getEmployeesByContract`, `submitContractApplication`)

### Components
- All functional components (no classes)
- Default exports for pages/components: `export default function LoginPage()`
- Named exports for utilities/hooks: `export function useDialog()`
- Pages handle API calls + state; extract presentational parts to `components/`
- Keep components under 200 lines; split large ones into smaller sub-components
- Use `memo()` only when profiling confirms a re-render bottleneck

### Styling
- Tailwind CSS 4 with `@tailwindcss/postcss`
- Custom colors defined in `src/index.css` via `@theme`:
  - `primary` (#419823) — brand green
  - `secondary` (#F4D348) — accent yellow
- Responsive: `md:` prefix (768px+ breakpoint)
- Avoid inline `style={}` — use Tailwind classes exclusively
- Use consistent spacing/rounded patterns: `rounded-lg`, `shadow-sm`, `gap-*`

### Error Handling
- All API calls go through `request()` in `src/lib/http.ts` — auto-attaches Bearer token
- `extractErrorMessage()` in `src/lib/errors.ts` parses server error responses (supports Zod format)
- `toUserMessage()` converts technical errors to user-friendly Indonesian messages
- Component-level: `try/catch` with `loading` + `error` state pattern
- Always use `toUserMessage(err, fallbackMsg)` — never display raw error strings to users

### API Pattern
```typescript
// src/lib/api.ts — one function per endpoint, typed request/response
export async function getEmployees(params: Params): Promise<Response> {
  return request(`${API_BASE}/api/employees?${new URLSearchParams(...)}`);
}
```

## Architecture Patterns

### Auth
- Token + role stored in localStorage via `src/store/auth.ts`
- `RequireAuth` / `RequireGuest` guards in `src/router/guards.tsx`
- Role is used **only for UI conditionals** (sidebar selection, menu visibility)
- Backend is the source of truth for authorization

### Layout
- `AppLayout` wraps authenticated pages — provides sidebar + responsive shell
- Sidebar selection: `AdminSidebar` for `super_admin`/`disnaker`, `CompanySidebar` for others

### Custom Hooks
- `useDialog` — confirm/alert modals via React Context
- `useSessionValidator` — polls session validity for admin users
- Data hooks (`useEmployees`, `useDashboardSummary`, etc.) — encapsulate API + loading/error state
- Pattern: `useState` + `useEffect` with `isMounted` cleanup

### State Management
- No Redux/Zustand — component state + custom hooks only
- localStorage for auth persistence (no token refresh mechanism)

## Best Practices — Reusable & Production-Ready Code

### Hook Pattern (Data Fetching)
Every data hook follows this canonical shape. Replicate this when writing new hooks:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { toUserMessage } from '../lib/errors';

export function useResource(params: ResourceParams): UseResourceResult {
  const [data, setData] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const res = await getResource(params);
        if (isMounted) setData(res.data);
      } catch (err: any) {
        if (isMounted) setError(toUserMessage(err, 'Gagal memuat data'));
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetch();
    return () => { isMounted = false; };
  }, [/* dep array from params fields */, refreshKey]);

  const refetch = useCallback(() => setRefreshKey(v => v + 1), []);
  return { data, loading, error, refetch };
}
```

Key rules:
- Always use `isMounted` flag to prevent state updates after unmount
- Always use `toUserMessage()` for error strings shown to users
- Expose a `refetch` function via `refreshKey` increment
- Use `useCallback` for action functions to avoid unnecessary re-renders

### Component Pattern (Presentational)
```tsx
// components/SomeCard.tsx — pure presentational, receives all data as props
import type { ReactNode } from 'react';

export type SomeCardProps = {
  title: string;
  items: SomeItem[];
  loading: boolean;
  error: string | null;
  onRefetch: () => void;
};

export default function SomeCard({ title, items, loading, error, onRefetch }: SomeCardProps) {
  if (loading) return <CardSkeleton />;
  if (error) return <ErrorState message={error} onRetry={onRefetch} />;
  if (items.length === 0) return <EmptyState message="Tidak ada data" />;
  return <div>{/* render items */}</div>;
}
```

Key rules:
- Presentational components receive data + callbacks as props — no direct API calls
- Handle `loading`, `error`, and `empty` states explicitly in every data-bound component
- Use `CardSkeleton` pattern for loading placeholders (see `src/components/dashboard/CardSkeleton.tsx`)

### Page Pattern (Container)
```tsx
// pages/some/SomePage.tsx — owns state + side effects
import { useResource } from '../../hooks/useResource';
import SomeCard from '../../components/SomeCard';

export default function SomePage() {
  const { data, loading, error, refetch } = useResource({ /* params */ });

  return (
    <div className="space-y-6">
      <SomeCard items={data?.items ?? []} loading={loading} error={error} onRefetch={refetch} />
    </div>
  );
}
```

### File Upload Pattern
Files are converted to base64 before sending. Reuse `fileToBase64()` from `src/lib/utils.ts`:
```typescript
const base64 = await fileToBase64(file);
// Include in JSON body: { file_name: file.name, file_content_base64: base64 }
```

### Validation
- NIK validation: `validateNIKFormat()` in `src/lib/excel.ts` (16-digit Indonesian NIK)
- Date normalization: `formatDateToYMD()` in `src/lib/date.ts` (defensive YYYY-MM-DD)
- File validation: check size and extension client-side before upload

### Performance
- Use `useMemo` for expensive derived data (see Dashboard page pattern)
- Use `useCallback` for event handlers passed as props
- Avoid unnecessary re-renders: keep state close to where it's consumed
- Lazy-load route-level pages if bundle size grows

### Testing
- Use `describe` / `it` / `expect` from Vitest
- Test files go in `tests/` (utilities) or co-located as `*.test.ts(x)` next to source
- Focus on pure functions (parsers, validators, formatters) — no DOM testing setup yet
- Use `import { describe, it, expect } from 'vitest'` explicitly (even though globals are enabled)

### Security
- Never log or expose `auth_token` in UI or console
- Backend is the source of truth for all authorization checks
- Input validation (NIK, dates) is defense-in-depth — backend must also validate
- Use `rel="noopener noreferrer"` on all `target="_blank"` links

## Environment
- `VITE_API_URL` — API base URL (defaults to `http://localhost:4000`)
- Define in `.env` or `.env.local`
