import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UploadCloud, Database, LogOut } from 'lucide-react';
import { clearAuth } from '../store/auth';

type Props = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

export default function BpjsSidebar({ sidebarOpen, setSidebarOpen }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/home');
  };

  const navItems = [
    { name: 'Masukkan Data', path: '/bpjs/form', icon: UploadCloud },
    { name: 'Lihat Data', path: '/bpjs/data', icon: Database },
  ];

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`fixed inset-y-0 left-0 bg-white shadow-xl z-50 w-64 transform transition-transform duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-100">
          <img className="h-8 w-auto" src="/siap-pkwt-logo-1.png" alt="Petugas BPJS" />
        </div>
        
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4 shrink-0">
          <button
            onClick={handleLogout}
            className="group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-red-400 group-hover:text-red-500" />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
