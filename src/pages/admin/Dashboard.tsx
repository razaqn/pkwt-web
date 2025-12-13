import { Users, FileText, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { ClipLoader } from 'react-spinners';
import AdminMetricCard from '../../components/dashboard/AdminMetricCard';
import EmployeeContractStatusChart from '../../components/dashboard/EmployeeContractStatusChart';
import NewContractsChart from '../../components/dashboard/NewContractsChart';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';

export default function AdminDashboard() {
    const { data, loading, error } = useAdminDashboard();

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <ClipLoader size={40} color="#1F4E8C" />
                <p className="mt-4 text-slate-600">Memuat data dashboard...</p>
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
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AdminMetricCard
                    title="Total Employees"
                    value={formatNumber(data.metrics.total_employees.value)}
                    icon={Users}
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                    trend={{
                        value: data.metrics.total_employees.change_percentage,
                        isPositive: data.metrics.total_employees.change_percentage >= 0
                    }}
                />
                <AdminMetricCard
                    title="Active Contracts"
                    value={formatNumber(data.metrics.active_contracts.value)}
                    icon={FileText}
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                    trend={{
                        value: data.metrics.active_contracts.change_percentage,
                        isPositive: data.metrics.active_contracts.change_percentage >= 0
                    }}
                />
                <AdminMetricCard
                    title="Pending Approvals"
                    value={formatNumber(data.metrics.pending_approvals.value)}
                    icon={Clock}
                    iconBgColor="bg-yellow-100"
                    iconColor="text-yellow-600"
                    trend={{
                        value: data.metrics.pending_approvals.change_percentage,
                        isPositive: data.metrics.pending_approvals.change_percentage >= 0
                    }}
                />
                <AdminMetricCard
                    title="Contracts Expiring Soon"
                    value={formatNumber(data.metrics.contracts_expiring_soon.value)}
                    icon={AlertCircle}
                    iconBgColor="bg-red-100"
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
