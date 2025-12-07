import { useState, useEffect } from 'react';
import { getEmployeeDetail } from '../lib/api';
import type { EmployeeDetail } from '../lib/api';

interface UseEmployeeDetailResult {
    data: EmployeeDetail | null;
    loading: boolean;
    error: string | null;
}

export function useEmployeeDetail(employeeId: string | undefined): UseEmployeeDetailResult {
    const [data, setData] = useState<EmployeeDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!employeeId) {
            setLoading(false);
            setError('Employee ID is required');
            return;
        }

        let isMounted = true;

        async function fetchEmployeeDetail() {
            setLoading(true);
            setError(null);

            try {
                const response = await getEmployeeDetail(employeeId!);
                if (isMounted) {
                    setData(response.data);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err?.message || 'Failed to fetch employee detail');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchEmployeeDetail();
        return () => { isMounted = false; };
    }, [employeeId]);

    return { data, loading, error };
}
