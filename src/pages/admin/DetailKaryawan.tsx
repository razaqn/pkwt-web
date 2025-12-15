import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { useEmployeeDetail } from '../../hooks/useEmployeeDetail';
import { MoonLoader } from 'react-spinners';
import { EmptyState } from '../../components/dashboard/EmptyState';

export default function AdminDetailKaryawan() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { data, loading, error, refetch } = useEmployeeDetail(id);

    // NOTE: Hooks must be called unconditionally.
    // Keep derived values (useMemo) above all early returns, and make them null-safe.
    const contractsSorted = useMemo(() => {
        const contracts = data?.contracts ?? [];
        const list = Array.isArray(contracts) ? [...contracts] : [];
        list.sort((a, b) => {
            const ad = a.start_date ? new Date(a.start_date).getTime() : 0;
            const bd = b.start_date ? new Date(b.start_date).getTime() : 0;
            return bd - ad;
        });
        return list;
    }, [data?.contracts]);

    const activeContract = data
        ? contractsSorted.find((c) => c.id === data.current_contract_id) ?? contractsSorted[0]
        : undefined;

    if (!id) {
        return (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">Terjadi Kesalahan</p>
                    <p className="text-sm text-red-700 mt-1">ID karyawan tidak ditemukan.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                    <MoonLoader size={48} color="#419823" />
                    <span className="text-slate-600 font-medium">Memuat detail karyawan...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/90 font-semibold"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                </button>

                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Terjadi Kesalahan</p>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                        <button
                            onClick={() => refetch()}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 transition-colors"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/90 font-semibold"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </button>

                    <button
                        onClick={() => refetch()}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-primary/5 transition-colors"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Refresh
                    </button>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/25 px-5 py-4">
                        <p className="text-sm font-semibold text-slate-800">Data tidak tersedia</p>
                        <p className="mt-1 text-sm text-slate-600">Kami tidak menemukan data karyawan untuk ID ini.</p>
                    </div>
                    <div className="px-5">
                        <EmptyState
                            title="Data karyawan tidak ditemukan"
                            description="Coba refresh. Jika masih tidak muncul, pastikan ID karyawan valid."
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/90 font-semibold"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </button>

                    <div>
                        <p className="text-sm font-semibold text-primary">Admin • Karyawan</p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{data.full_name}</h1>
                        <p className="mt-1 text-sm text-slate-600">Informasi lengkap profil karyawan dan riwayat kontrak.</p>
                    </div>
                </div>

                <button
                    onClick={() => refetch()}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-primary/5 transition-colors"
                >
                    <RotateCcw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">NIK</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">{data.nik || '-'}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kontrak Aktif</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">{activeContract?.title || '-'}</p>
                    {activeContract?.contract_type ? (
                        <div className="mt-2">
                            <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${activeContract.contract_type === 'PKWT'
                                    ? 'bg-primary/10 text-primary ring-primary/20'
                                    : 'bg-secondary/30 text-slate-900 ring-secondary/40'
                                    }`}
                            >
                                {activeContract.contract_type}
                            </span>
                        </div>
                    ) : null}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Jumlah Kontrak</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{contractsSorted.length}</p>
                </div>
            </div>

            {/* Informasi Karyawan Card */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/25 px-6 py-4">
                    <h2 className="text-base font-semibold text-slate-900">Informasi Karyawan</h2>
                    <p className="mt-1 text-sm text-slate-600">Data pribadi dan informasi pekerjaan.</p>
                </div>

                <div className="p-6">
                    {/* Informasi Pribadi Section */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">
                            Informasi Pribadi
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-slate-600">NIK (Nomor Induk Kependudukan)</label>
                                <p className="mt-2 text-slate-900">{data.nik || '-'}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-600">Alamat</label>
                                <p className="mt-2 text-slate-900">{data.address || '-'}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-600">Kecamatan</label>
                                <p className="mt-2 text-slate-900">{data.district || '-'}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-600">Kelurahan</label>
                                <p className="mt-2 text-slate-900">{data.village || '-'}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-600">Tempat Lahir</label>
                                <p className="mt-2 text-slate-900">{data.place_of_birth || '-'}</p>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-slate-600">Tanggal Lahir</label>
                                <p className="mt-2 text-slate-900">{data.birthdate_formatted || '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 my-8"></div>

                    {/* Informasi Pekerjaan Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">
                            Informasi Pekerjaan
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-slate-600">Perusahaan</label>
                                <p className="mt-2 text-slate-900">{activeContract?.company_name || '-'}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-600">Kontrak Sekarang</label>
                                <p className="mt-2 text-slate-900">{activeContract?.title || '-'}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-600">Jumlah Kontrak</label>
                                <p className="mt-2 text-slate-900">{contractsSorted.length} kontrak</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Riwayat Kontrak Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/25 px-6 py-4">
                    <h2 className="text-base font-semibold text-slate-900">Riwayat Kontrak</h2>
                    <p className="mt-1 text-sm text-slate-600">Daftar kontrak yang pernah tercatat untuk karyawan ini.</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Judul Kontrak</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Perusahaan</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Tipe</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Tanggal Mulai</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Durasi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contractsSorted.length > 0 ? (
                                contractsSorted.map((contract) => {
                                    const isActive = Boolean(data.current_contract_id && contract.id === data.current_contract_id);
                                    const typeBadgeClass =
                                        contract.contract_type === 'PKWT'
                                            ? 'bg-primary/10 text-primary ring-primary/20'
                                            : 'bg-secondary/30 text-slate-900 ring-secondary/40';

                                    return (
                                        <tr
                                            key={contract.id}
                                            className={`border-b border-slate-200 hover:bg-slate-50 transition ${isActive ? 'bg-primary/5' : ''}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-slate-900">{contract.title}</div>
                                                {isActive ? (
                                                    <div className="mt-1">
                                                        <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary ring-1 ring-inset ring-primary/20">
                                                            Aktif
                                                        </span>
                                                    </div>
                                                ) : null}
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">{contract.company_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${typeBadgeClass}`}>
                                                    {contract.contract_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">
                                                {contract.start_date
                                                    ? new Date(contract.start_date).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })
                                                    : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">
                                                {contract.contract_type === 'PKWTT'
                                                    ? 'Tetap'
                                                    : contract.duration_months
                                                        ? `${contract.duration_months} bulan`
                                                        : '-'}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10">
                                        <EmptyState
                                            title="Belum ada riwayat kontrak"
                                            description="Kontrak untuk karyawan ini belum tercatat di sistem."
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
