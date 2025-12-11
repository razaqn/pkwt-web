import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Building2, Phone, MapPin, Globe, Info, Loader, AlertCircle, RotateCcw } from 'lucide-react';
import { getCompanyDetailById } from '../../lib/api';
import type { CompanyProfileData } from '../../lib/api';

export default function DetailCompany() {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<CompanyProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchCompanyDetail() {
            setLoading(true);
            setError(null);

            try {
                const response = await getCompanyDetailById(id!);
                if (isMounted) {
                    setProfile(response.data);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err?.message || 'Gagal memuat detail perusahaan');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        if (id) {
            fetchCompanyDetail();
        }

        return () => {
            isMounted = false;
        };
    }, [id]);

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-slate-600">
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Memuat detail perusahaan...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Detail Perusahaan</h1>
                    <p className="mt-1 text-slate-600">Informasi lengkap tentang perusahaan</p>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Terjadi Kesalahan</p>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-3 inline-flex items-center gap-1.5 rounded bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 transition"
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
            <div className="rounded-lg border bg-slate-50 p-8 text-center">
                <p className="text-slate-600">Tidak ada data perusahaan</p>
            </div>
        );
    }

    const totalActiveContracts = profile.active_contracts_pkwt + profile.active_contracts_pkwtt;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Detail Perusahaan</h1>
                <p className="mt-1 text-slate-600">Informasi lengkap tentang perusahaan</p>
            </div>

            {/* Informasi Dasar Section */}
            <div className="space-y-4">
                <h2 className="text-base font-semibold text-slate-700">Informasi Dasar</h2>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Card: Informasi Perusahaan */}
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-slate-600" />
                            <h3 className="text-sm font-semibold text-slate-800">Informasi Perusahaan</h3>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Nama Perusahaan</p>
                                <p className="mt-1 text-sm font-medium text-slate-900">{profile.company_name}</p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Nomor Telepon</p>
                                <div className="mt-1 flex items-center gap-2 text-sm text-slate-700">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                    <span>{profile.phone_number}</span>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Kontrak Aktif</p>
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                    <div className="rounded-md bg-blue-50 px-2 py-2 text-center">
                                        <p className="text-xs text-blue-700">PKWT</p>
                                        <p className="text-lg font-bold text-blue-900">{profile.active_contracts_pkwt}</p>
                                    </div>
                                    <div className="rounded-md bg-green-50 px-2 py-2 text-center">
                                        <p className="text-xs text-green-700">PKWTT</p>
                                        <p className="text-lg font-bold text-green-900">{profile.active_contracts_pkwtt}</p>
                                    </div>
                                    <div className="rounded-md bg-slate-100 px-2 py-2 text-center">
                                        <p className="text-xs text-slate-600">Total</p>
                                        <p className="text-lg font-bold text-slate-800">{totalActiveContracts}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card: Alamat */}
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-slate-600" />
                            <h3 className="text-sm font-semibold text-slate-800">Alamat Perusahaan</h3>
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Informasi Tambahan Section */}
            <div className="space-y-4">
                <h2 className="text-base font-semibold text-slate-700">Informasi Tambahan</h2>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Card: Website */}
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <Globe className="h-5 w-5 text-slate-600" />
                            <h3 className="text-sm font-semibold text-slate-800">Media Digital</h3>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-2">Website</p>
                            {profile.website_url ? (
                                <a
                                    href={profile.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 hover:underline transition"
                                >
                                    <span className="break-all">{profile.website_url}</span>
                                    <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                                </a>
                            ) : (
                                <p className="text-sm text-slate-500 italic">Tidak ada website</p>
                            )}
                        </div>
                    </div>

                    {/* Card: Tentang Perusahaan */}
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <Info className="h-5 w-5 text-slate-600" />
                            <h3 className="text-sm font-semibold text-slate-800">Tentang Perusahaan</h3>
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
