import { useState } from "react";
import { Building2 } from "lucide-react";
import CompanyTable from "../components/CompanyTable";
import { dummyCompanies } from "../lib/dummyData";
import type { Company, PaginationState } from "../types/companyTypes";

export default function ListsCompany() {
    // State for pagination
    const [pagination, setPagination] = useState<PaginationState>({
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: dummyCompanies.length,
        totalPages: Math.ceil(dummyCompanies.length / 10)
    });

    // Get current companies based on pagination
    const getCurrentCompanies = (): Company[] => {
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        const endIndex = startIndex + pagination.itemsPerPage;
        return dummyCompanies.slice(startIndex, endIndex);
    };

    const handlePageChange = (page: number) => {
        setPagination({
            ...pagination,
            currentPage: page
        });
    };

    return (
        <div className="p-0">
            <div className="flex items-center gap-3 px-6 pt-6 pb-2">
                <Building2 className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Daftar perusahaan yang terdaftar</h1>
            </div>

            {/* Company table */}
            <div className="px-6 pb-6">
                <CompanyTable
                    companies={getCurrentCompanies()}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
}