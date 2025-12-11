import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RotateCcw } from 'lucide-react';
import AdminCompanyTable from '../../components/AdminCompanyTable';
import { useAllCompanies } from '../../hooks/useAllCompanies';
import { getUserFriendlyErrorMessage } from '../../lib/errors';

const ITEMS_PER_PAGE = 7;

export default function ListCompanies() {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch companies with pagination and search
    const { companies, loading, error } = useAllCompanies({
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
        search: searchQuery,
    });

    const handleLihatDetail = (companyId: string) => {
        navigate(`/admin/detail-company/${companyId}`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">List Perusahaan</h1>
                <p className="mt-1 text-slate-600">Data perusahaan yang terdaftar dalam sistem E-PKWT</p>
            </div>

            {/* Error State */}
            {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Terjadi Kesalahan</p>
                        <p className="text-sm text-red-700 mt-1">{getUserFriendlyErrorMessage(error)}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-3 inline-flex items-center gap-1.5 rounded bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 transition"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Coba Lagi
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <AdminCompanyTable
                data={companies}
                loading={loading}
                onLihatDetail={handleLihatDetail}
                onPageChange={setCurrentPage}
                currentPage={currentPage}
                onSearchChange={setSearchQuery}
                searchQuery={searchQuery}
            />
        </div>
    );
}
