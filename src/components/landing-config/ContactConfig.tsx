import type { LandingConfig } from '../../lib/api';

interface ContactConfigProps {
    config: LandingConfig;
    onChange: (config: LandingConfig) => void;
}

export default function ContactConfig({ config, onChange }: ContactConfigProps) {
    const updateContact = (field: keyof LandingConfig['contact'], value: string | boolean) => {
        onChange({
            ...config,
            contact: {
                ...config.contact,
                [field]: value as any,
            },
        });
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Kontak</h3>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={config.contact.enabled}
                        onChange={(e) => updateContact('enabled', e.target.checked)}
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
                        value={config.contact.title}
                        onChange={(e) => updateContact('title', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Kontak"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Telepon</label>
                        <input
                            type="text"
                            value={config.contact.phone}
                            onChange={(e) => updateContact('phone', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="(0543) ..."
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                        <input
                            type="email"
                            value={config.contact.email}
                            onChange={(e) => updateContact('email', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="disnaker@example.go.id"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Alamat</label>
                    <textarea
                        value={config.contact.address}
                        onChange={(e) => updateContact('address', e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Alamat kantor..."
                    />
                </div>
            </div>
        </div>
    );
}
