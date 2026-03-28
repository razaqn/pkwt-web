import { Upload, X, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { checkNIKs } from '../lib/api';
import { ClipLoader } from 'react-spinners';
import { toUserMessage } from '../lib/errors';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface FormKontrakPKWTTData {
    nik: string;
    fullName?: string;
    gender?: 'Laki-laki' | 'Perempuan';
    position?: string;
    startDate: string;
    address?: string;
    fileSuratPermohonan?: File | null;
    fileDraftPKWT?: File | null;
}

interface FormKontrakPKWTTProps {
    data: FormKontrakPKWTTData;
    onChange: (data: FormKontrakPKWTTData) => void;
    errors?: Partial<Record<keyof FormKontrakPKWTTData, string>>;
    loading?: boolean;
}

export default function FormKontrakPKWTT({ data, onChange, errors = {}, loading = false }: FormKontrakPKWTTProps) {
    const [isCheckingNIK, setIsCheckingNIK] = useState(false);
    const [nikFound, setNikFound] = useState<boolean | null>(null);
    const [nikCheckError, setNikCheckError] = useState<string | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Auto-populate when NIK is entered (debounced)
    async function handleNIKCheck(nik: string) {
        if (!/^[0-9]{16}$/.test(nik)) {
            setNikFound(null);
            setNikCheckError(null);
            return;
        }

        setIsCheckingNIK(true);
        setNikCheckError(null);

        try {
            const response = await checkNIKs([nik]);
            const employee = response.data.find(r => r.nik === nik);

            if (employee?.exists) {
                setNikFound(true);
                // Auto-fill fields from existing data (only if current data is empty)
                const updates: Partial<FormKontrakPKWTTData> = {};
                if (!data.fullName && employee.full_name) {
                    updates.fullName = employee.full_name;
                }
                if (!data.gender && employee.gender) {
                    updates.gender = employee.gender as 'Laki-laki' | 'Perempuan';
                }
                if (!data.position && employee.position) {
                    updates.position = employee.position;
                }
                if (!data.address && employee.address) {
                    updates.address = employee.address;
                }
                if (Object.keys(updates).length > 0) {
                    onChange({ ...data, ...updates });
                }
            } else {
                setNikFound(false);
            }
        } catch (err: any) {
            setNikCheckError(toUserMessage(err, 'Gagal memeriksa NIK'));
            setNikFound(null);
        } finally {
            setIsCheckingNIK(false);
        }
    }

    function handleNIKChange(value: string) {
        onChange({ ...data, nik: value });
        setNikFound(null);
        setNikCheckError(null);

        // Debounced NIK check
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        if (/^[0-9]{16}$/.test(value)) {
            debounceRef.current = setTimeout(() => {
                handleNIKCheck(value);
            }, 500);
        }
    }

    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    function updateField(field: keyof FormKontrakPKWTTData, value: string) {
        onChange({ ...data, [field]: value });
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

    return (
        <div className="space-y-8">
            {/* NIK Section with auto-populate */}
            <div className="space-y-3">
                <label htmlFor="nik" className="block">
                    <span className="text-sm font-medium text-slate-700">NIK Karyawan</span>
                    <span className="text-red-500 ml-1">*</span>
                </label>

                <div className="relative">
                    <input
                        id="nik"
                        type="text"
                        value={data.nik}
                        onChange={(e) => handleNIKChange(e.target.value)}
                        placeholder="Masukkan 16 digit NIK"
                        disabled={loading}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                    {isCheckingNIK && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <ClipLoader size={16} color="#419823" />
                        </div>
                    )}
                </div>

                {errors.nik && <p className="text-sm text-red-500">{errors.nik}</p>}

                {/* NIK check status */}
                {nikFound === true && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <p className="text-sm text-green-700">NIK ditemukan. Data karyawan telah diisi otomatis.</p>
                    </div>
                )}
                {nikFound === false && (
                    <div className="flex items-center gap-2 rounded-lg bg-yellow-50 border border-yellow-200 p-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <p className="text-sm text-yellow-700">NIK baru. Silakan isi data karyawan di bawah ini.</p>
                    </div>
                )}
                {nikCheckError && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <p className="text-sm text-red-700">{nikCheckError}</p>
                    </div>
                )}
            </div>

            {/* Employee Data Fields (editable) */}
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Data Karyawan</p>
                <p className="text-xs text-slate-500">Data akan terisi otomatis jika NIK sudah terdaftar. Anda bisa mengubah jika ada perubahan.</p>

                {/* Nama Lengkap */}
                <div className="space-y-2">
                    <label htmlFor="fullName" className="block">
                        <span className="text-sm font-medium text-slate-700">Nama Lengkap</span>
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                        id="fullName"
                        type="text"
                        value={data.fullName || ''}
                        onChange={(e) => updateField('fullName', e.target.value)}
                        placeholder="Masukkan nama lengkap"
                        disabled={loading}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                    {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
                </div>

                {/* Kelamin & Jabatan (Side by side) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="gender" className="block">
                            <span className="text-sm font-medium text-slate-700">Kelamin</span>
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                            id="gender"
                            value={data.gender || ''}
                            onChange={(e) => updateField('gender', e.target.value)}
                            disabled={loading}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
                        >
                            <option value="">Pilih kelamin</option>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                        {errors.gender && <p className="text-sm text-red-600">{errors.gender}</p>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="position" className="block">
                            <span className="text-sm font-medium text-slate-700">Jabatan</span>
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            id="position"
                            type="text"
                            value={data.position || ''}
                            onChange={(e) => updateField('position', e.target.value)}
                            placeholder="Contoh: Staff Administrasi"
                            disabled={loading}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
                        />
                        {errors.position && <p className="text-sm text-red-600">{errors.position}</p>}
                    </div>
                </div>

                {/* Alamat (Kelurahan) */}
                <div className="space-y-2">
                    <label htmlFor="address" className="block">
                        <span className="text-sm font-medium text-slate-700">Alamat (Kelurahan)</span>
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                        id="address"
                        type="text"
                        value={data.address || ''}
                        onChange={(e) => updateField('address', e.target.value)}
                        placeholder="Masukkan kelurahan"
                        disabled={loading}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                    {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
                </div>
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
                    onChange={(e) => updateField('startDate', e.target.value)}
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
                />
                <p className="text-xs text-slate-500">PKWTT (tetap) tidak memiliki tanggal berakhir.</p>
                {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
            </div>

            {/* Surat Permohonan */}
            <div className="space-y-2">
                <label className="block">
                    <span className="text-sm font-medium text-slate-700">Surat Permohonan (PDF)</span>
                    <span className="text-red-500 ml-1">*</span>
                    <span className="text-xs text-slate-500 ml-2">(max {MAX_FILE_SIZE_MB}MB)</span>
                </label>

                {data.fileSuratPermohonan ? (
                    <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm font-semibold text-slate-900">{data.fileSuratPermohonan.name}</p>
                                <p className="text-xs text-slate-600">
                                    {(data.fileSuratPermohonan.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleSuratPermohonanChange(null)}
                            disabled={loading}
                            type="button"
                            className="rounded-lg p-2 hover:bg-primary/10 disabled:opacity-50 transition"
                            title="Hapus file"
                        >
                            <X className="h-5 w-5 text-primary" />
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition">
                        <Upload className="h-8 w-8 text-slate-400 mb-2" />
                        <span className="text-sm font-medium text-slate-700">Pilih file Surat Permohonan</span>
                        <span className="text-xs text-slate-500 mt-1">atau drag and drop</span>
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
                        />
                    </label>
                )}

                {errors.fileSuratPermohonan && (
                    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700">{errors.fileSuratPermohonan}</p>
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

                {data.fileDraftPKWT ? (
                    <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm font-semibold text-slate-900">{data.fileDraftPKWT.name}</p>
                                <p className="text-xs text-slate-600">
                                    {(data.fileDraftPKWT.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDraftPKWTChange(null)}
                            disabled={loading}
                            type="button"
                            className="rounded-lg p-2 hover:bg-primary/10 disabled:opacity-50 transition"
                            title="Hapus file"
                        >
                            <X className="h-5 w-5 text-primary" />
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition">
                        <Upload className="h-8 w-8 text-slate-400 mb-2" />
                        <span className="text-sm font-medium text-slate-700">Pilih file Draft PKWT</span>
                        <span className="text-xs text-slate-500 mt-1">atau drag and drop</span>
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
                        />
                    </label>
                )}

                {errors.fileDraftPKWT && (
                    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700">{errors.fileDraftPKWT}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
