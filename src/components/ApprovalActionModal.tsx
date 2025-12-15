import { AlertCircle, Info, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
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
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const MAX_COMMENT_LENGTH = 500;

    const isApprove = actionType === 'approve';
    const iconColor = isApprove ? 'text-primary' : 'text-red-600';
    const buttonColor = isApprove
        ? 'bg-primary hover:bg-primary/90'
        : 'bg-red-600 hover:bg-red-700';
    const title = isApprove ? 'Setujui Permohonan' : 'Tolak Permohonan';
    const description = isApprove
        ? 'Anda yakin ingin menyetujui permohonan kontrak ini?'
        : 'Anda yakin ingin menolak permohonan kontrak ini? Silakan berikan alasan penolakan.';

    const helperText = isApprove
        ? 'Opsional: Tambahkan catatan singkat untuk perusahaan (jika perlu).'
        : 'Wajib diisi: Jelaskan alasan penolakan agar perusahaan bisa memperbaiki pengajuan.';

    const placeholder = isApprove ? 'Tambahkan catatan (opsional)' : 'Jelaskan alasan penolakan';

    const commentCount = useMemo(() => comment.length, [comment]);

    useEffect(() => {
        if (isOpen) {
            // Small delay helps ensure the element is in the DOM before focus.
            const t = window.setTimeout(() => {
                textareaRef.current?.focus();
            }, 0);
            return () => window.clearTimeout(t);
        }
        return;
    }, [isOpen]);

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
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-200 p-6">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${isApprove ? 'bg-primary/10' : 'bg-red-100'
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

                        <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <Info className="mt-0.5 h-4 w-4 text-slate-500" />
                            <p className="text-sm text-slate-700">{helperText}</p>
                        </div>

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
                                ref={textareaRef}
                                onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
                                rows={4}
                                disabled={loading}
                                placeholder={placeholder}
                                className="mt-1 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
                            />

                            <div className="mt-2 flex items-center justify-between">
                                <p className={`text-xs ${!isApprove ? 'text-slate-600' : 'text-slate-500'}`}>
                                    {!isApprove ? 'Contoh: Dokumen PKWT belum ditandatangani / data NIK tidak valid.' : 'Catatan akan tersimpan sebagai komentar admin.'}
                                </p>
                                <p className={`text-xs ${commentCount >= MAX_COMMENT_LENGTH ? 'text-red-600' : 'text-slate-500'}`}>
                                    {commentCount}/{MAX_COMMENT_LENGTH}
                                </p>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                <AlertCircle className="mt-0.5 h-4 w-4 text-red-600" />
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
