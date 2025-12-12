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
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Cari perusahaan..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50">
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
                                    <div className="flex items-center justify-center gap-2 text-slate-600">
                                        <ClipLoader size={20} color="#475569" />
                                        <span>Memuat data persetujuan...</span>
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
                                                ? 'bg-blue-50 text-blue-700 ring-blue-600/20'
                                                : 'bg-purple-50 text-purple-700 ring-purple-600/20'
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
                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${approval.approval_status?.toUpperCase() === 'PENDING'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : approval.approval_status?.toUpperCase() === 'APPROVED'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
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
                                            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
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
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Sebelumnya
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
