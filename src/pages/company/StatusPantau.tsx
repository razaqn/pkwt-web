import { useNavigate } from 'react-router-dom';
import {
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Eye,
    RotateCcw,
    Edit,
    Trash2,
} from 'lucide-react';
import { useContractList } from '../../hooks/useContractList';
import { deleteDraftContract } from '../../lib/api';
import { useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { EmptyState } from '../../components/dashboard/EmptyState';
import { useDialog } from '../../hooks/useDialog';
import { toUserMessage } from '../../lib/errors';

export default function StatusPantau() {
    const navigate = useNavigate();
    const dialog = useDialog();
    const {
        contracts,
        loading,
        error,
        currentPage,
        totalPages,
        statusFilter,
        setStatusFilter,
        goToPage,
        refetch,
    } = useContractList();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const statusBadgeStyles = {
        PENDING: 'bg-secondary/30 text-slate-900 ring-1 ring-inset ring-secondary/40',
        APPROVED: 'bg-primary/15 text-primary ring-1 ring-inset ring-primary/20',
        REJECTED: 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-200',
        DRAFT: 'bg-slate-100 text-slate-800 ring-1 ring-inset ring-slate-200',
    };

    const statusLabels = {
        PENDING: 'Menunggu',
        APPROVED: 'Disetujui',
        REJECTED: 'Ditolak',
        DRAFT: 'Draft',
    };

    async function handleDeleteDraft(draftId: string) {
        const ok = await dialog.confirm({
            title: 'Hapus draft ini?',
            message: 'Draft akan dihapus permanen dan tidak bisa dikembalikan.',
            confirmText: 'Hapus',
            cancelText: 'Batal',
            tone: 'error',
        });
        if (!ok) return;

        setDeletingId(draftId);
        try {
            await deleteDraftContract(draftId);
            setDeletingId(null);
            refetch();
        } catch (err: any) {
            await dialog.alert({
                title: 'Gagal menghapus draft',
                message: toUserMessage(err, 'Terjadi kesalahan. Silakan coba lagi.'),
                tone: 'error',
            });
            setDeletingId(null);
        }
    }

    if (error && !loading) {
        return (
            <div className="space-y-6">
                <div>
                    <p className="text-sm font-semibold text-primary">Status Pantau</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Pengajuan Kontrak</h1>
                    <p className="mt-1 text-sm text-slate-600">Pantau status pengajuan kontrak Anda, termasuk draft yang belum dikirim.</p>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Terjadi Kesalahan</p>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-primary">Status Pantau</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Pengajuan Kontrak</h1>
                    <p className="mt-1 text-sm text-slate-600">Pantau status pengajuan kontrak Anda, termasuk draft yang belum dikirim.</p>
                </div>
                <button
                    onClick={() => navigate('/form-kontrak')}
                    className="inline-flex items-center justify-center rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                    Buat Kontrak Baru
                </button>
            </div>

            {/* Toolbar */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="hidden flex-wrap items-center gap-2 md:flex">
                        {([
                            { key: 'ALL', label: 'Semua' },
                            { key: 'DRAFT', label: 'Draft' },
                            { key: 'PENDING', label: 'Menunggu' },
                            { key: 'APPROVED', label: 'Disetujui' },
                            { key: 'REJECTED', label: 'Ditolak' },
                        ] as const).map((item) => {
                            const active = (statusFilter ?? 'ALL') === item.key;
                            return (
                                <button
                                    key={item.key}
                                    onClick={() =>
                                        setStatusFilter(
                                            item.key === 'ALL' ? null : (item.key as any)
                                        )
                                    }
                                    className={
                                        active
                                            ? 'rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20'
                                            : 'rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100'
                                    }
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-3">
                        <label htmlFor="status-filter" className="text-sm font-semibold text-slate-700 md:hidden">
                            Filter
                        </label>
                        <select
                            id="status-filter"
                            value={statusFilter || 'ALL'}
                            onChange={(e) => {
                                const value = e.target.value;
                                setStatusFilter(value === 'ALL' ? null : (value === 'DRAFT' ? 'DRAFT' : (value as any)));
                            }}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 md:w-56"
                        >
                            <option value="ALL">Semua Status</option>
                            <option value="DRAFT">Draft</option>
                            <option value="PENDING">Menunggu</option>
                            <option value="APPROVED">Disetujui</option>
                            <option value="REJECTED">Ditolak</option>
                        </select>

                        <button
                            onClick={() => refetch()}
                            className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-white px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-16 shadow-sm">
                    <div className="flex items-center gap-3">
                        <ClipLoader size={20} color="#419823" />
                        <span className="text-slate-600 font-medium">Memuat data pengajuan...</span>
                    </div>
                </div>
            ) : contracts.length === 0 ? (
                /* Empty State */
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <EmptyState
                        title="Belum ada pengajuan kontrak"
                        description="Buat kontrak baru atau lanjutkan draft yang tersimpan."
                    />
                    <div className="mt-2 flex justify-center">
                        <button
                            onClick={() => navigate('/form-kontrak')}
                            className="inline-flex items-center justify-center rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            Buat Kontrak Baru
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Table Wrapper with Horizontal Scroll for Mobile */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/20">
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
                                                {contract.contract_type === 'PKWT' ? (
                                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">
                                                        PKWT
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-secondary/30 px-2.5 py-1 text-xs font-semibold text-slate-900 ring-1 ring-inset ring-secondary/40">
                                                        PKWTT
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeStyles[
                                                        contract.approval_status as keyof typeof statusBadgeStyles
                                                    ] || 'bg-slate-100 text-slate-800'
                                                        }`}
                                                >
                                                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                    {contract.approval_status ? statusLabels[contract.approval_status as keyof typeof statusLabels] : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                {contract.is_draft ? (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => navigate(`/form-kontrak?draftId=${contract.id}`)}
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20 hover:bg-primary/15"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            Lanjutkan
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteDraft(contract.id)}
                                                            disabled={deletingId === contract.id}
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-100 disabled:opacity-50"
                                                        >
                                                            {deletingId === contract.id && <ClipLoader size={12} color="#419823" />}
                                                            <Trash2 className="h-4 w-4" />
                                                            {deletingId === contract.id ? 'Menghapus...' : 'Hapus'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => navigate(`/status-pantau/${contract.id}`)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5"
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
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between pt-4">
                        <div className="text-sm text-slate-600">
                            Menampilkan <span className="font-semibold text-slate-900">{contracts.length}</span> data
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/30 text-slate-700 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                aria-label="Halaman sebelumnya"
                                title="Sebelumnya"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <div className="text-sm text-slate-700">Halaman {currentPage} / {totalPages}</div>
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/30 text-slate-700 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                aria-label="Halaman berikutnya"
                                title="Selanjutnya"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
