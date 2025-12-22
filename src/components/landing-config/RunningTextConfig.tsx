import type { LandingConfig } from '../../lib/api';

interface RunningTextConfigProps {
    config: LandingConfig;
    onChange: (config: LandingConfig) => void;
}

export default function RunningTextConfig({ config, onChange }: RunningTextConfigProps) {
    const update = (field: keyof LandingConfig['runningText'], value: string | boolean) => {
        onChange({
            ...config,
            runningText: {
                ...config.runningText,
                [field]: value as any,
            },
        });
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Running Text</h3>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={config.runningText.enabled}
                        onChange={(e) => update('enabled', e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
                    />
                    <span className="text-sm text-slate-600">Aktif</span>
                </label>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Teks</label>
                <textarea
                    value={config.runningText.text}
                    onChange={(e) => update('text', e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Pengumuman: ..."
                />
                <p className="mt-2 text-xs text-slate-500">Ditampilkan sebagai teks berjalan di bawah gambar hero.</p>
            </div>
        </div>
    );
}
