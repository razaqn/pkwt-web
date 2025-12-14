import { BookOpen, Loader2 } from 'lucide-react';
import { PengertianSection } from '../../components/welcome/PengertianSection';
import { SyaratKetentuanSection } from '../../components/welcome/SyaratKetentuanSection';
import { HakKewajibanSection } from '../../components/welcome/HakKewajibanSection';
import { KonsultasiSection } from '../../components/welcome/KonsultasiSection';
import { useWelcomeConfig } from '../../hooks/useWelcomeConfig';

export default function Welcome() {
    const { config, loading, error } = useWelcomeConfig();

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                    <p className="mt-2 text-sm text-slate-600">Memuat panduan...</p>
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
            {/* Hero Header */}
            {config.hero.enabled && (
                <div className="rounded-xl border bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-8 shadow-lg text-white">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <BookOpen className="h-10 w-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{config.hero.title}</h1>
                            <p className="text-blue-100 text-base">{config.hero.subtitle}</p>
                        </div>
                    </div>
                    <p className="text-white/90 text-sm leading-relaxed max-w-3xl">
                        {config.hero.description}
                    </p>
                </div>
            )}

            {/* Content Sections */}
            {config.pengertianSection.enabled && <PengertianSection config={config.pengertianSection} />}
            {config.syaratKetentuanSection.enabled && <SyaratKetentuanSection config={config.syaratKetentuanSection} />}
            {config.hakKewajibanSection.enabled && <HakKewajibanSection config={config.hakKewajibanSection} />}
            {config.konsultasiSection.enabled && <KonsultasiSection config={config.konsultasiSection} />}

            {/* Footer CTA */}
            {config.footerCTA.enabled && (
                <div className="rounded-xl border bg-gradient-to-br from-slate-50 to-slate-100 p-6 shadow-sm text-center">
                    <p className="text-slate-600 text-sm mb-4">
                        {config.footerCTA.text}
                    </p>
                    <div className="flex gap-3 justify-center flex-wrap">
                        <a
                            href={config.footerCTA.button1Link}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
                        >
                            {config.footerCTA.button1Text}
                        </a>
                        <a
                            href={config.footerCTA.button2Link}
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-slate-700 transition"
                        >
                            {config.footerCTA.button2Text}
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
