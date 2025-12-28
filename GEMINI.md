# CODING GUIDELINES
*MUST FOLLOW*

## Project Overview

**pkwt-web** is a React + TypeScript + Vite application for **E-PKWT** (Sistem Elektronik Perjanjian Kerja Waktu Tertentu) - an electronic contract agreement system. The application supports multi-role authentication with role-based UI layouts for candidates, companies, admins, and government agencies (disnaker).

**Tech Stack:**
- React 19 with TypeScript 5.9
- Vite 7 for build/dev
- React Router 7.9 for client-side routing
- Tailwind CSS 4 + PostCSS 4 for styling
- Lucide React icons

## Critical Architecture Patterns

### 1. Role-Based Layout System
The app conditionally renders different sidebars based on user role:

```tsx
// AppLayout.tsx: Sidebars are role-aware
const SidebarComponent = role === 'super_admin' || role === 'disnaker' 
  ? AdminSidebar 
  : CompanySidebar;
```

**Implications:**
- Role changes require complete sidebar re-render
- Roles: `'candidate' | 'company' | 'super_admin' | 'disnaker'`
- New pages must handle both sidebar variants
- Each sidebar controls mobile/desktop responsiveness independently

### 2. Authentication & Authorization

**Auth Storage Pattern** (`src/store/auth.ts`):
- Token + role stored in localStorage (no persistence layer)
- Guards in router prevent unauthorized access
- `RequireAuth` enforces authentication; `RequireGuest` prevents double login

```tsx
// Example from router/guards.tsx
export function RequireAuth({ children }: { children: JSX.Element }) {
  const isAuthed = Boolean(getToken());
  if (!isAuthed) return <Navigate to="/login" replace />;
  return children;
}
```

**⚠️ CRITICAL: Role-Based Authorization Rules**

Roles dalam sistem memiliki tingkat akses yang ketat:

| Role | Akses Halaman | Sidebar | Login Route | Deskripsi |
|------|---------------|---------|-------------|-----------|
| `candidate` | Public pages, Dashboard, Profile | CompanySidebar | `/login` | Pencari kerja |
| `company` | Public pages, Dashboard, Recruits, Contracts | CompanySidebar | `/login` | Perusahaan perekrut |
| `super_admin` | Semua pages, Admin Dashboard | AdminSidebar | `/login/admin` | Admin sistem |
| `disnaker` | Semua pages, Admin Dashboard, Verification | AdminSidebar | `/login/admin` | Dinas Ketenagakerjaan |

**Development Rules:**
1. **JANGAN menggunakan role dari localStorage untuk security checks kritis** - backend HARUS selalu validate role
2. **Frontend role digunakan HANYA untuk UI conditionals:**
   - Tampilkan/sembunyikan menu items
   - Conditional rendering components
   - User experience personalization
3. **Implementasi dengan `getRole()` function:**
   ```tsx
   const role = getRole(); // Ambil dari localStorage
   if (role === 'super_admin' || role === 'disnaker') {
     return <AdminSidebar />;
   }
   return <CompanySidebar />;
   ```
4. **Selalu gunakan guards untuk route protection:**
   ```tsx
   // Di App.tsx - backend akan reject jika role tidak sesuai
   <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
   ```
5. **API calls SELALU akan gagal jika user tidak punya akses** - handle error dari backend sebagai source of truth

**Developer Note:** No session refresh mechanism or token expiry handling visible - this is a security concern for production.

### 3. HTTP Request Handling

**Centralized request utility** (`src/lib/http.ts`):
- All API calls use `request()` wrapper function
- Automatic JSON parsing and error extraction
- Custom error message extraction from server responses

**Error Message Extraction Logic** (`src/lib/errors.ts`):
- Parses validation errors from API (supports Zod format)
- Formats errors as `field: message` strings
- Fallback to raw response if parsing fails

**Pattern for API calls:**
```tsx
const res = await login(email, password);  // Already JSON-parsed
setAuth(res.token, res.role);
```

### 4. Responsive Sidebar Design
The `AppLayout` component handles responsive behavior:
- Sidebar auto-opens on `md` breakpoint (768px+)
- Mobile: overlay + hamburger toggle
- Desktop: fixed sidebar with left padding (`md:pl-56`)

## Development Workflows

### Commands
```bash
npm run dev      # Start Vite dev server (HMR enabled)
npm run build    # TypeScript check + Vite build
npm run lint     # ESLint on all .ts/.tsx files
npm run preview  # Preview built app
```

