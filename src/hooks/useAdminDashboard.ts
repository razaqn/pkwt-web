import { useState, useEffect } from 'react';
import { getAdminDashboardOverview, type AdminDashboardOverview } from '../lib/api';
import { toUserMessage } from '../lib/errors';

export function useAdminDashboard() {
    const [data, setData] = useState<AdminDashboardOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            try {
                setLoading(true);
                setError(null);
                const response = await getAdminDashboardOverview();

                if (isMounted) {
                    setData(response.data);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(toUserMessage(err, 'Gagal memuat data dashboard'));
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    return { data, loading, error };
}
