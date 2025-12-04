import { useState } from "react";
import { Users } from "lucide-react";
import EmployeeTable from "../components/EmployeeTable";
import { dummyEmployees } from "../lib/dummyData";
import type { Employee, PaginationState } from "../types/employeeTypes";

export default function ListsEmployee() {
    // State for pagination
    const [pagination, setPagination] = useState<PaginationState>({
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: dummyEmployees.length,
        totalPages: Math.ceil(dummyEmployees.length / 10)
    });

    // Get current employees based on pagination
    const getCurrentEmployees = (): Employee[] => {
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        const endIndex = startIndex + pagination.itemsPerPage;
        return dummyEmployees.slice(startIndex, endIndex);
    };

    const handlePageChange = (page: number) => {
        setPagination({
            ...pagination,
            currentPage: page
        });
    };

    return (
        <div className="space-y-4 p-0">
            <div className="flex items-center gap-3 px-6 pt-6 pb-2">
                <Users className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Daftar karyawan kontrak yang terdaftar</h1>
            </div>

            <div className="px-6 pb-6">
                <EmployeeTable
                    employees={getCurrentEmployees()}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
}