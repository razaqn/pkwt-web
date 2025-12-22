import type { LandingConfig } from '../../lib/api';

interface UcapanConfigProps {
    config: LandingConfig;
    onChange: (config: LandingConfig) => void;
}

export default function UcapanConfig({ config, onChange }: UcapanConfigProps) {
    const update = (field: keyof LandingConfig['ucapan'], value: string | boolean) => {
        onChange({
            ...config,
            ucapan: {
                ...config.ucapan,
                [field]: value as any,
            },
        });
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Ucapan / Sambutan</h3>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={config.ucapan.enabled}
                        onChange={(e) => update('enabled', e.target.checked)}
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
                        onChange={(e) => update('title', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Selamat datang di E-PKWT"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Isi</label>
                    <textarea
                        value={config.ucapan.body}
                        onChange={(e) => update('body', e.target.value)}
                        rows={6}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Tulis sambutan/penjelasan singkat..."
                    />
                    <p className="mt-2 text-xs text-slate-500">Mendukung baris baru (newline) untuk paragraf.</p>
                </div>
            </div>
        </div>
    );
}
