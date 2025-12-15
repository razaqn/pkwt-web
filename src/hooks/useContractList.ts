import { useState, useEffect } from 'react';
import {
    getContractApplications,
    type ContractApplicationBatch,
} from '../lib/api';
import { getCompanyId } from '../store/auth';

type ApprovalStatus = 'PENDING' | 'REJECTED' | 'APPROVED' | 'DRAFT' | null;

export interface UseContractListReturn {
    contracts: ContractApplicationBatch[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    statusFilter: ApprovalStatus;
    setStatusFilter: (status: ApprovalStatus) => void;
    goToPage: (page: number) => void;
    refetch: () => void;
}

const LIMIT_PER_PAGE = 7;

function withEmployeeCountInTitle(title: string, count: number): string {
    // Normalize title like: "PKWT-xxxx (0 Karyawan)" -> "PKWT-xxxx (2 Karyawan)"
    // If pattern is absent, we append a suffix.
    const re = /\(\s*\d+\s*Karyawan\s*\)/i;
    if (re.test(title)) return title.replace(re, `(${count} Karyawan)`);
    return `${title} (${count} Karyawan)`;
}

function normalizeDraftBatches(data: ContractApplicationBatch[]): ContractApplicationBatch[] {
    // Backend may store PKWT drafts as multiple rows (1 per NIK). UI should display a single batch.
    // We group only PKWT drafts to avoid changing semantics for non-draft submissions.
    const grouped = new Map<string, {
        item: ContractApplicationBatch;
        sumCount: number;
        maxCount: number;
        rowCount: number;
    }>();

    const passthrough: ContractApplicationBatch[] = [];

    for (const item of data) {
        const isDraft = Boolean(item.is_draft) || item.approval_status === null;
        if (!isDraft || item.contract_type !== 'PKWT') {
            passthrough.push(item);
            continue;
        }

        // Composite key to group per-NIK rows that represent the same draft batch.
        // We intentionally do NOT rely only on `id` because some backends return row ids.
        // NOTE: Some backends also generate a different title per row (e.g., title contains the row id),
        // so we must NOT include title in the grouping key.
        const key = [
            'PKWT_DRAFT',
            item.contract_type,
            item.start_date,
            item.duration_months ?? 'null',
        ].join('|');

        const existing = grouped.get(key);
        if (!existing) {
            grouped.set(key, {
                item,
                sumCount: item.employee_count ?? 0,
                maxCount: item.employee_count ?? 0,
                rowCount: 1,
            });
            continue;
        }

        existing.sumCount += item.employee_count ?? 0;
        existing.maxCount = Math.max(existing.maxCount, item.employee_count ?? 0);
        existing.rowCount += 1;

        // Prefer a representative item that looks more like a batch (higher employee_count).
        if ((item.employee_count ?? 0) > (existing.item.employee_count ?? 0)) {
            existing.item = item;
        }
    }

    const mergedDrafts: ContractApplicationBatch[] = [];
    for (const { item, sumCount, maxCount, rowCount } of grouped.values()) {
        const computedCount = maxCount > 1 ? maxCount : (sumCount > 0 ? sumCount : rowCount);
        mergedDrafts.push({
            ...item,
            title: withEmployeeCountInTitle(item.title, computedCount),
            employee_count: computedCount,
            is_draft: true,
            approval_status: null,
        });
    }

    return [...mergedDrafts, ...passthrough];
}

export function useContractList(): UseContractListReturn {
    const companyId = getCompanyId();

    const [contracts, setContracts] = useState<ContractApplicationBatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [statusFilter, setStatusFilter] = useState<ApprovalStatus>(null);
    const [refreshKey, setRefreshKey] = useState(0);

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

                const is_draft = statusFilter === 'DRAFT' ? true : undefined;
                const approval_status = statusFilter === 'DRAFT' ? undefined : (statusFilter || undefined);

                const response = await getContractApplications({
                    company_id: companyId!,
                    limit: LIMIT_PER_PAGE,
                    offset,
                    approval_status,
                    is_draft,
                });

                if (isMounted) {
                    setContracts(normalizeDraftBatches(response.data));
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
    }, [companyId, currentPage, statusFilter, refreshKey]);

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

    const refetch = () => {
        setRefreshKey((v) => v + 1);
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
        refetch,
    };
}
