"use client";

import { NavLink, useNavigate } from 'react-router-dom';
import { clearAuth, getRole } from '../store/auth';
import { LayoutDashboard, Users, FilePlus, Building, LogOut, FileCheck, BookOpen } from 'lucide-react';

interface CompanySidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export default function CompanySidebar({ sidebarOpen, setSidebarOpen }: CompanySidebarProps) {
    const navigate = useNavigate();
    const role = getRole();

    function logout() {
        clearAuth();
        navigate('/login');
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
                    <NavLink to="/welcome" className={({ isActive }) => `flex items-start gap-3 rounded-xl px-3 py-3 ${isActive ? 'bg-white/10 ring-1 ring-white/15 shadow-inner' : 'hover:bg-white/5'} transition`}>
                        <span className="mt-0.5 text-white/90">
                            <BookOpen className="h-5 w-5" />
                        </span>
                        <span className="flex-1">
                            <div className="text-sm font-medium">Panduan</div>
                            <div className="text-[11px] text-white/70">Informasi PKWT</div>
                        </span>
                    </NavLink>

                    <NavLink to="/dashboard" className={({ isActive }) => `flex items-start gap-3 rounded-xl px-3 py-3 ${isActive ? 'bg-white/10 ring-1 ring-white/15 shadow-inner' : 'hover:bg-white/5'} transition`}>
                        <span className="mt-0.5 text-white/90">
                            <LayoutDashboard className="h-5 w-5" />
                        </span>
                        <span className="flex-1">
                            <div className="text-sm font-medium">Overview</div>
                            <div className="text-[11px] text-white/70">Ringkasan informasi</div>
                        </span>
                    </NavLink>

                    <NavLink to="/list-karyawan" className={({ isActive }) => `flex items-start gap-3 rounded-xl px-3 py-3 ${isActive ? 'bg-white/10 ring-1 ring-white/15 shadow-inner' : 'hover:bg-white/5'} transition`}>
                        <span className="mt-0.5 text-white/90">
                            <Users className="h-5 w-5" />
                        </span>
                        <span className="flex-1">
                            <div className="text-sm font-medium">List Karyawan</div>
                            <div className="text-[11px] text-white/70">PKWT & PKWTT</div>
                        </span>
                    </NavLink>

                    <NavLink to="/form-kontrak" className={({ isActive }) => `flex items-start gap-3 rounded-xl px-3 py-3 ${isActive ? 'bg-white/10 ring-1 ring-white/15 shadow-inner' : 'hover:bg-white/5'} transition`}>
                        <span className="mt-0.5 text-white/90">
                            <FilePlus className="h-5 w-5" />
                        </span>
                        <span className="flex-1">
                            <div className="text-sm font-medium">Form Kontrak</div>
                            <div className="text-[11px] text-white/70">PKWT & PKWTT</div>
                        </span>
                    </NavLink>

                    <NavLink to="/status-pantau" className={({ isActive }) => `flex items-start gap-3 rounded-xl px-3 py-3 ${isActive ? 'bg-white/10 ring-1 ring-white/15 shadow-inner' : 'hover:bg-white/5'} transition`}>
                        <span className="mt-0.5 text-white/90">
                            <FileCheck className="h-5 w-5" />
                        </span>
                        <span className="flex-1">
                            <div className="text-sm font-medium">Status Pengajuan</div>
                            <div className="text-[11px] text-white/70">Pantau pengajuan</div>
                        </span>
                    </NavLink>

                    <NavLink to="/profil-perusahaan" className={({ isActive }) => `flex items-start gap-3 rounded-xl px-3 py-3 ${isActive ? 'bg-white/10 ring-1 ring-white/15 shadow-inner' : 'hover:bg-white/5'} transition`}>
                        <span className="mt-0.5 text-white/90">
                            <Building className="h-5 w-5" />
                        </span>
                        <span className="flex-1">
                            <div className="text-sm font-medium">Profil Perusahaan</div>
                            <div className="text-[11px] text-white/70">Data perusahaan</div>
                        </span>
                    </NavLink>
                </nav>

                {/* Footer Sidebar */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#48A32A] flex items-center justify-center text-sm font-semibold text-white">
                            {role?.substring(0, 2)?.toUpperCase() || 'US'}
                        </div>
                        <div className="text-[13px]">
                            <div className="font-medium">CV. Contoh Perusahaan</div>
                            <div className="text-white/70">{role?.includes('admin') ? 'Administrator' : 'Perusahaan'}</div>
                        </div>
                    </div>
                    <button onClick={logout} className="mt-3 w-full rounded-md px-3 py-2 text-left flex items-center gap-2 hover:bg-white/5">
                        <LogOut className="h-5 w-5 text-white/90" />
                        <span className="text-sm">Keluar</span>
                    </button>
                </div>
            </aside>
        </>
    );
}