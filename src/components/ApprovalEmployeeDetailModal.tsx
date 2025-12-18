import { useState } from 'react';
import { X, AlertCircle, ImageOff, IdCard, Maximize } from 'lucide-react';
import { ClipLoader } from 'react-spinners';
import type { EmployeeDetail } from '../lib/api';
import { resolveUploadUrl } from '../lib/url';

interface ApprovalEmployeeDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    loading: boolean;
    error?: string | null;
    employee: EmployeeDetail | null;
    meta?: {
        full_name?: string | null;
        nik?: string | null;
    };
    onRetry?: () => void;
}

export default function ApprovalEmployeeDetailModal({
    isOpen,
    onClose,
    loading,
    error,
    employee,
    meta,
    onRetry,
}: ApprovalEmployeeDetailModalProps) {
    if (!isOpen) return null;

    const displayName = employee?.full_name || meta?.full_name || '-';
    const displayNik = employee?.nik || meta?.nik || '-';

    const [isFullImageOpen, setIsFullImageOpen] = useState(false);

    const infoRows = [
        { label: 'NIK (Nomor Induk Kependudukan)', value: displayNik },
        { label: 'Alamat', value: employee?.address || '-' },
        { label: 'Kecamatan', value: employee?.district || '-' },
        { label: 'Kelurahan', value: employee?.village || '-' },
        { label: 'Tempat Lahir', value: employee?.place_of_birth || '-' },
        {
            label: 'Tanggal Lahir',
            value: employee?.birthdate_formatted || formatDate(employee?.birthdate) || '-',
        },
    ];

    const ktpImageUrl = resolveUploadUrl(employee?.ktp_file_url);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Detail Karyawan</p>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">{displayName}</h2>
                        <p className="text-sm text-slate-600">NIK: {displayNik}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 transition-colors hover:text-slate-600"
                        aria-label="Tutup"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-10">
                            <ClipLoader size={28} color="#1F4E8C" />
                            <p className="text-sm font-medium text-slate-700">Memuat data karyawan...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                            <div>
                                <p className="text-sm font-semibold text-red-800">Gagal memuat data karyawan</p>
                                <p className="mt-1 text-sm text-red-700">{error}</p>
                            </div>
                            {onRetry && (
                                <button
                                    onClick={onRetry}
                                    className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-inset ring-red-200 transition-colors hover:bg-red-100"
                                >
                                    Coba Lagi
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Informasi Pribadi */}
                            <div className="rounded-xl border border-slate-200 shadow-sm">
                                <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/20 px-5 py-3">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <IdCard className="h-4 w-4 text-primary" />
                                        Informasi Pribadi
                                    </div>
                                </div>
                                <div className="grid gap-4 p-5 md:grid-cols-2">
                                    {infoRows.map((row) => (
                                        <div key={row.label}>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{row.label}</p>
                                            <p className="mt-2 text-sm font-medium text-slate-900">{row.value || '-'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Foto KTP */}
                            <div className="rounded-xl border border-slate-200 shadow-sm">
                                <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/20 px-5 py-3">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <IdCard className="h-4 w-4 text-primary" />
                                        Foto KTP
                                    </div>
                                </div>
                                <div className="p-5">
                                    {ktpImageUrl ? (
                                        <div className="overflow-hidden rounded-lg border border-slate-200">
                                            <button
                                                type="button"
                                                onClick={() => setIsFullImageOpen(true)}
                                                className="group block w-full"
                                            >
                                                <div className="relative">
                                                    <img
                                                        src={ktpImageUrl}
                                                        alt={`Foto KTP ${displayName}`}
                                                        className="h-72 w-full object-cover"
                                                    />
                                                    <span className="pointer-events-none absolute inset-0 flex items-center justify-end p-3 opacity-0 transition-opacity group-hover:opacity-100">
                                                        <Maximize className="h-5 w-5 text-white drop-shadow" />
                                                    </span>
                                                </div>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
                                            <ImageOff className="h-8 w-8 text-slate-400" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">Foto KTP belum tersedia</p>
                                                <p className="text-sm text-slate-600">Hubungi tim backend untuk menyediakan URL foto KTP.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                    >
                        Tutup
                    </button>
                </div>
            </div>
            {isFullImageOpen && ktpImageUrl && (
                <div
                    className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setIsFullImageOpen(false)}
                >
                    <div className="max-h-full w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsFullImageOpen(false)}
                                className="rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                                aria-label="Tutup tampilan penuh"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="mt-3 overflow-hidden rounded-2xl border border-white/30 bg-black">
                            <img
                                src={ktpImageUrl}
                                alt={`Foto KTP ${displayName}`}
                                className="max-h-[80vh] w-full object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function formatDate(dateString?: string | null) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

