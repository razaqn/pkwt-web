import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import KaryawanTable from '../../components/KaryawanTable';
import { useEmployees } from '../../hooks/useEmployees';
import { getCompanyId } from '../../store/auth';
import type { Karyawan } from '../../components/KaryawanTable';

type ContractType = 'PKWT' | 'PKWTT';

const ITEMS_PER_PAGE = 7;

// Transform API data to component data format
function transformEmployeeToKaryawan(employee: any): Karyawan {
    return {
        id: employee.id,
        namaLengkap: employee.full_name,
        nik: employee.nik,
        alamat: '', // API tidak provide alamat, bisa ditambahkan nanti
        kontrakSekarang: employee.latest_contract?.title || '-',
        sisaWaktuKontrak: calculateRemainingWeeks(employee.latest_contract?.start_date, employee.latest_contract?.duration_months),
    };
}

// Calculate remaining weeks from start date and duration
function calculateRemainingWeeks(startDate: string | undefined, durationMonths: number | null | undefined): number {
    if (!startDate || !durationMonths) return 0;

    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + durationMonths);

    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    const diffWeeks = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7));

    return Math.max(0, diffWeeks);
}

export default function ListKaryawan() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<ContractType>('PKWT');
    const [currentPage, setCurrentPage] = useState(1);

    // Get company_id from auth context
    const companyId = getCompanyId();

    if (!companyId) {
        return (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                Error: Company ID tidak ditemukan. Silakan login ulang.
            </div>
        );
    }    // Fetch employees based on contract type
    const { employees, loading, error } = useEmployees({
        company_id: companyId,
        contract_type: activeTab,
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
    });

    // Transform API data to table format
    const tableData: Karyawan[] = useMemo(
        () => employees.map(transformEmployeeToKaryawan),
        [employees]
    );

    const handleLihatDetail = (karyawanId: string) => {
        navigate(`/detail-karyawan/${karyawanId}?type=${activeTab.toLowerCase()}`);
    };

    const handleTabChange = (tab: ContractType) => {
        setActiveTab(tab);
        setCurrentPage(1); // Reset ke halaman pertama saat ganti tab
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">List Karyawan</h1>
                <p className="mt-1 text-slate-600">Kelola data karyawan PKWT dan PKWTT</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200">
                <button
                    onClick={() => handleTabChange('PKWT')}
                    className={`px-4 py-3 font-medium border-b-2 transition ${activeTab === 'PKWT'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                >
                    PKWT
                </button>
                <button
                    onClick={() => handleTabChange('PKWTT')}
                    className={`px-4 py-3 font-medium border-b-2 transition ${activeTab === 'PKWTT'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                >
                    PKWTT
                </button>
            </div>

            {/* Error State */}
            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Tab Content */}
            <KaryawanTable
                data={tableData}
                loading={loading}
                onLihatDetail={handleLihatDetail}
                onPageChange={setCurrentPage}
                currentPage={currentPage}
            />
        </div>
    );
}
