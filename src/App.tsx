import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginCompany from './pages/LoginCompany';
import LoginAdmin from './pages/LoginAdmin';
import AppLayout from './layouts/AppLayout';
import AdminDashboard from './pages/admin/Dashboard';
import CompanyDashboard from './pages/company/Dashboard';
import Welcome from './pages/company/Welcome';
import ListEmployees from './pages/admin/ListEmployees';
import AdminDetailKaryawan from './pages/admin/DetailKaryawan';
import ListCompanies from './pages/admin/ListCompanies';
import DetailCompany from './pages/admin/DetailCompany';
import ApprovalList from './pages/admin/ApprovalList';
import ApprovalDetail from './pages/admin/ApprovalDetail';
import Config from './pages/admin/Config';
import LandingConfigPage from './pages/admin/LandingConfig';
import ListKaryawan from './pages/company/ListKaryawan';
import DetailKaryawan from './pages/company/DetailKaryawan';
import FormKontrak from './pages/company/FormKontrak';
import PengajuanBerkas from './pages/company/PengajuanBerkas';
import StatusPantau from './pages/company/StatusPantau';
import DetailPantau from './pages/company/DetailPantau';
import ProfilePerusahaan from './pages/company/ProfilePerusahaan';
import { RequireAuth, RequireGuest } from './router/guards';
import { getRole, getToken } from './store/auth';
import { DialogProvider } from './hooks/useDialog';
import Home from './pages/public/Home';

function DashboardWrapper() {
  const role = getRole();

  // Route to appropriate dashboard based on role
  if (role === 'super_admin' || role === 'disnaker') {
    return <AdminDashboard />;
  }

  return <CompanyDashboard />;
}

function RootRedirect() {
  const isAuthed = Boolean(getToken());
  return <Navigate to={isAuthed ? '/dashboard' : '/home'} replace />;
}

function App() {
  return (
    <DialogProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<RequireAuth><AppLayout><DashboardWrapper /></AppLayout></RequireAuth>} />
          <Route path="/welcome" element={<RequireAuth><AppLayout><Welcome /></AppLayout></RequireAuth>} />
          <Route path="/admin/list-employees" element={<RequireAuth><AppLayout><ListEmployees /></AppLayout></RequireAuth>} />
          <Route path="/admin/detail-karyawan/:id" element={<RequireAuth><AppLayout><AdminDetailKaryawan /></AppLayout></RequireAuth>} />
          <Route path="/admin/list-companies" element={<RequireAuth><AppLayout><ListCompanies /></AppLayout></RequireAuth>} />
          <Route path="/admin/detail-company/:id" element={<RequireAuth><AppLayout><DetailCompany /></AppLayout></RequireAuth>} />
          <Route path="/admin/approvals" element={<RequireAuth><AppLayout><ApprovalList /></AppLayout></RequireAuth>} />
          <Route path="/admin/approvals/:contractId" element={<RequireAuth><AppLayout><ApprovalDetail /></AppLayout></RequireAuth>} />
          <Route path="/admin/config" element={<RequireAuth><AppLayout><Config /></AppLayout></RequireAuth>} />
          <Route path="/admin/landing-config" element={<RequireAuth><AppLayout><LandingConfigPage /></AppLayout></RequireAuth>} />
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
    </DialogProvider>
  );
}

export default App
