import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Download, Users, Building2, Calendar, Clock, File } from 'lucide-react';
import ApprovalEmployeeTable from '../components/ApprovalEmployeeTable';
import ApprovalCommentModal from '../components/ApprovalCommentModal';
import { dummyApprovals, dummyApprovalEmployees } from '../lib/dummyData';
import type { Approval, ApprovalEmployee, PaginationState } from '../types/approvalTypes';

export default function ApprovalDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [approval, setApproval] = useState<Approval | null>(null);
    const [relatedEmployees, setRelatedEmployees] = useState<ApprovalEmployee[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null);

    // State for employee table pagination
    const [pagination, setPagination] = useState<PaginationState>({
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 0
    });

    useEffect(() => {
        const fetchData = () => {
            if (!id) {
                navigate('/perstujuan-pkwt');
                return;
            }

            // Find the approval
            const foundApproval = dummyApprovals.find(appr => appr.id === id);
            if (!foundApproval) {
                navigate('/perstujuan-pkwt');
                return;
            }

            setApproval(foundApproval);

            // Find related employees
            const employees = dummyApprovalEmployees.filter(emp => emp.approvalId === id);
            setRelatedEmployees(employees);

            // Set pagination
            setPagination({
                currentPage: 1,
                itemsPerPage: 10,
                totalItems: employees.length,
                totalPages: Math.ceil(employees.length / 10)
            });

            setLoading(false);
        };

        fetchData();
    }, [id, navigate]);

    const handlePageChange = (page: number) => {
        setPagination(prev => ({
            ...prev,
            currentPage: page
        }));
    };

    const getCurrentPageEmployees = () => {
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        const endIndex = startIndex + pagination.itemsPerPage;
        return relatedEmployees.slice(startIndex, endIndex);
    };

    const handleDownloadContract = () => {
        if (approval?.contractFile) {
            // In a real app, this would download the actual file
            console.log(`Downloading contract file: ${approval.contractFile}`);
            // For demo purposes, we'll just show an alert
            alert(`Mengunduh file kontrak: ${approval.contractFile}`);
        }
    };

    const handleApproveClick = () => {
        setModalType('approve');
        setIsModalOpen(true);
    };

    const handleRejectClick = () => {
        setModalType('reject');
        setIsModalOpen(true);
    };

    const handleModalSubmit = (comment: string) => {
        if (modalType === 'approve') {
            console.log(`Approval ${id} approved with comment: ${comment || 'No comment'}`);
            alert(`Permohonan PKWT disetujui${comment ? ` dengan catatan: ${comment}` : ''}`);
        } else if (modalType === 'reject') {
            console.log(`Approval ${id} rejected with reason: ${comment}`);
            alert(`Permohonan PKWT ditolak dengan alasan: ${comment}`);
        }
        // In a real app, this would call an API to update the status
    };

    // Format date to Indonesian format
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('id-ID', options);
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!approval) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900">Permohonan tidak ditemukan</h3>
                    <p className="text-sm text-gray-500 mt-1">Permohonan PKWT yang Anda cari tidak tersedia</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="p-0">
                {/* Header with back button */}
                <div className="px-6 pt-6 pb-2">
                    <button
                        onClick={() => navigate('/perstujuan-pkwt')}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Daftar Persetujuan
                    </button>
                </div>

                <div className="px-6 pb-6">
                    {/* Approval Header */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Building2 className="w-8 h-8 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{approval.companyName}</h1>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Permohonan {approval.pkwtType} - {approval.contractDuration}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleDownloadContract}
                                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Unduh Dokumen
                                </button>
                                <button
                                    onClick={handleApproveClick}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Setujui
                                </button>
                                <button
                                    onClick={handleRejectClick}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Tolak
                                </button>
                            </div>
                        </div>

                        {/* Approval Details */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                    <File className="w-5 h-5 text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Jenis PKWT</p>
                                    <p className="font-medium">{approval.pkwtType}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Durasi Kontrak</p>
                                    <p className="font-medium">{approval.contractDuration}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Users className="w-5 h-5 text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Jumlah Karyawan</p>
                                    <p className="font-medium">{approval.employeeCount}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Tanggal Pengajuan</p>
                                    <p className="font-medium">{formatDate(approval.submissionDate)}</p>
                                </div>
                            </div>
                        </div>

                        {approval.submissionNotes && (
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-500 mb-2">Catatan Pengajuan</p>
                                <p className="text-gray-700">{approval.submissionNotes}</p>
                            </div>
                        )}
                    </div>

                    {/* Related Employees Table */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Daftar Karyawan Terkait</h2>
                        <ApprovalEmployeeTable
                            employees={getCurrentPageEmployees()}
                            pagination={pagination}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            {modalType === 'approve' && (
                <ApprovalCommentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleModalSubmit}
                    title="Setujui Permohonan"
                    description="Apakah Anda yakin ingin menyetujui permohonan PKWT ini? Anda dapat menambahkan catatan opsional."
                    isRequired={false}
                    actionLabel="Setujui"
                    actionType="approve"
                />
            )}

            {modalType === 'reject' && (
                <ApprovalCommentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleModalSubmit}
                    title="Tolak Permohonan"
                    description="Apakah Anda yakin ingin menolak permohonan PKWT ini? Harap berikan alasan penolakan."
                    isRequired={true}
                    actionLabel="Tolak"
                    actionType="reject"
                />
            )}
        </>
    );
}