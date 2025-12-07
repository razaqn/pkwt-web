import { Upload, X, AlertCircle, FileText } from 'lucide-react';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface FormKontrakPKWTTData {
    nik: string;
    startDate: string;
    fileKontrak: File | null;
}

interface FormKontrakPKWTTProps {
    data: FormKontrakPKWTTData;
    onChange: (data: FormKontrakPKWTTData) => void;
    errors?: Partial<Record<keyof FormKontrakPKWTTData, string>>;
    loading?: boolean;
}

export default function FormKontrakPKWTT({ data, onChange, errors = {}, loading = false }: FormKontrakPKWTTProps) {
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

    return (
        <div className="space-y-6">
            {/* NIK Section */}
            <div className="space-y-2">
                <label htmlFor="nik" className="block">
                    <span className="text-sm font-medium text-slate-700">NIK Karyawan</span>
                    <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                    id="nik"
                    type="text"
                    value={data.nik}
                    onChange={(e) => updateNIK(e.target.value)}
                    placeholder="Masukkan NIK"
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
