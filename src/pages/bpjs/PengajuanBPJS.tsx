import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Check, AlertCircle, Edit2, ArrowRight } from 'lucide-react';
import type { BpjsExcelRow } from '../../lib/excel-bpjs';
import { request } from '../../lib/http';
import { toUserMessage } from '../../lib/errors';
import { useDialog } from '../../hooks/useDialog';

type LocationState = {
  bpjsData: BpjsExcelRow[];
  fileName: string;
};

// Internal interface adding validation states
interface BpjsRowState extends BpjsExcelRow {
  _id: string; // temp id for UI map
  _isValid: boolean;
  _errors: string[];
}

export default function PengajuanBPJS() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | undefined;
  const { confirm, alert } = useDialog();

  const [rows, setRows] = useState<BpjsRowState[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRow, setSelectedRow] = useState<BpjsRowState | null>(null);

  useEffect(() => {
    if (!state || !state.bpjsData || state.bpjsData.length === 0) {
      navigate('/bpjs/form');
      return;
    }

    // Initialize rows with validation
    const initialRows = state.bpjsData.map((row) => {
      const errors: string[] = [];
      if (!row.nik || row.nik.length > 16) errors.push('NIK tidak valid');
      if (!row.nama) errors.push('Nama wajib diisi');

      return {
        ...row,
        _id: Math.random().toString(36).substr(2, 9),
        _isValid: errors.length === 0,
        _errors: errors
      };
    });

    setRows(initialRows);
  }, [state, navigate]);

  const stats = {
    total: rows.length,
    valid: rows.filter(r => r._isValid).length,
    invalid: rows.filter(r => !r._isValid).length,
  };

  const isAllValid = stats.invalid === 0 && stats.total > 0;

  const handleSubmit = async () => {
    if (!isAllValid) return;

    const proceed = await confirm({
      title: 'Kirim Data BPJS',
      message: `Anda akan mengirim ${stats.total} data peserta BPJS. Lanjutkan?`,
      confirmText: 'Kirim'
    });
    if (!proceed) return;

    setSubmitting(true);
    try {
      const records = rows.map(r => ({
        nik: r.nik,
        nama: r.nama,
        tanggal_lahir: r.tanggal_lahir,
        jenis_kelamin: r.jenis_kelamin,
        kecamatan: r.kecamatan,
        desa: r.desa,
        jenis_pekerjaan: r.jenis_pekerjaan,
        biaya_iuran_apbd: r.biaya_iuran_apbd,
        jenis_kepesertaan: r.jenis_kepesertaan,
        keterangan: r.keterangan
      }));

      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

      await request(`${API_BASE}/api/bpjs/submissions`, {
        method: 'POST',
        body: JSON.stringify({ records })
      });

      await alert({ title: 'Berhasil', message: 'Data BPJS Ketenagakerjaan berhasil disimpan' });
      navigate('/bpjs/data');
    } catch (err: any) {
      await alert({ title: 'Gagal mengirim data', message: toUserMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const updateSelectedRow = (field: keyof BpjsExcelRow, value: string) => {
    if (!selectedRow) return;
    setSelectedRow({ ...selectedRow, [field]: value });
  };

  const saveSelectedRow = () => {
    if (!selectedRow) return;
    
    // Revalidate
    const errors: string[] = [];
    if (!selectedRow.nik || selectedRow.nik.length > 16) errors.push('NIK tidak valid');
    if (!selectedRow.nama) errors.push('Nama wajib diisi');

    const updatedRow = {
      ...selectedRow,
      _isValid: errors.length === 0,
      _errors: errors
    };

    setRows(current => current.map(r => r._id === updatedRow._id ? updatedRow : r));
    setSelectedRow(null);
  };

  if (!state) return null;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row justify-between items-start md:items-center">
        <div>
          <Link to="/bpjs/form" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-2">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Kembali ke Form Upload
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900">Review Data BPJS</h1>
        </div>
        
        <div className="flex bg-white rounded-lg shadow-sm border border-slate-200 p-2">
          <div className="px-4 text-center border-r border-slate-200">
            <div className="text-xs text-slate-500 uppercase font-semibold">Total</div>
            <div className="text-xl font-bold text-slate-900">{stats.total}</div>
          </div>
          <div className="px-4 text-center border-r border-slate-200">
            <div className="text-xs text-emerald-600 uppercase font-semibold">Valid</div>
            <div className="text-xl font-bold text-emerald-600">{stats.valid}</div>
          </div>
          <div className="px-4 text-center">
            <div className="text-xs text-red-600 uppercase font-semibold">Error</div>
            <div className="text-xl font-bold text-red-600">{stats.invalid}</div>
          </div>
        </div>
      </div>

      {!isAllValid && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-amber-800">Terdapat data yang belum lengkap/valid</h3>
            <p className="text-sm text-amber-700 mt-1">Harap perbaiki {stats.invalid} baris data yang ditandai merah sebelum mengirim.</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">NIK & Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Kelamin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Pekerjaan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status & Kelas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Lokasi</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {rows.map((row) => (
                <tr key={row._id} className={!row._isValid ? "bg-red-50/30" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {row._isValid ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        <Check className="h-3 w-3 mr-1" /> Valid
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800" title={row._errors.join(', ')}>
                        <AlertCircle className="h-3 w-3 mr-1" /> Error
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">{row.nik || '-'}</div>
                    <div className="text-sm text-slate-500">{row.nama || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {row.jenis_kelamin || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {row.jenis_pekerjaan || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <div className="font-medium text-slate-900">{row.status_kepesertaan || '-'}</div>
                    <div className="text-xs">{row.jenis_kepesertaan || '-'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    <div>{row.desa || '-'}</div>
                    <div className="text-xs text-slate-400">{row.kecamatan || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedRow({...row})}
                      className="text-primary hover:text-primary/80 inline-flex items-center"
                    >
                      <Edit2 className="h-4 w-4 mr-1" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 inset-x-0 pb-6 pt-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-30 md:pl-64">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="text-sm text-slate-600">
            Source: <span className="font-medium text-slate-900">{state.fileName}</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!isAllValid || submitting}
            className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-slate-900 bg-secondary hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Mengirim Data...' : 'Kirim Pengajuan'}
            {!submitting && <ArrowRight className="ml-2 -mr-1 h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Edit Modal Component (Inline for simplicity) */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">Perbaiki Data Peserta</h3>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {!selectedRow._isValid && (
                <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                  <ul className="list-disc pl-5">
                    {selectedRow._errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NIK *</label>
                  <input type="text" value={selectedRow.nik || ''} onChange={e => updateSelectedRow('nik', e.target.value)} className="w-full h-10 rounded-lg border border-slate-300 px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap *</label>
                  <input type="text" value={selectedRow.nama || ''} onChange={e => updateSelectedRow('nama', e.target.value)} className="w-full h-10 rounded-lg border border-slate-300 px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Lahir (YYYY-MM-DD)</label>
                  <input type="date" value={selectedRow.tanggal_lahir || ''} onChange={e => updateSelectedRow('tanggal_lahir', e.target.value)} className="w-full h-10 rounded-lg border border-slate-300 px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Kelamin</label>
                  <select value={selectedRow.jenis_kelamin || ''} onChange={e => updateSelectedRow('jenis_kelamin', e.target.value)} className="w-full h-10 rounded-lg border border-slate-300 px-3">
                    <option value="">Pilih...</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pekerjaan</label>
                  <input type="text" value={selectedRow.jenis_pekerjaan || ''} onChange={e => updateSelectedRow('jenis_pekerjaan', e.target.value)} className="w-full h-10 rounded-lg border border-slate-300 px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Desa / Kelurahan</label>
                  <input type="text" value={selectedRow.desa || ''} onChange={e => updateSelectedRow('desa', e.target.value)} className="w-full h-10 rounded-lg border border-slate-300 px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kecamatan</label>
                  <input type="text" value={selectedRow.kecamatan || ''} onChange={e => updateSelectedRow('kecamatan', e.target.value)} className="w-full h-10 rounded-lg border border-slate-300 px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Biaya Iuran APBD</label>
                  <input type="text" value={selectedRow.biaya_iuran_apbd || ''} onChange={e => updateSelectedRow('biaya_iuran_apbd', e.target.value)} className="w-full h-10 rounded-lg border border-slate-300 px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status Kepesertaan</label>
                  <input type="text" value={selectedRow.status_kepesertaan || ''} onChange={e => updateSelectedRow('status_kepesertaan', e.target.value)} className="w-full h-10 rounded-lg border border-slate-300 px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Kepesertaan</label>
                  <input type="text" value={selectedRow.jenis_kepesertaan || ''} onChange={e => updateSelectedRow('jenis_kepesertaan', e.target.value)} className="w-full h-10 rounded-lg border border-slate-300 px-3" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan</label>
                  <textarea value={selectedRow.keterangan || ''} onChange={e => updateSelectedRow('keterangan', e.target.value)} className="w-full rounded-lg border border-slate-300 p-3" rows={2} />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
              <button onClick={() => setSelectedRow(null)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300">
                Batal
              </button>
              <button onClick={saveSelectedRow} className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm">
                Simpan & Validasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
