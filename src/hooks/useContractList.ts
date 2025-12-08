import { useState, useEffect } from 'react';
import {
    getContractApplications,
    type ContractApplicationBatch,
} from '../lib/api';
import { getCompanyId } from '../store/auth';

type ApprovalStatus = 'PENDING' | 'REJECTED' | 'APPROVED' | null;

export interface UseContractListReturn {
    contracts: ContractApplicationBatch[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    statusFilter: ApprovalStatus;
    setStatusFilter: (status: ApprovalStatus) => void;
    goToPage: (page: number) => void;
}

const LIMIT_PER_PAGE = 7;

export function useContractList(): UseContractListReturn {
    const companyId = getCompanyId();

    const [contracts, setContracts] = useState<ContractApplicationBatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [statusFilter, setStatusFilter] = useState<ApprovalStatus>(null);

    useEffect(() => {
        if (!companyId) {
            setError('Company ID not found');
            setLoading(false);
            return;
        }

        let isMounted = true;

        async function fetchContracts() {
            setLoading(true);
            setError(null);

            try {
                const offset = (currentPage - 1) * LIMIT_PER_PAGE;

                const response = await getContractApplications({
                    company_id: companyId!,
                    limit: LIMIT_PER_PAGE,
                    offset,
                    approval_status: statusFilter || undefined,
                });

                if (isMounted) {
                    setContracts(response.data);
                    setTotalCount(response.pagination.total);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err?.message || 'Gagal memuat data pengajuan');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchContracts();

        return () => {
            isMounted = false;
        };
    }, [companyId, currentPage, statusFilter]);

    const totalPages = Math.ceil(totalCount / LIMIT_PER_PAGE);

    const handleSetStatusFilter = (status: ApprovalStatus) => {
        setStatusFilter(status);
        setCurrentPage(1); // Reset to first page on filter change
    };

    const handleGoToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return {
        contracts,
        loading,
        error,
        currentPage,
        totalPages,
        statusFilter,
        setStatusFilter: handleSetStatusFilter,
        goToPage: handleGoToPage,
    };
}
