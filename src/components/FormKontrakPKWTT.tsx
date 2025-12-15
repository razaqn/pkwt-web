import { Upload, X, AlertCircle, FileText, FileSpreadsheet, CheckCircle, Download } from 'lucide-react';
import { useState } from 'react';
import { parseExcelFile, mapExcelRowsToPKWTT, MAX_FILE_SIZE_MB as EXCEL_MAX_SIZE_MB } from '../lib/excel';
import { ClipLoader } from 'react-spinners';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface FormKontrakPKWTTData {
    nik: string;
    startDate: string;
    fileKontrak: File | null;
    importedData?: Record<string, any>; // NIK -> additional Excel data mapping
}

interface FormKontrakPKWTTProps {
    data: FormKontrakPKWTTData;
    onChange: (data: FormKontrakPKWTTData) => void;
    errors?: Partial<Record<keyof FormKontrakPKWTTData, string>>;
    loading?: boolean;
}

export default function FormKontrakPKWTT({ data, onChange, errors = {}, loading = false }: FormKontrakPKWTTProps) {
    const [importError, setImportError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState<string | null>(null);
    const [importWarnings, setImportWarnings] = useState<string[]>([]);
    const [isImporting, setIsImporting] = useState(false);

    function updateNIK(value: string) {
        onChange({
            ...data,
            nik: value
        });
    }

    function updateStartDate(value: string) {
        onChange({
            ...data,
            startDate: value
        });
    }

    function handleFileChange(file: File | null) {
        // Validate file type
        if (file && !file.type.includes('pdf')) {
            return;
        }
        // Validate file size
        if (file && file.size > MAX_FILE_SIZE_BYTES) {
            return;
        }
        onChange({
            ...data,
            fileKontrak: file
        });
    }

    function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] || null;
        if (file && file.size > MAX_FILE_SIZE_BYTES) {
            // Reset input
            e.target.value = '';
            return;
        }
        handleFileChange(file);
    }

    function clearFile() {
        onChange({
            ...data,
            fileKontrak: null
        });
    }

    async function handleExcelImport(file: File | null) {
        if (!file) return;

        setIsImporting(true);
        setImportError(null);
        setImportSuccess(null);
        setImportWarnings([]);

        try {
            // Parse Excel file
            const result = await parseExcelFile(file);

            // Map to PKWTT format (single NIK from first row)
            const { nik, importedData, multipleRowsWarning } = mapExcelRowsToPKWTT(result.rows);

            // Update NIK and imported data
            onChange({
                ...data,
                nik,
                importedData: { [nik]: importedData },
            });

            // Show success message
            let successMsg = `✓ NIK berhasil diimpor dari ${result.fileName}`;
            if (multipleRowsWarning) {
                successMsg += ' (Hanya baris pertama yang digunakan untuk PKWTT)';
            }
            setImportSuccess(successMsg);

            // Show warnings if any
            if (result.warnings.length > 0 || multipleRowsWarning) {
                const warnings = [...result.warnings];
                if (multipleRowsWarning) {
                    warnings.unshift('File memiliki multiple baris, hanya baris pertama yang digunakan');
                }
                setImportWarnings(warnings);
            }

            // Clear success message after 5 seconds
            setTimeout(() => setImportSuccess(null), 5000);
        } catch (err: any) {
            setImportError(err?.message || 'Gagal mengimpor file Excel');
        } finally {
            setIsImporting(false);
        }
    }

    function clearImportMessages() {
        setImportError(null);
        setImportSuccess(null);
        setImportWarnings([]);
    }

    return (
        <div className="space-y-6">
            {/* NIK Section */}
            <div className="space-y-3">
                <label htmlFor="nik" className="block">
                    <span className="text-sm font-medium text-slate-700">NIK Karyawan</span>
                    <span className="text-red-500 ml-1">*</span>
                </label>

                {/* Excel Import Section */}
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">Import dari Excel</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href="/templates/template-import-pkwtt.xlsx"
                                download
                                className="inline-flex items-center gap-2 rounded-md border border-blue-300 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                            >
                                <Download className="h-4 w-4" />
                                Template
                            </a>
                            <input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    if (file) {
                                        handleExcelImport(file);
                                        e.target.value = ''; // Reset input
                                    }
                                }}
                                disabled={loading || isImporting}
                                className="hidden"
                                id="excelInputPKWTT"
                            />
                            <label
                                htmlFor="excelInputPKWTT"
                                className={`inline-flex items-center gap-2 rounded-md border border-blue-300 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50 transition cursor-pointer ${loading || isImporting ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isImporting && <ClipLoader size={14} color="#419823" />}
                                <Upload className="h-4 w-4" />
                                {isImporting ? 'Mengimpor...' : 'Pilih File'}
                            </label>
                        </div>
                    </div>
                    <p className="text-xs text-blue-700">
                        📄 File Excel (.xlsx, .xls, .csv) dengan kolom "NIK" (wajib). Hanya baris pertama yang digunakan. Max {EXCEL_MAX_SIZE_MB}MB.
                    </p>
                </div>

                {/* Import Success Message */}
                {importSuccess && (
                    <div className="flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 p-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm text-green-700">{importSuccess}</p>
                        </div>
                        <button
                            onClick={clearImportMessages}
                            type="button"
                            className="text-green-600 hover:text-green-800"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Import Error Message */}
                {importError && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm text-red-700">{importError}</p>
                        </div>
                        <button
                            onClick={clearImportMessages}
                            type="button"
                            className="text-red-600 hover:text-red-800"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Import Warnings */}
                {importWarnings.length > 0 && (
                    <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 space-y-1">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-900">Peringatan Import:</span>
                        </div>
                        <ul className="text-xs text-yellow-700 list-disc list-inside space-y-0.5">
                            {importWarnings.slice(0, 5).map((warning, idx) => (
                                <li key={idx}>{warning}</li>
                            ))}
                            {importWarnings.length > 5 && (
                                <li className="italic">...dan {importWarnings.length - 5} peringatan lainnya</li>
                            )}
                        </ul>
                    </div>
                )}

                <input
                    id="nik"
                    type="text"
                    value={data.nik}
                    onChange={(e) => updateNIK(e.target.value)}
                    placeholder="Masukkan NIK atau import dari Excel"
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
                {errors.nik && <p className="text-sm text-red-500">{errors.nik}</p>}
            </div>

            {/* Start Date */}
            <div className="space-y-2">
                <label htmlFor="startDate" className="block">
                    <span className="text-sm font-medium text-slate-700">Tanggal Mulai</span>
                    <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                    id="startDate"
                    type="date"
                    value={data.startDate}
                    onChange={(e) => updateStartDate(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
                {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
            </div>

            {/* File Kontrak */}
            <div className="space-y-2">
                <label className="block">
                    <span className="text-sm font-medium text-slate-700">File Kontrak</span>
                    <span className="text-red-500 ml-1">*</span>
                    <span className="text-xs text-slate-500 ml-2">(Format PDF, Maksimal 5MB)</span>
                </label>

                {data.fileKontrak ? (
                    <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-blue-50 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">{data.fileKontrak.name}</p>
                                <p className="text-xs text-blue-700">
                                    {(data.fileKontrak.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={clearFile}
                            disabled={loading}
                            type="button"
                            className="rounded p-1 hover:bg-blue-100 disabled:opacity-50 transition"
                            title="Hapus file"
                        >
                            <X className="h-5 w-5 text-blue-600" />
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                        <Upload className="h-8 w-8 text-slate-400 mb-2" />
                        <span className="text-sm font-medium text-slate-700">Pilih file PDF</span>
                        <span className="text-xs text-slate-500 mt-1">atau drag and drop</span>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={onFileInputChange}
                            disabled={loading}
                            className="hidden"
                        />
                    </label>
                )}

                {errors.fileKontrak && (
                    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700">{errors.fileKontrak}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
