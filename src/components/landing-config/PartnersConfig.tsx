import { useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, Upload } from 'lucide-react';
import type { LandingConfig } from '../../lib/api';
import { resolveUploadUrl } from '../../lib/url';

type PartnerItem = LandingConfig['partners']['items'][number];

function newId(prefix: string) {
    const rnd = Math.random().toString(16).slice(2);
    return `${prefix}-${Date.now()}-${rnd}`;
}

function normalizeOrders(items: PartnerItem[]): PartnerItem[] {
    return items
        .slice()
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((it, idx) => ({ ...it, order: idx + 1 }));
}

interface PartnersConfigProps {
    config: LandingConfig;
    onChange: (config: LandingConfig) => void;
    onUpload: (file: File) => Promise<{ success: true; imagePath: string } | { success: false; error: string }>;
}

export default function PartnersConfig({ config, onChange, onUpload }: PartnersConfigProps) {
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const updatePartners = (updates: Partial<LandingConfig['partners']>) => {
        onChange({
            ...config,
            partners: {
                ...config.partners,
                ...updates,
            },
        });
    };

    const items = normalizeOrders(config.partners.items || []);

    const updateItem = (id: string, updates: Partial<PartnerItem>) => {
        const next = items.map((it) => (it.id === id ? { ...it, ...updates } : it));
        updatePartners({ items: normalizeOrders(next) });
    };

    const addItem = () => {
        const next: PartnerItem[] = [
            ...items,
            { id: newId('partner'), image_path: '', alt: '', enabled: true, order: items.length + 1 },
        ];
        updatePartners({ items: normalizeOrders(next) });
    };

    const removeItem = (id: string) => {
        const next = items.filter((it) => it.id !== id);
        updatePartners({ items: normalizeOrders(next) });
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
        updatePartners({ items: normalizeOrders(next) });
    };

    const uploadFor = async (id: string, file: File | null) => {
        if (!file) return;
        setUploadingId(id);
        const res = await onUpload(file);
        setUploadingId(null);

        if (res.success) {
            updateItem(id, { image_path: res.imagePath, alt: items.find((x) => x.id === id)?.alt || file.name });
        } else {
            alert(res.error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">Partner Logos</h3>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={config.partners.enabled}
                            onChange={(e) => updatePartners({ enabled: e.target.checked })}
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
                            value={config.partners.title}
                            onChange={(e) => updatePartners({ title: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Mitra"
                        />
                    </div>
                    <div className="flex items-end justify-end">
                        <button
                            type="button"
                            onClick={addItem}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Logo
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {items.map((it, idx) => {
                    const url = resolveUploadUrl(it.image_path);
                    const isUploading = uploadingId === it.id;
                    return (
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

                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Alt Text</label>
                                    <input
                                        type="text"
                                        value={it.alt}
                                        onChange={(e) => updateItem(it.id, { alt: e.target.value })}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Nama instansi/perusahaan"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Gambar</label>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <input
                                            ref={(el) => {
                                                fileInputRefs.current[it.id] = el;
                                            }}
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            className="hidden"
                                            onChange={(e) => uploadFor(it.id, e.target.files?.[0] || null)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRefs.current[it.id]?.click()}
                                            disabled={isUploading}
                                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                        >
                                            <Upload className="h-4 w-4" />
                                            {isUploading ? 'Mengunggah...' : 'Upload'}
                                        </button>

                                        <input
                                            type="text"
                                            value={it.image_path}
                                            onChange={(e) => updateItem(it.id, { image_path: e.target.value })}
                                            className="min-w-[240px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="/uploads/landing/partners/..."
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">Boleh upload atau isi manual path URL.</p>
                                </div>
                            </div>

                            {url && (
                                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-600">Preview</div>
                                    <img
                                        src={url}
                                        alt={it.alt || 'Partner'}
                                        className="mt-2 h-10 w-auto opacity-90"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}

                {items.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600">
                        Belum ada logo. Klik <span className="font-semibold">Tambah Logo</span> untuk menambahkan.
                    </div>
                )}
            </div>
        </div>
    );
}