### Environment Configuration
- API base URL: `VITE_API_URL` env variable (defaults to `http://localhost:4000`)
- Must define in `.env` or `.env.local` for development

### File Organization
```
src/
├── components/    # Reusable UI components (Sidebars only currently)
├── layouts/       # Page layout wrappers (AppLayout, etc.)
├── lib/           # Utilities (api, http, errors)
├── pages/         # Route-level components (Login, Dashboard)
├── router/        # Route guards
└── store/         # State management (localStorage-backed auth)
```

## Code Patterns & Conventions

### 1. React Functional Components with TypeScript
- All components are functional; use `ReactNode` for children types
- Props interfaces named `{ComponentName}Props` or inline with `type`
- Use `type` keyword over `interface` (current codebase preference)

### 2. Form Handling
Based on `LoginCompany.tsx`:
- Local state for form fields + loading + error
- Error messages displayed as-is (multi-line via newline separation)
- Form validation happens on submit; errors caught from API response

### 3. Navigation & Redirects
- Use `useNavigate()` hook for programmatic navigation
- `<Navigate replace />` for declarative redirects in guards

### 4. Styling with Tailwind
- Uses Tailwind 4 with PostCSS 4 (latest versions)
- Custom colors: `#1F4E8C` (brand blue), `#27406a` (sidebar dark)
- Responsive prefixes: `md:` for 768px+ breakpoint
- Gradient backgrounds: `radial-gradient()` via Tailwind utilities

### 5. Icon Library
- Lucide React for all icons
- Imported as: `import { IconName } from 'lucide-react'`
- Examples: `LayoutDashboard`, `FileText`, `Users`, `LogOut`

## Best Practices: Separation of Concerns & Responsibility Boundaries

### Frontend-Backend Responsibility Matrix

**Backend HARUS SELALU HANDLE:**
1. ✅ **Authentication & Security**
   - Token validation & refresh
   - Role-based access control (RBAC) enforcement
   - Password hashing & security
   - Session management
   - CORS, rate limiting, input validation

2. ✅ **Business Logic & Data Integrity**
   - Complex calculations
   - Workflow state management
   - Data validation rules
   - Transactions & consistency
   - Authorization checks for ALL endpoints

3. ✅ **Data Persistence & Consistency**
   - Database operations
   - Data relationships
   - Backup & recovery
   - Audit logging

**Frontend BOLEH HANDLE (HANYA untuk UX):**
1. ✅ **UI/UX Concerns**
   - Form validation feedback (client-side only for speed)
   - Loading states
   - Error message display
   - Conditional UI rendering
   - Animations & transitions

2. ✅ **Local State Management**
   - Component state
   - Modal/sidebar toggles
   - Pagination UI state
   - Form field values (temporary)

3. ✅ **Authentication Display Only**
   - Show/hide menus based on role
   - Display user name/email
   - Redirect to login if token missing
   - **BUT:** Never trust role for security checks

### API Integration Best Practices

**1. HTTP Layer - Request Wrapper Pattern** (`src/lib/http.ts`):
```typescript
// ✅ GOOD: Centralized, handles errors
export async function request<T = any>(url: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...init?.headers,
  };
  
  const res = await fetch(url, { ...init, headers });
  if (res.ok) return res.json() as Promise<T>;
  
  const text = await res.text();
  const msg = extractErrorMessage(text);
  throw new Error(msg);
}
```

**2. API Service Layer** (`src/lib/api.ts`):
- One function per API endpoint
- Return parsed response directly
- Throw errors for consumer to handle
- Include type definitions for requests/responses

```typescript
// ✅ GOOD: Type-safe, specific, reusable
export async function login(email: string, password: string) {
  return request(`${API_BASE}/api/user/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function getUserProfile() {
  return request(`${API_BASE}/api/user/profile`);
}

export async function updateUserProfile(data: UpdateProfileDto) {
  return request(`${API_BASE}/api/user/profile`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}
```

**3. Component-Level API Calls:**
```tsx
// ✅ GOOD: Use custom hooks to isolate logic
const [user, setUser] = useState(null);
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);

