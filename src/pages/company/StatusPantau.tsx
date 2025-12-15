import { useNavigate } from 'react-router-dom';
import {
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Loader,
    Eye,
    RotateCcw,
    Edit,
    Trash2,
} from 'lucide-react';
import { useContractList } from '../../hooks/useContractList';
import { deleteDraftContract } from '../../lib/api';
import { useState } from 'react';
import { ClipLoader } from 'react-spinners';

export default function StatusPantau() {
    const navigate = useNavigate();
    const {
        contracts,
        loading,
        error,
        currentPage,
        totalPages,
        statusFilter,
        setStatusFilter,
        goToPage,
    } = useContractList();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const statusBadgeStyles = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        APPROVED: 'bg-green-100 text-green-800',
        REJECTED: 'bg-red-100 text-red-800',
        DRAFT: 'bg-slate-100 text-slate-800',
    };

    const statusLabels = {
        PENDING: 'Menunggu',
        APPROVED: 'Disetujui',
        REJECTED: 'Ditolak',
        DRAFT: 'Draft',
    };

    async function handleDeleteDraft(draftId: string) {
        if (!window.confirm('Yakin ingin menghapus draft ini?')) return;

        setDeletingId(draftId);
        try {
            await deleteDraftContract(draftId);
            // Refresh list
            window.location.reload();
        } catch (err: any) {
            alert('Gagal menghapus draft: ' + err.message);
            setDeletingId(null);
        }
    }

    if (error && !loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Status Pantau Pengajuan</h1>
                    <p className="mt-1 text-slate-600">Pantau status pengajuan kontrak Anda</p>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Terjadi Kesalahan</p>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Status Pantau Pengajuan</h1>
                <p className="mt-1 text-slate-600">Pantau status pengajuan kontrak Anda</p>
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-4">
                <label htmlFor="status-filter" className="text-sm font-medium text-slate-700">
                    Filter Status:
                </label>
                <select
                    id="status-filter"
                    value={statusFilter || 'ALL'}
                    onChange={(e) => {
                        const value = e.target.value;
                        setStatusFilter(value === 'ALL' ? null : (value === 'DRAFT' ? 'DRAFT' : value as any));
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="ALL">Semua Status</option>
                    <option value="DRAFT">Draft</option>
                    <option value="PENDING">Menunggu</option>
                    <option value="APPROVED">Disetujui</option>
                    <option value="REJECTED">Ditolak</option>
                </select>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="flex items-center gap-2 text-slate-600">
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>Memuat data pengajuan...</span>
                    </div>
                </div>
            ) : contracts.length === 0 ? (
                /* Empty State */
                <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
                    <p className="text-slate-600">Tidak ada data pengajuan</p>
                </div>
            ) : (
                <>
                    {/* Table Wrapper with Horizontal Scroll for Mobile */}
                    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Judul Kontrak
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Tanggal Mulai
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Durasi
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Tipe
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {contracts.map((contract) => (
                                    <tr key={contract.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-medium text-slate-900">
                                                {contract.title}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm text-slate-600">
                                                {new Date(contract.start_date).toLocaleDateString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm text-slate-600">
                                                {contract.duration_months ? `${contract.duration_months} bulan` : 'Tetap'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                                                {contract.contract_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeStyles[
                                                    contract.approval_status as keyof typeof statusBadgeStyles
                                                ] || 'bg-slate-100 text-slate-800'
                                                    }`}
                                            >
                                                <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                                                {contract.approval_status ? statusLabels[contract.approval_status as keyof typeof statusLabels] : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            {contract.is_draft ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/form-kontrak?draftId=${contract.id}`)}
                                                        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        Lanjutkan
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteDraft(contract.id)}
                                                        disabled={deletingId === contract.id}
                                                        className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                                                    >
                                                        {deletingId === contract.id && <ClipLoader size={12} color="#419823" />}
                                                        <Trash2 className="h-4 w-4" />
                                                        {deletingId === contract.id ? 'Menghapus...' : 'Hapus'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => navigate(`/status-pantau/${contract.id}`)}
                                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    Lihat Detail
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-600">
                            Halaman {currentPage} dari {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Sebelumnya
                            </button>
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Selanjutnya
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
