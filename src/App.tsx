import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginCompany from './pages/LoginCompany';
import LoginAdmin from './pages/LoginAdmin';
import AppLayout from './layouts/AppLayout';
import DashboardAdmin from './components/DashboardAdmin';
import DashboardCompany from './components/DashboardCompany';
import ListsEmployee from './pages/ListsEmployee';
import ListsEmployeeCompany from './pages/ListsEmployeeCompany';
import ListsCompany from './pages/ListsCompany';
import ApprovalPage from './pages/ApprovalPage';
import ApprovalDetail from './pages/ApprovalDetail';
import EmployeeDetail from './pages/EmployeeDetail';
import CompanyDetail from './pages/CompanyDetail';
import FormPKWT from './pages/FormPKWT';
import PengajuanPage from './pages/PengajuanPage';
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
        <Route path="/daftar-karyawan" element={
          <RequireAuth>
            <AppLayout pageTitle="Lists Employee">
              {getRole() === 'company' ? <ListsEmployeeCompany /> : <ListsEmployee />}
            </AppLayout>
          </RequireAuth>
        } />
        <Route path="/daftar-karyawan/:id" element={<RequireAuth><AppLayout pageTitle="Detail Karyawan"><EmployeeDetail /></AppLayout></RequireAuth>} />
        <Route path="/daftar-perusahaan" element={<RequireAuth><AppLayout pageTitle="Lists Company"><ListsCompany /></AppLayout></RequireAuth>} />
        <Route path="/daftar-perusahaan/:id" element={<RequireAuth><AppLayout pageTitle="Detail Perusahaan"><CompanyDetail /></AppLayout></RequireAuth>} />
        <Route path="/perstujuan-pkwt" element={<RequireAuth><AppLayout pageTitle="Approval Page"><ApprovalPage /></AppLayout></RequireAuth>} />
        <Route path="/perstujuan-pkwt/:id" element={<RequireAuth><AppLayout pageTitle="Detail Persetujuan"><ApprovalDetail /></AppLayout></RequireAuth>} />
        <Route path="/form-pkwt" element={<RequireAuth><AppLayout pageTitle="Form PKWT/PKWTT"><FormPKWT /></AppLayout></RequireAuth>} />
        <Route path="/pengajuan" element={<RequireAuth><AppLayout pageTitle="Pengajuan"><PengajuanPage /></AppLayout></RequireAuth>} />
        <Route path="/login" element={<RequireGuest><LoginCompany /></RequireGuest>} />
        <Route path="/login/admin" element={<RequireGuest><LoginAdmin /></RequireGuest>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
