import type { GuideConfig } from '../../hooks/useGuideConfig';

interface HeroFooterConfigProps {
    config: GuideConfig;
    onChange: (config: GuideConfig) => void;
}

export default function HeroFooterConfig({ config, onChange }: HeroFooterConfigProps) {
    const updateHero = (field: keyof GuideConfig['hero'], value: string | boolean) => {
        onChange({
            ...config,
            hero: { ...config.hero, [field]: value },
        });
    };

    const updateFooterCTA = (field: keyof GuideConfig['footerCTA'], value: string | boolean) => {
        onChange({
            ...config,
            footerCTA: { ...config.footerCTA, [field]: value },
        });
    };

    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">Hero Section</h3>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={config.hero.enabled}
                            onChange={(e) => updateHero('enabled', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-slate-600">Aktif</span>
                    </label>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Title
                        </label>
                        <input
                            type="text"
                            value={config.hero.title}
                            onChange={(e) => updateHero('title', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Panduan E-PKWT"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Subtitle
                        </label>
                        <input
                            type="text"
                            value={config.hero.subtitle}
                            onChange={(e) => updateHero('subtitle', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Sistem Aplikasi Pencatatan PKWT"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Description
                        </label>
                        <textarea
                            value={config.hero.description}
                            onChange={(e) => updateHero('description', e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Selamat datang di sistem E-PKWT..."
                        />
                    </div>
                </div>
            </div>

            {/* Footer CTA Section */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">Footer CTA</h3>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={config.footerCTA.enabled}
                            onChange={(e) => updateFooterCTA('enabled', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-slate-600">Aktif</span>
                    </label>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Call to Action Text
                        </label>
                        <input
                            type="text"
                            value={config.footerCTA.text}
                            onChange={(e) => updateFooterCTA('text', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Sudah memahami panduan di atas?"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Button 1 Text
                            </label>
                            <input
                                type="text"
                                value={config.footerCTA.button1Text}
                                onChange={(e) => updateFooterCTA('button1Text', e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Buat Kontrak Baru"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Button 1 Link
                            </label>
                            <input
                                type="text"
                                value={config.footerCTA.button1Link}
                                onChange={(e) => updateFooterCTA('button1Link', e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="/form-kontrak"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Button 2 Text
                            </label>
                            <input
                                type="text"
                                value={config.footerCTA.button2Text}
                                onChange={(e) => updateFooterCTA('button2Text', e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Lihat Daftar Karyawan"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Button 2 Link
                            </label>
                            <input
                                type="text"
                                value={config.footerCTA.button2Link}
                                onChange={(e) => updateFooterCTA('button2Link', e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="/list-karyawan"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
