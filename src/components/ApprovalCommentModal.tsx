import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ApprovalCommentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (comment: string) => void;
    title: string;
    description: string;
    isRequired?: boolean;
    actionLabel: string;
    actionType: 'approve' | 'reject';
}

export default function ApprovalCommentModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    description,
    isRequired = false,
    actionLabel,
    actionType
}: ApprovalCommentModalProps) {
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setComment('');
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isRequired && !comment.trim()) {
            setError('Alasan harus diisi');
            return;
        }

        onSubmit(comment);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${actionType === 'approve' ? 'bg-green-100' : 'bg-red-100'}`}>
                        <AlertCircle className={`w-5 h-5 ${actionType === 'approve' ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-6">{description}</p>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                            {isRequired ? 'Alasan (wajib diisi)' : 'Catatan (opsional)'}
                        </label>
                        <textarea
                            id="comment"
                            rows={4}
                            value={comment}
                            onChange={(e) => {
                                setComment(e.target.value);
                                if (error) setError('');
                            }}
                            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${error ? 'border-red-300' : 'border-gray-300'}`}
                            placeholder={isRequired ? 'Masukkan alasan penolakan...' : 'Masukkan catatan (jika ada)...'}
                        />
                        {error && (
                            <p className="mt-2 text-sm text-red-600">{error}</p>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className={`px-4 py-2 rounded-md text-white ${actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                            {actionLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}