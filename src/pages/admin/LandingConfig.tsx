import { useState } from 'react';
import { Save } from 'lucide-react';
import { ClipLoader, MoonLoader } from 'react-spinners';
import { useLandingConfig } from '../../hooks/useLandingConfig';
import RunningTextConfig from '../../components/landing-config/RunningTextConfig';
import UcapanConfig from '../../components/landing-config/UcapanConfig';
import PartnersConfig from '../../components/landing-config/PartnersConfig';
import FaqConfig from '../../components/landing-config/FaqConfig';
import ContactConfig from '../../components/landing-config/ContactConfig';

type TabType = 'running-text' | 'ucapan' | 'partners' | 'faq' | 'contact';

const TABS: Array<{ id: TabType; label: string }> = [
    { id: 'running-text', label: 'Running Text' },
    { id: 'ucapan', label: 'Ucapan' },
    { id: 'partners', label: 'Partner Logos' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contact', label: 'Kontak' },
];

export default function LandingConfigPage() {
    const [activeTab, setActiveTab] = useState<TabType>('running-text');
    const { config, setConfig, loading, error, saving, saveConfig, uploadPartner, uploadUcapanImage } = useLandingConfig();
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSave = async () => {
        const result = await saveConfig(config);
        if (result.success) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <MoonLoader size={48} color="#419823" />
                    <p className="text-slate-600 font-medium">Memuat konfigurasi landing page...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <h3 className="text-lg font-semibold text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/25 p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Landing Page Config</h1>
                        <p className="mt-1 text-sm text-slate-600">Kelola konten landing page publik (guest) di /home</p>
                        <div className="mt-2 text-xs text-slate-500">
                            {config.updatedAt ? (
                                <span>
                                    Terakhir diubah: {new Date(config.updatedAt).toLocaleString('id-ID')} {config.updatedBy ? `oleh ${config.updatedBy}` : ''}
                                </span>
                            ) : (
                                <span>Belum ada informasi pembaruan.</span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-start gap-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
                        >
                            {saving ? <ClipLoader size={16} color="#fff" /> : <Save className="h-4 w-4" />}
                            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>

                        {saveSuccess && (
                            <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 ring-1 ring-green-200">
                                ✓ Berhasil disimpan
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                <div className="flex flex-wrap gap-2">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === tab.id
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-white text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'running-text' && <RunningTextConfig config={config} onChange={setConfig} />}
            {activeTab === 'ucapan' && <UcapanConfig config={config} onChange={setConfig} onUploadImage={uploadUcapanImage} />}
            {activeTab === 'partners' && (
                <PartnersConfig
                    config={config}
                    onChange={setConfig}
                    onUpload={uploadPartner}
                />
            )}
            {activeTab === 'faq' && <FaqConfig config={config} onChange={setConfig} />}
            {activeTab === 'contact' && <ContactConfig config={config} onChange={setConfig} />}
        </div>
    );
}
