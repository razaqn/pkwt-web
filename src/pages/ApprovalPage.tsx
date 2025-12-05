import { useState } from 'react';
import { CheckSquare } from 'lucide-react';
import ApprovalTable from '../components/ApprovalTable';
import { dummyApprovals } from '../lib/dummyData';
import type { PaginationState } from '../types/approvalTypes';

export default function ApprovalPage() {
    // Filter only pending approvals
    const pendingApprovals = dummyApprovals.filter(approval => approval.status === 'pending');
    const itemsPerPage = 10;

    // State for pagination
    const [pagination, setPagination] = useState<PaginationState>({
        currentPage: 1,
        itemsPerPage,
        totalItems: pendingApprovals.length,
        totalPages: Math.ceil(pendingApprovals.length / itemsPerPage)
    });

    // Get current page data
    const getCurrentPageData = () => {
        const startIndex = (pagination.currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return pendingApprovals.slice(startIndex, endIndex);
    };

    const handlePageChange = (page: number) => {
        setPagination(prev => ({
            ...prev,
            currentPage: page
        }));
    };

    return (
        <div className="p-0">
            <div className="flex items-center gap-3 px-6 pt-6 pb-2">
                <CheckSquare className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Daftar permohonan PKWT yang membutuhkan persetujuan</h1>
            </div>

            <div className="px-6 pb-6">
                <ApprovalTable
                    approvals={getCurrentPageData()}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                />
            </div>
        </div>
    );
}