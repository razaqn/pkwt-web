import { useParams, useNavigate } from 'react-router-dom';
import {
    AlertCircle,
    Loader,
    ArrowLeft,
    RotateCcw,
} from 'lucide-react';
import { useContractDetail } from '../../hooks/useContractDetail';

export default function DetailPantau() {
    const { contractId } = useParams<{ contractId: string }>();
    const navigate = useNavigate();
    const { contract, employees, comment, loading, error } =
        useContractDetail(contractId);

    const statusBadgeStyles = {
        PENDING: {
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            label: 'Menunggu',
        },
        APPROVED: {
            bg: 'bg-green-100',
            text: 'text-green-800',
            label: 'Disetujui',
        },
        REJECTED: {
            bg: 'bg-red-100',
            text: 'text-red-800',
            label: 'Ditolak',
        },
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="flex items-center gap-2 text-slate-600">
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Memuat detail pengajuan...</span>
                </div>
            </div>
        );
    }

    if (error || !contract) {
        return (
            <div className="space-y-4">
                <button
                    onClick={() => navigate('/status-pantau')}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                </button>

                <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Terjadi Kesalahan</p>
                        <p className="text-sm text-red-700 mt-1">
                            {error || 'Data pengajuan tidak ditemukan'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-3 inline-flex items-center gap-1.5 rounded bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 transition"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const statusInfo =
        statusBadgeStyles[contract.approval_status as keyof typeof statusBadgeStyles];

    return (
        <div className="space-y-6">
            {/* Header with Back Button */}
            <button
                onClick={() => navigate('/status-pantau')}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali
            </button>

            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Detail Pengajuan Kontrak</h1>
                <p className="mt-1 text-slate-600">Informasi lengkap pengajuan kontrak</p>
            </div>

            {/* Contract Info Card */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Informasi Kontrak</h2>
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
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
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

            {/* Status & Comment Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Approval Status Card */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                        Status Persetujuan
                    </h2>
                    <div
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${statusInfo.bg} ${statusInfo.text}`}
                    >
                        <span className="h-2.5 w-2.5 rounded-full bg-current"></span>
                        <span className="font-medium text-sm">{statusInfo.label}</span>
                    </div>
                </div>

                {/* Admin Comment Card */}
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                        Komentar Admin
                    </h2>
                    <div className="rounded-lg bg-slate-50 px-4 py-3 border border-slate-200">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                            {comment || 'Tidak ada komentar'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Employees Table */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Daftar Karyawan
                </h2>

                {employees.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-slate-600">Tidak ada data karyawan</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto -mx-6">
                        <div className="inline-block min-w-full align-middle px-6">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            NIK
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Nama Lengkap
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Status Data
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {employees.map((employee) => (
                                        <tr key={employee.nik} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-slate-900">
                                                    {employee.nik}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-600">
                                                    {employee.full_name}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${employee.data_complete
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                >
                                                    <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                                                    {employee.data_complete ? 'Lengkap' : 'Belum Lengkap'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
