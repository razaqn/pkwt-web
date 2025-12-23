import { BookOpen } from 'lucide-react';
import { MoonLoader } from 'react-spinners';
import { Link } from 'react-router-dom';
import { useState } from 'react';

import { HakKewajibanSection } from '../../components/welcome/HakKewajibanSection';
import { KonsultasiSection } from '../../components/welcome/KonsultasiSection';
import { PengertianSection } from '../../components/welcome/PengertianSection';
import { SyaratKetentuanSection } from '../../components/welcome/SyaratKetentuanSection';
import { useGuidePublic, type GuideType } from '../../hooks/useGuideConfig';

export default function Guide({ type }: { type: GuideType }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { config, loading, error } = useGuidePublic(type);

    const pill = type === 'pkwtt' ? 'Panduan • PKWTT • SIAP-PKWT' : 'Panduan • PKWT • SIAP-PKWT';
    const titleFallback = type === 'pkwtt' ? 'Panduan PKWTT' : 'Panduan PKWT';

    const isInternal = (href: string) => href.startsWith('/') || href.startsWith('#');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-secondary/10">
            {/* Top bar (match landing) */}
            <header className="sticky top-0 z-10 border-b border-primary/10 bg-white/90 shadow-sm shadow-primary/5 backdrop-blur-xl">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <img src="/siap-pkwt-logo-1.png" alt="SIAP PKWT" className="h-9 w-auto" />
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Desktop actions */}
                        <div className="hidden md:flex items-center gap-3">
                            <div className="flex items-center gap-5 mr-2">
                                <Link
                                    to="/pkwt"
                                    className={`text-sm font-bold hover:text-primary ${type === 'pkwt' ? 'text-primary' : 'text-slate-700'}`}
                                >
                                    Panduan PKWT
                                </Link>
                                <Link
                                    to="/pkwtt"
                                    className={`text-sm font-bold hover:text-primary ${type === 'pkwtt' ? 'text-primary' : 'text-slate-700'}`}
                                >
                                    Panduan PKWTT
                                </Link>
                            </div>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary/90 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/40"
                            >
                                Masuk Perusahaan
                            </Link>
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            type="button"
                            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100"
                            aria-label="Open menu"
                            onClick={() => setMobileMenuOpen((s) => !s)}
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile menu overlay (match landing) */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-20">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
                    <div className="absolute top-0 right-0 w-72 bg-white shadow-lg p-4">
                        <Link
                            to="/pkwt"
                            className={`block px-4 py-2 rounded text-base font-semibold hover:bg-slate-50 ${type === 'pkwt' ? 'text-primary' : 'text-slate-700'}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Panduan PKWT
                        </Link>
                        <Link
                            to="/pkwtt"
                            className={`block px-4 py-2 rounded text-base font-semibold hover:bg-slate-50 ${type === 'pkwtt' ? 'text-primary' : 'text-slate-700'}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Panduan PKWTT
                        </Link>
                        <div className="my-2 border-t border-slate-200" />
                        <Link
                            to="/login"
                            className="block px-4 py-2 rounded text-base font-semibold text-slate-700 hover:bg-slate-50"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Masuk Perusahaan
                        </Link>
                    </div>
                </div>
            )}

            <main>
                <section className="mx-auto max-w-6xl px-6 py-10 md:py-14">
                    {/* Loading/Error (in landing shell) */}
                    {loading && (
                        <div className="flex min-h-[50vh] items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <MoonLoader size={48} color="#419823" />
                                <p className="text-slate-600 font-medium">Memuat panduan...</p>
                            </div>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-red-800">Terjadi Kesalahan</h3>
                            <p className="mt-1 text-sm text-red-700">{error}</p>
                            <div className="mt-4">
                                <Link to="/home" className="text-sm font-semibold text-red-800 underline">
                                    Kembali ke Home
                                </Link>
                            </div>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="space-y-8">
                            {/* Hero */}
                            <div className="group relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-white via-primary/5 to-secondary/10 p-10 shadow-2xl shadow-primary/10 transition-all duration-500 hover:shadow-3xl hover:shadow-primary/20">
                                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl transition-transform duration-700 group-hover:scale-150" />
                                <div className="relative">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-2">
                                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                        <div className="text-xs font-black uppercase tracking-widest text-primary">Panduan</div>
                                    </div>

                                    <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="max-w-3xl">
                                            <div className="flex items-start gap-4">
                                                <div className="hidden sm:flex h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 items-center justify-center shadow-lg shadow-primary/30">
                                                    <BookOpen className="h-8 w-8 text-white" />
                                                </div>
                                                <div>
                                                    <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                                                        {(config.hero?.enabled && config.hero.title) ? config.hero.title : titleFallback}
                                                    </h1>
                                                    <p className="mt-3 text-base font-semibold text-slate-700 md:text-lg">
                                                        {config.hero?.enabled ? config.hero.subtitle : pill}
                                                    </p>
                                                </div>
                                            </div>

                                            {config.hero?.enabled && (
                                                <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-slate-700 md:text-base">
                                                    {config.hero.description}
                                                </p>
                                            )}

                                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-primary/10">
                                                    {pill}
                                                </div>
                                                {config.updatedAt && (
                                                    <div className="text-xs font-medium text-slate-500">
                                                        Terakhir diperbarui: {new Date(config.updatedAt).toLocaleDateString('id-ID')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quick links */}
                                        <div className="w-full lg:w-[320px]">
                                            <div className="rounded-2xl border border-primary/15 bg-white/80 p-5 shadow-sm backdrop-blur">
                                                <div className="text-sm font-black text-slate-900">Navigasi cepat</div>
                                                <div className="mt-3 grid grid-cols-2 gap-2">
                                                    <a href="#pengertian" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Pengertian</a>
                                                    <a href="#syarat" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Syarat</a>
                                                    <a href="#hak" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Hak & Kewajiban</a>
                                                    <a href="#konsultasi" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Konsultasi</a>
                                                </div>

                                                <div className="mt-4">
                                                    <Link
                                                        to="/login"
                                                        className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary/90 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-primary/40"
                                                    >
                                                        Masuk Perusahaan
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sections */}
                            <section id="pengertian" className="scroll-mt-28">
                                {config.pengertianSection.enabled && <PengertianSection config={config.pengertianSection} />}
                            </section>
                            <section id="syarat" className="scroll-mt-28">
                                {config.syaratKetentuanSection.enabled && (
                                    <SyaratKetentuanSection config={config.syaratKetentuanSection} />
                                )}
                            </section>
                            <section id="hak" className="scroll-mt-28">
                                {config.hakKewajibanSection.enabled && <HakKewajibanSection config={config.hakKewajibanSection} />}
                            </section>
                            <section id="konsultasi" className="scroll-mt-28">
                                {config.konsultasiSection.enabled && <KonsultasiSection config={config.konsultasiSection} />}
                            </section>

                            {/* Footer CTA */}
                            {config.footerCTA.enabled && (
                                <div className="group relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-white via-primary/5 to-secondary/10 p-8 shadow-2xl shadow-primary/10">
                                    <div className="absolute -right-10 -bottom-10 h-56 w-56 rounded-full bg-gradient-to-br from-primary/15 to-secondary/15 blur-3xl" />
                                    <div className="relative text-center">
                                        <p className="text-slate-700 text-sm font-semibold mb-5 whitespace-pre-line">
                                            {config.footerCTA.text}
                                        </p>
                                        <div className="flex gap-3 justify-center flex-wrap">
                                            {isInternal(config.footerCTA.button1Link) ? (
                                                <Link
                                                    to={config.footerCTA.button1Link}
                                                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary/90 px-6 py-3 text-sm font-black text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/40"
                                                >
                                                    {config.footerCTA.button1Text}
                                                </Link>
                                            ) : (
                                                <a
                                                    href={config.footerCTA.button1Link}
                                                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary/90 px-6 py-3 text-sm font-black text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/40"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {config.footerCTA.button1Text}
                                                </a>
                                            )}

                                            {isInternal(config.footerCTA.button2Link) ? (
                                                <Link
                                                    to={config.footerCTA.button2Link}
                                                    className="inline-flex items-center justify-center rounded-xl border border-primary/20 bg-white px-6 py-3 text-sm font-black text-slate-900 shadow-sm transition-all duration-300 hover:bg-slate-50"
                                                >
                                                    {config.footerCTA.button2Text}
                                                </Link>
                                            ) : (
                                                <a
                                                    href={config.footerCTA.button2Link}
                                                    className="inline-flex items-center justify-center rounded-xl border border-primary/20 bg-white px-6 py-3 text-sm font-black text-slate-900 shadow-sm transition-all duration-300 hover:bg-slate-50"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {config.footerCTA.button2Text}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 text-center">
                                <Link to="/home" className="text-xs font-bold text-slate-600 hover:text-primary">
                                    ← Kembali ke Landing
                                </Link>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}