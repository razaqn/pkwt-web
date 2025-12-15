import { AlertCircle, ExternalLink, FileImage, FileText, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';

export interface KelengkapanDataForm {
    fullName: string;
    address: string;
    district: string;
    village: string;
    placeOfBirth: string;
    birthdate: string;
    ktpFile?: File | null; // KTP image file (jpg/jpeg/png)
}

interface ModalKelengkapanDataProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: KelengkapanDataForm) => void;
    nik: string;
    initialData?: KelengkapanDataForm;
    ktpFileUrl?: string | null; // URL to existing KTP image
    loading?: boolean;
}

export default function ModalKelengkapanData({
    isOpen,
    onClose,
    onSave,
    nik,
    initialData,
    ktpFileUrl,
    loading = false
}: ModalKelengkapanDataProps) {
    const [formData, setFormData] = useState<KelengkapanDataForm>({
        fullName: '',
        address: '',
        district: '',
        village: '',
        placeOfBirth: '',
        birthdate: '',
        ktpFile: null,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof Omit<KelengkapanDataForm, 'ktpFile'>, string>>>({});
    const [ktpError, setKtpError] = useState<string | null>(null);

    const hasExistingKtp = Boolean(ktpFileUrl);

    useEffect(() => {
        if (!isOpen) return;

        let cancelled = false;

        const nextFormData: KelengkapanDataForm = initialData
            ? {
                fullName: initialData.fullName,
                address: initialData.address,
                district: initialData.district,
                village: initialData.village,
                placeOfBirth: initialData.placeOfBirth,
                birthdate: initialData.birthdate,
                ktpFile: initialData.ktpFile || null,
            }
            : {
                fullName: '',
                address: '',
                district: '',
                village: '',
                placeOfBirth: '',
                birthdate: '',
                ktpFile: null,
            };

        // Defer state sync to avoid synchronous setState-in-effect warnings.
        Promise.resolve().then(() => {
            if (cancelled) return;
            setFormData(nextFormData);
            setErrors({});
            setKtpError(null);
        });

        return () => {
            cancelled = true;
        };
    }, [isOpen, initialData]);

    function handleChange(field: keyof Omit<KelengkapanDataForm, 'ktpFile'>, value: string) {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    }

    function handleKtpFileChange(file: File | null) {
        setKtpError(null);

        if (!file) {
            setFormData(prev => ({ ...prev, ktpFile: null }));
            return;
        }

        // Validasi tipe file
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            setKtpError('Format file harus JPG, JPEG, atau PNG');
            return;
        }

        // Validasi ukuran (max 5MB)
        const maxSizeBytes = 5 * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
            setKtpError(`File terlalu besar. Maksimal 5MB, file Anda ${fileSizeMB}MB`);
            return;
        }

        setFormData(prev => ({ ...prev, ktpFile: file }));
    }

    function validate(): boolean {
        const newErrors: Partial<Record<keyof Omit<KelengkapanDataForm, 'ktpFile'>, string>> = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Nama lengkap harus diisi';
        }
        if (!formData.address.trim()) {
            newErrors.address = 'Alamat harus diisi';
        }
        if (!formData.district.trim()) {
            newErrors.district = 'Kabupaten/Kota harus diisi';
        }
        if (!formData.village.trim()) {
            newErrors.village = 'Desa harus diisi';
        }
        if (!formData.placeOfBirth.trim()) {
            newErrors.placeOfBirth = 'Tempat lahir harus diisi';
        }
        if (!formData.birthdate) {
            newErrors.birthdate = 'Tanggal lahir harus diisi';
        }

        // Require KTP if not already uploaded previously.
        if (!hasExistingKtp && !formData.ktpFile) {
            setKtpError('Upload KTP wajib diisi');
        }

        setErrors(newErrors);
        const fieldsOk = Object.keys(newErrors).length === 0;
        const ktpOk = hasExistingKtp || Boolean(formData.ktpFile);
        return fieldsOk && ktpOk;
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (validate()) {
            onSave(formData);
        }
    }

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
            onMouseDown={(e) => {
                if (loading) return;
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                <form onSubmit={handleSubmit} className="flex max-h-[90vh] flex-col">
                    {/* Header */}
                    <div className="shrink-0 flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/20 px-6 py-5">
                        <div>
                            <p className="text-sm font-semibold text-primary">Data Karyawan</p>
                            <h2 className="mt-1 text-lg font-bold text-slate-900">Kelengkapan Data</h2>
                            <p className="mt-1 text-sm text-slate-600">NIK: <span className="font-semibold text-slate-900">{nik}</span></p>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg p-2 text-slate-600 hover:bg-primary/5 disabled:opacity-50 transition"
                            aria-label="Tutup"
                            title="Tutup"
                            type="button"
                        >
                            <X className="h-5 w-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                        <div className="space-y-6">
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <p className="text-sm font-semibold text-slate-900">Identitas</p>
                                <p className="mt-1 text-sm text-slate-600">Lengkapi data dasar untuk kebutuhan administrasi kontrak.</p>
                            </div>

                            {/* Nama Lengkap */}
                            <div className="space-y-2">
                                <label htmlFor="fullName" className="block">
                                    <span className="text-sm font-medium text-slate-700">Nama Lengkap</span>
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    id="fullName"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => handleChange('fullName', e.target.value)}
                                    placeholder="Masukkan nama lengkap"
                                    disabled={loading}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                                {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
                            </div>

                            {/* Alamat */}
                            <div className="space-y-2">
                                <label htmlFor="address" className="block">
                                    <span className="text-sm font-medium text-slate-700">Alamat</span>
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <textarea
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    placeholder="Masukkan alamat lengkap"
                                    disabled={loading}
                                    rows={3}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500 resize-none"
                                />
                                {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
                            </div>

                            {/* Kabupaten/Kota & Desa (Side by side) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="district" className="block">
                                        <span className="text-sm font-medium text-slate-700">Kabupaten/Kota</span>
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        id="district"
                                        type="text"
                                        value={formData.district}
                                        onChange={(e) => handleChange('district', e.target.value)}
                                        placeholder="Contoh: Paser"
                                        disabled={loading}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
                                    />
                                    {errors.district && <p className="text-sm text-red-600">{errors.district}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="village" className="block">
                                        <span className="text-sm font-medium text-slate-700">Desa</span>
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        id="village"
                                        type="text"
                                        value={formData.village}
                                        onChange={(e) => handleChange('village', e.target.value)}
                                        placeholder="Masukkan nama desa"
                                        disabled={loading}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
                                    />
                                    {errors.village && <p className="text-sm text-red-600">{errors.village}</p>}
                                </div>
                            </div>

                            {/* Tempat Lahir & Tanggal Lahir (Side by side) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="placeOfBirth" className="block">
                                        <span className="text-sm font-medium text-slate-700">Tempat Lahir</span>
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        id="placeOfBirth"
                                        type="text"
                                        value={formData.placeOfBirth}
                                        onChange={(e) => handleChange('placeOfBirth', e.target.value)}
                                        placeholder="Masukkan tempat lahir"
                                        disabled={loading}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
                                    />
                                    {errors.placeOfBirth && <p className="text-sm text-red-600">{errors.placeOfBirth}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="birthdate" className="block">
                                        <span className="text-sm font-medium text-slate-700">Tanggal Lahir</span>
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        id="birthdate"
                                        type="date"
                                        value={formData.birthdate}
                                        onChange={(e) => handleChange('birthdate', e.target.value)}
                                        disabled={loading}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
                                    />
                                    {errors.birthdate && <p className="text-sm text-red-600">{errors.birthdate}</p>}
                                </div>
                            </div>

                            {/* Upload KTP */}
                            <div className="space-y-2">
                                <label htmlFor="ktpFile" className="block">
                                    <span className="text-sm font-medium text-slate-700">Upload KTP (Foto/Scan)</span>
                                    {!hasExistingKtp && <span className="text-red-500 ml-1">*</span>}
                                    <span className="text-xs text-slate-500 ml-2">(JPG/JPEG/PNG, Maksimal 5MB)</span>
                                </label>

                                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                                                <FileImage className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">Dokumen KTP</p>
                                                <p className="mt-0.5 text-sm text-slate-600">
                                                    {hasExistingKtp ? 'Sudah ada file sebelumnya. Anda bisa mengganti jika perlu.' : 'Wajib diunggah untuk melengkapi data.'}
                                                </p>
                                            </div>
                                        </div>

                                        {hasExistingKtp && (
                                            <a
                                                href={ktpFileUrl as string}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-white px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/5"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                Lihat KTP
                                            </a>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <input
                                            id="ktpFile"
                                            type="file"
                                            accept=".jpg,.jpeg,.png,image/jpeg,image/jpg,image/png"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                handleKtpFileChange(file);
                                            }}
                                            disabled={loading}
                                            className="hidden"
                                        />

                                        <label
                                            htmlFor="ktpFile"
                                            className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 cursor-pointer transition hover:border-primary/60 hover:bg-primary/5 disabled:opacity-50"
                                        >
                                            <Upload className="h-5 w-5 text-slate-500" />
                                            <div className="text-center">
                                                <span className="text-sm font-semibold text-slate-700">Pilih file KTP</span>
                                                <span className="text-xs text-slate-500 block">Klik untuk memilih (drag & drop jika browser mendukung)</span>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Preview */}
                                    {(formData.ktpFile || hasExistingKtp) && (
                                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-5">
                                            <div className="sm:col-span-2">
                                                <div className="aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                                    {formData.ktpFile ? (
                                                        <img
                                                            src={URL.createObjectURL(formData.ktpFile)}
                                                            alt="Preview KTP"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={ktpFileUrl as string}
                                                            alt="KTP"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="sm:col-span-3">
                                                {formData.ktpFile ? (
                                                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                                                        <FileText className="h-4 w-4 text-green-600" />
                                                        <div className="flex-1">
                                                            <span className="text-sm font-semibold text-green-800 block">{formData.ktpFile.name}</span>
                                                            <span className="text-xs text-green-700">{(formData.ktpFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleKtpFileChange(null)}
                                                            disabled={loading}
                                                            className="text-xs font-semibold text-green-700 hover:text-green-900 disabled:opacity-50"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                                                        <FileText className="h-4 w-4 text-primary" />
                                                        <div className="flex-1">
                                                            <span className="text-sm font-semibold text-slate-900 block">KTP sudah diunggah</span>
                                                            <span className="text-xs text-slate-600">Unggah file baru jika ingin mengganti.</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {ktpError && (
                                        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-sm">
                                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                            <p className="text-sm text-red-700">{ktpError}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
                            >
                                {loading && <ClipLoader size={16} color="#ffffff" />}
                                {loading ? 'Menyimpan...' : 'Simpan Data'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
