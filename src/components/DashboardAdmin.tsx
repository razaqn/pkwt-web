import Dashboard from "./Dashboard";
import StatCard from "./StatCard";
import EmployeeContractStatusChart from "./EmployeeContractStatusChart";
import NewContractsChart from "./NewContractsChart";
import {
    Users,
    FileText,
    CheckSquare,
    Clock
} from 'lucide-react';

// Dummy data for statistics
const statsData = {
    totalEmployees: {
        value: 1245,
        percentage: 5.32,
        icon: Users,
        iconBgColor: 'bg-blue-100',
        iconColor: 'text-blue-600'
    },
    activeContracts: {
        value: 987,
        percentage: 1.9,
        icon: FileText,
        iconBgColor: 'bg-green-100',
        iconColor: 'text-green-600'
    },
    pendingApprovals: {
        value: 34,
        percentage: 0.65,
        icon: CheckSquare,
        iconBgColor: 'bg-yellow-100',
        iconColor: 'text-yellow-600'
    },
    contractsExpiringSoon: {
        value: 15,
        percentage: 8.35,
        icon: Clock,
        iconBgColor: 'bg-red-100',
        iconColor: 'text-red-600'
    }
};

// Dummy data for Employee Contract Status chart
const contractStatusData = {
    labels: ['Permanent', 'Fixed-term', 'Intern'],
    datasets: [
        {
            data: [65, 25, 10],
            backgroundColor: ['#3B82F6', '#06B6D4', '#10B981'],
            borderColor: ['#FFFFFF', '#FFFFFF', '#FFFFFF'],
            borderWidth: 2,
        },
    ],
};

// Dummy data for New Contracts per Month chart
const newContractsData = {
    labels: ['Jan-Jun', 'February', 'March', 'April', 'May', 'Jun-Jun'],
    datasets: [
        {
            label: 'New Contracts',
            data: [21, 54, 35, 76, 57, 93],
            borderColor: '#06B6D4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            tension: 0.4,
            fill: true,
        },
    ],
};

export default function DashboardAdmin() {
    return (
        <Dashboard
            title="Selamat Datang di Dashboard Admin E-PKWT!"
            welcomeText="Kelola data karyawan dan kontrak dengan mudah."
        >
            <div className="space-y-6">
                {/* Statistics Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Employees"
                        value={statsData.totalEmployees.value}
                        icon={statsData.totalEmployees.icon}
                        iconBgColor={statsData.totalEmployees.iconBgColor}
                        iconColor={statsData.totalEmployees.iconColor}
                        percentage={statsData.totalEmployees.percentage}
                    />
                    <StatCard
                        title="Active Contracts"
                        value={statsData.activeContracts.value}
                        icon={statsData.activeContracts.icon}
                        iconBgColor={statsData.activeContracts.iconBgColor}
                        iconColor={statsData.activeContracts.iconColor}
                        percentage={statsData.activeContracts.percentage}
                    />
                    <StatCard
                        title="Pending Approvals"
                        value={statsData.pendingApprovals.value}
                        icon={statsData.pendingApprovals.icon}
                        iconBgColor={statsData.pendingApprovals.iconBgColor}
                        iconColor={statsData.pendingApprovals.iconColor}
                        percentage={statsData.pendingApprovals.percentage}
                        percentageColor="text-yellow-500"
                    />
                    <StatCard
                        title="Contracts Expiring Soon"
                        value={statsData.contractsExpiringSoon.value}
                        icon={statsData.contractsExpiringSoon.icon}
                        iconBgColor={statsData.contractsExpiringSoon.iconBgColor}
                        iconColor={statsData.contractsExpiringSoon.iconColor}
                        percentage={statsData.contractsExpiringSoon.percentage}
                        percentageColor="text-red-500"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <EmployeeContractStatusChart data={contractStatusData} />
                    <NewContractsChart data={newContractsData} />
                </div>
            </div>
        </Dashboard>
    );
}