async function handleLogin(email: string, password: string) {
  setLoading(true);
  setError(null);
  try {
    const res = await login(email, password);
    setAuth(res.token, res.role);
    // Redirect handled by guard/useNavigate
  } catch (err: any) {
    setError(err?.message || 'Unknown error');
  } finally {
    setLoading(false);
  }
}
```

**4. Error Handling Strategy** (`src/lib/errors.ts`):
- Backend returns structured error format
- Frontend parses field-level errors
- Display errors closest to source (form field, toast, etc.)
- Never expose sensitive backend details to user

```typescript
// API Response Format (from backend)
{
  "ok": false,
  "errors": [
    { "path": "email", "message": "Email sudah terdaftar" },
    { "path": "password", "message": "Minimal 8 karakter" }
  ]
}

// Frontend displays:
// email: Email sudah terdaftar
// password: Minimal 8 karakter
```

### Frontend Component Architecture

**1. Component Hierarchy & Separation:**
```
src/pages/          ← Route-level containers (handle business logic)
├── LoginCompany.tsx ← Fetch API, manage form state, show errors
├── Dashboard.tsx
└── AdminPanel.tsx

src/components/     ← Reusable, presentation-focused
├── CompanySidebar.tsx
├── AdminSidebar.tsx
├── FormInput.tsx
├── Button.tsx
└── ErrorAlert.tsx
```

**2. Container vs Presentational Pattern:**
```tsx
// ❌ AVOID: Mixed concerns
function UserProfile() {
  const [user, setUser] = useState(null);
  // ... API call logic, state management ...
  return (
    <div>
      <h1>{user?.name}</h1>
      {/* Lots of JSX mixed with logic */}
    </div>
  );
}

// ✅ GOOD: Separated concerns
// Container component (in pages/)
function UserProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Fetch logic here
  }, []);
  
  return <UserProfileView user={user} loading={loading} />;
}

// Presentational component (in components/)
interface UserProfileViewProps {
  user: User | null;
  loading: boolean;
}

