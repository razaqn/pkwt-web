import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, FileText, MapPin, Building, Calendar, Clock } from "lucide-react";
import ContractHistoryTable from "../components/ContractHistoryTable";
import { dummyEmployees, dummyContracts } from "../lib/dummyData";
import type { Employee, Contract, PaginationState } from "../types/employeeTypes";

export default function EmployeeDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [contractPagination, setContractPagination] = useState<PaginationState>({
        currentPage: 1,
        itemsPerPage: 5,
        totalItems: 0,
        totalPages: 0
    });

    useEffect(() => {
        // Find employee by ID
        const foundEmployee = dummyEmployees.find(emp => emp.id === id);
        if (foundEmployee) {
            setEmployee(foundEmployee);

            // Find contracts for this employee
            const employeeContracts = dummyContracts.filter(contract => contract.employeeId === id);
            setContracts(employeeContracts);

            // Set up pagination for contracts
            setContractPagination({
                currentPage: 1,
                itemsPerPage: 5,
                totalItems: employeeContracts.length,
                totalPages: Math.ceil(employeeContracts.length / 5)
            });
        } else {
            // Redirect if employee not found
            navigate('/daftar-karyawan');
        }
    }, [id, navigate]);

    const getCurrentContracts = (): Contract[] => {
        if (!contracts.length) return [];

        const startIndex = (contractPagination.currentPage - 1) * contractPagination.itemsPerPage;
        const endIndex = startIndex + contractPagination.itemsPerPage;
        return contracts.slice(startIndex, endIndex);
    };

    const handleContractPageChange = (page: number) => {
        setContractPagination({
            ...contractPagination,
            currentPage: page
        });
    };

    if (!employee) {
        return <div className="p-6">Memuat data karyawan...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header with back button */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate('/daftar-karyawan')}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Kembali</span>
                </button>
            </div>

            {/* Employee Details Card */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Profile Image */}
                    <div className="flex-shrink-0">
                        <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-16 h-16 text-blue-600" />
                        </div>
                    </div>

                    {/* Employee Information */}
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">{employee.fullName}</h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Personal Information */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-500">NIK</p>
                                        <p className="font-medium">{employee.nik}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-500">Alamat</p>
                                        <p className="font-medium">{employee.address}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-500">Kota/Kecamatan</p>
                                        <p className="font-medium">{employee.city}, {employee.district}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-500">Tempat/Tanggal Lahir</p>
                                        <p className="font-medium">{employee.birthPlace}, {new Date(employee.birthDate).toLocaleDateString('id-ID', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric'
                                        })}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Employment Information */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Building className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-500">Perusahaan</p>
                                        <p className="font-medium">{employee.company}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-500">Kontrak Sekarang</p>
                                        <p className="font-medium">{employee.currentContract}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-500">Jumlah Kontrak</p>
                                        <p className="font-medium">{employee.totalContracts} kontrak terdata</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contract History Section */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Riwayat Kontrak</h2>

                <ContractHistoryTable
                    contracts={getCurrentContracts()}
                    pagination={contractPagination}
                    onPageChange={handleContractPageChange}
                />
            </div>
        </div>
    );
}