import { useRef, useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import type { LandingConfig } from '../../lib/api';
import { resolveUploadUrl } from '../../lib/url';

interface UcapanConfigProps {
    config: LandingConfig;
    onChange: (config: LandingConfig) => void;
    onUploadImage: (file: File) => Promise<{ success: true; imagePath: string } | { success: false; error: string }>;
}

export default function UcapanConfig({ config, onChange, onUploadImage }: UcapanConfigProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const updateUcapan = (updates: Partial<LandingConfig['ucapan']>) => {
        onChange({
            ...config,
            ucapan: {
                ...config.ucapan,
                ...updates,
            },
        });
    };

    const onPickFile = async (file: File | null) => {
        setUploadError(null);
        if (!file) return;

        const allowed = ['image/jpeg', 'image/png'];
        if (!allowed.includes(file.type)) {
            setUploadError('Format harus JPG/JPEG atau PNG.');
            return;
        }
        const maxBytes = 5 * 1024 * 1024;
        if (file.size > maxBytes) {
            const mb = (file.size / 1024 / 1024).toFixed(2);
            setUploadError(`File terlalu besar. Maksimal 5MB (file Anda ${mb}MB).`);
            return;
        }

        setUploading(true);
        const res = await onUploadImage(file);
        setUploading(false);

        if (res.success) {
            updateUcapan({ image_path: res.imagePath });
        } else {
            setUploadError(res.error);
        }
    };

    const previewUrl = resolveUploadUrl(config.ucapan.image_path);

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Ucapan / Sambutan</h3>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={config.ucapan.enabled}
                        onChange={(e) => updateUcapan({ enabled: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
                    />
                    <span className="text-sm text-slate-600">Aktif</span>
                </label>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Judul</label>
                    <input
                        type="text"
                        value={config.ucapan.title}
                        onChange={(e) => updateUcapan({ title: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Selamat datang di E-PKWT"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Isi</label>
                    <textarea
                        value={config.ucapan.body}
                        onChange={(e) => updateUcapan({ body: e.target.value })}
                        rows={6}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Tulis sambutan/penjelasan singkat..."
                    />
                    <p className="mt-2 text-xs text-slate-500">Mendukung baris baru (newline) untuk paragraf.</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="text-sm font-semibold text-slate-800">Gambar Ucapan</div>
                            <div className="mt-1 text-xs text-slate-500">JPG/JPEG/PNG, maksimal 5MB.</div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg"
                                className="hidden"
                                onChange={(e) => onPickFile(e.target.files?.[0] || null)}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                                <Upload className="h-4 w-4" />
                                {uploading ? 'Mengunggah...' : 'Upload'}
                            </button>

                            <button
                                type="button"
                                onClick={() => updateUcapan({ image_path: null })}
                                disabled={!config.ucapan.image_path || uploading}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                                title="Hapus gambar"
                            >
                                <Trash2 className="h-4 w-4" />
                                Hapus
                            </button>
                        </div>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Path gambar</label>
                            <input
                                type="text"
                                value={config.ucapan.image_path ?? ''}
                                onChange={(e) => updateUcapan({ image_path: e.target.value ? e.target.value : null })}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="/uploads/landing/ucapan/..."
                            />
                            <p className="mt-1 text-xs text-slate-500">Boleh upload atau isi manual path URL.</p>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Fit Mode</label>
                            <select
                                value={config.ucapan.image_fit || 'cover'}
                                onChange={(e) => updateUcapan({ image_fit: e.target.value as 'cover' | 'contain' })}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="cover">Cover (crop agar penuh)</option>
                                <option value="contain">Contain (tanpa crop)</option>
                            </select>
                            <p className="mt-1 text-xs text-slate-500">Default: cover.</p>
                        </div>
                    </div>

                    <div className="mt-3">
                        <label className="mb-1 block text-sm font-medium text-slate-700">Posisi Gambar</label>
                        <select
                            value={config.ucapan.image_position || 'side'}
                            onChange={(e) => updateUcapan({ image_position: e.target.value as 'side' | 'below' })}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="side">Di samping teks</option>
                            <option value="below">Di bawah teks (besar)</option>
                        </select>
                        <p className="mt-1 text-xs text-slate-500">Pilih layout gambar di landing page publik.</p>
                    </div>

                    {uploadError && (
                        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {uploadError}
                        </div>
                    )}

                    {previewUrl && (
                        <div className="mt-4">
                            <div className="text-xs font-semibold uppercase tracking-wider text-slate-600">Preview</div>
                            {config.ucapan.image_position === 'below' ? (
                                <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3">
                                    <img
                                        src={previewUrl}
                                        alt={config.ucapan.title || 'Ucapan'}
                                        className={`h-48 w-full rounded-lg bg-slate-100 ${(config.ucapan.image_fit || 'cover') === 'contain' ? 'object-contain' : 'object-cover'}`}
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                    <div className="mt-2 text-xs text-slate-500">Preview posisi: di bawah teks (besar).</div>
                                </div>
                            ) : (
                                <div className="mt-2 inline-flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3">
                                    <img
                                        src={previewUrl}
                                        alt={config.ucapan.title || 'Ucapan'}
                                        className={`h-24 w-24 rounded-lg bg-slate-100 ${(config.ucapan.image_fit || 'cover') === 'contain' ? 'object-contain' : 'object-cover'}`}
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                    <div className="text-sm text-slate-600">
                                        <div className="font-semibold text-slate-800">Gambar Ucapan</div>
                                        <div className="text-xs">Ditampilkan di landing publik pada section Ucapan.</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
