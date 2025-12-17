import { useNavigate } from 'react-router-dom';
import { AlertCircle, RotateCcw, FileCheck } from 'lucide-react';
import { useApprovalList } from '../../hooks/useApprovalList';
import ApprovalTable from '../../components/ApprovalTable';

export default function ApprovalList() {
    const navigate = useNavigate();
    const {
        approvals,
        loading,
        error,
        currentPage,
        totalPages,
        totalCount,
        searchQuery,
        setSearchQuery,
        goToPage,
    } = useApprovalList();

    const handleLihatDetail = (contractId: string) => {
        navigate(`/admin/approvals/${contractId}`);
    };

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-primary">Kontrak</p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Persetujuan Kontrak</h1>
                        <p className="mt-1 text-sm text-slate-600">Kelola persetujuan kontrak dari perusahaan.</p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm">
                        <FileCheck className="h-4 w-4 text-primary" />
                        Pending: {totalCount.toLocaleString('id-ID')}
                    </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">
                            Terjadi Kesalahan
                        </p>
                        <p className="mt-1 text-sm text-red-700">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-200"
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-primary">Kontrak</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Persetujuan Kontrak</h1>
                    <p className="mt-1 text-sm text-slate-600">Kelola persetujuan kontrak dari perusahaan.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm">
                    <FileCheck className="h-4 w-4 text-primary" />
                    Pending: {totalCount.toLocaleString('id-ID')}
                </div>
            </div>

            {/* Table */}
            <ApprovalTable
                data={approvals}
                loading={loading}
                onLihatDetail={handleLihatDetail}
                onPageChange={goToPage}
                currentPage={currentPage}
                totalPages={totalPages}
                onSearchChange={setSearchQuery}
                searchQuery={searchQuery}
            />
        </div>
    );
}
