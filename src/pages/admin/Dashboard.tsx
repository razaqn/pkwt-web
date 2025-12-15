import { Users, FileText, Clock, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { MoonLoader } from 'react-spinners';
import { Link } from 'react-router-dom';
import AdminMetricCard from '../../components/dashboard/AdminMetricCard';
import EmployeeContractStatusChart from '../../components/dashboard/EmployeeContractStatusChart';
import NewContractsChart from '../../components/dashboard/NewContractsChart';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';

export default function AdminDashboard() {
    const { data, loading, error } = useAdminDashboard();

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <MoonLoader size={48} color="#419823" />
                <p className="font-medium text-slate-700">Memuat data dashboard...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-red-800">Gagal Memuat Data</h3>
                        <p className="mt-1 text-sm text-red-700">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // No data state
    if (!data) {
        return (
            <div className="rounded-xl border bg-white p-6 text-center">
                <p className="text-slate-600">Tidak ada data tersedia</p>
            </div>
        );
    }

    // Format numbers with thousand separators
    const formatNumber = (num: number): string => {
        return num.toLocaleString('id-ID');
    };

    return (
        <div className="space-y-6">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-[#419823] via-[#2f7d1a] to-[#1f6a14] p-6 text-white shadow-sm">
                <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -left-24 -bottom-28 h-64 w-64 rounded-full bg-black/10 blur-2xl" />

                <div className="relative">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
                                Overview • Admin
                            </div>
                            <h1 className="mt-3 text-2xl font-semibold tracking-tight">Dashboard Admin</h1>
                            <p className="mt-1 text-white/85">
                                Ringkasan aktivitas kontrak, persetujuan, dan data karyawan.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Link
                                to="/admin/approvals"
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-white/95"
                            >
                                Lihat Pengajuan
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                to="/admin/config"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                            >
                                Pengaturan
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AdminMetricCard
                    title="Total Employees"
                    value={formatNumber(data.metrics.total_employees.value)}
                    icon={Users}
                    iconBgColor="bg-primary/10"
                    iconColor="text-primary"
                    trend={{
                        value: data.metrics.total_employees.change_percentage,
                        isPositive: data.metrics.total_employees.change_percentage >= 0
                    }}
                />
                <AdminMetricCard
                    title="Active Contracts"
                    value={formatNumber(data.metrics.active_contracts.value)}
                    icon={FileText}
                    iconBgColor="bg-secondary/25"
                    iconColor="text-slate-900"
                    trend={{
                        value: data.metrics.active_contracts.change_percentage,
                        isPositive: data.metrics.active_contracts.change_percentage >= 0
                    }}
                />
                <AdminMetricCard
                    title="Pending Approvals"
                    value={formatNumber(data.metrics.pending_approvals.value)}
                    icon={Clock}
                    iconBgColor="bg-slate-100"
                    iconColor="text-slate-700"
                    trend={{
                        value: data.metrics.pending_approvals.change_percentage,
                        isPositive: data.metrics.pending_approvals.change_percentage >= 0
                    }}
                />
                <AdminMetricCard
                    title="Contracts Expiring Soon"
                    value={formatNumber(data.metrics.contracts_expiring_soon.value)}
                    icon={AlertCircle}
                    iconBgColor="bg-red-50"
                    iconColor="text-red-600"
                    trend={{
                        value: data.metrics.contracts_expiring_soon.change_percentage,
                        isPositive: data.metrics.contracts_expiring_soon.change_percentage >= 0
                    }}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EmployeeContractStatusChart data={data.contract_status_distribution} />
                <NewContractsChart data={data.new_contracts_trend} />
            </div>
        </div>
    );
}
