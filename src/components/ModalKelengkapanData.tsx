import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';

export interface KelengkapanDataForm {
    fullName: string;
    gender: 'Laki-laki' | 'Perempuan' | '';
    position: string;
    startDate: string;
    endDate: string;
    address: string;
    noPkwt: string;
    pkwtSequence: string;
    keterangan: string;
}

interface ModalKelengkapanDataProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: KelengkapanDataForm) => void;
    nik: string;
    initialData?: KelengkapanDataForm;
    loading?: boolean;
    contractType?: 'PKWT' | 'PKWTT';
}

export default function ModalKelengkapanData({
    isOpen,
    onClose,
    onSave,
    nik,
    initialData,
    loading = false,
    contractType = 'PKWT'
}: ModalKelengkapanDataProps) {
    const [formData, setFormData] = useState<KelengkapanDataForm>({
        fullName: '',
        gender: '',
        position: '',
        startDate: '',
        endDate: '',
        address: '',
        noPkwt: '',
        pkwtSequence: '',
        keterangan: '',
    });

    const [errors, setErrors] = useState<Partial<Record<keyof KelengkapanDataForm, string>>>({});

    useEffect(() => {
        if (!isOpen) return;

        let cancelled = false;

        const nextFormData: KelengkapanDataForm = initialData
            ? {
                fullName: initialData.fullName || '',
                gender: initialData.gender || '',
                position: initialData.position || '',
                startDate: initialData.startDate || '',
                endDate: initialData.endDate || '',
                address: initialData.address || '',
                noPkwt: initialData.noPkwt || '',
                pkwtSequence: initialData.pkwtSequence || '',
                keterangan: initialData.keterangan || '',
            }
            : {
                fullName: '',
                gender: '',
                position: '',
                startDate: '',
                endDate: '',
                address: '',
                noPkwt: '',
                pkwtSequence: '',
                keterangan: '',
            };

        // Defer state sync to avoid synchronous setState-in-effect warnings.
        Promise.resolve().then(() => {
            if (cancelled) return;
            setFormData(nextFormData);
            setErrors({});
        });

        return () => {
            cancelled = true;
        };
    }, [isOpen, initialData]);

    function handleChange(field: keyof KelengkapanDataForm, value: string) {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    }

    function validate(): boolean {
        const newErrors: Partial<Record<keyof KelengkapanDataForm, string>> = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Nama lengkap harus diisi';
        }
        if (!formData.gender) {
            newErrors.gender = 'Kelamin harus dipilih';
        }
        if (!formData.position.trim()) {
            newErrors.position = 'Jabatan harus diisi';
        }
        if (!formData.address.trim()) {
            newErrors.address = 'Alamat (Kelurahan) harus diisi';
        }

        if (contractType === 'PKWT') {
            if (!formData.startDate) {
                newErrors.startDate = 'Tanggal mulai harus diisi';
            }
            if (!formData.endDate) {
                newErrors.endDate = 'Tanggal berakhir harus diisi';
            }
            if (!formData.noPkwt.trim()) {
                newErrors.noPkwt = 'Nomor PKWT harus diisi';
            }

            // Validate date range
            if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
                newErrors.endDate = 'Tanggal berakhir harus setelah tanggal mulai';
            }
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

                            {/* Kelamin & Jabatan (Side by side) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="gender" className="block">
                                        <span className="text-sm font-medium text-slate-700">Kelamin</span>
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <select
                                        id="gender"
                                        value={formData.gender}
                                        onChange={(e) => handleChange('gender', e.target.value)}
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
                                        value={formData.position}
                                        onChange={(e) => handleChange('position', e.target.value)}
                                        placeholder="Contoh: Staff Administrasi"
                                        disabled={loading}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
                                    />
                                    {errors.position && <p className="text-sm text-red-600">{errors.position}</p>}
                                </div>
                            </div>

                            {/* Nomor PKWT Asli - Only for PKWT */}
                            {contractType === 'PKWT' && (
                                <div className="space-y-2">
                                    <label htmlFor="noPkwt" className="block">
                                        <span className="text-sm font-medium text-slate-700">Nomor PKWT</span>
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        id="noPkwt"
                                        type="text"
                                        value={formData.noPkwt}
                                        onChange={(e) => handleChange('noPkwt', e.target.value)}
                                        placeholder="Masukkan nomor PKWT asli"
                                        disabled={loading}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
                                    />
                                    {errors.noPkwt && <p className="text-sm text-red-600">{errors.noPkwt}</p>}
                                </div>
                            )}

                            {/* Tanggal Mulai & Tanggal Berakhir (Side by side) - Only for PKWT */}
                            {contractType === 'PKWT' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="startDate" className="block">
                                            <span className="text-sm font-medium text-slate-700">Tanggal Mulai</span>
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            id="startDate"
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => handleChange('startDate', e.target.value)}
                                            disabled={loading}
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
                                        />
                                        {errors.startDate && <p className="text-sm text-red-600">{errors.startDate}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="endDate" className="block">
                                            <span className="text-sm font-medium text-slate-700">Tanggal Berakhir</span>
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            id="endDate"
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => handleChange('endDate', e.target.value)}
                                            disabled={loading}
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
                                        />
                                        {errors.endDate && <p className="text-sm text-red-600">{errors.endDate}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Alamat (Kelurahan) */}
                            <div className="space-y-2">
                                <label htmlFor="address" className="block">
                                    <span className="text-sm font-medium text-slate-700">Alamat (Kelurahan)</span>
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    id="address"
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    placeholder="Masukkan kelurahan"
                                    disabled={loading}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                                {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
                            </div>

                            {/* Keterangan */}
                            <div className="space-y-2">
                                <label htmlFor="keterangan" className="block">
                                    <span className="text-sm font-medium text-slate-700">Keterangan</span>
                                </label>
                                <textarea
                                    id="keterangan"
                                    rows={3}
                                    value={formData.keterangan}
                                    onChange={(e) => handleChange('keterangan', e.target.value)}
                                    placeholder="Masukkan keterangan tambahan (opsional)"
                                    disabled={loading}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
                                />
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
