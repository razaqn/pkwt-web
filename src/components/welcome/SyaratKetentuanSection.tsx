import { FileText, Briefcase, Scale } from 'lucide-react';
import type { WelcomeConfig, ListItem } from '../../hooks/useWelcomeConfig';

interface SyaratKetentuanSectionProps {
    config: WelcomeConfig['syaratKetentuanSection'];
}

export function SyaratKetentuanSection({ config }: SyaratKetentuanSectionProps) {
    return (
        <div className="rounded-xl border bg-gradient-to-br from-indigo-50 via-white to-indigo-50 p-6 shadow-sm">
            <div className="mb-6 bg-gradient-to-r from-indigo-600 to-indigo-500 -mx-6 -mt-6 p-6 rounded-t-xl text-white">
                <h2 className="text-2xl font-bold mb-2">{config.title}</h2>
                <p className="text-indigo-100 text-sm">{config.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Syarat Sah PKWT */}
                {config.cards.syaratSah.enabled && (
                    <div className="bg-white rounded-xl border border-purple-100 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-slate-800">{config.cards.syaratSah.title}</h3>
                        </div>
                        {config.cards.syaratSah.items.length > 0 ? (
                            <ul className="space-y-3">
                                {config.cards.syaratSah.items.map((item, index) => {
                                    const listItem = item as ListItem;
                                    return (
                                        <li key={item.id} className="flex items-start gap-3">
                                            <div className="mt-1 h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
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

                {/* Jenis Pekerjaan yang Bisa PKWT */}
                {config.cards.jenisPekerjaan.enabled && (
                    <div className="bg-white rounded-xl border border-pink-100 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-pink-100 flex items-center justify-center">
                                <Briefcase className="h-5 w-5 text-pink-600" />
                            </div>
                            <h3 className="font-semibold text-slate-800">{config.cards.jenisPekerjaan.title}</h3>
                        </div>
                        {config.cards.jenisPekerjaan.items.length > 0 ? (
                            <ul className="space-y-3">
                                {config.cards.jenisPekerjaan.items.map((item, index) => {
                                    const listItem = item as ListItem;
                                    return (
                                        <li key={item.id} className="flex items-start gap-3">
                                            <div className="mt-1 h-6 w-6 rounded-full bg-pink-600 flex items-center justify-center flex-shrink-0">
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
            </div>

            {/* Persyaratan Legal */}
            {config.cards.persyaratanLegal.enabled && (
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                            <Scale className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-lg font-bold">{config.cards.persyaratanLegal.title}</h3>
                    </div>
                    {config.cards.persyaratanLegal.items.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-4">
                            {config.cards.persyaratanLegal.items.map((item) => {
                                const listItem = item as ListItem;
                                return (
                                    <div key={item.id} className="bg-white/10 rounded-lg p-4 backdrop-blur">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center">
                                                <span className="text-blue-600 text-xs font-bold">✓</span>
                                            </div>
                                            <p className="font-medium text-sm">{listItem.text}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-white/70 italic">Belum ada item</p>
                    )}
                </div>
            )}
        </div>
    );
}
