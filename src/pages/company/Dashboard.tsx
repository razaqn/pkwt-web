import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardSummary } from '../../hooks/useDashboardSummary';
import { NotificationCenterCard } from '../../components/dashboard/NotificationCenterCard';
import { ActiveEmployeesCard } from '../../components/dashboard/ActiveEmployeesCard';
import { ExpiringSoonCard } from '../../components/dashboard/ExpiringSoonCard';

export default function CompanyDashboard() {
    const navigate = useNavigate();
    const { summary, loading, error, markAsRead, markAllAsRead, refetch } = useDashboardSummary();

    const notificationItems = useMemo(() => summary?.notifications.items.slice(0, 5) ?? [], [summary]);
    const totalUnread = summary?.notifications.total_unread ?? 0;
    const expiringSoon = useMemo(() => summary?.expiring_soon ?? [], [summary]);

    // Calculate total in frontend to match ProfilePerusahaan logic
    const pkwt = summary?.active_employees.pkwt ?? 0;
    const pkwtt = summary?.active_employees.pkwtt ?? 0;
    const totalActiveEmployees = pkwt + pkwtt;

    const showWelcome = useMemo(() => {
        if (loading || !summary) return false;
        const hasNotifications = summary.notifications.items.length > 0;
        const hasEmployees = summary.active_employees.total > 0;
        const hasExpiring = summary.expiring_soon.length > 0;
        return !hasNotifications && !hasEmployees && !hasExpiring;
    }, [loading, summary]);

    const handleNotificationClick = async (id: string, contractId: string) => {
        await markAsRead(id);
        navigate(`/status-pantau/${contractId}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-primary">Overview</p>
                    <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Ringkasan Perusahaan</h2>
                    <p className="mt-1 text-sm text-slate-600">Pantau notifikasi, karyawan aktif, dan kontrak yang mendekati habis.</p>
                </div>
                <button
                    onClick={() => navigate('/form-kontrak')}
                    className="inline-flex items-center justify-center rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                    Buat Kontrak Baru
                </button>
            </div>

            {showWelcome && (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="bg-gradient-to-r from-primary/10 via-white to-secondary/20 px-6 py-5">
                        <p className="text-lg font-semibold text-slate-900">Selamat Datang di E-PKWT!</p>
                        <p className="mt-1 text-sm text-slate-600">Mulai dengan menambahkan karyawan dan membuat kontrak baru.</p>
                    </div>
                    <div className="px-6 py-5">
                        <button
                            onClick={() => navigate('/form-kontrak')}
                            className="inline-flex items-center justify-center rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            Buat Kontrak Baru
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12">
                <div className="md:col-span-2 lg:col-span-5">
                    <NotificationCenterCard
                        notifications={notificationItems}
                        totalUnread={totalUnread}
                        loading={loading}
                        error={error}
                        onRefetch={() => void refetch()}
                        onMarkAllRead={() => void markAllAsRead()}
                        onClickItem={(id, contractId) => void handleNotificationClick(id, contractId)}
                        onViewAll={() => navigate('/status-pantau')}
                    />
                </div>

                <div className="lg:col-span-3">
                    <ActiveEmployeesCard
                        total={totalActiveEmployees}
                        pkwt={pkwt}
                        pkwtt={pkwtt}
                        loading={loading}
                        error={error}
                        onRefetch={() => void refetch()}
                    />
                </div>

                <div className="lg:col-span-4">
                    <ExpiringSoonCard
                        items={expiringSoon}
                        loading={loading}
                        error={error}
                        onRefetch={() => void refetch()}
                    />
                </div>
            </div>
        </div>
    );
}
