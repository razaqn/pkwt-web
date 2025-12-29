import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { getRole } from '../store/auth';
import CompanySidebar from '../components/CompanySidebar';
import AdminSidebar from '../components/AdminSidebar';
import { Menu } from 'lucide-react';
import { useSessionValidator } from '../hooks/useSessionValidator';
import { SessionInvalidatedModal } from '../components/SessionInvalidatedModal';

type Props = { children: ReactNode };

export default function AppLayout({ children }: Props) {
  const role = getRole();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Poll session validity for admin users - show modal if session invalidated
  const { showInvalidatedModal, handleCloseModal } = useSessionValidator();

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
    <>
      <div className="min-h-screen bg-slate-50">
        <SidebarComponent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="min-h-screen md:pl-56">
          <main className="min-h-screen">
            <section className="max-w-6xl mx-auto px-6 py-6">
              {children}
            </section>
          </main>
        </div>

        {/* Floating button untuk mobile - hanya muncul di mobile */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-[#48A32A] shadow-lg flex items-center justify-center hover:bg-[#3d8a24] transition-colors"
        >
          <Menu className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Session invalidated modal */}
      <SessionInvalidatedModal
        isOpen={showInvalidatedModal}
        onClose={handleCloseModal}
      />
    </>
  );
}
