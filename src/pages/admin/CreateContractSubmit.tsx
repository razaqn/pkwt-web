import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Users, Clock, AlertCircle, Send, Upload, FileText, ArrowLeft, Building2 } from 'lucide-react';
import TabelNIKPengajuan from '../../components/TabelNIKPengajuan';
import ModalKelengkapanData, { type KelengkapanDataForm } from '../../components/ModalKelengkapanData';
import { useContractSubmission } from '../../hooks/useContractSubmission';
import { ClipLoader, MoonLoader } from 'react-spinners';
import { useDialog } from '../../hooks/useDialog';
import { fileToBase64 } from '../../lib/utils';
import { adminSubmitContractApplication } from '../../lib/api';
import { toUserMessage } from '../../lib/errors';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

type ContractType = 'PKWT' | 'PKWTT';

interface AdminContractData {
    companyId: string;
    companyName?: string;
    contractType: ContractType;
    niks: string[];
    startDate: string;
    duration: number | null;
    fileKontrak?: File | null;
    importedData?: Record<string, any>;
}

export default function CreateContractSubmit() {
    const navigate = useNavigate();
    const location = useLocation();
    const contractData = location.state as AdminContractData | null;
    const dialog = useDialog();

    const {
        nikDataList,
        loading,
        error,
        saveNIKData,
        allDataComplete,
    } = useContractSubmission(contractData);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedNIK, setSelectedNIK] = useState<string | null>(null);
    const [fileKontrak, setFileKontrak] = useState<File | null>(contractData?.fileKontrak || null);
    const [fileSizeError, setFileSizeError] = useState<string | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const allEmployeesCount = contractData?.niks?.length ?? 0;

    const contractStartDateLabel = (() => {
        if (!contractData?.startDate) return '-';
        try {
            return new Date(contractData.startDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return contractData.startDate;
        }
    })();

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

        if (contractData.contractType === 'PKWT' && !fileKontrak) {
            setSubmitError('File kontrak harus diunggah untuk PKWT');
            return;
        }

        if (!allDataComplete) {
            setSubmitError('Harap lengkapi semua data NIK terlebih dahulu');
            return;
        }

        setSubmitLoading(true);
        setSubmitError(null);

        try {
            if (contractData.contractType === 'PKWT') {
                if (!fileKontrak) throw new Error('File kontrak harus diunggah');
                if (!fileKontrak.name.toLowerCase().endsWith('.pdf')) {
                    throw new Error('File kontrak harus berformat PDF');
                }

                const fileBase64 = await fileToBase64(fileKontrak);

                await adminSubmitContractApplication({
                    company_id: contractData.companyId,
                    contract_type: 'PKWT',
                    start_date: contractData.startDate,
                    duration_months: contractData.duration || 0,
                    employee_niks: contractData.niks,
                    file_name: fileKontrak.name,
                    file_content_base64: fileBase64,
                });
            } else {
                if (!contractData.fileKontrak) throw new Error('File kontrak wajib diisi');
                if (!contractData.fileKontrak.name.toLowerCase().endsWith('.pdf')) {
                    throw new Error('File kontrak harus berformat PDF');
                }

                const fileBase64 = await fileToBase64(contractData.fileKontrak);

                await adminSubmitContractApplication({
                    company_id: contractData.companyId,
                    contract_type: 'PKWTT',
                    start_date: contractData.startDate,
                    employee_nik: contractData.niks[0],
                    file_name: contractData.fileKontrak.name,
                    file_content_base64: fileBase64,
                });
            }

            await dialog.alert({
                title: 'Berhasil',
                message: 'Kontrak berhasil dibuat dan diajukan!',
                tone: 'success',
            });

            navigate('/admin/approvals');
        } catch (err: any) {
            setSubmitError(toUserMessage(err, 'Gagal mengirim pengajuan'));
        } finally {
            setSubmitLoading(false);
        }
    }

    if (!contractData) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <MoonLoader size={40} color="#419823" />
                    <div>
                        <p className="text-sm font-semibold text-slate-900">Mengalihkan ke Form Kontrak...</p>
                        <p className="mt-1 text-sm text-slate-600">Data pengajuan tidak ditemukan.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/create-contract')}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-white px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Form Kontrak
                    </button>
                </div>
            </div>
        );
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
            ktpFile: null,
        }
        : undefined;

    const fileRequiredMissing =
        (contractData.contractType === 'PKWT' && !fileKontrak) ||
        (contractData.contractType === 'PKWTT' && !contractData.fileKontrak);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-primary">Admin</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Pengajuan Berkas</h1>
                    <p className="mt-1 text-sm text-slate-600">Lengkapi data karyawan, lalu ajukan kontrak untuk verifikasi.</p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate('/admin/create-contract')}
                    disabled={submitLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-white px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:opacity-50"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                </button>
            </div>

            {/* Error Alert */}
            {(error || submitError) && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Terjadi Kesalahan</p>
                        <p className="text-sm text-red-700 mt-1">{error || submitError}</p>
                    </div>
                </div>
            )}

            {/* Contract Info Card */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/20 px-6 py-5">
                    <p className="text-sm font-semibold text-slate-900">Informasi Kontrak</p>
                    <p className="mt-1 text-sm text-slate-600">Ringkasan pengajuan sebelum dikirim.</p>
                </div>

                <div className="px-6 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {/* Perusahaan */}
                        <div>
                            <div className="text-sm text-slate-600 mb-1">Perusahaan</div>
                            <div className="flex items-center gap-2 text-slate-900">
                                <Building2 className="h-4 w-4 text-slate-500" />
                                <span className="font-medium">{contractData.companyName || '-'}</span>
                            </div>
                        </div>

                        {/* Jenis Kontrak */}
                        <div>
                            <div className="text-sm text-slate-600 mb-1">Jenis Kontrak</div>
                            <div className="flex items-center gap-2">
                                <div
                                    className={`rounded-lg px-3 py-1.5 text-sm font-medium ${contractData.contractType === 'PKWT'
                                        ? 'bg-primary/10 text-primary ring-1 ring-inset ring-primary/20'
                                        : 'bg-secondary/30 text-slate-900 ring-1 ring-inset ring-secondary/40'
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
                                        ? `${allEmployeesCount} Orang`
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
                                    {contractData.duration ? `${contractData.duration} Bulan` : contractData.contractType === 'PKWTT' ? 'Tetap' : '-'}
                                </span>
                            </div>
                        </div>

                        {/* Tanggal Mulai */}
                        <div>
                            <div className="text-sm text-slate-600 mb-1">Tanggal Mulai</div>
                            <div className="flex items-center gap-2 text-slate-900">
                                <Calendar className="h-4 w-4 text-slate-500" />
                                <span className="font-medium">{contractStartDateLabel}</span>
                            </div>
                        </div>
                    </div>
                </div>
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
                                    id="fileInputAdmin"
                                />

                                <label
                                    htmlFor="fileInputAdmin"
                                    className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 cursor-pointer transition hover:border-primary/60 hover:bg-primary/5 disabled:opacity-50"
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
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                    onClick={handleSubmitContract}
                    disabled={!allDataComplete || fileRequiredMissing || submitLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                    {submitLoading && <ClipLoader size={14} color="#ffffff" />}
                    <Send className="h-4 w-4" />
                    {submitLoading ? 'Mengirim...' : 'Ajukan Kontrak'}
                </button>
                <button
                    onClick={() => navigate('/admin/create-contract')}
                    disabled={submitLoading}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
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
