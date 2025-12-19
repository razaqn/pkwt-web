import { useState, useEffect } from 'react';
import { getAllEmployeesByContract } from '../lib/api';
import { toUserMessage } from '../lib/errors';
import type { Employee, GetAllEmployeesParams } from '../lib/api';

interface UseAllEmployeesResult {
    employees: Employee[];
    loading: boolean;
    error: string | null;
    pagination: {
        limit: number;
        offset: number;
        total: number;
    };
}

export function useAllEmployees(
    params: GetAllEmployeesParams
): UseAllEmployeesResult {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        limit: params.limit || 7,
        offset: params.offset || 0,
        total: 0
    });

    useEffect(() => {
        let isMounted = true;

        async function fetchEmployees() {
            setLoading(true);
            setError(null);

            try {
                const response = await getAllEmployeesByContract(params);

                if (isMounted) {
                    setEmployees(response.data);
                    setPagination(response.pagination);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(toUserMessage(err, 'Gagal memuat data karyawan'));
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
    }, [params.contract_type, params.company_id, params.approved, params.limit, params.offset]);

    return { employees, loading, error, pagination };
}
