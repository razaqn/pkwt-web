import { useState, useEffect } from 'react';
import {
    getContractApplicationDetail,
    getContractEmployees,
    type ContractApplicationDetail,
    type ContractEmployee,
} from '../lib/api';

export interface UseContractDetailReturn {
    contract: ContractApplicationDetail | null;
    employees: ContractEmployee[];
    comment: string | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useContractDetail(
    contractId: string | undefined
): UseContractDetailReturn {
    const [contract, setContract] = useState<ContractApplicationDetail | null>(
        null
    );
    const [employees, setEmployees] = useState<ContractEmployee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    function refetch() {
        setRefreshKey((k) => k + 1);
    }

    useEffect(() => {
        if (!contractId) {
            setError('Contract ID tidak ditemukan');
            setLoading(false);
            return;
        }

        let isMounted = true;

        async function fetchContractDetail() {
            setLoading(true);
            setError(null);

            try {
                // Fetch contract detail and employees in parallel
                const [detailResponse, employeesResponse] = await Promise.all([
                    getContractApplicationDetail(contractId!),
                    getContractEmployees(contractId!),
                ]);

                if (isMounted) {
                    // Handle nested response structure
                    const contractData = 'contract' in detailResponse.data
                        ? detailResponse.data.contract
                        : detailResponse.data;
                    setContract(contractData);
                    setEmployees(employeesResponse.data);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err?.message || 'Gagal memuat detail pengajuan');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchContractDetail();

        return () => {
            isMounted = false;
        };
    }, [contractId, refreshKey]);

    return {
        contract,
        employees,
        comment: contract?.admin_comment || null,
        loading,
        error,
        refetch,
    };
}
