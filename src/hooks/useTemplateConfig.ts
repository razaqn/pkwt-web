import { useEffect, useState } from 'react';
import {
    getTemplatesConfigAdmin,
    updateTemplatesConfigAdmin,
    uploadTemplateFile,
    type TemplatesConfig,
} from '../lib/api';
import { toUserMessage } from '../lib/errors';

const initialTemplatesConfig: TemplatesConfig = {
    id: 'templates-config-default',
    templates: {
        enabled: true,
        title: 'Template',
        items: [],
    },
    updatedAt: null,
    updatedBy: null,
};

export function useTemplateConfig() {
    const [config, setConfig] = useState<TemplatesConfig>(initialTemplatesConfig);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await getTemplatesConfigAdmin();
                if (res?.ok && res.data) {
                    setConfig(res.data);
                } else {
                    setConfig(initialTemplatesConfig);
                    setError('Gagal memuat konfigurasi template');
                }
            } catch (err: any) {
                setConfig(initialTemplatesConfig);
                setError(toUserMessage(err, 'Gagal memuat konfigurasi template'));
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const saveConfig = async (newConfig: TemplatesConfig) => {
        try {
            setSaving(true);
            setError(null);

            const res = await updateTemplatesConfigAdmin(newConfig);
            if (res?.ok && res.data) {
                setConfig(res.data);
                return { success: true as const };
            }

            const msg = res?.message || 'Gagal menyimpan konfigurasi template';
            setError(msg);
            return { success: false as const, error: msg };
        } catch (err: any) {
            const msg = toUserMessage(err, 'Gagal menyimpan konfigurasi template');
            setError(msg);
            return { success: false as const, error: msg };
        } finally {
            setSaving(false);
        }
    };

    const uploadFile = async (file: File) => {
        try {
            setError(null);
            const res = await uploadTemplateFile(file);
            if (res?.ok && res.data?.file_path) {
                return { success: true as const, data: res.data };
            }
            return { success: false as const, error: 'Gagal upload file template' };
        } catch (err: any) {
            return { success: false as const, error: toUserMessage(err, 'Gagal upload file template') };
        }
    };

    return {
        config,
        setConfig,
        loading,
        error,
        saving,
        saveConfig,
        uploadFile,
    };
}
