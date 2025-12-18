import { Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback } from 'react';
import { ClipLoader } from 'react-spinners';
import type { ApprovalListItem } from '../lib/api';

interface ApprovalTableProps {
    data: ApprovalListItem[];
    loading?: boolean;
    onLihatDetail: (contractId: string) => void;
    onPageChange?: (page: number) => void;
    currentPage?: number;
    totalPages?: number;
    onSearchChange?: (query: string) => void;
    searchQuery?: string;
    statusFilter?: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';
    onStatusChange?: (status: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED') => void;
}

export default function ApprovalTable({
    data,
    loading = false,
    onLihatDetail,
    onPageChange,
    currentPage = 1,
    totalPages = 1,
    onSearchChange,
    searchQuery = '',
    statusFilter = 'PENDING',
    onStatusChange,
}: ApprovalTableProps) {
    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onSearchChange?.(e.target.value);
        },
        [onSearchChange]
    );

    const handlePreviousPage = useCallback(() => {
        if (currentPage > 1) {
            onPageChange?.(currentPage - 1);
        }
    }, [currentPage, onPageChange]);

    const handleNextPage = useCallback(() => {
        if (currentPage < totalPages) {
            onPageChange?.(currentPage + 1);
        }
    }, [currentPage, totalPages, onPageChange]);

    const handleStatusChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            onStatusChange?.(e.target.value as 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED');
        },
        [onStatusChange]
    );

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatDuration = (months: number | null, type: string): string => {
        if (type === 'PKWTT') return 'Tetap';
        return months ? `${months} bulan` : '-';
    };

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    {/* Search & Filter */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2 md:gap-3">
                        <div className="relative w-full sm:w-64 md:w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari perusahaan..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div className="w-full sm:w-52">
                            <select
                                value={statusFilter}
                                onChange={handleStatusChange}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="ALL">Semua Status</option>
                                <option value="PENDING">Menunggu</option>
                                <option value="APPROVED">Disetujui</option>
                                <option value="REJECTED">Ditolak</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 md:justify-end">
                        <div className="text-sm text-slate-600">
                            Menampilkan <span className="font-semibold text-slate-900">{data.length}</span>
                        </div>
                        <div className="inline-flex items-center rounded-lg bg-primary/5 px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-primary/10">
                            Halaman {currentPage} / {totalPages}
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/20">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Nama Perusahaan
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Jenis PKWT
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Durasi Kontrak
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Jumlah Karyawan
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Tanggal Pengajuan
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-16 text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            <ClipLoader size={20} color="#419823" />
                                            <span className="text-slate-600 font-medium">Memuat data persetujuan...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-16 text-center text-slate-500">
                                        Tidak ada data persetujuan
                                    </td>
                                </tr>
                            ) : (
                                data.map((approval) => (
                                    <tr
                                        key={approval.id}
                                        className="transition-colors hover:bg-slate-50"
                                    >
                                        <td className="px-4 py-4 font-medium text-slate-900">
                                            {approval.company_name}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${approval.contract_type === 'PKWT'
                                                    ? 'bg-primary/10 text-primary ring-primary/20'
                                                    : 'bg-secondary/25 text-slate-900 ring-secondary/40'
                                                    }`}
                                            >
                                                {approval.contract_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-slate-700">
                                            {formatDuration(approval.duration_months, approval.contract_type)}
                                        </td>
                                        <td className="px-4 py-4 text-slate-700">
                                            {approval.employee_count}
                                        </td>
                                        <td className="px-4 py-4 text-slate-700">
                                            {formatDate(approval.submitted_at)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${approval.approval_status?.toUpperCase() === 'PENDING'
                                                    ? 'bg-secondary/25 text-slate-900 ring-secondary/40'
                                                    : approval.approval_status?.toUpperCase() === 'APPROVED'
                                                        ? 'bg-primary/10 text-primary ring-primary/20'
                                                        : 'bg-red-50 text-red-700 ring-red-200'
                                                    }`}
                                            >
                                                <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                                                {approval.approval_status?.toUpperCase() === 'PENDING'
                                                    ? 'Menunggu'
                                                    : approval.approval_status?.toUpperCase() === 'APPROVED'
                                                        ? 'Disetujui'
                                                        : 'Ditolak'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => onLihatDetail(approval.id)}
                                                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Lihat Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {!loading && data.length > 0 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                        Halaman {currentPage} dari {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Sebelumnya
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Selanjutnya
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
