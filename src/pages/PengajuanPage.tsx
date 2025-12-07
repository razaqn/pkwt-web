"use client";

import { FileText, Users, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Edit, Send, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { checkEmployeeByNIK, createEmployee, updateEmployee } from "../lib/api";
import type { PengajuanData, PengajuanEmployee, SubmissionData } from "../types/pengajuanTypes";
import { cn } from "../lib/utils";

export default function PengajuanPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<PengajuanEmployee | null>(null);
    const [pengajuan, setPengajuan] = useState<PengajuanData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Format tanggal
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };
    
    // Fungsi untuk mengambil data pengajuan dari API
    const fetchPengajuanData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const submissionData = location.state?.submissionData as SubmissionData;
            if (!submissionData) {
                throw new Error("Data pengajuan tidak ditemukan");
            }
            
            // Cek status registrasi setiap NIK
            const employeesWithStatus = await Promise.all(
                submissionData.nikList.map(async (nik: string) => {
                    try {
                        const response = await checkEmployeeByNIK(nik);
                        return {
                            nik,
                            name: response.available ? "" : (response.data?.full_name || "Terdaftar"),
                            isRegistered: !response.available,
                            id: response.data?.id || undefined
                        };
                    } catch (err) {
                        // Jika employee tidak ditemukan, gunakan data dari submissionData
                        const existingEmployee = submissionData.employees?.find((e: PengajuanEmployee) => e.nik === nik) || { nik, name: "", isRegistered: false };
                        return {
                            nik,
                            name: existingEmployee.name || "",
                            isRegistered: false
                        };
                    }
                })
            );
            
            setPengajuan({
                id: submissionData.id || "1",
                type: submissionData.type,
                employeeCount: submissionData.type === "PKWT" ? submissionData.nikList.length : 1,
                employeeNames: submissionData.type === "PKWTT" ? [submissionData.nikList[0]] : [],
                duration: submissionData.type === "PKWT" ? submissionData.duration || "-" : "-",
                startDate: submissionData.startDate,
                status: submissionData.status || "null",
                employees: employeesWithStatus
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal memuat data pengajuan");
            console.error("Gagal memuat data pengajuan:", err);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Ambil data pengajuan saat pertama kali halaman dimuat
    useEffect(() => {
        fetchPengajuanData();
    }, [location.state]);
    
    // Handle edit data karyawan
    const handleEditEmployee = (employee: PengajuanEmployee) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };
    
    // Handle submit data karyawan
    const handleSubmitEmployeeData = async (data: {
        fullName: string;
        address: string;
        city: string;
        district: string;
        birthPlace: string;
        birthDate: string;
    }) => {
        if (!selectedEmployee) return;
        
        try {
            setIsLoading(true);
            setError(null);
            
            const payload = {
                full_name: data.fullName,
                nik: selectedEmployee.nik,
                address: data.address,
                district: data.district,
                village: data.city,
                place_of_birth: data.birthPlace,
                birthdate: data.birthDate,
            };
            
            if (selectedEmployee.id) {
                await updateEmployee(selectedEmployee.id, payload);
            } else {
                await createEmployee(payload);
            }
            
            // Refresh data pengajuan setelah berhasil menyimpan
            await fetchPengajuanData();
            setIsModalOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal menyimpan data karyawan");
            console.error("Gagal menyimpan data karyawan:", err);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-900">Halaman Pengajuan</h1>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <p className="text-gray-500">Memuat data pengajuan...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-900">Halaman Pengajuan</h1>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <p className="text-red-500">{error}</p>
                </div>
            </div>
        );
    }
    
    if (!pengajuan) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-900">Halaman Pengajuan</h1>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <p className="text-gray-500">Data pengajuan tidak ditemukan.</p>
                </div>
            </div>
        );
    }
    
    // Cek apakah semua karyawan sudah terdaftar
    const allEmployeesRegistered = pengajuan.employees.every(employee => employee.isRegistered);
    
    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-900">Halaman Pengajuan</h1>
                </div>
            </div>
            
            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Card Pengajuan */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {pengajuan.type === "PKWT" ? "Pengajuan PKWT" : "Pengajuan PKWTT"}
                        </h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                            pengajuan.status === "approved" ? "bg-green-100 text-green-800" :
                            pengajuan.status === "rejected" ? "bg-red-100 text-red-800" :
                            pengajuan.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                        }`}>
                            {pengajuan.status === "approved" && <CheckCircle className="w-4 h-4" />}
                            {pengajuan.status === "rejected" && <XCircle className="w-4 h-4" />}
                            {pengajuan.status === "pending" && <Clock className="w-4 h-4" />}
                            {pengajuan.status === "null" && <AlertCircle className="w-4 h-4" />}
                            {pengajuan.status ? pengajuan.status.toUpperCase() : "NULL"}
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-50 rounded-full">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Jumlah Orang</p>
                                <p className="font-medium">
                                    {pengajuan.type === "PKWT" ? pengajuan.employeeCount : pengajuan.employeeNames.join(", ")}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-50 rounded-full">
                                <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Durasi</p>
                                <p className="font-medium">{pengajuan.duration}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-50 rounded-full">
                                <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Tanggal Mulai</p>
                                <p className="font-medium">{formatDate(pengajuan.startDate)}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gray-50 rounded-full">
                                <FileText className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="font-medium">
                                    {pengajuan.status ? pengajuan.status.toUpperCase() : "NULL"}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-6">
                        <button
                            onClick={() => navigate(`/pengajuan/${pengajuan.id}/detail`)}
                            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 flex items-center gap-2"
                        >
                            <FileText className="w-4 h-4" /> Detail Page
                        </button>
                        
                        <button
                            onClick={() => console.log("Ajukan file")}
                            className={cn(
                                "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2",
                                !allEmployeesRegistered ? 'opacity-50 cursor-not-allowed' : ''
                            )}
                            disabled={!allEmployeesRegistered}
                        >
                            <Send className="w-4 h-4" /> Ajukan File
                        </button>
                        
                        {pengajuan.status === "rejected" && (
                            <button
                                onClick={() => console.log("Edit pengajuan")}
                                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" /> Edit
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Tabel Karyawan */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Daftar Karyawan</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIK</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pengajuan.employees.map((employee, index) => (
                                    <tr key={index} className={!employee.isRegistered ? "bg-yellow-50" : "bg-green-50"}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.nik}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {employee.name || "Belum terdaftar"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-xs font-medium",
                                                employee.isRegistered ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                            )}>
                                                {employee.isRegistered ? "Terdaftar" : "Belum Terdaftar"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {!employee.isRegistered && (
                                                <button
                                                    onClick={() => handleEditEmployee(employee)}
                                                    className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                                >
                                                    <UserPlus className="w-4 h-4" /> Lengkapi Data
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {/* Modal untuk pengisian data karyawan */}
            {isModalOpen && selectedEmployee && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Lengkapi Data Karyawan</h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-6">NIK: {selectedEmployee.nik}</p>
                            
                            <form className="space-y-4" onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget as HTMLFormElement);
                                handleSubmitEmployeeData({
                                    fullName: formData.get('fullName') as string,
                                    address: formData.get('address') as string,
                                    city: formData.get('city') as string,
                                    district: formData.get('district') as string,
                                    birthPlace: formData.get('birthPlace') as string,
                                    birthDate: formData.get('birthDate') as string,
                                });
                            }}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                                    <input
                                        type="text"
                                        name="address"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kabupaten/Kota</label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan/Desa</label>
                                    <input
                                        type="text"
                                        name="district"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                                    <input
                                        type="text"
                                        name="birthPlace"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                                    <input
                                        type="date"
                                        name="birthDate"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Menyimpan..." : "Simpan"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}