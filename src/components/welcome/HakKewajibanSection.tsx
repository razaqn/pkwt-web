import { Heart, Shield } from 'lucide-react';
import type { WelcomeConfig, ListItem } from '../../hooks/useWelcomeConfig';

interface HakKewajibanSectionProps {
    config: WelcomeConfig['hakKewajibanSection'];
}

export function HakKewajibanSection({ config }: HakKewajibanSectionProps) {
    return (
        <div className="rounded-xl border bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-6 shadow-sm">
            <div className="mb-6 bg-gradient-to-r from-emerald-600 to-emerald-500 -mx-6 -mt-6 p-6 rounded-t-xl text-white">
                <h2 className="text-2xl font-bold mb-2">{config.title}</h2>
                <p className="text-emerald-100 text-sm">{config.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Hak Pekerja PKWT */}
                {config.cards.hakPekerja.enabled && (
                    <div className="bg-white rounded-xl border border-green-100 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                                <Heart className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-slate-800">{config.cards.hakPekerja.title}</h3>
                        </div>
                        {config.cards.hakPekerja.items.length > 0 ? (
                            <ul className="space-y-3">
                                {config.cards.hakPekerja.items.map((item) => {
                                    const listItem = item as ListItem;
                                    return (
                                        <li key={item.id} className="flex items-start gap-3">
                                            <div className="mt-1 flex-shrink-0">
                                                <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                                                    <span className="text-white text-xl leading-none">✓</span>
                                                </div>
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

                {/* Kewajiban Pekerja PKWT */}
                {config.cards.kewajibanPekerja.enabled && (
                    <div className="bg-white rounded-xl border border-blue-100 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Shield className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-slate-800">{config.cards.kewajibanPekerja.title}</h3>
                        </div>
                        {config.cards.kewajibanPekerja.items.length > 0 ? (
                            <ul className="space-y-3">
                                {config.cards.kewajibanPekerja.items.map((item) => {
                                    const listItem = item as ListItem;
                                    return (
                                        <li key={item.id} className="flex items-start gap-3">
                                            <div className="mt-1 flex-shrink-0">
                                                <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                                                    <span className="text-white text-xl leading-none">→</span>
                                                </div>
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
        </div>
    );
}
