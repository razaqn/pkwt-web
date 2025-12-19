import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Download,
    CheckCircle,
    XCircle,
    FileText,
    Calendar,
    Users,
    Clock,
    AlertCircle,
    RotateCcw,
} from 'lucide-react';
import { useState } from 'react';
import { MoonLoader } from 'react-spinners';
import { useApprovalDetail } from '../../hooks/useApprovalDetail';
import { approveContract, getEmployeeDetail, rejectContract } from '../../lib/api';
import type { ApprovalEmployee, EmployeeDetail } from '../../lib/api';
import ApprovalEmployeeTable from '../../components/ApprovalEmployeeTable';
import ApprovalActionModal from '../../components/ApprovalActionModal';
import ApprovalEmployeeDetailModal from '../../components/ApprovalEmployeeDetailModal';
import { toUserMessage } from '../../lib/errors';

export default function ApprovalDetail() {
    const { contractId } = useParams<{ contractId: string }>();
    const navigate = useNavigate();
    const { approval, loading, error, refetch } = useApprovalDetail(contractId);

    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        type: 'approve' | 'reject';
    }>({ isOpen: false, type: 'approve' });
    const [actionLoading, setActionLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<ApprovalEmployee | null>(null);
    const [employeeDetail, setEmployeeDetail] = useState<EmployeeDetail | null>(null);
    const [employeeDetailLoading, setEmployeeDetailLoading] = useState(false);
    const [employeeDetailError, setEmployeeDetailError] = useState('');

    const handleOpenModal = (type: 'approve' | 'reject') => {
        setModalState({ isOpen: true, type });
        setSuccessMessage('');
        setErrorMessage('');
    };

    const handleCloseModal = () => {
        setModalState({ isOpen: false, type: 'approve' });
    };

    const handleSubmitAction = async ({ comment, file }: { comment: string; file: File }) => {
        if (!contractId) return;

        setActionLoading(true);
        setErrorMessage('');

        try {
            if (modalState.type === 'approve') {
                await approveContract(contractId, { comment, file });
                setSuccessMessage('Kontrak berhasil disetujui');
            } else {
                await rejectContract(contractId, { comment, file });
                setSuccessMessage('Kontrak berhasil ditolak');
            }

            handleCloseModal();

            // Auto-refresh: refetch detail then navigate back after short delay
            setTimeout(() => {
                refetch();
                setTimeout(() => {
                    navigate('/admin/approvals');
                }, 1000);
            }, 500);
        } catch (err: any) {
            setErrorMessage(toUserMessage(err, 'Terjadi kesalahan'));
            throw err; // Re-throw to let modal handle it
        } finally {
            setActionLoading(false);
        }
    };

    const fetchEmployeeDetail = async (employeeId: string) => {
        setEmployeeDetailLoading(true);
        setEmployeeDetailError('');

        try {
            const res = await getEmployeeDetail(employeeId);
            setEmployeeDetail(res.data);
        } catch (err: any) {
            setEmployeeDetailError(toUserMessage(err, 'Terjadi kesalahan'));
        } finally {
            setEmployeeDetailLoading(false);
        }
    };

    const handleOpenEmployeeDetail = (employee: ApprovalEmployee) => {
        setSelectedEmployee(employee);
        setEmployeeDetail(null);
        setEmployeeModalOpen(true);
        fetchEmployeeDetail(employee.id);
    };

    const handleCloseEmployeeModal = () => {
        setEmployeeModalOpen(false);
        setEmployeeDetail(null);
        setEmployeeDetailError('');
        setSelectedEmployee(null);
    };

    const handleDownloadSubmission = () => {
        const url = approval?.contract.submission_file_url || approval?.contract.file_url;
        if (url) window.open(url, '_blank');
    };

    const handleDownloadApproval = () => {
        const url = approval?.contract.approval_file_url;
        if (url) window.open(url, '_blank');
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatDuration = (
        months: number | null,
        type: string
    ): string => {
        if (type === 'PKWTT') return 'Tetap';
        return months ? `${months} bulan` : '-';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                    <MoonLoader size={48} color="#419823" />
                    <span className="text-slate-600 font-medium">Memuat detail persetujuan...</span>
                </div>
            </div>
        );
    }

    if (error || !approval) {
        return (
            <div className="space-y-6">
                <button
                    onClick={() => navigate('/admin/approvals')}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 rounded-lg px-3 py-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                </button>

                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">
                            Terjadi Kesalahan
                        </p>
                        <p className="mt-1 text-sm text-red-700">
                            {error || 'Data tidak ditemukan'}
                        </p>
                        <button
                            onClick={() => refetch()}
                            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-200"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { contract, company, employees } = approval;

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={() => navigate('/admin/approvals')}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali
            </button>

            {/* Success Message */}
            {successMessage && (
                <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 px-5 py-4 shadow-sm">
                    <CheckCircle className="mt-0.5 h-5 w-5 text-primary" />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{successMessage}</p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {errorMessage && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Terjadi Kesalahan</p>
                        <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
                    </div>
                </div>
            )}

            {/* Header Card */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/20 px-6 py-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{company.company_name}</h1>
                            <p className="mt-1 text-sm text-slate-600">
                                Permohonan {contract.contract_type} - {formatDuration(contract.duration_months, contract.contract_type)}
                            </p>

                            {/* Status Badges */}
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${contract.application_status?.toUpperCase() === 'PENDING'
                                        ? 'bg-secondary/25 text-slate-900 ring-secondary/40'
                                        : contract.application_status?.toUpperCase() === 'APPROVED'
                                            ? 'bg-primary/10 text-primary ring-primary/20'
                                            : 'bg-red-50 text-red-700 ring-red-200'
                                        }`}
                                >
                                    <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                                    Aplikasi: {contract.application_status?.toUpperCase() === 'PENDING'
                                        ? 'Menunggu'
                                        : contract.application_status?.toUpperCase() === 'APPROVED'
                                            ? 'Disetujui'
                                            : 'Ditolak'}
                                </span>

                                {contract.file_approval_status && (
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${contract.file_approval_status?.toUpperCase() === 'PENDING'
                                            ? 'bg-secondary/25 text-slate-900 ring-secondary/40'
                                            : contract.file_approval_status?.toUpperCase() === 'APPROVED'
                                                ? 'bg-primary/10 text-primary ring-primary/20'
                                                : 'bg-red-50 text-red-700 ring-red-200'
                                            }`}
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                                        File: {contract.file_approval_status?.toUpperCase() === 'PENDING'
                                            ? 'Menunggu'
                                            : contract.file_approval_status?.toUpperCase() === 'APPROVED'
                                                ? 'Disetujui'
                                                : 'Ditolak'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                            {(contract.submission_file_url || contract.file_url) && (
                                <button
                                    onClick={handleDownloadSubmission}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                                >
                                    <Download className="h-4 w-4" />
                                    Unduh Dokumen
                                </button>
                            )}
                            {contract.approval_file_url && (
                                <button
                                    onClick={handleDownloadApproval}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                                >
                                    <Download className="h-4 w-4" />
                                    Unduh Dokumen Persetujuan
                                </button>
                            )}
                            <button
                                onClick={() => handleOpenModal('approve')}
                                disabled={contract.application_status?.toUpperCase() !== 'PENDING'}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Setujui
                            </button>
                            <button
                                onClick={() => handleOpenModal('reject')}
                                disabled={contract.application_status?.toUpperCase() !== 'PENDING'}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <XCircle className="h-4 w-4" />
                                Tolak
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="hidden" />
                    </div>
                </div>
            </div>

            {/* Detail Card */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/20 px-6 py-5">
                    <h2 className="text-sm font-semibold text-slate-900">Detail Permohonan</h2>
                </div>

                <div className="p-6">

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/10">
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Jenis PKWT</p>
                                <p className="mt-0.5 font-medium text-slate-900">
                                    {contract.contract_type}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/25 ring-1 ring-secondary/20">
                                <Clock className="h-5 w-5 text-slate-900" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Durasi Kontrak</p>
                                <p className="mt-0.5 font-medium text-slate-900">
                                    {formatDuration(contract.duration_months, contract.contract_type)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/10">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Jumlah Karyawan</p>
                                <p className="mt-0.5 font-medium text-slate-900">
                                    {employees.length}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 ring-1 ring-slate-200">
                                <Calendar className="h-5 w-5 text-slate-700" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Tanggal Pengajuan</p>
                                <p className="mt-0.5 font-medium text-slate-900">
                                    {formatDate(contract.submitted_at)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Notes & Comment */}
                    <div className="mt-6 border-t border-slate-200 pt-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-slate-200 bg-white">
                                <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/20 px-4 py-3">
                                    <p className="text-sm font-semibold text-slate-900">Catatan Pengajuan</p>
                                    <p className="mt-0.5 text-xs text-slate-600">Catatan dari perusahaan saat mengajukan.</p>
                                </div>
                                <div className="p-4">
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                        <p className="whitespace-pre-wrap text-sm text-slate-700">
                                            {contract.submission_notes || 'Tidak ada catatan pengajuan.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white">
                                <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/20 px-4 py-3">
                                    <p className="text-sm font-semibold text-slate-900">Komentar Admin</p>
                                    <p className="mt-0.5 text-xs text-slate-600">Catatan yang tersimpan untuk pengajuan ini.</p>
                                </div>
                                <div className="p-4">
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                        <p className="whitespace-pre-wrap text-sm text-slate-700">
                                            {contract.admin_comment || 'Belum ada komentar admin.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Employee Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/20 px-6 py-5">
                    <h2 className="text-sm font-semibold text-slate-900">Karyawan Terkait</h2>
                </div>
                <div className="p-6">
                    <ApprovalEmployeeTable employees={employees} onViewDetail={handleOpenEmployeeDetail} />
                </div>
            </div>

            {/* Approval Action Modal */}
            <ApprovalActionModal
                isOpen={modalState.isOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmitAction}
                actionType={modalState.type}
                loading={actionLoading}
            />

            <ApprovalEmployeeDetailModal
                isOpen={employeeModalOpen}
                onClose={handleCloseEmployeeModal}
                loading={employeeDetailLoading}
                error={employeeDetailError}
                employee={employeeDetail}
                meta={{ full_name: selectedEmployee?.full_name, nik: selectedEmployee?.nik }}
                onRetry={selectedEmployee ? () => fetchEmployeeDetail(selectedEmployee.id) : undefined}
            />
        </div>
    );
}
