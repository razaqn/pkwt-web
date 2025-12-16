import { useParams, useNavigate } from 'react-router-dom';
import {
    AlertCircle,
    ArrowLeft,
    RotateCcw,
    Download,
} from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';
import { useContractDetail } from '../../hooks/useContractDetail';
import { buildNikCsv, downloadCsv } from '../../lib/csv';
import { MoonLoader } from 'react-spinners';
import { EmptyState } from '../../components/dashboard/EmptyState';

export default function DetailPantau() {
    const { contractId } = useParams<{ contractId: string }>();
    const navigate = useNavigate();
    const { contract, employees, comment, loading, error, refetch } =
        useContractDetail(contractId);

    const dialog = useDialog();

    const statusBadgeStyles = {
        PENDING: {
            className: 'bg-secondary/30 text-slate-900 ring-1 ring-inset ring-secondary/40',
            label: 'Menunggu',
        },
        APPROVED: {
            className: 'bg-primary/15 text-primary ring-1 ring-inset ring-primary/20',
            label: 'Disetujui',
        },
        REJECTED: {
            className: 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-200',
            label: 'Ditolak',
        },
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3 text-slate-600">
                    <MoonLoader size={44} color="#419823" />
                    <span className="text-sm">Memuat detail pengajuan...</span>
                </div>
            </div>
        );
    }

    if (error || !contract) {
        return (
            <div className="space-y-4">
                <button
                    onClick={() => navigate('/status-pantau')}
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/90 font-semibold"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                </button>

                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Terjadi Kesalahan</p>
                        <p className="text-sm text-red-700 mt-1">
                            {error || 'Data pengajuan tidak ditemukan'}
                        </p>
                        <button
                            onClick={() => refetch()}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 transition-colors"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const statusKey = contract.approval_status?.toUpperCase() as keyof typeof statusBadgeStyles;
    const statusInfo = statusBadgeStyles[statusKey] || {
        className: 'bg-slate-100 text-slate-800 ring-1 ring-inset ring-slate-200',
        label: contract.approval_status || 'Unknown',
    };

    const totalEmployees = employees.length;
    const incompleteEmployees = employees.filter((e) => !e.data_complete).length;

    // Download CSV of NIKs for rejected submissions
    function downloadRejectedNiksCsv() {
        const rows = employees.map((e) => e.nik ?? '').filter(Boolean);
        const csv = buildNikCsv(rows);
        downloadCsv(`rejected-niks-${contract?.id ?? 'untitled'}.csv`, csv);
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                    <button
                        onClick={() => navigate('/status-pantau')}
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/90 font-semibold"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </button>

                    <div>
                        <p className="text-sm font-semibold text-primary">Status Pantau</p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Detail Pengajuan Kontrak</h1>
                        <p className="mt-1 text-sm text-slate-600">Informasi lengkap pengajuan kontrak dan daftar karyawan terkait.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Download CSV button shown only when status is REJECTED */}
                    {statusKey === 'REJECTED' && (
                        <button
                            onClick={async () => {
                                const confirmed = await dialog.confirm({
                                    title: 'Unduh NIK',
                                    message: 'Unduh file CSV berisi kolom NIK untuk pengajuan ulang?',
                                    confirmText: 'Unduh',
                                    cancelText: 'Batal',
                                });
                                if (!confirmed) return;
                                downloadRejectedNiksCsv();
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-primary/5 transition-colors"
                            aria-label="Unduh NIK sebagai CSV"
                        >
                            <Download className="h-4 w-4" />
                            Unduh NIK (CSV)
                        </button>
                    )}

                    <button
                        onClick={() => refetch()}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-primary/5 transition-colors"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Contract Info Card */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/25 px-6 py-4">
                    <h2 className="text-base font-semibold text-slate-900">Informasi Kontrak</h2>
                    <p className="mt-1 text-sm text-slate-600">Ringkasan data pengajuan kontrak.</p>
                </div>

                <div className="p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                Judul Kontrak
                            </p>
                            <p className="mt-1 text-base font-medium text-slate-900">
                                {contract.title}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                Tipe Kontrak
                            </p>
                            <p className="mt-1">
                                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/15">
                                    {contract.contract_type}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                Tanggal Mulai
                            </p>
                            <p className="mt-1 text-base text-slate-900">
                                {new Date(contract.start_date).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                Durasi
                            </p>
                            <p className="mt-1 text-base text-slate-900">
                                {contract.duration_months ? `${contract.duration_months} bulan` : 'Tetap'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status & Comment Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Approval Status Card */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/25 px-6 py-4">
                        <h2 className="text-base font-semibold text-slate-900">Status Persetujuan</h2>
                        <p className="mt-1 text-sm text-slate-600">Status terbaru dari admin.</p>
                    </div>
                    <div className="p-6">
                        <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${statusInfo.className}`}>
                            <span className="h-2.5 w-2.5 rounded-full bg-current"></span>
                            <span>{statusInfo.label}</span>
                        </div>
                    </div>
                </div>

                {/* Admin Comment Card */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/25 px-6 py-4">
                        <h2 className="text-base font-semibold text-slate-900">Komentar Admin</h2>
                        <p className="mt-1 text-sm text-slate-600">Catatan yang diberikan pada pengajuan ini.</p>
                    </div>
                    <div className="p-6">
                        <div className="rounded-xl bg-slate-50 px-4 py-3 border border-slate-200">
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                {comment || 'Tidak ada komentar'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Employees Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/25 px-6 py-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">Daftar Karyawan</h2>
                            <p className="mt-1 text-sm text-slate-600">Karyawan yang termasuk dalam pengajuan ini.</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 ring-1 ring-inset ring-slate-200">
                                Total: {totalEmployees}
                            </span>
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${incompleteEmployees > 0 ? 'bg-secondary/30 text-slate-900 ring-secondary/40' : 'bg-primary/15 text-primary ring-primary/20'}`}>
                                {incompleteEmployees > 0 ? `Belum lengkap: ${incompleteEmployees}` : 'Semua lengkap'}
                            </span>
                        </div>
                    </div>
                </div>

                {employees.length === 0 ? (
                    <div className="px-6">
                        <EmptyState
                            title="Tidak ada data karyawan"
                            description="Belum ada karyawan yang tercatat untuk pengajuan ini."
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">NIK</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Nama Lengkap</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status Data</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {employees.map((employee) => {
                                    const badgeClass = employee.data_complete
                                        ? 'bg-primary/15 text-primary ring-1 ring-inset ring-primary/20'
                                        : 'bg-secondary/30 text-slate-900 ring-1 ring-inset ring-secondary/40';

                                    return (
                                        <tr key={employee.nik} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-slate-900">{employee.nik}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-700">{employee.full_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                                                    <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                                                    {employee.data_complete ? 'Lengkap' : 'Belum Lengkap'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
