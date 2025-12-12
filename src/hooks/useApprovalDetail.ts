import { useState, useEffect } from 'react';
import { getApprovalDetail } from '../lib/api';
import type { ApprovalDetail } from '../lib/api';

interface UseApprovalDetailResult {
    approval: ApprovalDetail | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useApprovalDetail(contractId: string | undefined): UseApprovalDetailResult {
    const [approval, setApproval] = useState<ApprovalDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    useEffect(() => {
        if (!contractId) {
            setLoading(false);
            return;
        }

        let isMounted = true;

        async function fetchApprovalDetail() {
            setLoading(true);
            setError(null);

            try {
                const data = await getApprovalDetail(contractId!);

                if (isMounted) {
                    setApproval(data);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err?.message || 'Gagal memuat detail persetujuan');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchApprovalDetail();

        return () => {
            isMounted = false;
        };
    }, [contractId, refetchTrigger]);

    const refetch = () => {
        setRefetchTrigger(prev => prev + 1);
    };

    return {
        approval,
        loading,
        error,
        refetch,
    };
}
