import { useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Company } from '../lib/api';
import { ClipLoader } from 'react-spinners';

interface AdminCompanyTableProps {
    data: Company[];
    loading?: boolean;
    onLihatDetail: (companyId: string) => void;
    onPageChange?: (page: number) => void;
    currentPage?: number;
    onSearchChange?: (query: string) => void;
    searchQuery?: string;
}

export default function AdminCompanyTable({
    data,
    loading = false,
    onLihatDetail,
    onPageChange,
    currentPage = 1,
    onSearchChange,
    searchQuery = '',
}: AdminCompanyTableProps) {
    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (onSearchChange) {
            onSearchChange(e.target.value);
        }
    }, [onSearchChange]);

    const handlePreviousPage = useCallback(() => {
        if (onPageChange) {
            onPageChange(Math.max(currentPage - 1, 1));
        }
    }, [currentPage, onPageChange]);

    const handleNextPage = useCallback(() => {
        if (onPageChange) {
            onPageChange(currentPage + 1);
        }
    }, [currentPage, onPageChange]);

    const formatAddress = (company: Company): string => {
        const parts = [company.address];
        if (company.village) parts.push(company.village);
        if (company.district) parts.push(company.district);
        return parts.join(', ');
    };

    return (
        <div className="space-y-4">
            {/* Search Field */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Cari nama perusahaan..."
                    disabled={loading}
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">Nama Perusahaan</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">Alamat</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">Total Kontrak</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center">
                                    <div className="flex items-center justify-center gap-3">
                                        <ClipLoader size={20} color="#419823" />
                                        <span className="text-slate-600 font-medium">Memuat data perusahaan...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length > 0 ? (
                            data.map((company) => (
                                <tr key={company.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                                    <td className="px-4 py-3 text-slate-900 font-medium">{company.company_name}</td>
                                    <td className="px-4 py-3 text-slate-600">{formatAddress(company)}</td>
                                    <td className="px-4 py-3 text-slate-600 font-medium">
                                        {company.active_contracts_pkwt + company.active_contracts_pkwtt}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => onLihatDetail(company.id)}
                                            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition"
                                        >
                                            Lihat Detail
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                    Belum ada perusahaan terdaftar
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {data.length > 0 && (
                <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-slate-600">
                        Menampilkan {data.length} data
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1 || loading}
                            className="flex items-center justify-center h-9 w-9 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="text-sm text-slate-600">Halaman {currentPage}</div>
                        <button
                            onClick={handleNextPage}
                            disabled={loading}
                            className="flex items-center justify-center h-9 w-9 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
