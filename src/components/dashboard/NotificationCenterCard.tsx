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
        <div className="h-96 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
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
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                        Tandai Semua Dibaca
                    </button>
                )}
            </div>

            <div className="space-y-2 overflow-y-auto p-4" style={{ maxHeight: 'calc(24rem - 9rem)' }}>
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
                            className={`flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${!item.is_read
                                    ? 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                                    : 'border-slate-200 bg-white hover:bg-slate-50'
                                }`}
                        >
                            <div className="flex h-2 w-2 shrink-0 mt-1.5">
                                {!item.is_read && (
                                    <span className="inline-block h-2 w-2 rounded-full bg-blue-600" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="mb-1 flex items-center gap-2">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${item.status === 'APPROVED'
                                                ? 'bg-green-100 text-green-800'
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
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    Lihat Semua
                </button>
            </div>
        </div>
    );
}
