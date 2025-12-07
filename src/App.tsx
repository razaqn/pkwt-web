import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginCompany from './pages/LoginCompany';
import LoginAdmin from './pages/LoginAdmin';
import AppLayout from './layouts/AppLayout';
import AdminDashboard from './pages/admin/Dashboard';
import CompanyDashboard from './pages/company/Dashboard';
import { RequireAuth, RequireGuest } from './router/guards';
import { getRole } from './store/auth';

function DashboardWrapper() {
  const role = getRole();

  // Route to appropriate dashboard based on role
  if (role === 'super_admin' || role === 'disnaker') {
    return <AdminDashboard />;
  }

  return <CompanyDashboard />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RequireAuth><AppLayout><DashboardWrapper /></AppLayout></RequireAuth>} />
        <Route path="/login" element={<RequireGuest><LoginCompany /></RequireGuest>} />
        <Route path="/login/admin" element={<RequireGuest><LoginAdmin /></RequireGuest>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
