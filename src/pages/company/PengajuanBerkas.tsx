import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Users, Clock, AlertCircle, Send, Upload, FileText } from 'lucide-react';
import TabelNIKPengajuan from '../../components/TabelNIKPengajuan';
import ModalKelengkapanData, { type KelengkapanDataForm } from '../../components/ModalKelengkapanData';
import { useContractSubmission } from '../../hooks/useContractSubmission';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

type ContractType = 'PKWT' | 'PKWTT';

interface ContractData {
    contractType: ContractType;
    niks: string[];
    startDate: string;
    duration: number | null;
    fileKontrak?: File | null;
}

export default function PengajuanBerkas() {
    const navigate = useNavigate();
    const location = useLocation();
    const contractData = location.state as ContractData | null;

    // Use custom hook for contract submission logic
    const {
        nikDataList,
        contractStatus,
        loading,
        submitLoading,
        error,
        saveNIKData,
        submitContract,
        saveDraft,
        allDataComplete,
    } = useContractSubmission(contractData);

    // Local UI state
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedNIK, setSelectedNIK] = useState<string | null>(null);
    const [draftId, setDraftId] = useState<string | null>(null);
    const [fileKontrak, setFileKontrak] = useState<File | null>(contractData?.fileKontrak || null);
    const [fileSizeError, setFileSizeError] = useState<string | null>(null);

    function handleEditNIK(nik: string) {
        setSelectedNIK(nik);
        setModalOpen(true);
    }

    function handleFileChange(file: File | null) {
        setFileSizeError(null);

        if (file && file.size > MAX_FILE_SIZE_BYTES) {
            const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
            setFileSizeError(`File terlalu besar. Maksimal 5MB, file Anda ${fileSizeMB}MB`);
            return;
        }

        setFileKontrak(file);
    }

    async function handleSaveNIKData(formData: KelengkapanDataForm) {
        if (!selectedNIK) return;

        const success = await saveNIKData(selectedNIK, formData);
        if (success) {
            setModalOpen(false);
            setSelectedNIK(null);
        }
    }

    async function handleSubmitContract() {
        if (!contractData) return;

        // For PKWT, require file upload
        if (contractData.contractType === 'PKWT' && !fileKontrak) {
            // Error will be shown by hook
            await submitContract(null);
            return;
        }

        // Pass file to hook for submission
        const success = await submitContract(fileKontrak);
        if (success) {
            alert('Pengajuan berkas berhasil dikirim!');
        }
    }

    async function handleSaveDraft() {
        const newDraftId = await saveDraft();
        if (newDraftId) {
            setDraftId(newDraftId);
            // Show success message
            const successMsg = draftId ? 'Draf berhasil diperbarui!' : 'Draf berhasil disimpan!';
            alert(successMsg); // Replace with toast notification if available
        }
    }

    if (!contractData) {
        return null; // Will redirect in useEffect
    }

    const selectedNIKData = nikDataList.find(d => d.nik === selectedNIK);
    const initialModalData: KelengkapanDataForm | undefined = selectedNIKData
        ? {
            fullName: selectedNIKData.fullName || '',
            address: selectedNIKData.address || '',
            district: selectedNIKData.district || '',
            village: selectedNIKData.village || '',
            placeOfBirth: selectedNIKData.placeOfBirth || '',
            birthdate: selectedNIKData.birthdate || '',
            ktpFile: null, // File state handled separately in modal
        }
        : undefined;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Pengajuan Berkas Kontrak</h1>
                <p className="mt-1 text-slate-600">Lengkapi data karyawan sebelum mengajukan kontrak</p>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Terjadi Kesalahan</p>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Contract Info Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Informasi Kontrak</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Jenis Kontrak */}
                    <div>
                        <div className="text-sm text-slate-600 mb-1">Jenis Kontrak</div>
                        <div className="flex items-center gap-2">
                            <div
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${contractData.contractType === 'PKWT'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-purple-100 text-purple-800'
                                    }`}
                            >
                                {contractData.contractType}
                            </div>
                        </div>
                    </div>

                    {/* Jumlah Orang / Nama */}
                    <div>
                        <div className="text-sm text-slate-600 mb-1">
                            {contractData.contractType === 'PKWT' ? 'Jumlah Karyawan' : 'Karyawan'}
                        </div>
                        <div className="flex items-center gap-2 text-slate-900">
                            <Users className="h-4 w-4 text-slate-500" />
                            <span className="font-medium">
                                {contractData.contractType === 'PKWT'
                                    ? `${contractData.niks.length} Orang`
                                    : nikDataList[0]?.fullName || contractData.niks[0]}
                            </span>
                        </div>
                    </div>

                    {/* Durasi */}
                    <div>
                        <div className="text-sm text-slate-600 mb-1">Durasi</div>
                        <div className="flex items-center gap-2 text-slate-900">
                            <Clock className="h-4 w-4 text-slate-500" />
                            <span className="font-medium">
                                {contractData.duration ? `${contractData.duration} Bulan` : '-'}
                            </span>
                        </div>
                    </div>

                    {/* Tanggal Mulai */}
                    <div>
                        <div className="text-sm text-slate-600 mb-1">Tanggal Mulai</div>
                        <div className="flex items-center gap-2 text-slate-900">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            <span className="font-medium">
                                {new Date(contractData.startDate).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Status */}
                {contractStatus && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-600">Status:</span>
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${contractStatus === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : contractStatus === 'approved'
                                        ? 'bg-green-100 text-green-800'
                                        : contractStatus === 'rejected'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-slate-100 text-slate-800'
                                    }`}
                            >
                                {contractStatus === 'pending' && 'Menunggu Persetujuan'}
                                {contractStatus === 'approved' && 'Disetujui'}
                                {contractStatus === 'rejected' && 'Ditolak'}
                                {contractStatus === 'draft' && 'Draft'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabel NIK */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Data Karyawan</h2>
                    {!allDataComplete && (
                        <div className="flex items-center gap-2 text-sm text-yellow-700">
                            <AlertCircle className="h-4 w-4" />
                            <span>Lengkapi semua data untuk mengajukan</span>
                        </div>
                    )}
                </div>

                <TabelNIKPengajuan data={nikDataList} onEdit={handleEditNIK} loading={loading} />
            </div>

            {/* File Kontrak Section (for PKWT) */}
            {contractData.contractType === 'PKWT' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">File Kontrak</h2>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div className="space-y-2">
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Upload File Kontrak (PDF)</span>
                                <span className="text-red-500 ml-1">*</span>
                                <span className="text-xs text-slate-500 ml-2">(untuk semua {contractData.niks.length} karyawan)</span>
                            </label>

                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        if (file && file.size > MAX_FILE_SIZE_BYTES) {
                                            e.target.value = '';
                                        }
                                        handleFileChange(file);
                                    }}
                                    disabled={loading || submitLoading}
                                    className="hidden"
                                    id="fileInputPengajuan"
                                />

                                <label
                                    htmlFor="fileInputPengajuan"
                                    className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 cursor-pointer hover:bg-slate-100 hover:border-blue-400 transition disabled:opacity-50"
                                >
                                    <Upload className="h-5 w-5 text-slate-500" />
                                    <div className="text-center">
                                        <span className="text-sm font-medium text-slate-700">Pilih file PDF</span>
                                        <span className="text-xs text-slate-500 block">atau drag & drop (Maksimal 5MB)</span>
                                    </div>
                                </label>
                            </div>

                            {fileSizeError && (
                                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-red-700">{fileSizeError}</p>
                                </div>
                            )}

                            {fileKontrak && (
                                <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                                    <FileText className="h-4 w-4 text-green-600" />
                                    <div className="flex-1">
                                        <span className="text-sm text-green-700 block">{fileKontrak.name}</span>
                                        <span className="text-xs text-green-600">{(fileKontrak.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFileKontrak(null);
                                            setFileSizeError(null);
                                        }}
                                        disabled={loading || submitLoading}
                                        className="text-xs text-green-600 hover:text-green-800 font-medium"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-slate-200">
                <button
                    onClick={handleSaveDraft}
                    disabled={submitLoading}
                    className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-2.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
                >
                    <FileText className="h-4 w-4" />
                    {draftId ? 'Perbarui Draf' : 'Simpan Draf'}
                </button>
                <button
                    onClick={handleSubmitContract}
                    disabled={!allDataComplete || submitLoading || contractStatus === 'pending'}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <Send className="h-4 w-4" />
                    {submitLoading ? 'Mengirim...' : 'Ajukan Berkas'}
                </button>
                <button
                    onClick={() => navigate('/form-kontrak')}
                    disabled={submitLoading}
                    className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
                >
                    Kembali
                </button>
            </div>

            {/* Modal */}
            <ModalKelengkapanData
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedNIK(null);
                }}
                onSave={handleSaveNIKData}
                nik={selectedNIK || ''}
                initialData={initialModalData}
                ktpFileUrl={selectedNIKData?.ktpFileUrl || null}
                loading={loading}
            />
        </div>
    );
}
