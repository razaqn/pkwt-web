import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginCompany from './pages/LoginCompany';
import LoginAdmin from './pages/LoginAdmin';
import { getToken } from './store/auth';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import { RequireAuth, RequireGuest } from './router/guards';

function App() {
  const isAuthed = Boolean(getToken());
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RequireAuth><AppLayout><Dashboard /></AppLayout></RequireAuth>} />
        <Route path="/login" element={<RequireGuest><LoginCompany /></RequireGuest>} />
        <Route path="/login/admin" element={<RequireGuest><LoginAdmin /></RequireGuest>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
