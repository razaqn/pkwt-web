import { X, Upload, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

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

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    fullName: initialData.fullName,
                    address: initialData.address,
                    district: initialData.district,
                    village: initialData.village,
                    placeOfBirth: initialData.placeOfBirth,
                    birthdate: initialData.birthdate,
                    ktpFile: initialData.ktpFile || null,
                });
            } else {
                setFormData({
                    fullName: '',
                    address: '',
                    district: '',
                    village: '',
                    placeOfBirth: '',
                    birthdate: '',
                    ktpFile: null,
                });
            }
            setErrors({});
            setKtpError(null);
        }
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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (validate()) {
            onSave(formData);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Kelengkapan Data Karyawan</h2>
                        <p className="text-sm text-slate-600 mt-1">NIK: {nik}</p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-50 transition"
                    >
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                        />
                        {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
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
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 resize-none"
                        />
                        {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
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
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                            />
                            {errors.district && <p className="text-sm text-red-500">{errors.district}</p>}
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
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                            />
                            {errors.village && <p className="text-sm text-red-500">{errors.village}</p>}
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
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                            />
                            {errors.placeOfBirth && <p className="text-sm text-red-500">{errors.placeOfBirth}</p>}
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
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                            />
                            {errors.birthdate && <p className="text-sm text-red-500">{errors.birthdate}</p>}
                        </div>
                    </div>

                    {/* Upload KTP */}
                    <div className="space-y-2">
                        <label htmlFor="ktpFile" className="block">
                            <span className="text-sm font-medium text-slate-700">Upload KTP (Foto/Scan)</span>
                            <span className="text-red-500 ml-1">*</span>
                            <span className="text-xs text-slate-500 ml-2">(JPG/JPEG/PNG, Maksimal 5MB)</span>
                        </label>

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
                                className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 cursor-pointer hover:bg-slate-100 hover:border-blue-400 transition disabled:opacity-50"
                            >
                                <Upload className="h-5 w-5 text-slate-500" />
                                <div className="text-center">
                                    <span className="text-sm font-medium text-slate-700">Pilih file KTP</span>
                                    <span className="text-xs text-slate-500 block">atau drag & drop</span>
                                </div>
                            </label>
                        </div>

                        {ktpError && (
                            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                                <span className="text-xs text-red-600 font-medium">⚠</span>
                                <p className="text-sm text-red-700">{ktpError}</p>
                            </div>
                        )}

                        {formData.ktpFile ? (
                            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                                <FileText className="h-4 w-4 text-green-600" />
                                <div className="flex-1">
                                    <span className="text-sm text-green-700 block">{formData.ktpFile.name}</span>
                                    <span className="text-xs text-green-600">{(formData.ktpFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleKtpFileChange(null)}
                                    disabled={loading}
                                    className="text-xs text-green-600 hover:text-green-800 font-medium"
                                >
                                    Hapus
                                </button>
                            </div>
                        ) : ktpFileUrl ? (
                            <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <div className="flex-1">
                                    <span className="text-sm text-blue-700 block">KTP sudah diunggah sebelumnya</span>
                                    <span className="text-xs text-blue-600">Klik pilih file untuk mengganti</span>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan Data'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
