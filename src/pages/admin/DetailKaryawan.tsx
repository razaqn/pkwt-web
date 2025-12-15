import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useEmployeeDetail } from '../../hooks/useEmployeeDetail';
import { MoonLoader } from 'react-spinners';

export default function AdminDetailKaryawan() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { data, loading, error } = useEmployeeDetail(id);

    if (!id) {
        return (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                Error: ID karyawan tidak ditemukan.
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
            <div className="space-y-4">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                </button>
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali
            </button>

            {/* Title */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">{data?.full_name || 'Detail Karyawan'}</h1>
                <p className="mt-1 text-slate-600">Informasi lengkap profil karyawan</p>
            </div>

            {/* Informasi Karyawan Card */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Informasi Karyawan</h2>

                {/* Informasi Pribadi Section */}
                <div className="mb-8">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">
                        Informasi Pribadi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* NIK */}
                        <div>
                            <label className="text-sm font-medium text-slate-600">NIK (Nomor Induk Kependudukan)</label>
                            <p className="mt-2 text-slate-900">{data?.nik || '-'}</p>
                        </div>

                        {/* Alamat */}
                        <div>
                            <label className="text-sm font-medium text-slate-600">Alamat</label>
                            <p className="mt-2 text-slate-900">{data?.address || '-'}</p>
                        </div>

                        {/* Kota/Kecamatan */}
                        <div>
                            <label className="text-sm font-medium text-slate-600">Kota/Kecamatan</label>
                            <p className="mt-2 text-slate-900">{data?.district || '-'}</p>
                        </div>

                        {/* Tempat Lahir */}
                        <div>
                            <label className="text-sm font-medium text-slate-600">Tempat Lahir</label>
                            <p className="mt-2 text-slate-900">{data?.place_of_birth || '-'}</p>
                        </div>

                        {/* Tanggal Lahir */}
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-slate-600">Tanggal Lahir</label>
                            <p className="mt-2 text-slate-900">{data?.birthdate_formatted || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200 my-8"></div>

                {/* Informasi Pekerjaan Section */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">
                        Informasi Pekerjaan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Perusahaan */}
                        <div>
                            <label className="text-sm font-medium text-slate-600">Perusahaan</label>
                            <p className="mt-2 text-slate-900">
                                {data?.contracts && data.contracts.length > 0
                                    ? data.contracts[0].company_name
                                    : '-'}
                            </p>
                        </div>

                        {/* Kontrak Sekarang */}
                        <div>
                            <label className="text-sm font-medium text-slate-600">Kontrak Sekarang</label>
                            <p className="mt-2 text-slate-900">
                                {data?.contracts && data.contracts.length > 0
                                    ? data.contracts[0].title
                                    : '-'}
                            </p>
                        </div>

                        {/* Jumlah Kontrak */}
                        <div>
                            <label className="text-sm font-medium text-slate-600">Jumlah Kontrak</label>
                            <p className="mt-2 text-slate-900">{data?.contracts?.length || 0} kontrak</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Riwayat Kontrak Table */}
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Riwayat Kontrak</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-6 py-3 text-left font-semibold text-slate-700">Judul Kontrak</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700">Perusahaan</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700">Tanggal Mulai</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700">Durasi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.contracts && data.contracts.length > 0 ? (
                                data.contracts.map((contract) => (
                                    <tr key={contract.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 text-slate-900">{contract.title}</td>
                                        <td className="px-6 py-4 text-slate-600">{contract.company_name}</td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {contract.start_date
                                                ? new Date(contract.start_date).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {contract.contract_type === 'PKWTT'
                                                ? 'Tetap'
                                                : contract.duration_months
                                                    ? `${contract.duration_months} bulan`
                                                    : '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        Tidak ada data riwayat kontrak
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
