import { useState, useEffect } from 'react';
import { getEmployeeDetail } from '../lib/api';
import { toUserMessage } from '../lib/errors';
import type { EmployeeDetail } from '../lib/api';

interface UseEmployeeDetailResult {
    data: EmployeeDetail | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useEmployeeDetail(employeeId: string | undefined): UseEmployeeDetailResult {
    const [data, setData] = useState<EmployeeDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    function refetch() {
        setRefreshKey((k) => k + 1);
    }

    useEffect(() => {
        if (!employeeId) {
            setLoading(false);
            setError('ID karyawan tidak ditemukan');
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
                    setError(toUserMessage(err, 'Gagal memuat detail karyawan'));
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchEmployeeDetail();
        return () => { isMounted = false; };
    }, [employeeId, refreshKey]);

    return { data, loading, error, refetch };
}
