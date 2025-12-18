import { useCallback } from 'react';
import type { ReactNode } from 'react';
import { Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { ClipLoader } from 'react-spinners';

export interface AdminKaryawan {
    id: string;
    namaLengkap: string;
    nik: string;
    alamat: string;
    perusahaan: string;
    kontrakSekarang: string;
    sisaWaktuKontrak: number; // dalam minggu
    companyId: string;
}

interface AdminKaryawanTableProps {
    data: AdminKaryawan[];
    loading?: boolean;
    onLihatDetail: (karyawanId: string) => void;
    onPageChange?: (page: number) => void;
    currentPage?: number;
    totalPages?: number;
    totalItems?: number;
    onSearchChange?: (query: string) => void;
    searchQuery?: string;
    filterControls?: ReactNode;
}

export default function AdminKaryawanTable({
    data,
    loading = false,
    onLihatDetail,
    onPageChange,
    currentPage = 1,
    totalPages = 1,
    totalItems,
    onSearchChange,
    searchQuery = '',
    filterControls,
}: AdminKaryawanTableProps) {
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

    const canGoPrev = currentPage > 1 && !loading;
    const canGoNext = currentPage < totalPages && !loading;

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama karyawan atau perusahaan..."
                                disabled={loading}
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        {filterControls}
                    </div>
                    <div className="flex items-center gap-3 justify-end">
                        <div className="text-sm text-slate-600">
                            {typeof totalItems === 'number' ? (
                                <span>
                                    Total <span className="font-semibold text-slate-900">{totalItems.toLocaleString('id-ID')}</span>
                                </span>
                            ) : (
                                <span>
                                    Menampilkan <span className="font-semibold text-slate-900">{data.length}</span>
                                </span>
                            )}
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
                        <thead>
                            <tr className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/20">
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Nama Lengkap</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">NIK</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Alamat</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Perusahaan</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Kontrak Sekarang</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Sisa Waktu</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-16 text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            <ClipLoader size={20} color="#419823" />
                                            <span className="text-slate-600 font-medium">Memuat data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length > 0 ? (
                                data.map((karyawan) => {
                                    const sisa = karyawan.sisaWaktuKontrak;
                                    const sisaBadgeClass =
                                        sisa <= 0
                                            ? 'bg-red-50 text-red-700 ring-red-200'
                                            : sisa <= 4
                                                ? 'bg-secondary/25 text-slate-900 ring-secondary/40'
                                                : 'bg-primary/10 text-primary ring-primary/20';

                                    return (
                                        <tr key={karyawan.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-slate-900">{karyawan.namaLengkap}</td>
                                            <td className="px-4 py-3 text-slate-700">{karyawan.nik}</td>
                                            <td className="px-4 py-3 text-slate-700">
                                                <span className="line-clamp-2">{karyawan.alamat || '-'}</span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">
                                                <span className="line-clamp-2">{karyawan.perusahaan}</span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">
                                                <span className="line-clamp-2">{karyawan.kontrakSekarang}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${sisaBadgeClass}`}>
                                                    {sisa <= 0 ? 'Habis' : `${sisa} minggu`}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => onLihatDetail(karyawan.id)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    Lihat Detail
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-4 py-16 text-center text-slate-500">
                                        Tidak ada data karyawan
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {data.length > 0 && (
                <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-slate-600">
                        {typeof totalItems === 'number'
                            ? `Menampilkan ${data.length} dari ${totalItems.toLocaleString('id-ID')} data`
                            : `Menampilkan ${data.length} data`}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePreviousPage}
                            disabled={!canGoPrev}
                            className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/30 text-slate-700 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="text-sm text-slate-700">Halaman {currentPage} / {totalPages}</div>
                        <button
                            onClick={handleNextPage}
                            disabled={!canGoNext}
                            className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/30 text-slate-700 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
