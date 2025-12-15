import { useState } from 'react';
import { Save } from 'lucide-react';
import { MoonLoader, ClipLoader } from 'react-spinners';
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
                <div className="flex flex-col items-center gap-3">
                    <MoonLoader size={48} color="#419823" />
                    <p className="text-slate-600 font-medium">Memuat konfigurasi...</p>
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
            <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/25 p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Welcome Page Config</h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Kelola konten halaman panduan untuk pengguna perusahaan
                        </p>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? (
                            <>
                                <ClipLoader size={14} color="#0f172a" />
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
            </div>

            {/* Success Message */}
            {saveSuccess && (
                <div className="rounded-lg border border-primary/20 bg-primary/10 p-4">
                    <p className="text-sm font-semibold text-primary">
                        ✓ Konfigurasi berhasil disimpan!
                    </p>
                </div>
            )}

            {/* Tabs */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200">
                    <div className="flex gap-1 overflow-x-auto p-2">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === tab.id
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-slate-700 hover:bg-slate-100'
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
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {saving ? (
                        <>
                            <ClipLoader size={16} color="#0f172a" />
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
