import { useCallback, useEffect, useState } from 'react';
import { getLandingConfigPublic, getLandingStatsPublic, type LandingConfig, type LandingStats } from '../lib/api';
import { toUserMessage } from '../lib/errors';

export function useLandingPublic(options?: { enabled?: boolean }) {
    const enabled = options?.enabled !== false;
    const [config, setConfig] = useState<LandingConfig | null>(null);
    const [stats, setStats] = useState<LandingStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [cfg, st] = await Promise.all([getLandingConfigPublic(), getLandingStatsPublic()]);
            if (cfg?.ok) setConfig(cfg.data);
            if (st?.ok) setStats(st.data);
        } catch (err: any) {
            setError(toUserMessage(err, 'Gagal memuat landing page'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }
        fetchAll();
    }, [enabled, fetchAll]);

    return {
        config,
        stats,
        loading,
        error,
        refresh: fetchAll,
    };
}
