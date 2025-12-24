import { useCallback, useEffect, useState } from 'react';
import { getCompanyTemplates, type CompanyTemplatesResponse } from '../lib/api';
import { toUserMessage } from '../lib/errors';

export function useCompanyTemplates() {
    const [data, setData] = useState<CompanyTemplatesResponse['data'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await getCompanyTemplates();
                if (res?.ok && res.data) {
                    setData(res.data);
                } else {
                    setData({ enabled: true, title: 'Template', items: [] });
                    setError('Gagal memuat template');
                }
            } catch (err: any) {
                setData({ enabled: true, title: 'Template', items: [] });
                setError(toUserMessage(err, 'Gagal memuat template'));
            } finally {
                setLoading(false);
            }
        };

        run();
    }, []);

    const refetch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getCompanyTemplates();
            if (res?.ok && res.data) {
                setData(res.data);
            } else {
                setData({ enabled: true, title: 'Template', items: [] });
                setError('Gagal memuat template');
            }
        } catch (err: any) {
            setData({ enabled: true, title: 'Template', items: [] });
            setError(toUserMessage(err, 'Gagal memuat template'));
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, refetch };
}
