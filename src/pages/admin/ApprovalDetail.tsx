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
import { approveContract, rejectContract } from '../../lib/api';
import ApprovalEmployeeTable from '../../components/ApprovalEmployeeTable';
import ApprovalActionModal from '../../components/ApprovalActionModal';

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

    const handleOpenModal = (type: 'approve' | 'reject') => {
        setModalState({ isOpen: true, type });
        setSuccessMessage('');
        setErrorMessage('');
    };

    const handleCloseModal = () => {
        setModalState({ isOpen: false, type: 'approve' });
    };

    const handleSubmitAction = async (comment: string) => {
        if (!contractId) return;

        setActionLoading(true);
        setErrorMessage('');

        try {
            if (modalState.type === 'approve') {
                await approveContract(contractId, comment);
                setSuccessMessage('Kontrak berhasil disetujui');
            } else {
                await rejectContract(contractId, comment);
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
            setErrorMessage(err?.message || 'Terjadi kesalahan');
            throw err; // Re-throw to let modal handle it
        } finally {
            setActionLoading(false);
        }
    };

    const handleDownload = () => {
        if (approval?.contract.file_url) {
            window.open(approval.contract.file_url, '_blank');
        }
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
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                </button>

                <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3">
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
                            className="mt-3 inline-flex items-center gap-1.5 rounded bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-200"
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
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali
            </button>

            {/* Success Message */}
            {successMessage && (
                <div className="flex items-start gap-3 rounded-lg border border-green-300 bg-green-50 px-4 py-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">{successMessage}</p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {errorMessage && (
                <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Terjadi Kesalahan</p>
                        <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
                    </div>
                </div>
            )}

            {/* Header Card */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {company.company_name}
                        </h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Permohonan {contract.contract_type} -{' '}
                            {formatDuration(contract.duration_months, contract.contract_type)}
                        </p>

                        {/* Status Badges */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${contract.application_status?.toUpperCase() === 'PENDING'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : contract.application_status?.toUpperCase() === 'APPROVED'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
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
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${contract.file_approval_status?.toUpperCase() === 'PENDING'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : contract.file_approval_status?.toUpperCase() === 'APPROVED'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
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
                        {contract.file_url && (
                            <button
                                onClick={handleDownload}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                            >
                                <Download className="h-4 w-4" />
                                Unduh Dokumen
                            </button>
                        )}
                        <button
                            onClick={() => handleOpenModal('approve')}
                            disabled={contract.application_status?.toUpperCase() !== 'PENDING'}
                            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <CheckCircle className="h-4 w-4" />
                            Setujui
                        </button>
                        <button
                            onClick={() => handleOpenModal('reject')}
                            disabled={contract.application_status?.toUpperCase() !== 'PENDING'}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <XCircle className="h-4 w-4" />
                            Tolak
                        </button>
                    </div>
                </div>
            </div>

            {/* Detail Card */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">
                    Detail Permohonan
                </h2>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                            <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Jenis PKWT</p>
                            <p className="mt-0.5 font-medium text-slate-900">
                                {contract.contract_type}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                            <Clock className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Durasi Kontrak</p>
                            <p className="mt-0.5 font-medium text-slate-900">
                                {formatDuration(contract.duration_months, contract.contract_type)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                            <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Jumlah Karyawan</p>
                            <p className="mt-0.5 font-medium text-slate-900">
                                {employees.length}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                            <Calendar className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Tanggal Pengajuan</p>
                            <p className="mt-0.5 font-medium text-slate-900">
                                {formatDate(contract.submitted_at)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Submission Notes */}
                {contract.submission_notes && (
                    <div className="mt-4 border-t border-slate-200 pt-4">
                        <p className="text-xs text-slate-500">Catatan Pengajuan</p>
                        <p className="mt-1 text-sm text-slate-700">
                            {contract.submission_notes}
                        </p>
                    </div>
                )}

                {/* Admin Comment */}
                {contract.admin_comment && (
                    <div className="mt-4 border-t border-slate-200 pt-4">
                        <p className="text-xs text-slate-500">Komentar Admin</p>
                        <p className="mt-1 text-sm text-slate-700">
                            {contract.admin_comment}
                        </p>
                    </div>
                )}
            </div>

            {/* Employee Table */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">
                    Karyawan Terkait
                </h2>
                <ApprovalEmployeeTable employees={employees} />
            </div>

            {/* Approval Action Modal */}
            <ApprovalActionModal
                isOpen={modalState.isOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmitAction}
                actionType={modalState.type}
                loading={actionLoading}
            />
        </div>
    );
}
