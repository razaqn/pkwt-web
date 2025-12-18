import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useCallback } from 'react';
import type { ApprovalEmployee } from '../lib/api';

interface ApprovalEmployeeTableProps {
    employees: ApprovalEmployee[];
    onViewDetail?: (employee: ApprovalEmployee) => void;
}

const ITEMS_PER_PAGE = 10;

export default function ApprovalEmployeeTable({ employees, onViewDetail }: ApprovalEmployeeTableProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(employees.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentEmployees = employees.slice(startIndex, endIndex);

    const handlePreviousPage = useCallback(() => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    }, [currentPage]);

    const handleNextPage = useCallback(() => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    }, [currentPage, totalPages]);

    const formatDate = (dateString: string | null): string => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/20">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Nama Lengkap
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    NIK
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Tanggal Lahir
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Jumlah Kontrak Sebelumnya
                                </th>
                                {onViewDetail && (
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                                        Aksi
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {currentEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={onViewDetail ? 5 : 4} className="px-4 py-16 text-center text-slate-500">
                                        Tidak ada data karyawan
                                    </td>
                                </tr>
                            ) : (
                                currentEmployees.map((employee) => (
                                    <tr
                                        key={employee.id}
                                        className="transition-colors hover:bg-slate-50"
                                    >
                                        <td className="px-4 py-4 font-medium text-slate-900">
                                            {employee.full_name}
                                        </td>
                                        <td className="px-4 py-4 text-slate-700">{employee.nik}</td>
                                        <td className="px-4 py-4 text-slate-700">
                                            {formatDate(employee.birthdate)}
                                        </td>
                                        <td className="px-4 py-4 text-slate-700">
                                            {employee.previous_contract_count}
                                        </td>
                                        {onViewDetail && (
                                            <td className="px-4 py-4 text-slate-700">
                                                <button
                                                    onClick={() => onViewDetail(employee)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary/90"
                                                >
                                                    Lihat Detail
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
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
