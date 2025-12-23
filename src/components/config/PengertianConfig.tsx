import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { GuideConfig, ListItem, QAItem } from '../../hooks/useGuideConfig';

interface PengertianConfigProps {
    config: GuideConfig;
    onChange: (config: GuideConfig) => void;
}

export default function PengertianConfig({ config, onChange }: PengertianConfigProps) {
    const updateSection = (field: keyof GuideConfig['pengertianSection'], value: any) => {
        onChange({
            ...config,
            pengertianSection: { ...config.pengertianSection, [field]: value },
        });
    };

    const updateCard = (cardKey: 'karakteristik' | 'kapanDigunakan' | 'pertanyaanUmum', updates: any) => {
        onChange({
            ...config,
            pengertianSection: {
                ...config.pengertianSection,
                cards: {
                    ...config.pengertianSection.cards,
                    [cardKey]: { ...config.pengertianSection.cards[cardKey], ...updates },
                },
            },
        });
    };

    const addListItem = (cardKey: 'karakteristik' | 'kapanDigunakan') => {
        const card = config.pengertianSection.cards[cardKey];
        const maxOrder = Math.max(...card.items.map((item: any) => item.order), 0);
        const newItem: ListItem = {
            id: `item-${Date.now()}`,
            text: 'Item baru',
            order: maxOrder + 1,
            enabled: true,
        };
        updateCard(cardKey, { items: [...card.items, newItem] });
    };

    const addQAItem = () => {
        const card = config.pengertianSection.cards.pertanyaanUmum;
        const maxOrder = Math.max(...card.items.map((item: any) => item.order), 0);
        const newItem: QAItem = {
            id: `qa-${Date.now()}`,
            question: 'Pertanyaan baru?',
            answer: 'Jawaban baru',
            order: maxOrder + 1,
            enabled: true,
        };
        updateCard('pertanyaanUmum', { items: [...card.items, newItem] });
    };

    const updateListItem = (cardKey: 'karakteristik' | 'kapanDigunakan', itemId: string, field: keyof ListItem, value: any) => {
        const card = config.pengertianSection.cards[cardKey];
        const items = card.items.map((item: any) =>
            item.id === itemId ? { ...item, [field]: value } : item
        );
        updateCard(cardKey, { items });
    };

    const updateQAItem = (itemId: string, field: keyof QAItem, value: any) => {
        const card = config.pengertianSection.cards.pertanyaanUmum;
        const items = card.items.map((item: any) =>
            item.id === itemId ? { ...item, [field]: value } : item
        );
        updateCard('pertanyaanUmum', { items });
    };

    const deleteItem = (cardKey: 'karakteristik' | 'kapanDigunakan' | 'pertanyaanUmum', itemId: string) => {
        const card = config.pengertianSection.cards[cardKey];
        const items = card.items.filter((item: any) => item.id !== itemId);
        updateCard(cardKey, { items });
    };

    const moveItem = (cardKey: 'karakteristik' | 'kapanDigunakan' | 'pertanyaanUmum', itemId: string, direction: 'up' | 'down') => {
        const card = config.pengertianSection.cards[cardKey];
        const items = [...card.items];
        const index = items.findIndex((item: any) => item.id === itemId);

        if (direction === 'up' && index > 0) {
            [items[index], items[index - 1]] = [items[index - 1], items[index]];
        } else if (direction === 'down' && index < items.length - 1) {
            [items[index], items[index + 1]] = [items[index + 1], items[index]];
        }

        // Update order values
        items.forEach((item: any, idx) => {
            item.order = idx + 1;
        });

        updateCard(cardKey, { items });
    };

    return (
        <div className="space-y-6">
            {/* Section Settings */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">Section Settings</h3>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={config.pengertianSection.enabled}
                            onChange={(e) => updateSection('enabled', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-slate-600">Aktif</span>
                    </label>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Section Title</label>
                        <input
                            type="text"
                            value={config.pengertianSection.title}
                            onChange={(e) => updateSection('title', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Section Subtitle</label>
                        <input
                            type="text"
                            value={config.pengertianSection.subtitle}
                            onChange={(e) => updateSection('subtitle', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>
            </div>

            {/* Karakteristik Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">Karakteristik PKWT</h3>
                        <input
                            type="text"
                            value={config.pengertianSection.cards.karakteristik.title}
                            onChange={(e) => updateCard('karakteristik', { title: e.target.value })}
                            className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-sm"
                        />
                    </div>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={config.pengertianSection.cards.karakteristik.enabled}
                            onChange={(e) => updateCard('karakteristik', { enabled: e.target.checked })}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-slate-600">Aktif</span>
                    </label>
                </div>

                <div className="space-y-2">
                    {(config.pengertianSection.cards.karakteristik.items as ListItem[]).map((item, index) => (
                        <div key={item.id} className="flex items-start gap-2 rounded-lg border bg-slate-50 p-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={item.enabled}
                                    onChange={(e) => updateListItem('karakteristik', item.id, 'enabled', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
                                />
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                    {index + 1}
                                </span>
                            </div>

                            <input
                                type="text"
                                value={item.text}
                                onChange={(e) => updateListItem('karakteristik', item.id, 'text', e.target.value)}
                                className="flex-1 rounded border border-slate-200 px-2 py-1 text-sm"
                            />

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => moveItem('karakteristik', item.id, 'up')}
                                    disabled={index === 0}
                                    className="rounded p-1 hover:bg-slate-200 disabled:opacity-30"
                                >
                                    <ChevronUp className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => moveItem('karakteristik', item.id, 'down')}
                                    disabled={index === config.pengertianSection.cards.karakteristik.items.length - 1}
                                    className="rounded p-1 hover:bg-slate-200 disabled:opacity-30"
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => deleteItem('karakteristik', item.id)}
                                    className="rounded p-1 text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => addListItem('karakteristik')}
                    className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-primary hover:text-primary"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Item
                </button>
            </div>

            {/* Kapan Digunakan Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">Kapan Digunakan?</h3>
                        <input
                            type="text"
                            value={config.pengertianSection.cards.kapanDigunakan.title}
                            onChange={(e) => updateCard('kapanDigunakan', { title: e.target.value })}
                            className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-sm"
                        />
                    </div>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={config.pengertianSection.cards.kapanDigunakan.enabled}
                            onChange={(e) => updateCard('kapanDigunakan', { enabled: e.target.checked })}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-slate-600">Aktif</span>
                    </label>
                </div>

                <div className="space-y-2">
                    {(config.pengertianSection.cards.kapanDigunakan.items as ListItem[]).map((item, index) => (
                        <div key={item.id} className="flex items-start gap-2 rounded-lg border bg-slate-50 p-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={item.enabled}
                                    onChange={(e) => updateListItem('kapanDigunakan', item.id, 'enabled', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
                                />
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-600">
                                    ✓
                                </span>
                            </div>

                            <input
                                type="text"
                                value={item.text}
                                onChange={(e) => updateListItem('kapanDigunakan', item.id, 'text', e.target.value)}
                                className="flex-1 rounded border border-slate-200 px-2 py-1 text-sm"
                            />

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => moveItem('kapanDigunakan', item.id, 'up')}
                                    disabled={index === 0}
                                    className="rounded p-1 hover:bg-slate-200 disabled:opacity-30"
                                >
                                    <ChevronUp className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => moveItem('kapanDigunakan', item.id, 'down')}
                                    disabled={index === config.pengertianSection.cards.kapanDigunakan.items.length - 1}
                                    className="rounded p-1 hover:bg-slate-200 disabled:opacity-30"
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => deleteItem('kapanDigunakan', item.id)}
                                    className="rounded p-1 text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => addListItem('kapanDigunakan')}
                    className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-primary hover:text-primary"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Item
                </button>
            </div>

            {/* Pertanyaan Umum Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">Pertanyaan Umum (FAQ)</h3>
                        <input
                            type="text"
                            value={config.pengertianSection.cards.pertanyaanUmum.title}
                            onChange={(e) => updateCard('pertanyaanUmum', { title: e.target.value })}
                            className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-sm"
                        />
                    </div>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={config.pengertianSection.cards.pertanyaanUmum.enabled}
                            onChange={(e) => updateCard('pertanyaanUmum', { enabled: e.target.checked })}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-slate-600">Aktif</span>
                    </label>
                </div>

                <div className="space-y-3">
                    {(config.pengertianSection.cards.pertanyaanUmum.items as QAItem[]).map((item, index) => (
                        <div key={item.id} className="rounded-lg border bg-slate-50 p-4">
                            <div className="mb-3 flex items-start gap-2">
                                <input
                                    type="checkbox"
                                    checked={item.enabled}
                                    onChange={(e) => updateQAItem(item.id, 'enabled', e.target.checked)}
                                    className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
                                />
                                <div className="flex-1">
                                    <label className="mb-1 block text-xs font-medium text-slate-600">Pertanyaan</label>
                                    <input
                                        type="text"
                                        value={item.question}
                                        onChange={(e) => updateQAItem(item.id, 'question', e.target.value)}
                                        className="w-full rounded border border-slate-200 px-2 py-1 text-sm font-medium"
                                    />
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => moveItem('pertanyaanUmum', item.id, 'up')}
                                        disabled={index === 0}
                                        className="rounded p-1 hover:bg-slate-200 disabled:opacity-30"
                                    >
                                        <ChevronUp className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => moveItem('pertanyaanUmum', item.id, 'down')}
                                        disabled={index === config.pengertianSection.cards.pertanyaanUmum.items.length - 1}
                                        className="rounded p-1 hover:bg-slate-200 disabled:opacity-30"
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteItem('pertanyaanUmum', item.id)}
                                        className="rounded p-1 text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">Jawaban</label>
                                <textarea
                                    value={item.answer}
                                    onChange={(e) => updateQAItem(item.id, 'answer', e.target.value)}
                                    rows={2}
                                    className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={addQAItem}
                    className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-primary hover:text-primary"
                >
                    <Plus className="h-4 w-4" />
                    Tambah FAQ
                </button>
            </div>
        </div>
    );
}
