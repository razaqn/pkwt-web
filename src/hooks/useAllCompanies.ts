import { useState, useEffect } from 'react';
import { getAllCompanies } from '../lib/api';
import { toUserMessage } from '../lib/errors';
import type { Company, GetAllCompaniesParams } from '../lib/api';

interface UseAllCompaniesResult {
    companies: Company[];
    loading: boolean;
    error: string | null;
    pagination: {
        limit: number;
        offset: number;
        total: number;
    };
}

export function useAllCompanies(
    params: GetAllCompaniesParams
): UseAllCompaniesResult {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        limit: params.limit || 7,
        offset: params.offset || 0,
        total: 0
    });

    useEffect(() => {
        let isMounted = true;

        async function fetchCompanies() {
            setLoading(true);
            setError(null);

            try {
                const response = await getAllCompanies(params);

                if (isMounted) {
                    setCompanies(response.data);
                    setPagination(response.pagination);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(toUserMessage(err, 'Gagal memuat data perusahaan'));
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchCompanies();

        return () => {
            isMounted = false;
        };
    }, [params.limit, params.offset, params.search]);

    return { companies, loading, error, pagination };
}
