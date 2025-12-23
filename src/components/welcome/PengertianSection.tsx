import { Info, CheckCircle } from 'lucide-react';
import type { GuideConfig, ListItem, QAItem } from '../../hooks/useGuideConfig';

interface PengertianSectionProps {
    config: GuideConfig['pengertianSection'];
}

export function PengertianSection({ config }: PengertianSectionProps) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 bg-gradient-to-r from-[#419823] to-[#2f7d1a] -mx-6 -mt-6 p-6 rounded-t-xl text-white">
                <h2 className="text-2xl font-bold mb-2">{config.title}</h2>
                <p className="text-white/85 text-sm">{config.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Karakteristik PKWT */}
                {config.cards.karakteristik.enabled && (
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-[#419823]/10 flex items-center justify-center">
                                <Info className="h-5 w-5 text-[#419823]" />
                            </div>
                            <h3 className="font-semibold text-slate-800">{config.cards.karakteristik.title}</h3>
                        </div>
                        {config.cards.karakteristik.items.length > 0 ? (
                            <ul className="space-y-3">
                                {config.cards.karakteristik.items.map((item, index) => {
                                    const listItem = item as ListItem;
                                    return (
                                        <li key={item.id} className="flex items-start gap-3">
                                            <div className="mt-1 h-6 w-6 rounded-full bg-[#419823] flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-xs font-semibold">{index + 1}</span>
                                            </div>
                                            <span className="text-slate-700 text-sm">{listItem.text}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-500 italic">Belum ada item</p>
                        )}
                    </div>
                )}

                {/* Kapan Digunakan */}
                {config.cards.kapanDigunakan.enabled && (
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-[#F4D348]/25 flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-slate-900" />
                            </div>
                            <h3 className="font-semibold text-slate-800">{config.cards.kapanDigunakan.title}</h3>
                        </div>
                        {config.cards.kapanDigunakan.items.length > 0 ? (
                            <ul className="space-y-3">
                                {config.cards.kapanDigunakan.items.map((item) => {
                                    const listItem = item as ListItem;
                                    return (
                                        <li key={item.id} className="flex items-start gap-3">
                                            <div className="mt-1 h-6 w-6 rounded-full bg-[#419823] flex items-center justify-center flex-shrink-0">
                                                <CheckCircle className="h-4 w-4 text-white" />
                                            </div>
                                            <span className="text-slate-700 text-sm">{listItem.text}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-500 italic">Belum ada item</p>
                        )}
                    </div>
                )}
            </div>

            {/* Pertanyaan Umum */}
            {config.cards.pertanyaanUmum.enabled && (
                <div className="mt-6 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 rounded-lg bg-[#F4D348]/25 flex items-center justify-center">
                            <span className="text-slate-900 text-lg font-bold">?</span>
                        </div>
                        <h3 className="font-semibold text-slate-800">{config.cards.pertanyaanUmum.title}</h3>
                    </div>
                    {config.cards.pertanyaanUmum.items.length > 0 ? (
                        <div className="space-y-4">
                            {config.cards.pertanyaanUmum.items.map((item) => {
                                const qaItem = item as QAItem;
                                return (
                                    <div key={item.id} className="border-l-4 border-[#419823] pl-4 py-2 bg-[#419823]/5 rounded-r">
                                        <p className="text-sm font-semibold text-[#2f7d1a] mb-1">Q: {qaItem.question}</p>
                                        <p className="text-sm text-slate-600">A: {qaItem.answer}</p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 italic">Belum ada item</p>
                    )}
                </div>
            )}
        </div>
    );
}
