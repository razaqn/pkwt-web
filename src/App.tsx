import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginCompany from './pages/LoginCompany';
import LoginAdmin from './pages/LoginAdmin';
import AppLayout from './layouts/AppLayout';
import DashboardAdmin from './components/DashboardAdmin';
import DashboardCompany from './components/DashboardCompany';
import ListsEmployee from './pages/ListsEmployee';
import ListsContract from './pages/ListsContract';
import { RequireAuth, RequireGuest } from './router/guards';
import { getRole } from './store/auth';

function DashboardRoleBased() {
  const role = getRole();

  if (role === 'super_admin' || role === 'disnaker') {
    return <DashboardAdmin />;
  } else if (role === 'company') {
    return <DashboardCompany />;
  }

  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RequireAuth><AppLayout><DashboardRoleBased /></AppLayout></RequireAuth>} />
        <Route path="/daftar-karyawan" element={<RequireAuth><AppLayout pageTitle="Lists Employee"><ListsEmployee /></AppLayout></RequireAuth>} />
        <Route path="/daftar-kontrak" element={<RequireAuth><AppLayout pageTitle="Lists Contract"><ListsContract /></AppLayout></RequireAuth>} />
        <Route path="/login" element={<RequireGuest><LoginCompany /></RequireGuest>} />
        <Route path="/login/admin" element={<RequireGuest><LoginAdmin /></RequireGuest>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
