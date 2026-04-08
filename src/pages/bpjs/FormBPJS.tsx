import { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Download, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { BpjsExcelRow } from '../../lib/excel-bpjs';
import { parseBPJSExcelFile } from '../../lib/excel-bpjs';
import { ClipLoader } from 'react-spinners';

export default function FormBPJS() {
  const [file, setFile] = useState<File | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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

      // Instead of storing in a complex context, we can just pass the parsed data via router state
      // or to a local storage temporarily. 
      // Using navigate state is simplest for flow: Form -> PengajuanBPJS
      navigate('/bpjs/submit', { state: { bpjsData: data, fileName: file.name } });
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memproses file');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Input Data BPJS dari Excel</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex gap-3 border border-red-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
          <h3 className="font-medium text-slate-900 mb-2">Panduan Import Excel</h3>
          <p className="text-sm text-slate-600 mb-3">
            File Excel harus mengandung baris header dengan nama kolom berikut. Urutan kolom bebas, yang penting penulisan judul kolom sesuai:
          </p>
          <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
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
      </div>
    </div>
  );
}
