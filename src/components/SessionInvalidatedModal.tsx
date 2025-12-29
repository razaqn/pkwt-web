import { LogOut } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export function SessionInvalidatedModal({ isOpen, onClose }: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-full bg-red-100">
                        <LogOut className="text-red-600" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Sesi Berakhir</h3>
                </div>

                <p className="text-slate-600 mb-6 leading-relaxed">
                    Sesi Anda telah berakhir karena login dari perangkat lain.
                    Silakan login kembali untuk melanjutkan.
                </p>

                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                    >
                        Login Kembali
                    </button>
                </div>
            </div>
        </div>
    );
}
