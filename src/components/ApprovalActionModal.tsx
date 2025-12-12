import { AlertCircle, X } from 'lucide-react';
import { useState, useCallback } from 'react';
import { ClipLoader } from 'react-spinners';

interface ApprovalActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (comment: string) => Promise<void>;
    actionType: 'approve' | 'reject';
    loading?: boolean;
}

export default function ApprovalActionModal({
    isOpen,
    onClose,
    onSubmit,
    actionType,
    loading = false,
}: ApprovalActionModalProps) {
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    const isApprove = actionType === 'approve';
    const iconColor = isApprove ? 'text-green-600' : 'text-red-600';
    const buttonColor = isApprove
        ? 'bg-green-600 hover:bg-green-700'
        : 'bg-red-600 hover:bg-red-700';
    const title = isApprove ? 'Setujui Permohonan' : 'Tolak Permohonan';
    const description = isApprove
        ? 'Anda yakin ingin menyetujui permohonan kontrak ini?'
        : 'Anda yakin ingin menolak permohonan kontrak ini? Silakan berikan alasan penolakan.';

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError('');

            // Validation: reject requires comment
            if (!isApprove && !comment.trim()) {
                setError('Komentar wajib diisi untuk penolakan');
                return;
            }

            try {
                await onSubmit(comment);
                setComment(''); // Reset on success
            } catch (err: any) {
                setError(err?.message || 'Terjadi kesalahan');
            }
        },
        [comment, isApprove, onSubmit]
    );

    const handleClose = useCallback(() => {
        if (!loading) {
            setComment('');
            setError('');
            onClose();
        }
    }, [loading, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-200 p-6">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${isApprove ? 'bg-green-100' : 'bg-red-100'
                                }`}
                        >
                            <AlertCircle className={`h-6 w-6 ${iconColor}`} />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="text-slate-400 transition-colors hover:text-slate-600 disabled:cursor-not-allowed"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 p-6">
                        <p className="text-sm text-slate-600">{description}</p>

                        {/* Comment Textarea */}
                        <div>
                            <label
                                htmlFor="comment"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Komentar {!isApprove && <span className="text-red-600">*</span>}
                            </label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                disabled={loading}
                                placeholder={
                                    isApprove
                                        ? 'Tambahkan catatan (opsional)'
                                        : 'Jelaskan alasan penolakan'
                                }
                                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 disabled:text-slate-500"
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${buttonColor}`}
                        >
                            {loading && <ClipLoader size={16} color="#ffffff" />}
                            {loading ? 'Memproses...' : isApprove ? 'Setujui' : 'Tolak'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
