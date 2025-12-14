import { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { useWelcomeConfig } from '../../hooks/useWelcomeConfig';
import HeroFooterConfig from '../../components/config/HeroFooterConfig';
import PengertianConfig from '../../components/config/PengertianConfig';
import SyaratConfig from '../../components/config/SyaratConfig';
import HakKonsultasiConfig from '../../components/config/HakKonsultasiConfig';

type TabType = 'hero' | 'pengertian' | 'syarat' | 'hak-konsultasi';

const TABS: Array<{ id: TabType; label: string }> = [
    { id: 'hero', label: 'Hero & Footer' },
    { id: 'pengertian', label: 'Pengertian PKWT' },
    { id: 'syarat', label: 'Syarat & Ketentuan' },
    { id: 'hak-konsultasi', label: 'Hak & Konsultasi' },
];

export default function Config() {
    const [activeTab, setActiveTab] = useState<TabType>('hero');
    const { config, setConfig, loading, error, saving, saveConfig } = useWelcomeConfig();
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
                <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                    <p className="mt-2 text-sm text-slate-600">Memuat konfigurasi...</p>
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Welcome Page Config</h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Kelola konten halaman panduan untuk pengguna perusahaan
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Simpan Perubahan
                        </>
                    )}
                </button>
            </div>

            {/* Success Message */}
            {saveSuccess && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="text-sm font-medium text-green-800">
                        ✓ Konfigurasi berhasil disimpan!
                    </p>
                </div>
            )}

            {/* Tabs */}
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b border-slate-200">
                    <div className="flex gap-1 overflow-x-auto p-2">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'hero' && (
                        <HeroFooterConfig config={config} onChange={setConfig} />
                    )}

                    {activeTab === 'pengertian' && (
                        <PengertianConfig config={config} onChange={setConfig} />
                    )}

                    {activeTab === 'syarat' && (
                        <SyaratConfig config={config} onChange={setConfig} />
                    )}

                    {activeTab === 'hak-konsultasi' && (
                        <HakKonsultasiConfig config={config} onChange={setConfig} />
                    )}
                </div>
            </div>

            {/* Bottom Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5" />
                            Simpan Perubahan
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
