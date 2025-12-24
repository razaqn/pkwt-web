import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { API_BASE, type TemplateItem } from '../../lib/api';
import { CardSkeleton } from './CardSkeleton';

type TemplatesCardProps = {
    title: string;
    enabled: boolean;
    items: TemplateItem[];
    loading: boolean;
    error: string | null;
    onRefetch: () => void;
};

function buildDownloadUrl(filePath: string) {
    // Backend serves local uploads from /uploads static middleware.
    // In dev, FE and API are different origins, so prefix with API_BASE.
    if (!filePath) return '#';
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
    return `${API_BASE}${filePath}`;
}

function isPdfTemplate(it: TemplateItem) {
    const ct = (it.content_type || '').toLowerCase();
    if (ct.includes('pdf')) return true;

    const filePath = (it.file_path || '').toLowerCase();
    if (filePath.endsWith('.pdf')) return true;

    const originalName = (it.original_file_name || '').toLowerCase();
    if (originalName.endsWith('.pdf')) return true;

    return false;
}

export function TemplatesCard({ title, enabled, items, loading, error, onRefetch }: TemplatesCardProps) {
    const excelItems = items.filter((it) => it.kind === 'excel');
    const contractItems = items.filter((it) => it.kind === 'contract_sample');

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3 border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/20 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 shadow-sm ring-1 ring-slate-900/20">
                    <Download className="h-4 w-4 text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-900">{title || 'Template'}</h3>
                    <p className="text-xs text-slate-500">Download template yang diaktifkan admin</p>
                </div>
            </div>

            <div className="p-5">
                {loading && <CardSkeleton />}

                {!loading && error && (
                    <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                        <p className="font-semibold">Gagal memuat template</p>
                        <p className="mt-1">{error}</p>
                        <button onClick={onRefetch} className="mt-2 text-xs font-semibold text-red-700 underline">
                            Coba lagi
                        </button>
                    </div>
                )}

                {!loading && !error && (!enabled || items.length === 0) && (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-900">Belum ada template aktif</p>
                        <p className="mt-1 text-sm text-slate-600">Minta admin untuk menambahkan dan mengaktifkan template di menu admin.</p>
                    </div>
                )}

                {!loading && !error && enabled && items.length > 0 && (
                    <div className="space-y-5">
                        {excelItems.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                                    <FileSpreadsheet className="h-4 w-4 text-primary" />
                                    Template Excel
                                </div>
                                <div className="mt-2 space-y-2">
                                    {excelItems.map((it) => (
                                        <a
                                            key={it.id}
                                            href={buildDownloadUrl(it.file_path)}
                                            download
                                            className="group flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                                            title={it.original_file_name || it.file_path}
                                        >
                                            <span className="min-w-0 truncate">{it.name}</span>
                                            <span className="text-xs font-semibold text-primary group-hover:underline">Download</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {contractItems.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                                    <FileText className="h-4 w-4 text-slate-700" />
                                    Contoh Kontrak
                                </div>
                                <div className="mt-2 space-y-2">
                                    {contractItems.map((it) => {
                                        const isPdf = isPdfTemplate(it);
                                        return (
                                            <a
                                                key={it.id}
                                                href={buildDownloadUrl(it.file_path)}
                                                download={!isPdf}
                                                target={isPdf ? '_blank' : undefined}
                                                rel={isPdf ? 'noreferrer' : undefined}
                                                className="group flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                                                title={it.original_file_name || it.file_path}
                                            >
                                                <span className="min-w-0 truncate">{it.name}</span>
                                                <span className="text-xs font-semibold text-primary group-hover:underline">{isPdf ? 'Buka' : 'Download'}</span>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
