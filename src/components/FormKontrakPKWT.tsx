import { Trash2, Upload, FileText, AlertCircle, FileSpreadsheet, X, CheckCircle } from 'lucide-react';
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
    fileSuratPermohonan?: File | null;
    fileDraftPKWT?: File | null;
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

    function handleSuratPermohonanChange(file: File | null) {
        if (file && file.size > MAX_FILE_SIZE_BYTES) {
            onChange({ ...data, fileSuratPermohonan: null });
            return;
        }
        onChange({ ...data, fileSuratPermohonan: file });
    }

    function handleDraftPKWTChange(file: File | null) {
        if (file && file.size > MAX_FILE_SIZE_BYTES) {
            onChange({ ...data, fileDraftPKWT: null });
            return;
        }
        onChange({ ...data, fileDraftPKWT: file });
    }

    async function handleExcelImport(file: File | null) {
        if (!file) return;

        setIsImporting(true);
        setImportError(null);
        setImportSuccess(null);
        setImportWarnings([]);

        try {
            const result = await parseExcelFile(file);
            const { niks: newNIKs, importedData, duplicates } = mapExcelRowsToPKWT(result.rows, data.niks);

            if (newNIKs.length === 0 && duplicates.length === 0) {
                setImportError('Tidak ada NIK baru untuk diimpor');
                return;
            }

            const updatedNIKs = [...data.niks, ...newNIKs];
            const updatedImportedData = { ...data.importedData, ...importedData };

            onChange({
                ...data,
                niks: updatedNIKs,
                importedData: updatedImportedData,
            });

            let successMsg = `✓ ${newNIKs.length} NIK berhasil diimpor dari ${result.fileName}`;
            if (duplicates.length > 0) {
                successMsg += ` (${duplicates.length} NIK duplikat dilewati)`;
            }
            setImportSuccess(successMsg);

            if (result.warnings.length > 0) {
                setImportWarnings(result.warnings);
            }

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
                            <input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    if (file) {
                                        handleExcelImport(file);
                                        e.target.value = '';
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
                        File Excel (.xlsx, .xls, .csv) dengan kolom: NIK, Nama, Kelamin, Jabatan, Tanggal Mulai, Tanggal Berakhir, Alamat, Keterangan. Max {EXCEL_MAX_SIZE_MB}MB, 500 baris.
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

            {/* Surat Permohonan */}
            <div className="space-y-2">
                <label className="block">
                    <span className="text-sm font-medium text-slate-700">Surat Permohonan (PDF)</span>
                    <span className="text-red-500 ml-1">*</span>
                    <span className="text-xs text-slate-500 ml-2">(max {MAX_FILE_SIZE_MB}MB)</span>
                </label>

                <div className="relative">
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleSuratPermohonanChange(file);
                            if (file && file.size > MAX_FILE_SIZE_BYTES) {
                                e.target.value = '';
                            }
                        }}
                        disabled={loading}
                        className="hidden"
                        id="suratPermohonanInput"
                    />

                    <label
                        htmlFor="suratPermohonanInput"
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition disabled:opacity-50"
                    >
                        <Upload className="h-5 w-5 text-slate-500" />
                        <div className="text-center">
                            <span className="text-sm font-medium text-slate-700">Pilih file Surat Permohonan</span>
                            <span className="text-xs text-slate-500 block">atau drag & drop</span>
                        </div>
                    </label>
                </div>

                {data.fileSuratPermohonan && (
                    <div className="flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                        <FileText className="h-4 w-4 text-primary" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{data.fileSuratPermohonan.name}</p>
                            <p className="text-xs text-slate-600">
                                {(data.fileSuratPermohonan.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleSuratPermohonanChange(null)}
                            disabled={loading}
                            className="text-xs font-semibold text-primary hover:text-primary"
                        >
                            Hapus
                        </button>
                    </div>
                )}

                {errors.fileSuratPermohonan && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-2">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-600">{errors.fileSuratPermohonan}</p>
                    </div>
                )}
            </div>

            {/* Draft PKWT */}
            <div className="space-y-2">
                <label className="block">
                    <span className="text-sm font-medium text-slate-700">Draft PKWT (PDF)</span>
                    <span className="text-red-500 ml-1">*</span>
                    <span className="text-xs text-slate-500 ml-2">(max {MAX_FILE_SIZE_MB}MB)</span>
                </label>

                <div className="relative">
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleDraftPKWTChange(file);
                            if (file && file.size > MAX_FILE_SIZE_BYTES) {
                                e.target.value = '';
                            }
                        }}
                        disabled={loading}
                        className="hidden"
                        id="draftPKWTInput"
                    />

                    <label
                        htmlFor="draftPKWTInput"
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition disabled:opacity-50"
                    >
                        <Upload className="h-5 w-5 text-slate-500" />
                        <div className="text-center">
                            <span className="text-sm font-medium text-slate-700">Pilih file Draft PKWT</span>
                            <span className="text-xs text-slate-500 block">atau drag & drop</span>
                        </div>
                    </label>
                </div>

                {data.fileDraftPKWT && (
                    <div className="flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                        <FileText className="h-4 w-4 text-primary" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{data.fileDraftPKWT.name}</p>
                            <p className="text-xs text-slate-600">
                                {(data.fileDraftPKWT.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleDraftPKWTChange(null)}
                            disabled={loading}
                            className="text-xs font-semibold text-primary hover:text-primary"
                        >
                            Hapus
                        </button>
                    </div>
                )}

                {errors.fileDraftPKWT && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-2">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-600">{errors.fileDraftPKWT}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
