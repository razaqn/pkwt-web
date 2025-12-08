import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginCompany from './pages/LoginCompany';
import LoginAdmin from './pages/LoginAdmin';
import AppLayout from './layouts/AppLayout';
import AdminDashboard from './pages/admin/Dashboard';
import CompanyDashboard from './pages/company/Dashboard';
import ListKaryawan from './pages/company/ListKaryawan';
import DetailKaryawan from './pages/company/DetailKaryawan';
import FormKontrak from './pages/company/FormKontrak';
import PengajuanBerkas from './pages/company/PengajuanBerkas';
import StatusPantau from './pages/company/StatusPantau';
import DetailPantau from './pages/company/DetailPantau';
import ProfilePerusahaan from './pages/company/ProfilePerusahaan';
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
        <Route path="/list-karyawan" element={<RequireAuth><AppLayout><ListKaryawan /></AppLayout></RequireAuth>} />
        <Route path="/detail-karyawan/:id" element={<RequireAuth><AppLayout><DetailKaryawan /></AppLayout></RequireAuth>} />
        <Route path="/form-kontrak" element={<RequireAuth><AppLayout><FormKontrak /></AppLayout></RequireAuth>} />
        <Route path="/pengajuan-berkas" element={<RequireAuth><AppLayout><PengajuanBerkas /></AppLayout></RequireAuth>} />
        <Route path="/status-pantau" element={<RequireAuth><AppLayout><StatusPantau /></AppLayout></RequireAuth>} />
        <Route path="/status-pantau/:contractId" element={<RequireAuth><AppLayout><DetailPantau /></AppLayout></RequireAuth>} />
        <Route path="/profil-perusahaan" element={<RequireAuth><AppLayout><ProfilePerusahaan /></AppLayout></RequireAuth>} />
        <Route path="/login" element={<RequireGuest><LoginCompany /></RequireGuest>} />
        <Route path="/login/admin" element={<RequireGuest><LoginAdmin /></RequireGuest>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
