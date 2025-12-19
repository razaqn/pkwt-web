import { useCallback, useEffect, useState } from 'react';
import {
    getDashboardSummary,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    type DashboardSummary,
} from '../lib/api';
import { toUserMessage } from '../lib/errors';

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export interface UseDashboardSummaryResult {
    summary: DashboardSummary | null;
    loading: boolean;
    error: string | null;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refetch: () => Promise<void>;
}

export function useDashboardSummary(): UseDashboardSummaryResult {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSummary = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getDashboardSummary();
            setSummary(response.data);
        } catch (err: any) {
            setError(toUserMessage(err, 'Gagal memuat ringkasan dashboard'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        const run = async () => {
            if (!isMounted) return;
            await fetchSummary();
        };

        run();

        const intervalId = setInterval(() => {
            void run();
        }, REFRESH_INTERVAL_MS);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [fetchSummary]);

    const markAsRead = useCallback(async (notificationId: string) => {
        setSummary((prev) => {
            if (!prev) return prev;

            const wasUnread = prev.notifications.items.some(
                (item) => item.id === notificationId && !item.is_read
            );

            const updatedItems = prev.notifications.items.map((item) =>
                item.id === notificationId ? { ...item, is_read: true } : item
            );

            const updatedUnread = wasUnread
                ? Math.max(0, prev.notifications.total_unread - 1)
                : prev.notifications.total_unread;

            return {
                ...prev,
                notifications: {
                    ...prev.notifications,
                    items: updatedItems,
                    total_unread: updatedUnread,
                },
            };
        });

        try {
            await markNotificationAsRead(notificationId);
        } catch (err: any) {
            setError(toUserMessage(err, 'Gagal menandai notifikasi'));
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        setSummary((prev) => {
            if (!prev) return prev;

            const hasUnread = prev.notifications.total_unread > 0;
            if (!hasUnread) return prev;

            const updatedItems = prev.notifications.items.map((item) => ({
                ...item,
                is_read: true,
            }));

            return {
                ...prev,
                notifications: {
                    ...prev.notifications,
                    items: updatedItems,
                    total_unread: 0,
                },
            };
        });

        try {
            await markAllNotificationsAsRead();
        } catch (err: any) {
            setError(toUserMessage(err, 'Gagal menandai semua notifikasi'));
        }
    }, []);

    const refetch = useCallback(async () => {
        await fetchSummary();
    }, [fetchSummary]);

    return {
        summary,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        refetch,
    };
}
