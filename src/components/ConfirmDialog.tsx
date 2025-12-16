import { useEffect } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export type DialogTone = 'info' | 'success' | 'warning' | 'error';
export type DialogMode = 'alert' | 'confirm';

export type ConfirmDialogProps = {
    open: boolean;
    mode: DialogMode;
    tone?: DialogTone;
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    /** When false, only show the primary button (OK). */
    showCancel?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

function ToneIcon({ tone }: { tone: DialogTone }) {
    switch (tone) {
        case 'success':
            return <CheckCircle2 className="h-5 w-5 text-primary" />;
        case 'warning':
            return <AlertTriangle className="h-5 w-5 text-secondary" />;
        case 'error':
            return <AlertCircle className="h-5 w-5 text-red-600" />;
        case 'info':
        default:
            return <Info className="h-5 w-5 text-slate-600" />;
    }
}

export default function ConfirmDialog({
    open,
    mode,
    tone = 'info',
    title,
    message,
    confirmText,
    cancelText,
    showCancel,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    useEffect(() => {
        if (!open) return;

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onCancel();
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, onCancel]);

    if (!open) return null;

    const primaryLabel = confirmText ?? (mode === 'confirm' ? 'Ya' : 'OK');
    const secondaryLabel = cancelText ?? 'Batal';
    const showSecondary = showCancel ?? mode === 'confirm';

    const primaryBtnClass =
        tone === 'error'
            ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-200'
            : 'bg-secondary text-slate-900 hover:bg-secondary/90 focus:ring-primary/30';

    return (
        <div className="fixed inset-0 z-[100]">
            <button
                type="button"
                aria-label="Tutup dialog"
                className="absolute inset-0 bg-black/40"
                onClick={onCancel}
            />

            <div className="relative z-[101] flex min-h-full items-center justify-center p-4">
                <div
                    role="dialog"
                    aria-modal="true"
                    className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                >
                    <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/25 px-5 py-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                                <ToneIcon tone={tone} />
                            </div>
                            <div>
                                <div className="text-base font-semibold text-slate-900">{title}</div>
                                {message ? (
                                    <div className="mt-1 text-sm text-slate-600">{message}</div>
                                ) : null}
                            </div>
                        </div>
                        <button
                            type="button"
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            onClick={onCancel}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex flex-col-reverse gap-2 px-5 py-4 sm:flex-row sm:justify-end">
                        {showSecondary ? (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                            >
                                {secondaryLabel}
                            </button>
                        ) : null}

                        <button
                            type="button"
                            onClick={onConfirm}
                            className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 ${primaryBtnClass}`}
                        >
                            {primaryLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
