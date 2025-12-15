import { Bell } from 'lucide-react';
import type { DashboardNotification } from '../../lib/api';
import { formatRelativeTime } from '../../lib/utils';
import { CardSkeleton } from './CardSkeleton';
import { EmptyState } from './EmptyState';

interface NotificationCenterCardProps {
    notifications: DashboardNotification[];
    totalUnread: number;
    loading: boolean;
    error: string | null;
    onRefetch: () => void;
    onMarkAllRead: () => void;
    onClickItem: (id: string, contractId: string) => void;
    onViewAll: () => void;
}

export function NotificationCenterCard({
    notifications,
    totalUnread,
    loading,
    error,
    onRefetch,
    onMarkAllRead,
    onClickItem,
    onViewAll,
}: NotificationCenterCardProps) {
    return (
        <div className="flex h-96 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/20 px-5 py-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm ring-1 ring-primary/20">
                        <Bell className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Notifikasi</h3>
                        <p className="text-xs text-slate-500">Respon admin</p>
                    </div>
                </div>
                {totalUnread > 0 && (
                    <button
                        onClick={onMarkAllRead}
                        className="rounded-md px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                        Tandai Semua Dibaca
                    </button>
                )}
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {loading && <CardSkeleton />}

                {!loading && error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        <p className="font-semibold">Gagal memuat notifikasi</p>
                        <p className="mt-1">{error}</p>
                        <button
                            onClick={onRefetch}
                            className="mt-2 text-xs font-semibold text-red-700 underline"
                        >
                            Coba lagi
                        </button>
                    </div>
                )}

                {!loading && !error && notifications.length === 0 && (
                    <EmptyState
                        title="Belum ada notifikasi baru"
                        description="Notifikasi akan muncul setelah ada respon admin."
                    />
                )}

                {!loading && !error &&
                    notifications.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onClickItem(item.id, item.contract_id)}
                            className={`flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${!item.is_read
                                ? 'border-primary/25 bg-primary/5 hover:bg-primary/10'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                                }`}
                        >
                            <div className="flex h-2 w-2 shrink-0 mt-1.5">
                                {!item.is_read && (
                                    <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="mb-1 flex items-center gap-2">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${item.status === 'APPROVED'
                                            ? 'bg-primary/15 text-primary'
                                            : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {item.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-slate-900">{item.title}</p>
                                <p className="mt-0.5 text-xs text-slate-500">{formatRelativeTime(item.updated_at)}</p>
                            </div>
                        </button>
                    ))}

            </div>

            <div className="border-t border-slate-200 px-4 py-3">
                <button
                    onClick={onViewAll}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-white px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                >
                    Lihat Semua
                </button>
            </div>
        </div>
    );
}
