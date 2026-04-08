import { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Download, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { BpjsExcelRow } from '../../lib/excel-bpjs';
import { parseBPJSExcelFile } from '../../lib/excel-bpjs';
import { ClipLoader } from 'react-spinners';

type TabMode = 'EXCEL' | 'MANUAL';

export default function FormBPJS() {
  const [activeTab, setActiveTab] = useState<TabMode>('EXCEL');
  const [file, setFile] = useState<File | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Manual Input State
  const [manualRows, setManualRows] = useState<BpjsExcelRow[]>([{
    nik: '', nama: '', tanggal_lahir: '', jenis_kelamin: '', kecamatan: '', 
    desa: '', jenis_pekerjaan: '', biaya_iuran_apbd: '', 
    jenis_kepesertaan: '', keterangan: ''
  }]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcessFile = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const data: BpjsExcelRow[] = await parseBPJSExcelFile(file);
      if (data.length === 0) {
        throw new Error('Tidak ada data valid yang ditemukan dalam file Excel');
      }

      navigate('/bpjs/submit', { state: { bpjsData: data, fileName: file.name } });
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memproses file');
      setLoading(false);
    }
  };

  const handleAddRow = () => {
    setManualRows([...manualRows, {
      nik: '', nama: '', tanggal_lahir: '', jenis_kelamin: '', kecamatan: '', 
      desa: '', jenis_pekerjaan: '', biaya_iuran_apbd: '', 
      jenis_kepesertaan: '', keterangan: ''
    }]);
  };

  const handleRemoveRow = (index: number) => {
    const newRows = [...manualRows];
    newRows.splice(index, 1);
    setManualRows(newRows);
  };

  const handleRowChange = (index: number, field: keyof BpjsExcelRow, value: string) => {
    const newRows = [...manualRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setManualRows(newRows);
  };

  const handleSubmitManual = () => {
    setError(null);
    if (manualRows.length === 0) {
      setError('Maaf, minimal satu data harus diisi.');
      return;
    }
    const invalidRows = manualRows.filter(r => !r.nik || !/^\d{16}$/.test(r.nik) || !r.nama.trim());
    if (invalidRows.length > 0) {
       setError('Semua baris wajib memiliki NIK (16 digit angka) dan Nama Lengkap yang terisi.');
       return;
    }

    navigate('/bpjs/submit', { state: { bpjsData: manualRows, fileName: 'Input_Manual_BPJS' } });
  };

  return (
    <div className="space-y-6">

      {/* Tabs */}
      <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
              <button
                  type="button"
                  onClick={() => { setActiveTab('EXCEL'); setError(null); }}
                  className={
                      activeTab === 'EXCEL'
                          ? 'rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary ring-1 ring-inset ring-primary/20'
                          : 'rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50'
                  }
              >
                  Gunakan Excel
              </button>
              <button
                  type="button"
                  onClick={() => { setActiveTab('MANUAL'); setError(null); }}
                  className={
                      activeTab === 'MANUAL'
                          ? 'rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary ring-1 ring-inset ring-primary/20'
                          : 'rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50'
                  }
              >
                  Input Manual
              </button>
          </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {activeTab === 'EXCEL' ? 'Input Data BPJS dari Excel' : 'Input Data BPJS Manual'}
        </h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex gap-3 border border-red-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {activeTab === 'EXCEL' && (
          <>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
              <h3 className="font-medium text-slate-900 mb-2">Panduan Import Excel</h3>
              <p className="text-sm text-slate-600 mb-3">
                File Excel harus mengandung baris header dengan nama kolom berikut. Urutan kolom bebas, yang penting penulisan judul kolom sesuai:
              </p>
              <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1 mt-2">
                <li><span className="font-medium text-slate-800">No</span></li>
                <li><span className="font-medium text-slate-800">NIK / No KTP</span> (Wajib)</li>
                <li><span className="font-medium text-slate-800">Nama / Nama Lengkap</span> (Wajib)</li>
                <li><span className="font-medium text-slate-800">Tanggal Lahir</span> (Opsional)</li>
                <li><span className="font-medium text-slate-800">Kelamin / Jenis Kelamin</span> (Opsional)</li>
                <li><span className="font-medium text-slate-800">Kecamatan</span> (Opsional)</li>
                <li><span className="font-medium text-slate-800">Desa / Kelurahan</span> (Opsional)</li>
                <li><span className="font-medium text-slate-800">Jenis Pekerjaan</span> (Opsional)</li>
                <li><span className="font-medium text-slate-800">Biaya Iuran yang Ditanggung APBD</span> (Opsional)</li>
                <li><span className="font-medium text-slate-800">Jenis Kepesertaan</span> (Opsional)</li>
                <li><span className="font-medium text-slate-800">Keterangan</span> (Opsional)</li>
              </ul>
            </div>

            <div
              className={`mt-4 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer ${
                isHovering || file ? 'border-primary bg-primary/5' : 'border-slate-300 hover:border-slate-400 bg-slate-50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
              onDragLeave={() => setIsHovering(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsHovering(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? (
                <>
                  <div className="h-16 w-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileSpreadsheet className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-lg font-medium text-slate-900">{file.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  <button
                    type="button"
                    className="mt-4 text-sm text-primary font-medium hover:text-primary/80"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  >
                    Ganti File
                  </button>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <UploadCloud className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-lg font-medium text-slate-900">Klik atau seret file Excel ke sini</p>
                  <p className="mt-1 text-sm text-slate-500">Mendukung file .xlsx dan .xls</p>
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
              />
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleProcessFile}
                disabled={!file || loading}
                className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? <ClipLoader size={16} color="#fff" /> : <Download className="h-4 w-4" />}
                {loading ? 'Memproses File...' : 'Proses Data'}
              </button>
            </div>
          </>
        )}

        {activeTab === 'MANUAL' && (
          <div className="space-y-4">
            {manualRows.map((row, index) => (
              <div key={index} className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-1">
                    <label className="text-sm font-medium text-slate-700">NIK (16 Digit) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={row.nik}
                      onChange={(e) => handleRowChange(index, 'nik', e.target.value)}
                      placeholder="Contoh: 1234567890123456"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-sm font-medium text-slate-700">Nama Lengkap <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={row.nama}
                      onChange={(e) => handleRowChange(index, 'nama', e.target.value)}
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-sm font-medium text-slate-700">Keterangan (Opsional)</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={row.keterangan || ''}
                      onChange={(e) => handleRowChange(index, 'keterangan', e.target.value)}
                      placeholder="Masukkan keterangan"
                    />
                  </div>
                  <div className="pt-6">
                    <button
                      onClick={() => handleRemoveRow(index)}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100 transition h-[38px] flex items-center justify-center"
                      title="Hapus Data"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={handleAddRow}
              className="text-sm font-semibold text-primary hover:text-primary transition flex items-center gap-1 mt-2"
            >
              <Plus className="h-4 w-4" /> Tambah Baris
            </button>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmitManual}
                className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

