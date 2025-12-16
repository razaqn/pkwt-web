import { createContext, useContext } from 'react';
import type { DialogTone } from '../components/ConfirmDialog';

export type ConfirmOptions = {
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    tone?: DialogTone;
};

export type AlertOptions = {
    title: string;
    message?: string;
    confirmText?: string;
    tone?: DialogTone;
};

export type DialogApi = {
    confirm: (opts: ConfirmOptions) => Promise<boolean>;
    alert: (opts: AlertOptions) => Promise<void>;
};

export const DialogContext = createContext<DialogApi | null>(null);

export { DialogProvider } from '../components/DialogProvider.tsx';

export function useDialog(): DialogApi {
    const ctx = useContext(DialogContext);
    if (!ctx) {
        throw new Error('useDialog must be used within <DialogProvider>.');
    }
    return ctx;
}
