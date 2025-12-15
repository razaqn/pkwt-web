import { Users } from 'lucide-react';
import { CardSkeleton } from './CardSkeleton';

interface ActiveEmployeesCardProps {
    total: number;
    pkwt: number;
    pkwtt: number;
    loading: boolean;
    error: string | null;
    onRefetch: () => void;
}

export function ActiveEmployeesCard({ total, pkwt, pkwtt, loading, error, onRefetch }: ActiveEmployeesCardProps) {
    return (
        <div className="h-96 rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3 border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/20 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm ring-1 ring-primary/20">
                    <Users className="h-4 w-4 text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-900">Karyawan Aktif</h3>
                    <p className="text-xs text-slate-500">Total kontrak aktif</p>
                </div>
            </div>
            <div className="p-5">
                {loading && <CardSkeleton />}

                {!loading && error && (
                    <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                        <p className="font-semibold">Gagal memuat data</p>
                        <p className="mt-1">{error}</p>
                        <button
                            onClick={onRefetch}
                            className="mt-2 text-xs font-semibold text-red-700 underline"
                        >
                            Coba lagi
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <div className="space-y-6 text-center">
                        <div>
                            <div className="text-5xl font-bold text-slate-900">{total}</div>
                            <p className="mt-2 text-sm text-slate-600">Total Karyawan</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-left">
                            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">PKWT</div>
                                <div className="mt-1 text-2xl font-bold text-primary">{pkwt}</div>
                                <div className="mt-1 text-xs text-slate-500">Kontrak Waktu Tertentu</div>
                            </div>
                            <div className="rounded-xl border border-secondary/40 bg-secondary/20 p-4">
                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">PKWTT</div>
                                <div className="mt-1 text-2xl font-bold text-slate-900">{pkwtt}</div>
                                <div className="mt-1 text-xs text-slate-500">Kontrak Waktu Tidak Tertentu</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
