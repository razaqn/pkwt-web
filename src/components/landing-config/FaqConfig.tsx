import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import type { LandingConfig } from '../../lib/api';

type FaqItem = LandingConfig['faq']['items'][number];

function newId(prefix: string) {
    const rnd = Math.random().toString(16).slice(2);
    return `${prefix}-${Date.now()}-${rnd}`;
}

function normalizeOrders(items: FaqItem[]): FaqItem[] {
    return items
        .slice()
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((it, idx) => ({ ...it, order: idx + 1 }));
}

interface FaqConfigProps {
    config: LandingConfig;
    onChange: (config: LandingConfig) => void;
}

export default function FaqConfig({ config, onChange }: FaqConfigProps) {
    const updateFaq = (updates: Partial<LandingConfig['faq']>) => {
        onChange({
            ...config,
            faq: {
                ...config.faq,
                ...updates,
            },
        });
    };

    const items = normalizeOrders(config.faq.items || []);

    const updateItem = (id: string, updates: Partial<FaqItem>) => {
        const next = items.map((it) => (it.id === id ? { ...it, ...updates } : it));
        updateFaq({ items: normalizeOrders(next) });
    };

    const addItem = () => {
        const next: FaqItem[] = [
            ...items,
            { id: newId('faq'), question: '', answer: '', enabled: true, order: items.length + 1 },
        ];
        updateFaq({ items: normalizeOrders(next) });
    };

    const removeItem = (id: string) => {
        const next = items.filter((it) => it.id !== id);
        updateFaq({ items: normalizeOrders(next) });
    };

    const move = (id: string, dir: -1 | 1) => {
        const idx = items.findIndex((x) => x.id === id);
        if (idx < 0) return;
        const target = idx + dir;
        if (target < 0 || target >= items.length) return;
        const next = items.slice();
        const tmp = next[idx];
        next[idx] = next[target];
        next[target] = tmp;
        updateFaq({ items: normalizeOrders(next) });
    };

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">FAQ</h3>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={config.faq.enabled}
                            onChange={(e) => updateFaq({ enabled: e.target.checked })}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-slate-600">Aktif</span>
                    </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Judul Section</label>
                        <input
                            type="text"
                            value={config.faq.title}
                            onChange={(e) => updateFaq({ title: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="FAQ"
                        />
                    </div>
                    <div className="flex items-end justify-end">
                        <button
                            type="button"
                            onClick={addItem}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Pertanyaan
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {items.map((it, idx) => (
                    <div key={it.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={it.enabled}
                                        onChange={(e) => updateItem(it.id, { enabled: e.target.checked })}
                                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
                                    />
                                    <span className="text-sm text-slate-600">Tampil</span>
                                </label>
                                <span className="text-xs text-slate-500">Urutan #{idx + 1}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => move(it.id, -1)}
                                    disabled={idx === 0}
                                    className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                    title="Naik"
                                >
                                    <ChevronUp className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => move(it.id, 1)}
                                    disabled={idx === items.length - 1}
                                    className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                    title="Turun"
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeItem(it.id)}
                                    className="rounded-lg border border-red-200 bg-white p-2 text-red-700 hover:bg-red-50"
                                    title="Hapus"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Pertanyaan</label>
                                <input
                                    type="text"
                                    value={it.question}
                                    onChange={(e) => updateItem(it.id, { question: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Contoh: Bagaimana cara login?"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Jawaban</label>
                                <textarea
                                    value={it.answer}
                                    onChange={(e) => updateItem(it.id, { answer: e.target.value })}
                                    rows={4}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Tulis jawaban..."
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {items.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600">
                        Belum ada FAQ. Klik <span className="font-semibold">Tambah Pertanyaan</span>.
                    </div>
                )}
            </div>
        </div>
    );
}
