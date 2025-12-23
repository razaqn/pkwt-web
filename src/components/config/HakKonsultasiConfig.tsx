import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { GuideConfig, ListItem, ContactItem } from '../../hooks/useGuideConfig';

interface HakKonsultasiConfigProps {
    config: GuideConfig;
    onChange: (config: GuideConfig) => void;
}

const CONTACT_TYPES = [
    { value: 'phone', label: 'Telepon', icon: 'Phone' },
    { value: 'email', label: 'Email', icon: 'Mail' },
    { value: 'address', label: 'Alamat', icon: 'MapPin' },
    { value: 'custom', label: 'Custom', icon: 'Globe' },
];

const COLOR_OPTIONS = [
    { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
    { value: 'green', label: 'Green', class: 'bg-green-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
    { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
    { value: 'red', label: 'Red', class: 'bg-red-500' },
];

export default function HakKonsultasiConfig({ config, onChange }: HakKonsultasiConfigProps) {
    // Hak & Kewajiban Section Updates
    const updateHakKewajibanSection = (field: keyof GuideConfig['hakKewajibanSection'], value: any) => {
        onChange({
            ...config,
            hakKewajibanSection: { ...config.hakKewajibanSection, [field]: value },
        });
    };

    const updateHakKewajibanCard = (cardKey: 'hakPekerja' | 'kewajibanPekerja', updates: any) => {
        onChange({
            ...config,
            hakKewajibanSection: {
                ...config.hakKewajibanSection,
                cards: {
                    ...config.hakKewajibanSection.cards,
                    [cardKey]: { ...config.hakKewajibanSection.cards[cardKey], ...updates },
                },
            },
        });
    };

    const addHakKewajibanItem = (cardKey: 'hakPekerja' | 'kewajibanPekerja') => {
        const card = config.hakKewajibanSection.cards[cardKey];
        const maxOrder = Math.max(...card.items.map((item: any) => item.order), 0);
        const newItem: ListItem = {
            id: `item-${Date.now()}`,
            text: 'Item baru',
            order: maxOrder + 1,
            enabled: true,
        };
        updateHakKewajibanCard(cardKey, { items: [...card.items, newItem] });
    };

    const updateHakKewajibanItem = (cardKey: 'hakPekerja' | 'kewajibanPekerja', itemId: string, field: keyof ListItem, value: any) => {
        const card = config.hakKewajibanSection.cards[cardKey];
        const items = card.items.map((item: any) =>
            item.id === itemId ? { ...item, [field]: value } : item
        );
        updateHakKewajibanCard(cardKey, { items });
    };

    const deleteHakKewajibanItem = (cardKey: 'hakPekerja' | 'kewajibanPekerja', itemId: string) => {
        const card = config.hakKewajibanSection.cards[cardKey];
        const items = card.items.filter((item: any) => item.id !== itemId);
        updateHakKewajibanCard(cardKey, { items });
    };

    const moveHakKewajibanItem = (cardKey: 'hakPekerja' | 'kewajibanPekerja', itemId: string, direction: 'up' | 'down') => {
        const card = config.hakKewajibanSection.cards[cardKey];
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

        updateHakKewajibanCard(cardKey, { items });
    };

    // Konsultasi Section Updates
    const updateKonsultasiSection = (field: keyof GuideConfig['konsultasiSection'], value: any) => {
        onChange({
            ...config,
            konsultasiSection: { ...config.konsultasiSection, [field]: value },
        });
    };

    const updateLayananKonsultasi = (updates: any) => {
        onChange({
            ...config,
            konsultasiSection: {
                ...config.konsultasiSection,
                cards: {
                    ...config.konsultasiSection.cards,
                    layananKonsultasi: { ...config.konsultasiSection.cards.layananKonsultasi, ...updates },
                },
            },
        });
    };

    const addLayananItem = () => {
        const card = config.konsultasiSection.cards.layananKonsultasi;
        const maxOrder = Math.max(...card.items.map((item: any) => item.order), 0);
        const newItem: ListItem = {
            id: `item-${Date.now()}`,
            text: 'Layanan baru',
            order: maxOrder + 1,
            enabled: true,
        };
        updateLayananKonsultasi({ items: [...card.items, newItem] });
    };

    const updateLayananItem = (itemId: string, field: keyof ListItem, value: any) => {
        const card = config.konsultasiSection.cards.layananKonsultasi;
        const items = card.items.map((item: any) =>
            item.id === itemId ? { ...item, [field]: value } : item
        );
        updateLayananKonsultasi({ items });
    };

    const deleteLayananItem = (itemId: string) => {
        const card = config.konsultasiSection.cards.layananKonsultasi;
        const items = card.items.filter((item: any) => item.id !== itemId);
        updateLayananKonsultasi({ items });
    };

    const moveLayananItem = (itemId: string, direction: 'up' | 'down') => {
        const card = config.konsultasiSection.cards.layananKonsultasi;
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

        updateLayananKonsultasi({ items });
    };

    // Contact Info Updates
    const updateHubungiKami = (updates: any) => {
        onChange({
            ...config,
            konsultasiSection: {
                ...config.konsultasiSection,
                cards: {
                    ...config.konsultasiSection.cards,
                    hubungiKami: { ...config.konsultasiSection.cards.hubungiKami, ...updates },
                },
            },
        });
    };

    const addContact = () => {
        const card = config.konsultasiSection.cards.hubungiKami;
        const maxOrder = Math.max(...card.contacts.map(c => c.order), 0);
        const newContact: ContactItem = {
            id: `contact-${Date.now()}`,
            type: 'custom',
            label: 'Label Baru',
            value: '',
            icon: 'Globe',
            color: 'blue',
            enabled: true,
            order: maxOrder + 1,
        };
        updateHubungiKami({ contacts: [...card.contacts, newContact] });
    };

    const updateContact = (contactId: string, field: keyof ContactItem, value: any) => {
        const card = config.konsultasiSection.cards.hubungiKami;
        const contacts = card.contacts.map(contact =>
            contact.id === contactId ? { ...contact, [field]: value } : contact
        );
        updateHubungiKami({ contacts });
    };

    const deleteContact = (contactId: string) => {
        const card = config.konsultasiSection.cards.hubungiKami;
        const contacts = card.contacts.filter(contact => contact.id !== contactId);
        updateHubungiKami({ contacts });
    };

    const moveContact = (contactId: string, direction: 'up' | 'down') => {
        const card = config.konsultasiSection.cards.hubungiKami;
        const contacts = [...card.contacts];
        const index = contacts.findIndex(c => c.id === contactId);

        if (direction === 'up' && index > 0) {
            [contacts[index], contacts[index - 1]] = [contacts[index - 1], contacts[index]];
        } else if (direction === 'down' && index < contacts.length - 1) {
            [contacts[index], contacts[index + 1]] = [contacts[index + 1], contacts[index]];
        }

        contacts.forEach((contact, idx) => {
            contact.order = idx + 1;
        });

        updateHubungiKami({ contacts });
    };

    const renderListCard = (
        cardKey: 'hakPekerja' | 'kewajibanPekerja',
        cardTitle: string,
        badgeColor: string,
        badgeIcon: string
    ) => {
        const card = config.hakKewajibanSection.cards[cardKey];

        return (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">{cardTitle}</h3>
                        <input
                            type="text"
                            value={card.title}
                            onChange={(e) => updateHakKewajibanCard(cardKey, { title: e.target.value })}
                            className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-sm"
                        />
                    </div>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={card.enabled}
                            onChange={(e) => updateHakKewajibanCard(cardKey, { enabled: e.target.checked })}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
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
                                    onChange={(e) => updateHakKewajibanItem(cardKey, item.id, 'enabled', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
                                />
                                <span className={`flex h-6 w-6 items-center justify-center rounded-full ${badgeColor} text-xs font-semibold`}>
                                    {badgeIcon}
                                </span>
                            </div>

                            <input
                                type="text"
                                value={item.text}
                                onChange={(e) => updateHakKewajibanItem(cardKey, item.id, 'text', e.target.value)}
                                className="flex-1 rounded border border-slate-200 px-2 py-1 text-sm"
                            />

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => moveHakKewajibanItem(cardKey, item.id, 'up')}
                                    disabled={index === 0}
                                    className="rounded p-1 hover:bg-slate-200 disabled:opacity-30"
                                >
                                    <ChevronUp className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => moveHakKewajibanItem(cardKey, item.id, 'down')}
                                    disabled={index === card.items.length - 1}
                                    className="rounded p-1 hover:bg-slate-200 disabled:opacity-30"
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => deleteHakKewajibanItem(cardKey, item.id)}
                                    className="rounded p-1 text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => addHakKewajibanItem(cardKey)}
                    className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-primary hover:text-primary"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Item
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Hak & Kewajiban Section Settings */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">Section: Hak & Kewajiban</h3>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={config.hakKewajibanSection.enabled}
                            onChange={(e) => updateHakKewajibanSection('enabled', e.target.checked)}
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
                            value={config.hakKewajibanSection.title}
                            onChange={(e) => updateHakKewajibanSection('title', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Section Subtitle</label>
                        <input
                            type="text"
                            value={config.hakKewajibanSection.subtitle}
                            onChange={(e) => updateHakKewajibanSection('subtitle', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>
            </div>

            {/* Hak & Kewajiban Cards */}
            {renderListCard('hakPekerja', 'Hak Pekerja PKWT', 'bg-primary/10 text-primary', '♥')}
            {renderListCard('kewajibanPekerja', 'Kewajiban Pekerja PKWT', 'bg-secondary/40 text-slate-900', '⚡')}

            {/* Konsultasi Section Settings */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">Section: Konsultasi</h3>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={config.konsultasiSection.enabled}
                            onChange={(e) => updateKonsultasiSection('enabled', e.target.checked)}
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
                            value={config.konsultasiSection.title}
                            onChange={(e) => updateKonsultasiSection('title', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Section Subtitle</label>
                        <input
                            type="text"
                            value={config.konsultasiSection.subtitle}
                            onChange={(e) => updateKonsultasiSection('subtitle', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>
            </div>

            {/* Layanan Konsultasi Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">Layanan Konsultasi</h3>
                        <input
                            type="text"
                            value={config.konsultasiSection.cards.layananKonsultasi.title}
                            onChange={(e) => updateLayananKonsultasi({ title: e.target.value })}
                            className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-sm"
                        />
                    </div>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={config.konsultasiSection.cards.layananKonsultasi.enabled}
                            onChange={(e) => updateLayananKonsultasi({ enabled: e.target.checked })}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-slate-600">Aktif</span>
                    </label>
                </div>

                <div className="space-y-2">
                    {(config.konsultasiSection.cards.layananKonsultasi.items as ListItem[]).map((item, index) => (
                        <div key={item.id} className="flex items-start gap-2 rounded-lg border bg-slate-50 p-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={item.enabled}
                                    onChange={(e) => updateLayananItem(item.id, 'enabled', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
                                />
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-600">
                                    {index + 1}
                                </span>
                            </div>

                            <input
                                type="text"
                                value={item.text}
                                onChange={(e) => updateLayananItem(item.id, 'text', e.target.value)}
                                className="flex-1 rounded border border-slate-200 px-2 py-1 text-sm"
                            />

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => moveLayananItem(item.id, 'up')}
                                    disabled={index === 0}
                                    className="rounded p-1 hover:bg-slate-200 disabled:opacity-30"
                                >
                                    <ChevronUp className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => moveLayananItem(item.id, 'down')}
                                    disabled={index === config.konsultasiSection.cards.layananKonsultasi.items.length - 1}
                                    className="rounded p-1 hover:bg-slate-200 disabled:opacity-30"
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => deleteLayananItem(item.id)}
                                    className="rounded p-1 text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={addLayananItem}
                    className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-primary hover:text-primary"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Layanan
                </button>
            </div>

            {/* Hubungi Kami Card - Dynamic Contacts */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">Hubungi Kami</h3>
                        <input
                            type="text"
                            value={config.konsultasiSection.cards.hubungiKami.title}
                            onChange={(e) => updateHubungiKami({ title: e.target.value })}
                            className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-sm"
                        />
                    </div>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={config.konsultasiSection.cards.hubungiKami.enabled}
                            onChange={(e) => updateHubungiKami({ enabled: e.target.checked })}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-slate-600">Aktif</span>
                    </label>
                </div>

                <div className="space-y-3">
                    {config.konsultasiSection.cards.hubungiKami.contacts.map((contact, index) => (
                        <div key={contact.id} className="rounded-lg border bg-slate-50 p-4">
                            <div className="mb-3 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={contact.enabled}
                                    onChange={(e) => updateContact(contact.id, 'enabled', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
                                />

                                <select
                                    value={contact.type}
                                    onChange={(e) => updateContact(contact.id, 'type', e.target.value)}
                                    className="rounded border border-slate-200 px-2 py-1 text-sm"
                                >
                                    {CONTACT_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>

                                <select
                                    value={contact.color}
                                    onChange={(e) => updateContact(contact.id, 'color', e.target.value)}
                                    className="rounded border border-slate-200 px-2 py-1 text-sm"
                                >
                                    {COLOR_OPTIONS.map(color => (
                                        <option key={color.value} value={color.value}>{color.label}</option>
                                    ))}
                                </select>

                                <div className="ml-auto flex items-center gap-1">
                                    <button
                                        onClick={() => moveContact(contact.id, 'up')}
                                        disabled={index === 0}
                                        className="rounded p-1 hover:bg-slate-200 disabled:opacity-30"
                                    >
                                        <ChevronUp className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => moveContact(contact.id, 'down')}
                                        disabled={index === config.konsultasiSection.cards.hubungiKami.contacts.length - 1}
                                        className="rounded p-1 hover:bg-slate-200 disabled:opacity-30"
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteContact(contact.id)}
                                        className="rounded p-1 text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-2 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-600">Label</label>
                                    <input
                                        type="text"
                                        value={contact.label}
                                        onChange={(e) => updateContact(contact.id, 'label', e.target.value)}
                                        className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
                                        placeholder="Telepon"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-600">Value</label>
                                    <input
                                        type="text"
                                        value={contact.value}
                                        onChange={(e) => updateContact(contact.id, 'value', e.target.value)}
                                        className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
                                        placeholder="(0543) 12345"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={addContact}
                    className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-primary hover:text-primary"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Kontak
                </button>

                <div className="mt-4 space-y-2 border-t pt-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-700">Button Text:</label>
                        <input
                            type="text"
                            value={config.konsultasiSection.cards.hubungiKami.buttonText}
                            onChange={(e) => updateHubungiKami({ buttonText: e.target.value })}
                            className="flex-1 rounded border border-slate-200 px-2 py-1 text-sm"
                            placeholder="Jadwalkan Konsultasi"
                        />
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={config.konsultasiSection.cards.hubungiKami.buttonEnabled}
                                onChange={(e) => updateHubungiKami({ buttonEnabled: e.target.checked })}
                                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
                            />
                            <span className="text-sm text-slate-600">Aktif</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
