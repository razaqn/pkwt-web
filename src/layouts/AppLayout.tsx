import type { ReactNode } from 'react';
import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { clearAuth, getRole } from '../store/auth';

type Props = { children: ReactNode };

export default function AppLayout({ children }: Props) {
  const navigate = useNavigate();
  const role = getRole();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  function logout() {
    clearAuth();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {sidebarOpen && <div onClick={()=>setSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-30 md:hidden" />}
      <aside className={`${sidebarOpen? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 w-64 md:w-56 transform transition bg-[#27406a] text-slate-100 flex flex-col`}>
          <div className="px-4 py-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white/10 ring-1 ring-white/15 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white/90"><path d="M19.5 14.25v2.25a2.25 2.25 0 01-2.25 2.25h-10.5A2.25 2.25 0 014.5 16.5v-9A2.25 2.25 0 016.75 5.25h7.5"/><path d="M18.75 3.75h.75v3.75h-3.75v-.75a3 3 0 013-3z"/></svg>
              </div>
              <div>
                <div className="text-sm font-semibold tracking-wide">E-PKWT</div>
                <div className="text-[11px] text-white/70">DISNAKER Paser</div>
              </div>
            </div>
          </div>
          <div className="mx-4 border-t border-white/10" />
          <nav className="px-3 py-4 space-y-2 flex-1 overflow-y-auto">
            <NavLink to="/" className={({isActive})=>`flex items-start gap-3 rounded-xl px-3 py-3 ${isActive? 'bg-white/10 ring-1 ring-white/15 shadow-inner' : 'hover:bg-white/5'} transition` }>
              <span className="mt-0.5 text-white/90">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3 4.5h7.5v7.5H3V4.5zm10.5 0H21v4.5h-7.5V4.5zM3 13.5h4.5V21H3v-7.5zm7.5 0H21V21h-10.5v-7.5z"/></svg>
              </span>
              <span className="flex-1">
                <div className="text-sm font-medium">Overview</div>
                <div className="text-[11px] text-white/70">Ringkasan informasi</div>
              </span>
            </NavLink>
            <NavLink to="/pkwt" className={({isActive})=>`flex items-start gap-3 rounded-xl px-3 py-3 ${isActive? 'bg-white/10 ring-1 ring-white/15 shadow-inner' : 'hover:bg-white/5'} transition` }>
              <span className="mt-0.5 text-white/90">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M7.5 3.75h6a2.25 2.25 0 012.25 2.25v12a2.25 2.25 0 01-2.25 2.25h-6A2.25 2.25 0 015.25 18V6a2.25 2.25 0 012.25-2.25z"/><path d="M12 7.5h3.75"/></svg>
              </span>
              <span className="flex-1">
                <div className="text-sm font-medium">PKWT</div>
                <div className="text-[11px] text-white/70">Karyawan kontrak</div>
              </span>
            </NavLink>
            <NavLink to="/pkwtt" className={({isActive})=>`flex items-start gap-3 rounded-xl px-3 py-3 ${isActive? 'bg-white/10 ring-1 ring-white/15 shadow-inner' : 'hover:bg-white/5'} transition` }>
              <span className="mt-0.5 text-white/90">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9z"/><path d="M4.5 20.25a7.5 7.5 0 0115 0v.75H4.5v-.75z"/></svg>
              </span>
              <span className="flex-1">
                <div className="text-sm font-medium">PKWTT</div>
                <div className="text-[11px] text-white/70">Karyawan tetap</div>
              </span>
            </NavLink>
            <NavLink to="/form" className={({isActive})=>`flex items-start gap-3 rounded-xl px-3 py-3 ${isActive? 'bg-white/10 ring-1 ring-white/15 shadow-inner' : 'hover:bg-white/5'} transition` }>
              <span className="mt-0.5 text-white/90">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 4.5v6h6"/><path d="M6.75 3A2.25 2.25 0 004.5 5.25v13.5A2.25 2.25 0 006.75 21h10.5A2.25 2.25 0 0019.5 18.75V9.75A5.25 5.25 0 0014.25 4.5H6.75z"/></svg>
              </span>
              <span className="flex-1">
                <div className="text-sm font-medium">Form PKWT</div>
                <div className="text-[11px] text-white/70">Buat PKWT baru</div>
              </span>
            </NavLink>
            <NavLink to="/profil" className={({isActive})=>`flex items-start gap-3 rounded-xl px-3 py-3 ${isActive? 'bg-white/10 ring-1 ring-white/15 shadow-inner' : 'hover:bg-white/5'} transition` }>
              <span className="mt-0.5 text-white/90">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3.75 4.5A2.25 2.25 0 016 2.25h12a2.25 2.25 0 012.25 2.25v15a.75.75 0 01-1.2.6L16.5 17.25l-2.7 2.025a.75.75 0 01-1.2-.6v-4.5H6A2.25 2.25 0 013.75 12V4.5z"/></svg>
              </span>
              <span className="flex-1">
                <div className="text-sm font-medium">Profil Perusahaan</div>
                <div className="text-[11px] text-white/70">Data perusahaan</div>
              </span>
            </NavLink>
          </nav>
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-blue-500/80 flex items-center justify-center text-sm font-semibold">{role?.substring(0,2)?.toUpperCase() || 'US'}</div>
              <div className="text-[13px]">
                <div className="font-medium">CV. Contoh Perusahaan</div>
                <div className="text-white/70">{role?.includes('admin') ? 'Administrator' : 'Perusahaan'}</div>
              </div>
            </div>
            <button onClick={logout} className="mt-3 w-full rounded-md px-3 py-2 text-left flex items-center gap-2 hover:bg-white/5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white/90"><path d="M9.75 6.75v-1.5A2.25 2.25 0 0112 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0018 21h-6a2.25 2.25 0 01-2.25-2.25v-1.5"/><path d="M3 12h12m-3-3l3 3-3 3"/></svg>
              <span className="text-sm">Keluar</span>
            </button>
          </div>
        </aside>
      <div className="min-h-screen md:pl-56">
        <main className="min-h-screen">
          <header className="bg-white border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
              <button onClick={()=>setSidebarOpen(!sidebarOpen)} className="md:hidden h-9 w-9 rounded-md border border-slate-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-slate-700"><path d="M3 6.75h18M3 12h18M3 17.25h18"/></svg>
              </button>
              <h1 className="text-xl font-semibold text-slate-900">Overview</h1>
            </div>
          </header>
          <section className="max-w-6xl mx-auto px-6 py-6">
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}
