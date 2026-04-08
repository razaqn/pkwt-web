import { NavLink, useNavigate } from 'react-router-dom';
import { clearAuth } from '../store/auth';
import { UploadCloud, Database, LogOut } from 'lucide-react';

interface BpjsSidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export default function BpjsSidebar({ sidebarOpen, setSidebarOpen }: BpjsSidebarProps) {
    const navigate = useNavigate();

    function logout() {
        clearAuth();
        navigate('/login/admin');
    }

    return (
        <>
            {/* Overlay untuk menutup sidebar di mobile */}
            {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-30 md:hidden" />}

            {/* Sidebar Container */}
            <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 w-64 md:w-56 transform transition bg-[#48A32A] text-slate-100 flex flex-col`}>
                {/* Header Sidebar */}
                <div className="px-4 py-5 flex justify-center">
                    <img src="/siap-pkwt-logo-1.png" alt="siap PKWT Logo" className="h-10 w-auto" />
                </div>

                {/* Divider */}
                <div className="mx-4 border-t border-white/10" />

                {/* Navigasi */}
                <nav className="px-3 py-4 space-y-2 flex-1 overflow-y-auto">
                    <NavLink to="/bpjs/form" className={({ isActive }) => `flex items-start gap-3 rounded-xl px-3 py-3 ${isActive ? 'bg-white/10 ring-1 ring-white/15 shadow-inner' : 'hover:bg-white/5'} transition`}>
                        <span className="mt-0.5 text-white/90">
                            <UploadCloud className="h-5 w-5" />
                        </span>
                        <span className="flex-1">
                            <div className="text-sm font-medium">Masukkan Data</div>
                            <div className="text-[11px] text-white/70">Upload atau input manual BPJS</div>
                        </span>
                    </NavLink>

                    <NavLink to="/bpjs/data" className={({ isActive }) => `flex items-start gap-3 rounded-xl px-3 py-3 ${isActive ? 'bg-white/10 ring-1 ring-white/15 shadow-inner' : 'hover:bg-white/5'} transition`}>
                        <span className="mt-0.5 text-white/90">
                            <Database className="h-5 w-5" />
                        </span>
                        <span className="flex-1">
                            <div className="text-sm font-medium">Lihat Data</div>
                            <div className="text-[11px] text-white/70">Daftar data BPJS terunggah</div>
                        </span>
                    </NavLink>
                </nav>

                {/* Footer Sidebar (Logout) */}
                <div className="p-4 border-t border-white/10">
                    <button onClick={logout} className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-500/80 hover:text-white transition">
                        <LogOut className="h-4 w-4" />
                        Keluar Akun
                    </button>
                    <div className="mt-3 text-center text-[10px] text-white/40">
                        SIAP PKWT v1.0
                    </div>
                </div>
            </aside>
        </>
    );
}

