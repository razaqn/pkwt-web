import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import ConfirmDialog, { type DialogMode, type DialogTone } from './ConfirmDialog';
import { DialogContext, type AlertOptions, type ConfirmOptions, type DialogApi } from '../hooks/useDialog';

type DialogState = {
    open: boolean;
    mode: DialogMode;
    tone: DialogTone;
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
};

export function DialogProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<DialogState>({
        open: false,
        mode: 'alert',
        tone: 'info',
        title: '',
    });

    const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);
    const alertResolverRef = useRef<(() => void) | null>(null);

    const close = useCallback(() => {
        setState((s) => ({ ...s, open: false }));
    }, []);

    const confirm = useCallback((opts: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            confirmResolverRef.current = resolve;
            alertResolverRef.current = null;
            setState({
                open: true,
                mode: 'confirm',
                tone: opts.tone ?? 'warning',
                title: opts.title,
                message: opts.message,
                confirmText: opts.confirmText,
                cancelText: opts.cancelText,
            });
        });
    }, []);

    const alert = useCallback((opts: AlertOptions) => {
        return new Promise<void>((resolve) => {
            alertResolverRef.current = resolve;
            confirmResolverRef.current = null;
            setState({
                open: true,
                mode: 'alert',
                tone: opts.tone ?? 'info',
                title: opts.title,
                message: opts.message,
                confirmText: opts.confirmText,
                cancelText: undefined,
            });
        });
    }, []);

    const onConfirm = useCallback(() => {
        if (state.mode === 'confirm') {
            confirmResolverRef.current?.(true);
        } else {
            alertResolverRef.current?.();
        }

        confirmResolverRef.current = null;
        alertResolverRef.current = null;
        close();
    }, [close, state.mode]);

    const onCancel = useCallback(() => {
        if (state.mode === 'confirm') {
            confirmResolverRef.current?.(false);
        } else {
            alertResolverRef.current?.();
        }

        confirmResolverRef.current = null;
        alertResolverRef.current = null;
        close();
    }, [close, state.mode]);

    const api = useMemo<DialogApi>(() => ({ confirm, alert }), [confirm, alert]);

    return (
        <DialogContext.Provider value={api}>
            {children}
            <ConfirmDialog
                open={state.open}
                mode={state.mode}
                tone={state.tone}
                title={state.title}
                message={state.message}
                confirmText={state.confirmText}
                cancelText={state.cancelText}
                showCancel={state.mode === 'confirm'}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />
        </DialogContext.Provider>
    );
}