function UserProfileView({ user, loading }: UserProfileViewProps) {
  if (loading) return <LoadingSpinner />;
  if (!user) return <ErrorMessage />;
  
  return (
    <div className="space-y-4">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

**3. Props Composition - Keep Props Minimal:**
```tsx
// ❌ AVOID: Passing everything
<UserCard 
  user={user}
  onEdit={onEdit}
  onDelete={onDelete}
  onArchive={onArchive}
  theme={theme}
  isMobile={isMobile}
  permissions={permissions}
  {...10_more_props}
/>

// ✅ GOOD: Group related data
interface UserCardProps {
  user: User;
  actions: {
    onEdit: () => void;
    onDelete: () => void;
    onArchive: () => void;
  };
  appearance: {
    theme: 'light' | 'dark';
    isMobile: boolean;
  };
}

<UserCard user={user} actions={actions} appearance={appearance} />
```

### 4. When to Create a Component - Decision Guide

#### ✅ CREATE a Component if:
1. **Used in 2+ places** - Reusability requirement met
2. **JSX > 50 lines** - Too complex to keep inline
3. **Has own state/logic** - Encapsulates reusable behavior
4. **Needs testing** - Benefits from isolated unit tests

#### ❌ KEEP in Page if:
1. **Used only 1x** - Single page only
2. **JSX < 30 lines** - Simple & readable
3. **Pure presentation** - No internal state
4. **Page-specific logic** - Not generalizable elsewhere

#### Quick Rules:
| Scenario | Action |
|----------|--------|
| Dipakai 2+ page | → **buat component** |
| JSX >50 baris | → **buat component** |
| Simple & 1x pakai | → **keep di page** |

#### Common Mistakes & Fixes:
- ❌ Buat component untuk setiap UI kecil → ✅ Group related UI dulu
- ❌ Page jadi 300+ baris → ✅ Extract components early
- ❌ Props drilling 10+ level → ✅ Gunakan custom hook
- ❌ API call di component presentasi → ✅ Extract ke custom hook
- ❌ Page tanpa error/loading handling → ✅ Handle semua states
- ❌ Component punya 15+ props → ✅ Group related props

---

## Page Development Guidelines

### ✅ Pages SHOULD Have:
- **API calls & data fetching** - Fetch data, populate state
- **State management** - useState for loading, error, data
- **Event handlers** - Business logic, form submissions
- **useEffect** - Side effects (data fetching on mount)
- **Simple JSX layout** - Wrapper + conditional renders

### ❌ Pages SHOULD NOT Have:
- **Complex JSX** (>50 lines) - Extract to component
- **Reusable UI** - Extract to src/components/
- **Deeply nested ternaries** - Move to helper function or component
- **Mixing logic** - Separate API logic into custom hooks
- **Unhandled states** - Always handle loading + error

### Page Complexity Limits:

| Metric | Max | Extract if > |
|--------|-----|------|
| Lines of Code | 150 | 150 |
| useState calls | 7 | 7 |
| useEffect calls | 3 | 3 |
| JSX lines | 50 | 50 |

**When hitting limits → Extract to components/hooks**

## State Management & Custom Hooks Best Practices

### 1. Auth Store Pattern** (`src/store/auth.ts`):
```typescript
// ✅ GOOD: Simple, focused, no dependencies
type Role = 'candidate' | 'company' | 'super_admin' | 'disnaker';

export function setAuth(token: string, role: Role) {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_role', role);
}

export function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function getRole(): Role | null {
  return (localStorage.getItem('auth_role') as Role) || null;
}

export function clearAuth() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_role');
}
```

**Store Usage Rules:**
- ✅ Use for persistent, cross-component state only (auth, theme)
- ✅ Keep store functions pure (no side effects)
- ✅ Call from pages/components, not from other stores
- ❌ Don't use for temporary component state
- ❌ Don't call store functions in effects without dependencies array

### 2. Custom Hooks for Reusable Logic:**

**Pattern: Use Hook for API Data + Loading State**
```typescript
// ✅ GOOD: Encapsulate API + state logic
// src/hooks/useUser.ts
export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchUser() {
      try {
        const data = await getUserProfile(userId);
        if (isMounted) setUser(data);
      } catch (err: any) {
        if (isMounted) setError(err?.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchUser();
    return () => { isMounted = false; }; // Cleanup
  }, [userId]);

  return { user, loading, error };
}

// Usage in component
function UserPage({ userId }: { userId: string }) {
  const { user, loading, error } = useUser(userId);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return <UserProfile user={user!} />;
}
```

**Pattern: Use Hook for Auth State**
```typescript
// ✅ GOOD: Centralizes auth logic
// src/hooks/useAuth.ts
export function useAuth() {
  const token = getToken();
  const role = getRole();
  const isAuthenticated = Boolean(token);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginApi(email, password);
    setAuth(res.token, res.role);
    return res;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, []);

  return { isAuthenticated, token, role, login, logout };
}

// Usage
function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  async function handleSubmit(email: string, password: string) {
    const res = await login(email, password);
    if (res.role === 'company') navigate('/dashboard');
    else navigate('/admin');
  }
  
  return <LoginForm onSubmit={handleSubmit} />;
}
```

**Pattern: Use Hook for Form State**
```typescript
// ✅ GOOD: Reusable form logic
// src/hooks/useForm.ts
export function useForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return { values, errors, touched, handleChange, handleBlur, setErrors, resetForm };
}

// Usage
function MyForm() {
  const form = useForm({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.values.email, form.values.password);
      form.resetForm();
    } catch (err: any) {
      form.setErrors({ email: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={form.values.email}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
      />
      {form.touched.email && form.errors.email && (
        <p className="text-red-500">{form.errors.email}</p>
      )}
    </form>
  );
}
```

### 3. State Management Rules:**
- ✅ Component state (`useState`) for local, temporary values
- ✅ Custom hooks for reusable logic across components
- ✅ Store functions for persistent, auth-related data
- ✅ Keep state as close as possible to where it's used
- ❌ Don't prop-drill deeply (extract to custom hook instead)
- ❌ Don't create complex Redux-like store for simple app
- ❌ Don't mutate state directly

### 4. Common Hook Patterns to Avoid:**
```tsx
// ❌ AVOID: Storing API data in store
const store = reactive({
  users: [],
  loading: false
});

// ✅ GOOD: Use component state + custom hook
const { users, loading } = useUsers();

// ❌ AVOID: Multiple useState calls scattered
function Component() {
  const [x, setX] = useState();
  const [y, setY] = useState();
  const [z, setZ] = useState();
  // ... lots of logic ...
}

// ✅ GOOD: Group related state or use custom hook
function Component() {
  const form = useForm({ x: '', y: '', z: '' });
  const { data, loading } = useData();
}
```

## Common Tasks & Implementation Notes

### Adding a New Page
1. Create component in `src/pages/{PageName}.tsx` as a **container component**
2. Handle API calls, business logic, and state management here
3. Extract presentational components to `src/components/` if reusable
4. Add route in `App.tsx` with appropriate guard (`RequireAuth` or `RequireGuest`)
5. Wrap in `<AppLayout>` if authenticated user needs sidebar
6. Use `useNavigate()` for redirects after actions

**Example Page Structure:**
```tsx
// src/pages/ContractPage.tsx - Container component
export default function ContractPage() {
  const { contractId } = useParams<{ contractId: string }>();
  const { contract, loading, error } = useContract(contractId!);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  async function handleSave(data: ContractUpdateDto) {
    try {
      await updateContract(contractId!, data);
      setEditMode(false);
      // Show success toast
    } catch (err: any) {
      // Show error toast
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1>Contract Details</h1>
        <button onClick={() => setEditMode(!editMode)}>
          {editMode ? 'Cancel' : 'Edit'}
        </button>
      </div>
      
      {editMode ? (
        <ContractForm contract={contract!} onSave={handleSave} />
      ) : (
        <ContractView contract={contract!} onEdit={() => setEditMode(true)} />
      )}
    </div>
  );
}
```

### Adding a New Sidebar Link
1. Update both `CompanySidebar.tsx` and `AdminSidebar.tsx`
2. Use `<NavLink>` component for active state styling
3. Ensure route exists in `App.tsx` before linking
4. Check role-based visibility rules before linking

**Example with Role-Based Visibility:**
```tsx
// src/components/CompanySidebar.tsx
const role = getRole();

// ✅ GOOD: Show/hide based on role
<NavLink to="/recruits" className={({ isActive }) => isActive ? 'bg-blue-600' : ''}>
  <Users size={20} />
  <span>Manage Recruits</span>
</NavLink>

// ❌ AVOID: Showing link for unauthorized role
if (role !== 'company') return null; // Better: don't render at all
```

### Adding New API Endpoints
1. Define function in `src/lib/api.ts` using `request()` utility
2. Export for use in components
3. Handle errors in catch block using error message from `request()`
4. Always include proper TypeScript types for request/response
5. Centralize error handling at the HTTP layer, not in components

**Example API Function:**
```typescript
// src/lib/api.ts
export interface CreateContractRequest {
  title: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Contract extends CreateContractRequest {
  id: string;
  createdAt: string;
  status: 'draft' | 'pending' | 'active' | 'completed';
}

// ✅ GOOD: Type-safe with proper error handling
export async function createContract(data: CreateContractRequest): Promise<Contract> {
  return request(`${API_BASE}/api/contracts`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function getContracts(): Promise<Contract[]> {
  return request(`${API_BASE}/api/contracts`);
}

export async function updateContract(id: string, data: Partial<Contract>): Promise<Contract> {
  return request(`${API_BASE}/api/contracts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}
```

**Usage in Components:**
```tsx
// ✅ GOOD: Error handling at component level
async function handleCreate(data: CreateContractRequest) {
  setLoading(true);
  setError(null);
  try {
    const result = await createContract(data);
    // Success handling
    setContract(result);
    navigate(`/contracts/${result.id}`);
  } catch (err: any) {
    // Error from request() is already formatted
    setError(err.message);
  } finally {
    setLoading(false);
  }
}
```

### Environment Variables
- Define in `.env` or `.env.local`
- Access via `import.meta.env.VITE_*` (Vite convention)
- Example: `VITE_API_URL` for API base endpoint

## Backend Development Guidelines (For Backend Team)

### Service Layer Pattern - Best Practices

**Every API endpoint MUST have a dedicated service function:**

```typescript
// ❌ AVOID: Business logic in controllers
app.post('/api/contracts', (req, res) => {
  // Lots of business logic mixed with request handling
  const user = findUserById(req.body.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  // Validation logic
  if (!req.body.title || req.body.title.length < 3) {
    return res.status(400).json({ error: 'Title required' });
  }
  
  // Database logic
  const contract = db.contracts.create({...});
  res.json(contract);
});

// ✅ GOOD: Service layer abstraction
// src/services/contractService.ts
export async function createContract(userId: string, data: CreateContractDto) {
  // Validate inputs
  if (!data.title || data.title.length < 3) {
    throw new ValidationError('Title must be at least 3 characters');
  }

  // Check authorization
  const user = await getUserById(userId);
  if (!user) throw new NotFoundError('User not found');
  
  // Business logic
  if (user.role === 'candidate') {
    throw new ForbiddenError('Candidates cannot create contracts');
  }

  // Persistence
  return await db.contracts.create({
    title: data.title,
    companyId: user.companyId,
    createdAt: new Date()
  });
}

// In controller:
// src/controllers/contractController.ts
app.post('/api/contracts', async (req, res) => {
  try {
    const contract = await createContract(req.user.id, req.body);
    res.status(201).json(contract);
  } catch (err) {
    handleError(res, err);
  }
});
```

**Service Layer Rules:**
- ✅ Each service = one domain entity (contracts, users, applications, etc.)
- ✅ Service functions are **pure business logic** - no HTTP, no middleware
- ✅ All validation happens in service (not in controller)
- ✅ All authorization checks happen in service
- ✅ Services throw specific errors (`ValidationError`, `NotFoundError`, etc.)
- ✅ Services return domain objects, controllers convert to HTTP responses
- ❌ Don't let services depend on request/response objects
- ❌ Don't mix database queries with business logic
- ❌ Don't do validation in both service AND controller

### Authorization: Every Endpoint MUST Check Role

```typescript
// ✅ GOOD: Explicit authorization in every service
export async function getUserRecords(userId: string, role: string) {
  // ALWAYS check role from token/session
  if (role !== 'super_admin' && role !== 'disnaker') {
    throw new ForbiddenError('Only admins can view all records');
  }
  
  return await db.users.findAll();
}

export async function updateContractStatus(userId: string, role: string, contractId: string, newStatus: string) {
  // Check if user is authorized to update contracts
  if (role === 'candidate') {
    throw new ForbiddenError('Candidates cannot update contracts');
  }
  
  // If company, can only update their own contracts
  if (role === 'company') {
    const contract = await db.contracts.findById(contractId);
    if (contract.companyId !== userId) {
      throw new ForbiddenError('Cannot update other company contracts');
    }
  }
  
  return await db.contracts.update(contractId, { status: newStatus });
}

// In middleware:
// ✅ Extract role from token (JWT, session, etc.)
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = verifyToken(token);
  req.user = { id: decoded.userId, role: decoded.role }; // ← Set on request
  next();
});

