import { useEffect, useState } from 'react';
import {
    getLandingConfigAdmin,
    updateLandingConfigAdmin,
    uploadLandingPartnerImage,
    type LandingConfig,
} from '../lib/api';
import { toUserMessage } from '../lib/errors';

const initialLandingConfig: LandingConfig = {
    id: 'landing-config-default',
    runningText: { enabled: true, text: '' },
    ucapan: { enabled: true, title: '', body: '' },
    partners: { enabled: true, title: 'Mitra', items: [] },
    faq: { enabled: true, title: 'FAQ', items: [] },
    contact: { enabled: true, title: 'Kontak', phone: '', email: '', address: '' },
    updatedAt: null,
    updatedBy: null,
};

export function useLandingConfig() {
    const [config, setConfig] = useState<LandingConfig>(initialLandingConfig);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await getLandingConfigAdmin();
                if (res?.ok && res.data) {
                    setConfig(res.data);
                } else {
                    setConfig(initialLandingConfig);
                    setError('Gagal memuat konfigurasi');
                }
            } catch (err: any) {
                setConfig(initialLandingConfig);
                setError(toUserMessage(err, 'Gagal memuat konfigurasi'));
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const saveConfig = async (newConfig: LandingConfig) => {
        try {
            setSaving(true);
            setError(null);

            const res = await updateLandingConfigAdmin(newConfig);
            if (res?.ok && res.data) {
                setConfig(res.data);
                return { success: true as const };
            }

            const msg = res?.message || 'Gagal menyimpan konfigurasi';
            setError(msg);
            return { success: false as const, error: msg };
        } catch (err: any) {
            const msg = toUserMessage(err, 'Gagal menyimpan konfigurasi');
            setError(msg);
            return { success: false as const, error: msg };
        } finally {
            setSaving(false);
        }
    };

    const uploadPartner = async (file: File) => {
        try {
            setError(null);
            const res = await uploadLandingPartnerImage(file);
            if (res?.ok && res.data?.image_path) {
                return { success: true as const, imagePath: res.data.image_path };
            }
            return { success: false as const, error: 'Gagal upload gambar' };
        } catch (err: any) {
            return { success: false as const, error: toUserMessage(err, 'Gagal upload gambar') };
        }
    };

    return {
        config,
        setConfig,
        loading,
        error,
        saving,
        saveConfig,
        uploadPartner,
    };
}
