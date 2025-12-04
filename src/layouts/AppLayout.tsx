import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { getRole } from '../store/auth';
import CompanySidebar from '../components/CompanySidebar';
import AdminSidebar from '../components/AdminSidebar';

type Props = { children: ReactNode };

export default function AppLayout({ children }: Props) {
  const role = getRole();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Jika layar besar (md: breakpoint atau lebih), set sidebarOpen ke true
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pilih sidebar berdasarkan role
  const SidebarComponent = role === 'super_admin' || role === 'disnaker' ? AdminSidebar : CompanySidebar;

  return (
    <div className="min-h-screen bg-slate-50">
      <SidebarComponent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="min-h-screen md:pl-56">
        <main className="min-h-screen">
          <header className="bg-white border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden h-9 w-9 rounded-md border border-slate-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-slate-700"><path d="M3 6.75h18M3 12h18M3 17.25h18" /></svg>
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
