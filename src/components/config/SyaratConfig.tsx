import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { WelcomeConfig, ListItem } from '../../hooks/useWelcomeConfig';

interface SyaratConfigProps {
    config: WelcomeConfig;
    onChange: (config: WelcomeConfig) => void;
}

export default function SyaratConfig({ config, onChange }: SyaratConfigProps) {
    const updateSection = (field: keyof WelcomeConfig['syaratKetentuanSection'], value: any) => {
        onChange({
            ...config,
            syaratKetentuanSection: { ...config.syaratKetentuanSection, [field]: value },
        });
    };

    const updateCard = (cardKey: 'syaratSah' | 'jenisPekerjaan' | 'persyaratanLegal', updates: any) => {
        onChange({
            ...config,
            syaratKetentuanSection: {
                ...config.syaratKetentuanSection,
                cards: {
                    ...config.syaratKetentuanSection.cards,
                    [cardKey]: { ...config.syaratKetentuanSection.cards[cardKey], ...updates },
                },
            },
        });
    };

    const addListItem = (cardKey: 'syaratSah' | 'jenisPekerjaan' | 'persyaratanLegal') => {
        const card = config.syaratKetentuanSection.cards[cardKey];
        const maxOrder = Math.max(...card.items.map((item: any) => item.order), 0);
        const newItem: ListItem = {
            id: `item-${Date.now()}`,
            text: 'Item baru',
            order: maxOrder + 1,
            enabled: true,
        };
        updateCard(cardKey, { items: [...card.items, newItem] });
    };

    const updateListItem = (cardKey: 'syaratSah' | 'jenisPekerjaan' | 'persyaratanLegal', itemId: string, field: keyof ListItem, value: any) => {
        const card = config.syaratKetentuanSection.cards[cardKey];
        const items = card.items.map((item: any) =>
            item.id === itemId ? { ...item, [field]: value } : item
        );
        updateCard(cardKey, { items });
    };

    const deleteItem = (cardKey: 'syaratSah' | 'jenisPekerjaan' | 'persyaratanLegal', itemId: string) => {
        const card = config.syaratKetentuanSection.cards[cardKey];
        const items = card.items.filter((item: any) => item.id !== itemId);
        updateCard(cardKey, { items });
    };

    const moveItem = (cardKey: 'syaratSah' | 'jenisPekerjaan' | 'persyaratanLegal', itemId: string, direction: 'up' | 'down') => {
        const card = config.syaratKetentuanSection.cards[cardKey];
        const items = [...card.items];
        const index = items.findIndex((item: any) => item.id === itemId);

        if (direction === 'up' && index > 0) {
            [items[index], items[index - 1]] = [items[index - 1], items[index]];
        } else if (direction === 'down' && index < items.length - 1) {
            [items[index], items[index + 1]] = [items[index + 1], items[index]];
        }

        items.forEach((item: any, idx) => {
            item.order = idx + 1;
        });

        updateCard(cardKey, { items });
    };

    const renderCard = (
        cardKey: 'syaratSah' | 'jenisPekerjaan' | 'persyaratanLegal',
        cardTitle: string,
        badgeColor: string
    ) => {
        const card = config.syaratKetentuanSection.cards[cardKey];

        return (
            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">{cardTitle}</h3>
                        <input
                            type="text"
                            value={card.title}
                            onChange={(e) => updateCard(cardKey, { title: e.target.value })}
                            className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-sm"
                        />
                    </div>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={card.enabled}
                            onChange={(e) => updateCard(cardKey, { enabled: e.target.checked })}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-600">Aktif</span>
                    </label>
                </div>

                <div className="space-y-2">
                    {(card.items as ListItem[]).map((item, index) => (
                        <div key={item.id} className="flex items-start gap-2 rounded-lg border bg-slate-50 p-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={item.enabled}
                                    onChange={(e) => updateListItem(cardKey, item.id, 'enabled', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                                />
                                <span className={`flex h-6 w-6 items-center justify-center rounded-full ${badgeColor} text-xs font-semibold`}>
                                    {index + 1}
                                </span>
                            </div>

                            <input
                                type="text"
                                value={item.text}
                                onChange={(e) => updateListItem(cardKey, item.id, 'text', e.target.value)}
                                className="flex-1 rounded border border-slate-200 px-2 py-1 text-sm"
                            />

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => moveItem(cardKey, item.id, 'up')}
                                    disabled={index === 0}
                                    className="rounded p-1 hover:bg-slate-200 disabled:opacity-30"
                                >
                                    <ChevronUp className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => moveItem(cardKey, item.id, 'down')}
                                    disabled={index === card.items.length - 1}
                                    className="rounded p-1 hover:bg-slate-200 disabled:opacity-30"
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => deleteItem(cardKey, item.id)}
                                    className="rounded p-1 text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => addListItem(cardKey)}
                    className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-blue-500 hover:text-blue-600"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Item
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Section Settings */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">Section Settings</h3>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={config.syaratKetentuanSection.enabled}
                            onChange={(e) => updateSection('enabled', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-600">Aktif</span>
                    </label>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Section Title</label>
                        <input
                            type="text"
                            value={config.syaratKetentuanSection.title}
                            onChange={(e) => updateSection('title', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Section Subtitle</label>
                        <input
                            type="text"
                            value={config.syaratKetentuanSection.subtitle}
                            onChange={(e) => updateSection('subtitle', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Cards */}
            {renderCard('syaratSah', 'Syarat Sah PKWT', 'bg-purple-100 text-purple-600')}
            {renderCard('jenisPekerjaan', 'Jenis Pekerjaan yang Bisa PKWT', 'bg-pink-100 text-pink-600')}
            {renderCard('persyaratanLegal', 'Persyaratan Legal', 'bg-blue-100 text-blue-600')}
        </div>
    );
}
