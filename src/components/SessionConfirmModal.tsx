import { AlertTriangle } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

export function SessionConfirmModal({ isOpen, onConfirm, onCancel, loading }: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-full bg-amber-100">
                        <AlertTriangle className="text-amber-600" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Sesi Aktif Terdeteksi</h3>
                </div>

                <p className="text-slate-600 mb-6 leading-relaxed">
                    Akun ini sedang login di perangkat lain. Jika Anda lanjutkan,
                    sesi di perangkat lain akan otomatis logout.
                </p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Memproses...' : 'Lanjutkan Login'}
                    </button>
                </div>
            </div>
        </div>
    );
}
