import { X, AlertCircle, IdCard } from 'lucide-react';
import { ClipLoader } from 'react-spinners';
import type { EmployeeDetail } from '../lib/api';

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

    const infoRows = [
        { label: 'NIK (Nomor Induk Kependudukan)', value: displayNik },
        { label: 'Kelamin', value: employee?.gender || '-' },
        { label: 'Jabatan', value: employee?.position || '-' },
        { label: 'Alamat (Kelurahan)', value: employee?.address || '-' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
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
                            {/* Informasi Karyawan */}
                            <div className="rounded-xl border border-slate-200 shadow-sm">
                                <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/20 px-5 py-3">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <IdCard className="h-4 w-4 text-primary" />
                                        Informasi Karyawan
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

                            {/* Riwayat Kontrak */}
                            {employee?.contracts && employee.contracts.length > 0 && (
                                <div className="rounded-xl border border-slate-200 shadow-sm">
                                    <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/20 px-5 py-3">
                                        <p className="text-sm font-semibold text-slate-900">Riwayat Kontrak</p>
                                    </div>
                                    <div className="p-5">
                                        <div className="space-y-2">
                                            {employee.contracts.map((c) => (
                                                <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">{c.title || c.contract_type}</p>
                                                        <p className="text-xs text-slate-500">{c.company_name || '-'}</p>
                                                    </div>
                                                    <span className="text-xs text-slate-600">{c.start_date || '-'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
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
        </div>
    );
}
