import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Phone, MapPin, Globe, Info, User } from 'lucide-react';
import { dummyCompanies } from '../lib/dummyData';
import type { Company } from '../types/companyTypes';

export default function CompanyDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate data fetching
        const fetchCompany = () => {
            const foundCompany = dummyCompanies.find(c => c.id === id);
            if (foundCompany) {
                setCompany(foundCompany);
            } else {
                // Redirect if company not found
                navigate('/daftar-perusahaan');
            }
            setLoading(false);
        };

        fetchCompany();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse bg-white rounded-lg shadow p-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-full mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                        </div>
                        <div>
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!company) {
        return null; // Handled by redirect
    }

    return (
        <div className="p-0">
            {/* Header with back button */}
            <div className="px-6 pt-6 pb-2">
                <button
                    onClick={() => navigate('/daftar-perusahaan')}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Kembali ke Daftar Perusahaan</span>
                </button>
            </div>

            {/* Company Detail Content */}
            <div className="px-6 pb-6">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Company Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                            {/* Logo Fallback */}
                            <div className="w-20 h-20 rounded-lg bg-white/20 flex items-center justify-center border-2 border-white/30">
                                {company.logo ? (
                                    <img
                                        src={company.logo}
                                        alt={`${company.name} logo`}
                                        className="w-16 h-16 object-contain"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <Building2 className="w-12 h-12 text-white" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold">{company.name}</h1>
                                <p className="text-blue-100 mt-1">{company.about?.substring(0, 100)}...</p>
                            </div>
                        </div>
                    </div>

                    {/* Company Information */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column - Basic Information */}
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-blue-600" />
                                        Informasi Perusahaan
                                    </h2>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Nama Perusahaan</p>
                                            <p className="font-medium">{company.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Nomor Telepon</p>
                                            <p className="font-medium">{company.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Kontrak Aktif</p>
                                            <p className="font-medium">
                                                {company.activePkwts} PKWT | {company.activePkwtts} PKWTT
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-blue-600" />
                                        Alamat
                                    </h2>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Alamat Lengkap</p>
                                            <p className="font-medium">{company.address}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Kelurahan</p>
                                            <p className="font-medium">{company.subdistrict}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Kecamatan</p>
                                            <p className="font-medium">{company.district}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Kota</p>
                                            <p className="font-medium">{company.city}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Additional Information */}
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-blue-600" />
                                        Informasi Digital
                                    </h2>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Website</p>
                                            {company.website ? (
                                                <a
                                                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    {company.website}
                                                </a>
                                            ) : (
                                                <p className="font-medium text-gray-500">Tidak tersedia</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Info className="w-5 h-5 text-blue-600" />
                                        Tentang Perusahaan
                                    </h2>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {company.about || 'Tidak ada informasi tambahan tentang perusahaan ini.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}