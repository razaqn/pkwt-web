import { Users, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BpjsDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Dashboard Petugas BPJS</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola dan input data BPJS Ketenagakerjaan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/bpjs/form" className="block bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900">Masukkan Data</h3>
              <p className="text-sm text-slate-500">Upload dan ajukan data dari Excel</p>
            </div>
          </div>
        </Link>
        <Link to="/bpjs/data" className="block bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900">Lihat Data</h3>
              <p className="text-sm text-slate-500">Pantau data yang telah diajukan</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
