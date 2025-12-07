"use client";

import { FilePlus, Plus, Trash2, AlertCircle } from "lucide-react";
import { TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkEmployeesBatch } from "../lib/api";
import { cn } from "../lib/utils";

export default function FormPKWT() {
    const [activeTab, setActiveTab] = useState<"PKWT" | "PKWTT">("PKWT");
    const [nikInputs, setNikInputs] = useState<string[]>([""]);
    const [startDate, setStartDate] = useState<string>("");
    const [duration, setDuration] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Handle submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        
        try {
            // Validasi input
            if (activeTab === "PKWT") {
                if (nikInputs.some(nik => !nik.trim())) {
                    throw new Error("NIK tidak boleh kosong");
                }
                if (!startDate) {
                    throw new Error("Tanggal mulai kontrak harus diisi");
                }
                if (!duration) {
                    throw new Error("Durasi kontrak harus diisi");
                }
            } else { // PKWTT
                if (!nikInputs[0]?.trim()) {
                    throw new Error("NIK tidak boleh kosong");
                }
                if (!startDate) {
                    throw new Error("Tanggal mulai kontrak harus diisi");
                }
                if (!file) {
                    throw new Error("File kontrak harus diunggah");
                }
            }
            
            // Cek NIK melalui API
            const nikList = nikInputs.filter(nik => nik.trim());
            const responses = await checkEmployeesBatch(nikList);
            
            // Siapkan data karyawan dengan status registrasi
            const employees = responses.map((response, index) => ({
                nik: nikList[index],
                isRegistered: !response.available, // Jika available=false, berarti sudah terdaftar
                name: response.available ? "" : "Terdaftar" // Nama akan diisi di halaman Pengajuan
            }));
            
            // Navigasi ke halaman Pengajuan dengan membawa data
            navigate("/pengajuan", {
                state: {
                    submissionData: {
                        type: activeTab,
                        nikList,
                        startDate,
                        duration: activeTab === "PKWT" ? duration : undefined,
                        employees, // Sertakan status registrasi setiap NIK
                    }
                }
            });
            
            // Siapkan data untuk dikirim ke halaman Pengajuan
            const submissionData = {
                type: activeTab,
                nikList,
                startDate,
                duration: activeTab === "PKWT" ? duration : undefined,
                file: activeTab === "PKWTT" ? file : undefined,
            };
            
            // Navigasi ke halaman Pengajuan dengan membawa data
            navigate("/pengajuan", { state: { submissionData } });
            
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan saat mengajukan");
            console.error("Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4 p-0">
            <div className="flex items-center gap-3 px-6 pt-6 pb-2">
                <FilePlus className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Form PKWT/PKWTT</h1>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mx-6 bg-red-50 border-l-4 border-red-500 p-4">
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

            <div className="px-6 pb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-0">
                    {/* Tabs Navigation */}
                    <TabsList className="bg-white border-b border-gray-200 p-0 flex">
                        <TabsTrigger
                            value="PKWT"
                            isActive={activeTab === "PKWT"}
                            onClick={() => setActiveTab("PKWT")}
                            className={`px-6 py-3 text-sm font-medium ${activeTab === "PKWT" ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                        >
                            Form PKWT
                        </TabsTrigger>
                        <TabsTrigger
                            value="PKWTT"
                            isActive={activeTab === "PKWTT"}
                            onClick={() => setActiveTab("PKWTT")}
                            className={`px-6 py-3 text-sm font-medium ${activeTab === "PKWTT" ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                        >
                            Form PKWTT
                        </TabsTrigger>
                    </TabsList>

                    {/* Tabs Content */}
                    <div className="p-6">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <TabsContent value="PKWT" activeTab={activeTab}>
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold text-gray-800">Form Pengajuan PKWT</h2>
                                    <p className="text-gray-600">Isi formulir di bawah untuk mengajukan PKWT (Perjanjian Kerja Waktu Tertentu).</p>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">NIK Karyawan</label>
                                        <div className="space-y-3" id="nik-container">
                                            {nikInputs.map((nik, index) => (
                                                <div key={index} className="flex items-center gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Masukkan NIK karyawan"
                                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                        value={nik}
                                                        onChange={(e) => {
                                                            const newNikInputs = [...nikInputs];
                                                            newNikInputs[index] = e.target.value;
                                                            setNikInputs(newNikInputs);
                                                        }}
                                                    />
                                                    {index > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newNikInputs = nikInputs.filter((_, i) => i !== index);
                                                                setNikInputs(newNikInputs);
                                                            }}
                                                            className="p-2 text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => setNikInputs([...nikInputs, ""])}
                                                className="p-2 text-blue-500 hover:text-blue-700 flex items-center gap-1"
                                            >
                                                <Plus className="w-5 h-5" /> Tambah NIK
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai Kontrak</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Durasi Kontrak (Bulan)</label>
                                        <input
                                            type="number"
                                            placeholder="Masukkan durasi dalam bulan"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            min="1"
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="PKWTT" activeTab={activeTab}>
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold text-gray-800">Form Pengajuan PKWTT</h2>
                                    <p className="text-gray-600">Isi formulir di bawah untuk mengajukan PKWTT (Perjanjian Kerja Waktu Tidak Tertentu).</p>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">NIK Karyawan</label>
                                        <input
                                            type="text"
                                            placeholder="Masukkan NIK karyawan"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            value={nikInputs[0] || ""}
                                            onChange={(e) => setNikInputs([e.target.value])}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai Kontrak</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">File Kontrak (PDF)</label>
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    className={cn(
                                        "px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                                    )}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Memproses..." : "Ajukan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}