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
        <div className="h-96 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
                    <Users className="h-4 w-4 text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-900">Karyawan Aktif</h3>
                    <p className="text-xs text-slate-500">Total kontrak aktif</p>
                </div>
            </div>
            <div className="p-6">
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
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">PKWT</div>
                                <div className="mt-1 text-2xl font-bold text-blue-600">{pkwt}</div>
                                <div className="mt-1 text-xs text-slate-500">Kontrak Waktu Tertentu</div>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">PKWTT</div>
                                <div className="mt-1 text-2xl font-bold text-purple-600">{pkwtt}</div>
                                <div className="mt-1 text-xs text-slate-500">Kontrak Waktu Tidak Tertentu</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
