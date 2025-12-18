import { useState, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RotateCcw } from 'lucide-react';
import AdminKaryawanTable from '../../components/AdminKaryawanTable';
import { useAllEmployees } from '../../hooks/useAllEmployees';
import { useAllCompanies } from '../../hooks/useAllCompanies';
import { getUserFriendlyErrorMessage } from '../../lib/errors';
import type { AdminKaryawan } from '../../components/AdminKaryawanTable';

type ContractType = 'PKWT' | 'PKWTT';

const ITEMS_PER_PAGE = 7;

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

// Transform API data to component data format
function transformEmployeeToAdminKaryawan(employee: any): AdminKaryawan {
    return {
        id: employee.id,
        namaLengkap: employee.full_name,
        nik: employee.nik,
        alamat: employee.address || '-',
        perusahaan: employee.latest_contract?.company_name || '-',
        kontrakSekarang: employee.latest_contract?.title || '-',
        sisaWaktuKontrak: calculateRemainingWeeks(
            employee.latest_contract?.start_date,
            employee.latest_contract?.duration_months
        ),
        companyId: employee.company_id,
    };
}

export default function ListEmployees() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<ContractType>('PKWT');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCompanyId, setSelectedCompanyId] = useState('');

    // Fetch employees based on contract type (admin-wide, optionally filtered by company)
    const { employees, loading, error, pagination } = useAllEmployees({
        contract_type: activeTab,
        company_id: selectedCompanyId || undefined,
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
    });

    const { companies, loading: companiesLoading } = useAllCompanies({
        limit: 100,
        offset: 0,
    });

    const totalItems = pagination.total;
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

    // Transform API data to table format
    const tableData: AdminKaryawan[] = useMemo(
        () => employees.map(transformEmployeeToAdminKaryawan),
        [employees]
    );

    // Filter data based on search query (client-side search)
    const filteredData: AdminKaryawan[] = useMemo(
        () => tableData.filter(karyawan => {
            const matchesSearch =
                karyawan.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
                karyawan.perusahaan.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCompany =
                !selectedCompanyId || karyawan.companyId === selectedCompanyId;

            return matchesSearch && matchesCompany;
        }),
        [tableData, searchQuery, selectedCompanyId]
    );

    const handleLihatDetail = (karyawanId: string) => {
        navigate(`/admin/detail-karyawan/${karyawanId}?type=${activeTab.toLowerCase()}`);
    };

    const handleTabChange = (tab: ContractType) => {
        setActiveTab(tab);
        setCurrentPage(1); // Reset ke halaman pertama saat ganti tab
        setSearchQuery(''); // Reset search saat ganti tab
    };

    const handleCompanyChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedCompanyId(event.target.value);
        setCurrentPage(1);
    };

    const companyFilterControl = (
        <label className="flex flex-col gap-1 text-xs text-slate-500 min-w-[200px]">
            <select
                value={selectedCompanyId}
                onChange={handleCompanyChange}
                disabled={companiesLoading}
                className="rounded-lg border border-slate-300 bg-white py-1.5 px-3 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:cursor-not-allowed"
            >
                <option value="">Semua Perusahaan</option>
                {companies.map(company => (
                    <option key={company.id} value={company.id}>
                        {company.company_name}
                    </option>
                ))}
            </select>
        </label>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-primary">Karyawan</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">List Karyawan</h1>
                    <p className="mt-1 text-sm text-slate-600">Data karyawan PKWT dan PKWTT dari semua perusahaan.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => handleTabChange('PKWT')}
                        className={
                            activeTab === 'PKWT'
                                ? 'rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary ring-1 ring-inset ring-primary/20'
                                : 'rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50'
                        }
                    >
                        PKWT
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('PKWTT')}
                        className={
                            activeTab === 'PKWTT'
                                ? 'rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary ring-1 ring-inset ring-primary/20'
                                : 'rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50'
                        }
                    >
                        PKWTT
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Terjadi Kesalahan</p>
                        <p className="text-sm text-red-700 mt-1">{getUserFriendlyErrorMessage(error)}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-3 inline-flex items-center gap-1.5 rounded bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 transition"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Coba Lagi
                        </button>
                    </div>
                </div>
            )}

            {/* Tab Content */}
            <AdminKaryawanTable
                data={filteredData}
                loading={loading}
                onLihatDetail={handleLihatDetail}
                onPageChange={setCurrentPage}
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                onSearchChange={setSearchQuery}
                searchQuery={searchQuery}
                filterControls={companyFilterControl}
            />
        </div>
    );
}
