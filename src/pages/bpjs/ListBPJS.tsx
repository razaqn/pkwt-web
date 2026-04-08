import { useState, useEffect, useCallback } from 'react';
import { request } from '../../lib/http';
import { toUserMessage } from '../../lib/errors';
import { AlertCircle, Search, RefreshCw, FileSpreadsheet } from 'lucide-react';

interface BpjsRecord {
  id: string;
  nik: string;
  nama: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  kecamatan?: string;
  desa?: string;
  jenis_pekerjaan?: string;
  biaya_iuran_apbd?: string;
  jenis_kepesertaan?: string;
  keterangan?: string;
  created_at: string;
}

export default function ListBPJS() {
  const [data, setData] = useState<BpjsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  
  const limit = 10;

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (activeSearch) url.append('search', activeSearch);

      const res = await request(`/api/bpjs/records?${url.toString()}`);
      setData(res.data);
      setTotal(res.pagination.total);
    } catch (err: any) {
      setError(toUserMessage(err, 'Gagal memuat data BPJS'));
    } finally {
      setLoading(false);
    }
  }, [page, activeSearch]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchQuery);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Data BPJS</h1>
          <p className="mt-1 text-sm text-slate-500">Daftar peserta BPJS Ketenagakerjaan</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearch} className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Cari NIK atau Nama..."
            />
          </form>
          
          <button 
            onClick={fetchRecords} 
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 w-full md:w-auto justify-center"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-b border-red-100 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">NIK & Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Lokasi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pekerjaan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kepesertaan & Tgl Masuk</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading && data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">Memuat data...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center">
                    <FileSpreadsheet className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-slate-900 font-medium">Tidak ada data</h3>
                    <p className="text-slate-500 text-sm mt-1">Data BPJS belum ditambahkan atau tidak ditemukan.</p>
                  </td>
                </tr>
              ) : (
                data.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{item.nik}</div>
                      <div className="text-sm text-slate-500">{item.nama}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {item.jenis_kelamin || '-'} {item.tanggal_lahir ? `• ${item.tanggal_lahir}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">{item.desa || '-'}</div>
                      <div className="text-sm text-slate-500">{item.kecamatan || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">{item.jenis_pekerjaan || '-'}</div>
                      {item.biaya_iuran_apbd && (
                        <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {item.biaya_iuran_apbd}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <div>{item.jenis_kepesertaan || '-'}</div>
                      <div className="mt-1 text-xs">{new Date(item.created_at).toLocaleDateString('id-ID')}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-700">
                  Menampilkan <span className="font-medium">{((page - 1) * limit) + 1}</span> hingga <span className="font-medium">{Math.min(page * limit, total)}</span> dari <span className="font-medium">{total}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Sebelumnya
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Selanjutnya
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
