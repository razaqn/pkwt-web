"use client";

import { useState } from "react";
import { TabsList, TabsTrigger } from "../components/ui/tabs";
import EmployeeTable from "./EmployeeTable";
import type { Employee, PaginationState } from "../types/employeeTypes";
import { getContractType } from "../utils/contractUtils";

interface EmployeeTabsProps {
    employees: Employee[];
    companyId: string;
}

export default function EmployeeTabs({ employees, companyId }: EmployeeTabsProps) {
    const [activeTab, setActiveTab] = useState<"PKWT" | "PKWTT">("PKWT");

    // Filter employees by company and contract type
    const filteredEmployees = employees.filter(employee => {
        // Filter by company
        const companyMatch = employee.company === companyId ||
            (companyId === '1' && employee.company === 'PT Maju Bersama') ||
            (companyId === '2' && employee.company === 'PT Sejahtera Abadi') ||
            (companyId === '3' && employee.company === 'PT Teknologi Canggih');

        // Filter by contract type
        const contractType = getContractType(employee.currentContract);
        const contractMatch = contractType === activeTab;

        return companyMatch && contractMatch;
    });

    // Pagination state
    const [pagination, setPagination] = useState<PaginationState>({
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: filteredEmployees.length,
        totalPages: Math.ceil(filteredEmployees.length / 10)
    });

    // Get current employees based on pagination
    const getCurrentEmployees = (): Employee[] => {
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        const endIndex = startIndex + pagination.itemsPerPage;
        return filteredEmployees.slice(startIndex, endIndex);
    };

    const handlePageChange = (page: number) => {
        setPagination({
            ...pagination,
            currentPage: page
        });
    };

    return (
        <div className="space-y-4">
            <TabsList className="bg-white border-b border-gray-200 p-0 flex">
                <TabsTrigger
                    value="PKWT"
                    isActive={activeTab === "PKWT"}
                    onClick={() => {
                        setActiveTab("PKWT");
                        setPagination({
                            ...pagination,
                            currentPage: 1, // Reset to first page when changing tabs
                            totalItems: employees.filter(e => {
                                const companyMatch = e.company === companyId ||
                                    (companyId === '1' && e.company === 'PT Maju Bersama') ||
                                    (companyId === '2' && e.company === 'PT Sejahtera Abadi') ||
                                    (companyId === '3' && e.company === 'PT Teknologi Canggih');
                                return companyMatch && getContractType(e.currentContract) === "PKWT";
                            }).length,
                            totalPages: Math.ceil(employees.filter(e => {
                                const companyMatch = e.company === companyId ||
                                    (companyId === '1' && e.company === 'PT Maju Bersama') ||
                                    (companyId === '2' && e.company === 'PT Sejahtera Abadi') ||
                                    (companyId === '3' && e.company === 'PT Teknologi Canggih');
                                return companyMatch && getContractType(e.currentContract) === "PKWT";
                            }).length / 10)
                        });
                    }}
                    className={`px-6 py-3 text-sm font-medium ${activeTab === "PKWT" ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                >
                    List PKWT
                </TabsTrigger>
                <TabsTrigger
                    value="PKWTT"
                    isActive={activeTab === "PKWTT"}
                    onClick={() => {
                        setActiveTab("PKWTT");
                        setPagination({
                            ...pagination,
                            currentPage: 1, // Reset to first page when changing tabs
                            totalItems: employees.filter(e => {
                                const companyMatch = e.company === companyId ||
                                    (companyId === '1' && e.company === 'PT Maju Bersama') ||
                                    (companyId === '2' && e.company === 'PT Sejahtera Abadi') ||
                                    (companyId === '3' && e.company === 'PT Teknologi Canggih');
                                return companyMatch && getContractType(e.currentContract) === "PKWTT";
                            }).length,
                            totalPages: Math.ceil(employees.filter(e => {
                                const companyMatch = e.company === companyId ||
                                    (companyId === '1' && e.company === 'PT Maju Bersama') ||
                                    (companyId === '2' && e.company === 'PT Sejahtera Abadi') ||
                                    (companyId === '3' && e.company === 'PT Teknologi Canggih');
                                return companyMatch && getContractType(e.currentContract) === "PKWTT";
                            }).length / 10)
                        });
                    }}
                    className={`px-6 py-3 text-sm font-medium ${activeTab === "PKWTT" ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                >
                    List PKWTT
                </TabsTrigger>
            </TabsList>

            <div className="mt-0">
                {activeTab === "PKWT" && (
                    <EmployeeTable
                        employees={getCurrentEmployees()}
                        pagination={{
                            ...pagination,
                            totalItems: employees.filter(e => {
                                const companyMatch = e.company === companyId ||
                                    (companyId === '1' && e.company === 'PT Maju Bersama') ||
                                    (companyId === '2' && e.company === 'PT Sejahtera Abadi') ||
                                    (companyId === '3' && e.company === 'PT Teknologi Canggih');
                                return companyMatch && getContractType(e.currentContract) === "PKWT";
                            }).length,
                            totalPages: Math.ceil(employees.filter(e => {
                                const companyMatch = e.company === companyId ||
                                    (companyId === '1' && e.company === 'PT Maju Bersama') ||
                                    (companyId === '2' && e.company === 'PT Sejahtera Abadi') ||
                                    (companyId === '3' && e.company === 'PT Teknologi Canggih');
                                return companyMatch && getContractType(e.currentContract) === "PKWT";
                            }).length / pagination.itemsPerPage)
                        }}
                        onPageChange={handlePageChange}
                    />
                )}

                {activeTab === "PKWTT" && (
                    <EmployeeTable
                        employees={getCurrentEmployees()}
                        pagination={{
                            ...pagination,
                            totalItems: employees.filter(e => {
                                const companyMatch = e.company === companyId ||
                                    (companyId === '1' && e.company === 'PT Maju Bersama') ||
                                    (companyId === '2' && e.company === 'PT Sejahtera Abadi') ||
                                    (companyId === '3' && e.company === 'PT Teknologi Canggih');
                                return companyMatch && getContractType(e.currentContract) === "PKWTT";
                            }).length,
                            totalPages: Math.ceil(employees.filter(e => {
                                const companyMatch = e.company === companyId ||
                                    (companyId === '1' && e.company === 'PT Maju Bersama') ||
                                    (companyId === '2' && e.company === 'PT Sejahtera Abadi') ||
                                    (companyId === '3' && e.company === 'PT Teknologi Canggih');
                                return companyMatch && getContractType(e.currentContract) === "PKWTT";
                            }).length / pagination.itemsPerPage)
                        }}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </div>
    );
}