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
        <div className="grid gap-6">
            {showWelcome && (
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <p className="text-lg font-semibold text-slate-800">Selamat Datang di E-PKWT!</p>
                    <p className="mt-1 text-slate-600">Mulai dengan menambahkan karyawan dan membuat kontrak baru.</p>
                    <button
                        onClick={() => navigate('/form-kontrak')}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
                    >
                        Buat Kontrak Baru
                    </button>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-3">
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

                <ActiveEmployeesCard
                    total={totalActiveEmployees}
                    pkwt={pkwt}
                    pkwtt={pkwtt}
                    loading={loading}
                    error={error}
                    onRefetch={() => void refetch()}
                />

                <ExpiringSoonCard
                    items={expiringSoon}
                    loading={loading}
                    error={error}
                    onRefetch={() => void refetch()}
                />
            </div>
        </div>
    );
}
