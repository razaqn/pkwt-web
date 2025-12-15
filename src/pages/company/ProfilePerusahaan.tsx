import { Building2, Phone, MapPin, Globe, Info, AlertCircle, RotateCcw } from 'lucide-react';
import { useCompanyProfile } from '../../hooks/useCompanyProfile';
import { MoonLoader } from 'react-spinners';
import { EmptyState } from '../../components/dashboard/EmptyState';

export default function ProfilePerusahaan() {
    const { profile, loading, error, refetch } = useCompanyProfile();

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3 text-slate-600">
                    <MoonLoader size={40} color="#419823" />
                    <span className="text-sm">Memuat profil perusahaan...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <p className="text-sm font-semibold text-primary">Profil</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Profil Perusahaan</h1>
                    <p className="mt-1 text-sm text-slate-600">Informasi lengkap tentang perusahaan Anda</p>
                </div>

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

    // No data state
    if (!profile) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-primary">Profil</p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Profil Perusahaan</h1>
                        <p className="mt-1 text-sm text-slate-600">Informasi lengkap tentang perusahaan Anda</p>
                    </div>

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
                        <p className="mt-1 text-sm text-slate-600">Kami belum menemukan profil perusahaan untuk akun ini.</p>
                    </div>
                    <div className="px-5">
                        <EmptyState
                            title="Tidak ada data profil perusahaan"
                            description="Coba refresh halaman. Jika masih kosong, pastikan data perusahaan sudah terdaftar di sistem."
                        />
                    </div>
                </div>
            </div>
        );
    }

    const totalActiveContracts = profile.activeContractsPKWT + profile.activeContractsPKWTT;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-primary">Profil</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Profil Perusahaan</h1>
                    <p className="mt-1 text-sm text-slate-600">Informasi lengkap tentang perusahaan Anda</p>
                </div>

                <button
                    onClick={() => refetch()}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-primary/5 transition-colors"
                >
                    <RotateCcw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* Informasi Dasar Section */}
            <div className="space-y-4">
                <h2 className="text-base font-semibold text-slate-800">Informasi Dasar</h2>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Card: Informasi Perusahaan */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">Informasi Perusahaan</h3>
                                <p className="text-xs text-slate-500">Ringkasan identitas dan kontrak aktif</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Nama Perusahaan</p>
                                <p className="mt-1 text-sm font-medium text-slate-900">{profile.companyName}</p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Nomor Telepon</p>
                                <div className="mt-1 flex items-center gap-2 text-sm text-slate-700">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                    <span>{profile.phoneNumber}</span>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Kontrak Aktif</p>
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                    <div className="rounded-lg bg-primary/10 px-2 py-2 text-center ring-1 ring-inset ring-primary/15">
                                        <p className="text-xs font-semibold text-primary">PKWT</p>
                                        <p className="text-lg font-bold text-primary">{profile.activeContractsPKWT}</p>
                                    </div>
                                    <div className="rounded-lg bg-secondary/30 px-2 py-2 text-center ring-1 ring-inset ring-secondary/40">
                                        <p className="text-xs font-semibold text-slate-900">PKWTT</p>
                                        <p className="text-lg font-bold text-slate-900">{profile.activeContractsPKWTT}</p>
                                    </div>
                                    <div className="rounded-lg bg-slate-100 px-2 py-2 text-center ring-1 ring-inset ring-slate-200">
                                        <p className="text-xs text-slate-600">Total</p>
                                        <p className="text-lg font-bold text-slate-800">{totalActiveContracts}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card: Alamat */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                <MapPin className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">Alamat Perusahaan</h3>
                                <p className="text-xs text-slate-500">Lokasi dan wilayah administrasi</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Jalan / Nomor</p>
                                <p className="mt-1 text-sm text-slate-700 leading-relaxed">{profile.address}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Kelurahan</p>
                                    <p className="mt-1 text-sm text-slate-700">{profile.village || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Kecamatan</p>
                                    <p className="mt-1 text-sm text-slate-700">{profile.district || '-'}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Kota</p>
                                <p className="mt-1 text-sm text-slate-700">{profile.city || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Informasi Tambahan Section */}
            <div className="space-y-4">
                <h2 className="text-base font-semibold text-slate-800">Informasi Tambahan</h2>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Card: Website */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                <Globe className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">Media Digital</h3>
                                <p className="text-xs text-slate-500">Website dan kanal informasi</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-2">Website</p>
                            {profile.websiteUrl ? (
                                <a
                                    href={profile.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/90 hover:underline transition"
                                >
                                    <span className="break-all">{profile.websiteUrl}</span>
                                    <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                                </a>
                            ) : (
                                <p className="text-sm text-slate-500 italic">Tidak ada website</p>
                            )}
                        </div>
                    </div>

                    {/* Card: Tentang Perusahaan */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                <Info className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">Tentang Perusahaan</h3>
                                <p className="text-xs text-slate-500">Deskripsi singkat perusahaan</p>
                            </div>
                        </div>

                        <div>
                            {profile.description ? (
                                <p className="text-sm text-slate-700 leading-relaxed">{profile.description}</p>
                            ) : (
                                <p className="text-sm text-slate-500 italic">Belum ada deskripsi perusahaan</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
