import { BookOpen } from 'lucide-react';
import { MoonLoader } from 'react-spinners';
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
                <div className="flex flex-col items-center gap-3">
                    <MoonLoader size={48} color="#419823" />
                    <p className="text-slate-600 font-medium">Memuat panduan...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-red-800">Terjadi Kesalahan</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Hero Header */}
            {config.hero.enabled && (
                <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-[#419823] via-[#2f7d1a] to-[#1f6a14] p-8 shadow-sm text-white">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
                            <BookOpen className="h-10 w-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{config.hero.title}</h1>
                            <p className="text-white/85 text-base">{config.hero.subtitle}</p>
                        </div>
                    </div>
                    <p className="text-white/90 text-sm leading-relaxed max-w-3xl">
                        {config.hero.description}
                    </p>
                    <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#F4D348] px-3 py-1 text-xs font-semibold text-slate-900">
                        Panduan • PKWT • E-PKWT
                    </div>
                </div>
            )}

            {/* Content Sections */}
            {config.pengertianSection.enabled && <PengertianSection config={config.pengertianSection} />}
            {config.syaratKetentuanSection.enabled && <SyaratKetentuanSection config={config.syaratKetentuanSection} />}
            {config.hakKewajibanSection.enabled && <HakKewajibanSection config={config.hakKewajibanSection} />}
            {config.konsultasiSection.enabled && <KonsultasiSection config={config.konsultasiSection} />}

            {/* Footer CTA */}
            {config.footerCTA.enabled && (
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-center">
                    <p className="text-slate-600 text-sm mb-4">
                        {config.footerCTA.text}
                    </p>
                    <div className="flex gap-3 justify-center flex-wrap">
                        <a
                            href={config.footerCTA.button1Link}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#419823] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#2f7d1a] transition"
                        >
                            {config.footerCTA.button1Text}
                        </a>
                        <a
                            href={config.footerCTA.button2Link}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-[#F4D348] px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-[#f2cc27] transition"
                        >
                            {config.footerCTA.button2Text}
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
