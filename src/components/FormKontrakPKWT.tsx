import { Trash2, Upload, FileText, AlertCircle, FileSpreadsheet, X, CheckCircle, Download } from 'lucide-react';
import { useState } from 'react';
import { parseExcelFile, mapExcelRowsToPKWT, MAX_FILE_SIZE_MB as EXCEL_MAX_SIZE_MB } from '../lib/excel';
import { ClipLoader } from 'react-spinners';
import { toUserMessage } from '../lib/errors';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface NIKEntry {
    id: string;
    nik: string;
}

export interface FormKontrakPKWTData {
    niks: NIKEntry[];
    startDate: string;
    durasi: number;
    fileKontrak?: File | null;
    importedData?: Record<string, any>; // NIK -> additional Excel data mapping
}

interface FormKontrakPKWTProps {
    data: FormKontrakPKWTData;
    onChange: (data: FormKontrakPKWTData) => void;
    errors?: Partial<Record<keyof FormKontrakPKWTData, string>>;
    loading?: boolean;
}

export default function FormKontrakPKWT({ data, onChange, errors = {}, loading = false }: FormKontrakPKWTProps) {
    const [importError, setImportError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState<string | null>(null);
    const [importWarnings, setImportWarnings] = useState<string[]>([]);
    const [isImporting, setIsImporting] = useState(false);

    function addNIK() {
        const newNIKEntry: NIKEntry = {
            id: Date.now().toString(),
            nik: ''
        };
        onChange({
            ...data,
            niks: [...data.niks, newNIKEntry]
        });
    }

    function removeNIK(id: string) {
        onChange({
            ...data,
            niks: data.niks.filter(entry => entry.id !== id)
        });
    }

    function updateNIK(id: string, value: string) {
        onChange({
            ...data,
            niks: data.niks.map(entry =>
                entry.id === id ? { ...entry, nik: value } : entry
            )
        });
    }

    function updateStartDate(value: string) {
        onChange({
            ...data,
            startDate: value
        });
    }

    function updateDurasi(value: string) {
        const durasiNum = parseInt(value, 10);
        onChange({
            ...data,
            durasi: isNaN(durasiNum) ? 0 : durasiNum
        });
    }

    function handleFileChange(file: File | null) {
        // Validate file size (max 7MB)
        if (file && file.size > MAX_FILE_SIZE_BYTES) {
            // Show error by passing null and triggering error in parent
            onChange({
                ...data,
                fileKontrak: null
            });
            // Error will be set by parent component based on file validation
            return;
        }

        onChange({
            ...data,
            fileKontrak: file
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

            // Map to PKWT format and check for duplicates with existing NIKs
            const { niks: newNIKs, importedData, duplicates } = mapExcelRowsToPKWT(result.rows, data.niks);

            if (newNIKs.length === 0 && duplicates.length === 0) {
                setImportError('Tidak ada NIK baru untuk diimpor');
                return;
            }

            // Merge with existing NIKs
            const updatedNIKs = [...data.niks, ...newNIKs];

            // Merge imported data
            const updatedImportedData = { ...data.importedData, ...importedData };

            onChange({
                ...data,
                niks: updatedNIKs,
                importedData: updatedImportedData,
            });

            // Show success message
            let successMsg = `✓ ${newNIKs.length} NIK berhasil diimpor dari ${result.fileName}`;
            if (duplicates.length > 0) {
                successMsg += ` (${duplicates.length} NIK duplikat dilewati)`;
            }
            setImportSuccess(successMsg);

            // Show warnings if any
            if (result.warnings.length > 0) {
                setImportWarnings(result.warnings);
            }

            // Clear success message after 5 seconds
            setTimeout(() => setImportSuccess(null), 5000);
        } catch (err: any) {
            setImportError(toUserMessage(err, 'Gagal mengimpor file Excel'));
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
        <div className="space-y-8">
            {/* NIK Section */}
            <div className="space-y-3">
                <label className="block">
                    <span className="text-sm font-medium text-slate-700">NIK Karyawan</span>
                    <span className="text-red-500 ml-1">*</span>
                    <span className="text-xs text-slate-500 ml-2">(Dapat lebih dari satu)</span>
                </label>

                {/* Excel Import Section */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold text-slate-900">Import dari Excel</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href="/templates/template-import-pkwt.xlsx"
                                download
                                className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-white px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/5 transition cursor-pointer"
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
                                id="excelInput"
                            />
                            <label
                                htmlFor="excelInput"
                                className={`inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-white px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/5 transition cursor-pointer ${loading || isImporting ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isImporting && <ClipLoader size={14} color="#419823" />}
                                <Upload className="h-4 w-4" />
                                {isImporting ? 'Mengimpor...' : 'Pilih File'}
                            </label>
                        </div>
                    </div>
                    <p className="text-xs text-slate-700">
                        File Excel (.xlsx, .xls, .csv) dengan kolom "NIK" (wajib). Max {EXCEL_MAX_SIZE_MB}MB, 500 baris. Data diproses di browser Anda.
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
                    <div className="rounded-xl bg-secondary/20 border border-secondary/40 p-4 space-y-1">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-slate-800" />
                            <span className="text-sm font-semibold text-slate-900">Peringatan Import:</span>
                        </div>
                        <ul className="text-xs text-slate-700 list-disc list-inside space-y-0.5">
                            {importWarnings.slice(0, 5).map((warning, idx) => (
                                <li key={idx}>{warning}</li>
                            ))}
                            {importWarnings.length > 5 && (
                                <li className="italic">...dan {importWarnings.length - 5} peringatan lainnya</li>
                            )}
                        </ul>
                    </div>
                )}

                <div className="space-y-2">
                    {data.niks.length === 0 ? (
                        <p className="text-sm text-slate-500 italic">Belum ada NIK yang ditambahkan</p>
                    ) : (
                        data.niks.map((entry) => (
                            <div key={entry.id} className="flex gap-2">
                                <input
                                    type="text"
                                    value={entry.nik}
                                    onChange={(e) => updateNIK(entry.id, e.target.value)}
                                    placeholder="Masukkan NIK"
                                    disabled={loading}
                                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                                <button
                                    onClick={() => removeNIK(entry.id)}
                                    disabled={loading}
                                    type="button"
                                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100 disabled:opacity-50 transition"
                                    title="Hapus NIK"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <button
                    onClick={addNIK}
                    disabled={loading}
                    type="button"
                    className="text-sm font-semibold text-primary hover:text-primary disabled:opacity-50 transition"
                >
                    + Tambah NIK
                </button>

                {errors.niks && <p className="text-sm text-red-500">{errors.niks}</p>}
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
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
                />
                {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
            </div>

            {/* Durasi */}
            <div className="space-y-2">
                <label htmlFor="durasi" className="block">
                    <span className="text-sm font-medium text-slate-700">Durasi Kontrak</span>
                    <span className="text-red-500 ml-1">*</span>
                    <span className="text-xs text-slate-500 ml-2">(dalam bulan)</span>
                </label>
                <div className="flex items-center gap-2">
                    <input
                        id="durasi"
                        type="number"
                        value={data.durasi || ''}
                        onChange={(e) => updateDurasi(e.target.value)}
                        placeholder="Contoh: 12"
                        disabled={loading}
                        min="1"
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                    <span className="text-sm text-slate-600">bulan</span>
                </div>
                {errors.durasi && <p className="text-sm text-red-500">{errors.durasi}</p>}
            </div>

            {/* File Kontrak */}
            <div className="space-y-2">
                <label className="block">
                    <span className="text-sm font-medium text-slate-700">File Kontrak (PDF)</span>
                    <span className="text-red-500 ml-1">*</span>
                    <span className="text-xs text-slate-500 ml-2">(untuk semua karyawan, max {MAX_FILE_SIZE_MB}MB)</span>
                </label>

                <div className="relative">
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file && file.size > MAX_FILE_SIZE_BYTES) {
                                // Reset input
                                e.target.value = '';
                                // Trigger change with error message in parent
                                onChange({
                                    ...data,
                                    fileKontrak: null
                                });
                            } else {
                                handleFileChange(file);
                            }
                        }}
                        disabled={loading}
                        className="hidden"
                        id="fileInput"
                    />

                    <label
                        htmlFor="fileInput"
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition disabled:opacity-50"
                    >
                        <Upload className="h-5 w-5 text-slate-500" />
                        <div className="text-center">
                            <span className="text-sm font-medium text-slate-700">Pilih file PDF</span>
                            <span className="text-xs text-slate-500 block">atau drag & drop</span>
                        </div>
                    </label>
                </div>

                {data.fileKontrak && (
                    <div className="flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                        <FileText className="h-4 w-4 text-primary" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{data.fileKontrak.name}</p>
                            <p className="text-xs text-slate-600">
                                {(data.fileKontrak.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleFileChange(null)}
                            disabled={loading}
                            className="text-xs font-semibold text-primary hover:text-primary"
                        >
                            Hapus
                        </button>
                    </div>
                )}

                {errors.fileKontrak && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-2">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-600">{errors.fileKontrak}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
