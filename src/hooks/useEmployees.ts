import { useState, useEffect } from 'react';
import { getEmployeesByContract } from '../lib/api';
import type { Employee, GetEmployeesByContractParams } from '../lib/api';

interface UseEmployeesResult {
    employees: Employee[];
    loading: boolean;
    error: string | null;
    pagination: {
        total: number;
        limit: number;
        offset: number;
    };
    refetch: () => void;
}

export function useEmployees(
    params: GetEmployeesByContractParams
): UseEmployeesResult {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        total: 0,
        limit: params.limit || 50,
        offset: params.offset || 0,
    });
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let isMounted = true;

        async function fetchEmployees() {
            setLoading(true);
            setError(null);

            try {
                const response = await getEmployeesByContract(params);
                if (isMounted) {
                    setEmployees(response.data);
                    setPagination(response.pagination);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err?.message || 'Failed to fetch employees');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchEmployees();

        return () => {
            isMounted = false;
        };
    }, [params.company_id, params.contract_type, params.approved, params.limit, params.offset, refreshKey]);

    const refetch = () => {
        setRefreshKey((v) => v + 1);
    };

    return { employees, loading, error, pagination, refetch };
}
