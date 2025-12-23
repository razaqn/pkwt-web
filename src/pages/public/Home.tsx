import { Navigate, Link } from 'react-router-dom';
import { useState, useRef, useLayoutEffect } from 'react';
import { getToken } from '../../store/auth';
import { useLandingPublic } from '../../hooks/useLandingPublic';
import { resolveUploadUrl } from '../../lib/url';
import type { ReactNode } from 'react';

function formatNumberId(n: number | null | undefined) {
    const num = typeof n === 'number' && Number.isFinite(n) ? n : 0;
    return new Intl.NumberFormat('id-ID').format(num);
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-white via-primary/5 to-secondary/10 p-8 shadow-lg shadow-primary/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 blur-2xl transition-transform duration-500 group-hover:scale-150"></div>
            <div className="relative">
                <div className="text-sm font-bold uppercase tracking-wider text-slate-600">{label}</div>
                <div className="mt-3 text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary to-slate-900">{value}</div>
            </div>
        </div>
    );
}

function Marquee({ children }: { children: ReactNode }) {
    return (
        <div className="landing-marquee">
            <div className="landing-marquee__track">
                <div className="landing-marquee__group">{children}</div>
                <div className="landing-marquee__group" aria-hidden>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function Home() {
    const isAuthed = Boolean(getToken());
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { config, stats, loading, error } = useLandingPublic({ enabled: !isAuthed });

    // Running ticker helpers: measure and repeat content so marquee never shows blank on wide screens
    const tickerContainerRef = useRef<HTMLDivElement | null>(null);
    const tickerGroupRef = useRef<HTMLDivElement | null>(null);
    const measureRef = useRef<HTMLDivElement | null>(null);
    const [tickerRepeat, setTickerRepeat] = useState(2);

    useLayoutEffect(() => {
        function updateRepeat() {
            const container = tickerContainerRef.current;
            const measure = measureRef.current;
            if (!container || !measure) return;

            const containerW = container.clientWidth || 0;
            const singleW = measure.clientWidth || 0;
            if (singleW <= 0) return;

            // compute minimal repeat count so (singleW * repeats) * 2 >= containerW
            const repeats = Math.max(1, Math.ceil(containerW / (singleW * 2)));
            setTickerRepeat((prev) => (prev === repeats ? prev : repeats));
        }

        updateRepeat();
        let raf = 0;
        let timer: any = null;
        const onResize = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(updateRepeat);
            clearTimeout(timer);
            timer = setTimeout(updateRepeat, 150);
        };

        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
            cancelAnimationFrame(raf);
            clearTimeout(timer);
        };
    }, [config?.runningText?.text]);

    if (isAuthed) return <Navigate to="/dashboard" replace />;

    const runningTextEnabled = Boolean(config?.runningText?.enabled);
    const runningText = String(config?.runningText?.text || '').trim();

    const partnersEnabled = Boolean(config?.partners?.enabled);
    const partnerItems = (config?.partners?.items || [])
        .filter((x) => x && x.enabled)
        .slice()
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    const faqEnabled = Boolean(config?.faq?.enabled);
    const faqItems = (config?.faq?.items || [])
        .filter((x) => x && x.enabled)
        .slice()
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-secondary/10">
            {/* Top bar */}
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
                                    className="text-sm font-bold text-slate-700 hover:text-primary"
                                >
                                    Panduan PKWT
                                </Link>
                                <Link
                                    to="/pkwtt"
                                    className="text-sm font-bold text-slate-700 hover:text-primary"
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

            {/* Mobile menu overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-20">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
                    <div className="absolute top-0 right-0 w-64 bg-white shadow-lg p-4">
                        <Link
                            to="/pkwt"
                            className="block px-4 py-2 rounded text-base font-semibold text-slate-700 hover:bg-slate-50"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Panduan PKWT
                        </Link>
                        <Link
                            to="/pkwtt"
                            className="block px-4 py-2 rounded text-base font-semibold text-slate-700 hover:bg-slate-50"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Panduan PKWTT
                        </Link>
                        <div className="my-2 border-t border-slate-200" />
                        <Link to="/login" className="block px-4 py-2 rounded text-base font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>
                            Masuk Perusahaan
                        </Link>
                    </div>
                </div>
            )}

            <main>
                {/* (1) Hero full image */}
                <section className="relative overflow-hidden">
                    <img
                        src="/hero-section.jpg"
                        alt="Hero"
                        className="block w-full h-auto object-contain"
                        loading="eager"
                    />
                </section>

                {/* Loading/Error ribbon */}
                {(loading || error) && (
                    <section className="border-b border-slate-200 bg-white">
                        <div className="mx-auto max-w-6xl px-4 py-4">
                            {loading && <div className="text-sm text-slate-600">Memuat informasi landing page...</div>}
                            {!loading && error && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* (2) Running text */}
                {runningTextEnabled && runningText && (
                    <section className="border-y border-primary/10 bg-gradient-to-r from-secondary/20 via-white to-secondary/20 shadow-sm">
                        <div className="mx-auto max-w-6xl px-6 py-4">
                            <div className="landing-ticker" aria-label="Pengumuman berjalan" ref={tickerContainerRef}>
                                {/* Hidden measurement element (single copy) used to compute required repeats */}
                                <div
                                    ref={measureRef}
                                    aria-hidden
                                    style={{ position: 'absolute', left: -9999, top: 0, whiteSpace: 'nowrap', visibility: 'hidden', pointerEvents: 'none' }}
                                >
                                    <span className="landing-ticker__item inline-block">{runningText}</span>
                                    <span className="landing-ticker__sep">•</span>
                                </div>

                                <div className="landing-ticker__track">
                                    {/* Group that will be duplicated for seamless scroll */}
                                    <div className="landing-ticker__group" ref={tickerGroupRef}>
                                        {Array.from({ length: tickerRepeat }).map((_, i) => (
                                            <span key={`run-${i}`} className="landing-ticker__item inline-block">
                                                {runningText}
                                            </span>
                                        ))}
                                        <span className="landing-ticker__sep">•</span>
                                    </div>

                                    {/* ARIA hidden duplicate group (for continuous loop) */}
                                    <div className="landing-ticker__group" aria-hidden>
                                        {Array.from({ length: tickerRepeat }).map((_, i) => (
                                            <span key={`run2-${i}`} className="landing-ticker__item inline-block">
                                                {runningText}
                                            </span>
                                        ))}
                                        <span className="landing-ticker__sep">•</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                <section className="mx-auto max-w-6xl space-y-16 px-6 py-16">
                    {/* (3) Ucapan */}
                    {config?.ucapan?.enabled && (
                        <div className="group relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-white via-primary/5 to-secondary/10 p-10 shadow-2xl shadow-primary/10 transition-all duration-500 hover:shadow-3xl hover:shadow-primary/20 md:p-12">
                            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl transition-transform duration-700 group-hover:scale-150"></div>
                            <div className="relative">
                                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-2">
                                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                                    <div className="text-xs font-black uppercase tracking-widest text-primary">Sambutan</div>
                                </div>
                                <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
                                    {config?.ucapan?.title || 'Selamat datang di E-PKWT'}
                                </h1>
                                <p className="mt-6 max-w-3xl whitespace-pre-line text-base leading-relaxed text-slate-700 md:text-lg">
                                    {config?.ucapan?.body ||
                                        'Platform ini membantu pencatatan dan pemantauan kontrak kerja secara lebih transparan, rapi, dan terukur.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* (4) Hardcoded CTA: daftar / masuk */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-slate-200">
                            <div className="text-lg font-bold text-slate-900">Daftar Perusahaan</div>
                            <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                Pendaftaran perusahaan dilakukan melalui verifikasi pihak berwenang.
                            </p>
                            <a
                                href="https://adikara.vercel.app/register/company"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-6 inline-flex items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-all duration-300 hover:border-slate-400 hover:bg-slate-50"
                            >
                                Daftar Perusahaan
                            </a>
                        </div>

                        <div className="group relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/20 via-white to-secondary/30 p-8 shadow-xl shadow-primary/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/30">
                            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-3xl transition-transform duration-500 group-hover:scale-150"></div>
                            <div className="relative">
                                <div className="text-lg font-bold text-slate-900">Masuk Perusahaan</div>
                                <p className="mt-3 text-sm leading-relaxed text-slate-700">Masuk untuk membuat pengajuan, upload berkas, dan memantau status.</p>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary/90 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/40"
                                    >
                                        Login Perusahaan
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* (5) Stats (cached 24h from DB) */}
                    <div>
                        <div className="mb-8 flex items-end justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-2">
                                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                                    <div className="text-xs font-black uppercase tracking-widest text-primary">Live Data</div>
                                </div>
                                <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">Statistik Real-Time</h2>
                                <p className="mt-2 text-sm text-slate-600">Data real dari sistem, diperbarui otomatis setiap 24 jam.</p>
                            </div>
                            {stats?.refreshedAt && (
                                <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">Update: {new Date(stats.refreshedAt).toLocaleString('id-ID')}</div>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <StatCard label="Total Perusahaan" value={formatNumberId(stats?.companyRegistered)} />
                            <StatCard label="Total Karyawan PKWT" value={formatNumberId(stats?.contractEmployeesRegistered)} />
                            <StatCard label="Total Karyawan PKWTT" value={formatNumberId(stats?.permanentEmployeesRegistered)} />
                        </div>
                    </div>

                    {/* (6) Partner logos running images */}
                    {partnersEnabled && (
                        <div className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-white via-slate-50 to-primary/5 p-10 shadow-xl shadow-primary/10">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-2">
                                        <div className="h-2 w-2 rounded-full bg-secondary animate-pulse"></div>
                                        <div className="text-xs font-black uppercase tracking-widest text-primary">Partners</div>
                                    </div>
                                    <h2 className="mt-4 text-2xl font-black text-slate-900">{config?.partners?.title || 'Mitra Kami'}</h2>
                                </div>
                            </div>

                            {partnerItems.length > 0 ? (
                                <div className="mt-5">
                                    <Marquee>
                                        <div className="flex items-center gap-10 pr-10">
                                            {partnerItems.map((p) => {
                                                const url = resolveUploadUrl(p.image_path);
                                                return (
                                                    <img
                                                        key={p.id}
                                                        src={url || ''}
                                                        alt={p.alt || 'Partner'}
                                                        className="h-10 w-auto opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0"
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            // hide broken images to avoid layout shifts
                                                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </Marquee>
                                </div>
                            ) : (
                                <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                                    Belum ada logo mitra yang ditampilkan.
                                </div>
                            )}
                        </div>
                    )}

                    {/* (7) FAQ */}
                    {faqEnabled && (
                        <div className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-white via-slate-50 to-secondary/5 p-10 shadow-xl shadow-primary/10">
                            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-2">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                                <div className="text-xs font-black uppercase tracking-widest text-primary">Bantuan</div>
                            </div>
                            <h2 className="mt-4 text-2xl font-black text-slate-900">{config?.faq?.title || 'Pertanyaan Umum'}</h2>
                            {faqItems.length > 0 ? (
                                <div className="mt-6 space-y-3">
                                    {faqItems.map((it) => (
                                        <details key={it.id} className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:border-primary/30 hover:shadow-md">
                                            <summary className="cursor-pointer list-none select-none p-5 font-bold text-slate-900 transition-colors hover:text-primary">
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-base">{it.question}</span>
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 group-open:rotate-45 group-open:bg-primary group-open:text-white">+</span>
                                                </div>
                                            </summary>
                                            <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                                                {it.answer}
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                                    Belum ada pertanyaan yang ditampilkan.
                                </div>
                            )}
                        </div>
                    )}

                    {/* (8) Contact */}
                    {config?.contact?.enabled && (
                        <div id="contact" className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-white via-primary/5 to-secondary/10 p-10 shadow-xl shadow-primary/10">
                            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-2">
                                <div className="h-2 w-2 rounded-full bg-secondary animate-pulse"></div>
                                <div className="text-xs font-black uppercase tracking-widest text-primary">Hubungi Kami</div>
                            </div>
                            <h2 className="mt-4 text-2xl font-black text-slate-900">{config?.contact?.title || 'Kontak'}</h2>
                            <div className="mt-8 grid gap-6 md:grid-cols-3">
                                <div className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-white p-6 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20">
                                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-2xl"></div>
                                    <div className="relative">
                                        <div className="text-xs font-black uppercase tracking-widest text-slate-600">Telepon</div>
                                        <a
                                            href={config?.contact?.phone ? `tel:${config.contact.phone}` : undefined}
                                            className="mt-2 block text-base font-bold text-primary transition-colors hover:text-primary/80 hover:underline"
                                        >
                                            {config?.contact?.phone || '-'}
                                        </a>
                                    </div>
                                </div>
                                <div className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-white p-6 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20">
                                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-secondary/10 to-transparent blur-2xl"></div>
                                    <div className="relative">
                                        <div className="text-xs font-black uppercase tracking-widest text-slate-600">Email</div>
                                        <a
                                            href={config?.contact?.email ? `mailto:${config.contact.email}` : undefined}
                                            className="mt-2 block text-base font-bold text-primary transition-colors hover:text-primary/80 hover:underline"
                                        >
                                            {config?.contact?.email || '-'}
                                        </a>
                                    </div>
                                </div>
                                <div className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-white p-6 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20">
                                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-2xl"></div>
                                    <div className="relative">
                                        <div className="text-xs font-black uppercase tracking-widest text-slate-600">Alamat</div>
                                        <div className="mt-2 whitespace-pre-line text-sm font-bold text-slate-900">
                                            {config?.contact?.address || '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            <footer className="border-t border-primary/10 bg-gradient-to-r from-primary/5 via-white to-secondary/5">
                <div className="mx-auto max-w-6xl px-6 py-10">
                    <div className="text-base font-black text-slate-900">SIAP PKWT</div>
                    <div className="mt-2 text-xs font-semibold text-slate-600">© {new Date().getFullYear()} • Sistem Elektronik Perjanjian Kerja Waktu Tertentu</div>
                </div>
            </footer>
        </div>
    );
}
