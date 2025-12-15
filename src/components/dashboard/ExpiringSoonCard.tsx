import { AlertTriangle } from 'lucide-react';
import type { DashboardExpiringEmployee } from '../../lib/api';
import { CardSkeleton } from './CardSkeleton';
import { EmptyState } from './EmptyState';
import { getCountdownStatus } from '../../lib/utils';

interface ExpiringSoonCardProps {
    items: DashboardExpiringEmployee[];
    loading: boolean;
    error: string | null;
    onRefetch: () => void;
}

export function ExpiringSoonCard({ items, loading, error, onRefetch }: ExpiringSoonCardProps) {
    const sorted = [...items].sort((a, b) => a.days_until_expiry - b.days_until_expiry);

    return (
        <div className="flex h-96 flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3 border-b border-slate-200 bg-gradient-to-r from-secondary/30 via-white to-primary/10 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary shadow-sm ring-1 ring-secondary/30">
                    <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-900">Hampir Habis</h3>
                    <p className="text-xs text-slate-500">≤30 hari | Lewat maks 3 hari</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {loading && <CardSkeleton />}

                {!loading && error && (
                    <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                        <p className="font-semibold">Gagal memuat data</p>
                        <p className="mt-1">{error}</p>
                        <button
                            onClick={onRefetch}
                            className="mt-2 text-xs font-semibold text-red-700 underline"
                        >
                            Coba lagi
                        </button>
                    </div>
                )}

                {!loading && !error && sorted.length === 0 && (
                    <EmptyState
                        title="Tidak ada kontrak mendekati kedaluwarsa"
                        description="Semua kontrak masih aman untuk saat ini."
                    />
                )}

                {!loading && !error && sorted.length > 0 && (
                    <div className="space-y-2">
                        {sorted.map((item) => {
                            const { label, colorClass } = getCountdownStatus(item.days_until_expiry);
                            const isExpired = item.days_until_expiry < 0;
                            const isUrgent = item.days_until_expiry >= 0 && item.days_until_expiry <= 7;

                            return (
                                <div
                                    key={item.nik}
                                    className={`rounded-xl border px-3 py-3 transition-colors ${isExpired
                                        ? 'border-red-200 bg-red-50 hover:bg-red-100'
                                        : isUrgent
                                            ? 'border-secondary/40 bg-secondary/20 hover:bg-secondary/30'
                                            : 'border-slate-200 bg-white hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-slate-800">{item.name}</p>
                                            <p className="text-xs text-slate-500">NIK: {item.nik}</p>
                                        </div>
                                        <div
                                            className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-bold ${isExpired
                                                ? 'bg-red-100'
                                                : isUrgent
                                                    ? 'bg-secondary/40'
                                                    : 'bg-slate-100'
                                                }`}
                                        >
                                            <span className={colorClass}>{label}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
