import { useMemo, useRef, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { ClipLoader, MoonLoader } from 'react-spinners';
import { useTemplateConfig } from '../../hooks/useTemplateConfig';
import { API_BASE } from '../../lib/api';
import type { TemplateItem, TemplateKind, TemplateContractType } from '../../lib/api';

function getKindFromFileName(fileName: string): TemplateKind {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.xlsx')) return 'excel';
    return 'contract_sample';
}

function stripExt(fileName: string): string {
    return fileName.replace(/\.[^.]+$/, '');
}

function nextOrder(items: TemplateItem[]): number {
    const max = items.reduce((acc, it) => Math.max(acc, Number(it.order || 0)), 0);
    return max + 1;
}

const CONTRACT_TYPE_OPTIONS: Array<{ value: TemplateContractType; label: string }> = [
    { value: 'general', label: 'Umum' },
    { value: 'pkwt', label: 'PKWT' },
    { value: 'pkwtt', label: 'PKWTT' },
];

export default function AdminTemplatesPage() {
    const { config, setConfig, loading, error, saving, saveConfig, uploadFile } = useTemplateConfig();
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const items = config.templates.items || [];

    const enabledCount = useMemo(() => items.filter((it) => it.enabled).length, [items]);

    const handleSave = async () => {
        const result = await saveConfig(config);
        if (result.success) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }
    };

    const updateItem = (id: string, patch: Partial<TemplateItem>) => {
        setConfig((prev) => ({
            ...prev,
            templates: {
                ...prev.templates,
                items: (prev.templates.items || []).map((it) => (it.id === id ? { ...it, ...patch } : it)),
            },
        }));
    };

    const removeItem = (id: string) => {
        setConfig((prev) => ({
            ...prev,
            templates: {
                ...prev.templates,
                items: (prev.templates.items || []).filter((it) => it.id !== id),
            },
        }));
    };

    const handlePickFile = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelected = async (file: File | null) => {
        if (!file) return;

        setUploading(true);
        try {
            const res = await uploadFile(file);
            if (!res.success) {
                // error already surfaced in hook
                return;
            }

            const kind = getKindFromFileName(file.name);
            const id = crypto.randomUUID();
            const order = nextOrder(items);

            const newItem: TemplateItem = {
                id,
                name: stripExt(file.name),
                kind,
                contract_type: 'general',
                file_path: res.data.file_path,
                original_file_name: res.data.original_file_name,
                content_type: res.data.content_type,
                size_bytes: res.data.size_bytes,
                order,
                enabled: true,
            };

            setConfig((prev) => ({
                ...prev,
                templates: {
                    ...prev.templates,
                    items: [...(prev.templates.items || []), newItem],
                },
            }));
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <MoonLoader size={48} color="#419823" />
                    <p className="text-slate-600 font-medium">Memuat konfigurasi template...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <h3 className="text-lg font-semibold text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/25 p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Template Manager</h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Admin dapat upload banyak template (.xlsx/.docx/.pdf) lalu atur tampil/sembunyi. Company hanya melihat yang aktif di Dashboard.
                        </p>
                        <div className="mt-2 text-xs text-slate-500">
                            {config.updatedAt ? (
                                <span>
                                    Terakhir diubah: {new Date(config.updatedAt).toLocaleString('id-ID')} {config.updatedBy ? `oleh ${config.updatedBy}` : ''}
                                </span>
                            ) : (
                                <span>Belum ada informasi pembaruan.</span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-start gap-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
                        >
                            {saving ? <ClipLoader size={16} color="#fff" /> : <Save className="h-4 w-4" />}
                            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>

                        {saveSuccess && (
                            <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 ring-1 ring-green-200">✓ Berhasil disimpan</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-900">Daftar Template</p>
                        <p className="mt-1 text-sm text-slate-600">
                            Total: <span className="font-semibold text-slate-900">{items.length}</span> · Aktif:{' '}
                            <span className="font-semibold text-slate-900">{enabledCount}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept=".xlsx,.docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            onChange={(e) => void handleFileSelected(e.target.files?.[0] || null)}
                        />
                        <button
                            onClick={handlePickFile}
                            disabled={uploading}
                            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {uploading ? <ClipLoader size={16} color="#0f172a" /> : <Plus className="h-4 w-4" />}
                            {uploading ? 'Mengunggah...' : 'Tambah (+)'}
                        </button>
                    </div>
                </div>

                <div className="mt-6 space-y-3">
                    {items.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
                            <p className="text-sm font-semibold text-slate-900">Belum ada template</p>
                            <p className="mt-1 text-sm text-slate-600">Klik tombol “Tambah (+)” untuk upload file template.</p>
                        </div>
                    ) : (
                        items
                            .slice()
                            .sort((a, b) => a.order - b.order)
                            .map((it) => (
                                <div key={it.id} className="rounded-lg border border-slate-200 bg-white p-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                                                    <input
                                                        type="checkbox"
                                                        checked={it.enabled}
                                                        onChange={(e) => updateItem(it.id, { enabled: e.target.checked })}
                                                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
                                                    />
                                                    Tampilkan
                                                </label>

                                                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                                    {it.kind === 'excel' ? 'Excel' : 'Contoh Kontrak'}
                                                </span>

                                                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                                                    {it.contract_type.toUpperCase()}
                                                </span>
                                            </div>

                                            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-12">
                                                <div className="md:col-span-6">
                                                    <label className="text-xs font-semibold text-slate-700">Nama</label>
                                                    <input
                                                        value={it.name}
                                                        onChange={(e) => updateItem(it.id, { name: e.target.value })}
                                                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                        placeholder="Nama template"
                                                    />
                                                </div>

                                                <div className="md:col-span-3">
                                                    <label className="text-xs font-semibold text-slate-700">Jenis</label>
                                                    <select
                                                        value={it.contract_type}
                                                        onChange={(e) => updateItem(it.id, { contract_type: e.target.value as TemplateContractType })}
                                                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                    >
                                                        {CONTRACT_TYPE_OPTIONS.map((opt) => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="md:col-span-3">
                                                    <label className="text-xs font-semibold text-slate-700">Link File</label>
                                                    <a
                                                        href={`${API_BASE}${it.file_path}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="mt-1 block truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                                                        title={it.file_path}
                                                    >
                                                        {it.original_file_name || it.file_path}
                                                    </a>
                                                </div>
                                            </div>

                                            <div className="mt-2 text-xs text-slate-500">
                                                Order: {it.order} {it.size_bytes ? `· ${(it.size_bytes / 1024).toFixed(0)} KB` : ''}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => removeItem(it.id)}
                                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <input
                        type="checkbox"
                        checked={config.templates.enabled}
                        onChange={(e) => setConfig((prev) => ({ ...prev, templates: { ...prev.templates, enabled: e.target.checked } }))}
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
                    />
                    Aktifkan fitur template (global)
                </label>
                <p className="mt-1 text-sm text-slate-600">Jika dimatikan, company dashboard tidak akan menampilkan template apa pun.</p>
            </div>
        </div>
    );
}
