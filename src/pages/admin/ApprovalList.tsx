import { useNavigate } from 'react-router-dom';
import { AlertCircle, RotateCcw } from 'lucide-react';
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
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Persetujuan Kontrak
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Kelola persetujuan kontrak dari perusahaan
                    </p>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">
                            Terjadi Kesalahan
                        </p>
                        <p className="mt-1 text-sm text-red-700">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-3 inline-flex items-center gap-1.5 rounded bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-200"
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
                <h1 className="text-2xl font-bold text-slate-900">
                    Persetujuan Kontrak
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                    Kelola persetujuan kontrak dari perusahaan
                </p>
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