// Then use in controller:
app.get('/api/records', async (req, res) => {
  try {
    const records = await getUserRecords(req.user.id, req.user.role);
    res.json(records);
  } catch (err) {
    handleError(res, err);
  }
});
```

**Frontend NEVER decides authorization - backend ALWAYS does:**
- Frontend role is ONLY for UI (show/hide links)
- Backend receives token → extracts role → validates access
- If user tries to hit `/api/admin` without admin role → 403 Forbidden
- Frontend handles 403 gracefully (redirect to dashboard, show error)

### Error Response Format - Consistency with Frontend

```typescript
// ✅ GOOD: Structured error responses
app.use((err: any, req: any, res: any, next: any) => {
  // Validation errors
  if (err instanceof ValidationError) {
    return res.status(400).json({
      ok: false,
      errors: [
        { path: 'email', message: 'Invalid email format' },
        { path: 'password', message: 'Password too weak' }
      ]
    });
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      errors: err.issues.map(issue => ({
        path: issue.path[0],
        message: issue.message
      }))
    });
  }

  // Not found errors
  if (err instanceof NotFoundError) {
    return res.status(404).json({
      ok: false,
      message: err.message
    });
  }

  // Forbidden/auth errors
  if (err instanceof ForbiddenError) {
    return res.status(403).json({
      ok: false,
      message: err.message
    });
  }

  // Generic server error
  console.error(err);
  res.status(500).json({
    ok: false,
    message: 'Internal server error'
  });
});
```

### Token & Session Management

```typescript
// ✅ GOOD: Clear token validation
function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded; // { userId, role, iat, exp }
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

// Check expiry
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ ok: false, message: 'No token' });

  const decoded = verifyToken(token);
  
  // Optionally check expiry
  if (decoded.exp && decoded.exp < Date.now() / 1000) {
    return res.status(401).json({ ok: false, message: 'Token expired' });
  }

  req.user = decoded;
  next();
});
```

## Linting & Type Checking

- **ESLint Config:** `eslint.config.js` uses flat config (v9)
- **Extends:** Recommended rules for JS, TypeScript, React Hooks, React Refresh
- **TypeScript:** Strict mode with `tsconfig.app.json` scoped to `src/`
- **Build:** `npm run build` runs `tsc -b` first (stops build if type errors exist)

## Known Limitations & TODOs

1. **No token refresh mechanism** - localStorage tokens don't auto-refresh
2. **No persistent session** - localStorage cleared on manual logout only
3. **Error handling is basic** - API error extraction works but no retry logic
4. **Single API base URL** - No multi-environment strategy (dev/staging/prod)
5. **Sidebar components are large** - Consider extracting nav items to reusable components