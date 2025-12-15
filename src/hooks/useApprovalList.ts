import { useState, useEffect } from 'react';
import { getApprovalList } from '../lib/api';
import type { ApprovalListItem, GetApprovalListParams } from '../lib/api';

const LIMIT_PER_PAGE = 7;

interface UseApprovalListResult {
    approvals: ApprovalListItem[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    totalCount: number;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    goToPage: (page: number) => void;
}

export function useApprovalList(): UseApprovalListResult {
    const [approvals, setApprovals] = useState<ApprovalListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        let isMounted = true;

        async function fetchApprovals() {
            setLoading(true);
            setError(null);

            try {
                const params: GetApprovalListParams = {
                    limit: LIMIT_PER_PAGE,
                    offset: (currentPage - 1) * LIMIT_PER_PAGE,
                    status: 'PENDING', // Only show pending approvals
                };

                if (searchQuery.trim()) {
                    params.search = searchQuery;
                }

                const response = await getApprovalList(params);

                if (isMounted) {
                    setApprovals(response.data);
                    setTotalCount(response.pagination.total);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err?.message || 'Gagal memuat data persetujuan');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchApprovals();

        return () => {
            isMounted = false;
        };
    }, [currentPage, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(totalCount / LIMIT_PER_PAGE));

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleSetSearchQuery = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1); // Reset to page 1 on search
    };

    return {
        approvals,
        loading,
        error,
        currentPage,
        totalPages,
        totalCount,
        searchQuery,
        setSearchQuery: handleSetSearchQuery,
        goToPage,
    };
}
