import { useEffect, useMemo, useState } from 'react';
import { request } from '../lib/http';
import { toUserMessage } from '../lib/errors';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export type GuideType = 'pkwt' | 'pkwtt';

// Types (shared)
export interface ListItem {
    id: string;
    text: string;
    order: number;
    enabled: boolean;
}

export interface QAItem {
    id: string;
    question: string;
    answer: string;
    order: number;
    enabled: boolean;
}

export interface ContactItem {
    id: string;
    type: 'phone' | 'email' | 'address' | 'custom';
    label: string;
    value: string;
    icon?: string;
    color?: string;
    enabled: boolean;
    order: number;
}

export interface CardConfig {
    enabled: boolean;
    title: string;
    items: ListItem[] | QAItem[];
}

export interface HubungiKamiCard {
    enabled: boolean;
    title: string;
    contacts: ContactItem[];
    buttonText: string;
    buttonEnabled: boolean;
}

export interface GuideConfig {
    hero: {
        enabled: boolean;
        title: string;
        subtitle: string;
        description: string;
    };
    footerCTA: {
        enabled: boolean;
        text: string;
        button1Text: string;
        button1Link: string;
        button2Text: string;
        button2Link: string;
    };
    pengertianSection: {
        enabled: boolean;
        title: string;
        subtitle: string;
        cards: {
            karakteristik: CardConfig;
            kapanDigunakan: CardConfig;
            pertanyaanUmum: CardConfig;
        };
    };
    syaratKetentuanSection: {
        enabled: boolean;
        title: string;
        subtitle: string;
        cards: {
            syaratSah: CardConfig;
            jenisPekerjaan: CardConfig;
            persyaratanLegal: CardConfig;
        };
    };
    hakKewajibanSection: {
        enabled: boolean;
        title: string;
        subtitle: string;
        cards: {
            hakPekerja: CardConfig;
            kewajibanPekerja: CardConfig;
        };
    };
    konsultasiSection: {
        enabled: boolean;
        title: string;
        subtitle: string;
        cards: {
            layananKonsultasi: CardConfig;
            hubungiKami: HubungiKamiCard;
        };
    };
    updatedAt?: string;
    updatedBy?: string;
}

function replaceAllInsensitive(input: string, from: string, to: string) {
    return input
        .replaceAll(from.toUpperCase(), to.toUpperCase())
        .replaceAll(from, to)
        .replaceAll(from.toLowerCase(), to.toLowerCase());
}

function toPkwttConfig(fromPkwt: GuideConfig): GuideConfig {
    const cloned: GuideConfig = JSON.parse(JSON.stringify(fromPkwt));

    cloned.hero.title = replaceAllInsensitive(cloned.hero.title, 'PKWT', 'PKWTT');
    cloned.hero.subtitle = 'Sistem Aplikasi Pencatatan PKWTT';
    cloned.hero.description =
        'Selamat datang di sistem E-PKWT Dinas Ketenagakerjaan Kabupaten Paser. Pelajari panduan lengkap tentang PKWTT, syarat dan ketentuan, hak dan kewajiban, serta cara mengakses layanan konsultasi kami.';

    cloned.footerCTA.text = replaceAllInsensitive(cloned.footerCTA.text, 'PKWT', 'PKWTT');

    cloned.pengertianSection.title = 'Pengertian PKWTT';
    cloned.pengertianSection.subtitle = 'Memahami konsep dasar Perjanjian Kerja Waktu Tidak Tertentu';
    cloned.pengertianSection.cards.karakteristik.title = 'Karakteristik PKWTT';

    cloned.syaratKetentuanSection.subtitle = replaceAllInsensitive(cloned.syaratKetentuanSection.subtitle, 'PKWT', 'PKWTT');
    cloned.syaratKetentuanSection.cards.syaratSah.title = 'Syarat Sah PKWTT';
    cloned.syaratKetentuanSection.cards.jenisPekerjaan.title = 'Jenis Pekerjaan yang Umumnya PKWTT';

    cloned.hakKewajibanSection.cards.hakPekerja.title = 'Hak Pekerja PKWTT';
    cloned.hakKewajibanSection.cards.kewajibanPekerja.title = 'Kewajiban Pekerja PKWTT';

    // Light-touch replacements in list/Q&A text (admin can refine)
    (cloned.pengertianSection.cards.karakteristik.items as ListItem[]).forEach((it) => {
        it.text = replaceAllInsensitive(it.text, 'PKWT', 'PKWTT');
    });
    (cloned.pengertianSection.cards.kapanDigunakan.items as ListItem[]).forEach((it) => {
        it.text = replaceAllInsensitive(it.text, 'PKWT', 'PKWTT');
    });
    (cloned.pengertianSection.cards.pertanyaanUmum.items as QAItem[]).forEach((it) => {
        it.question = replaceAllInsensitive(it.question, 'PKWT', 'PKWTT');
        it.answer = replaceAllInsensitive(it.answer, 'PKWT', 'PKWTT');
    });

    (cloned.konsultasiSection.cards.layananKonsultasi.items as ListItem[]).forEach((it) => {
        it.text = replaceAllInsensitive(it.text, 'PKWT', 'PKWTT');
    });

    return cloned;
}

// Baseline initial config (PKWT) derived from previous Welcome page
const initialPkwtConfig: GuideConfig = {
    hero: {
        enabled: true,
        title: 'Panduan PKWT',
        subtitle: 'Sistem Aplikasi Pencatatan PKWT',
        description: 'Selamat datang di sistem E-PKWT Dinas Ketenagakerjaan Kabupaten Paser. Pelajari panduan lengkap tentang PKWT, syarat dan ketentuan, hak dan kewajiban, serta cara mengakses layanan konsultasi kami.',
    },
    footerCTA: {
        enabled: true,
        text: 'Sudah memahami panduan di atas? Mulai buat kontrak PKWT Anda sekarang!',
        button1Text: 'Buat Kontrak Baru',
        button1Link: '/form-kontrak',
        button2Text: 'Lihat Daftar Karyawan',
        button2Link: '/list-karyawan',
    },
    pengertianSection: {
        enabled: true,
        title: 'Pengertian PKWT',
        subtitle: 'Memahami konsep dasar Perjanjian Kerja Waktu Tertentu',
        cards: {
            karakteristik: {
                enabled: true,
                title: 'Karakteristik PKWT',
                items: [
                    { id: '1', text: 'Untuk pekerjaan tertentu dan sementara', order: 1, enabled: true },
                    { id: '2', text: 'Jangka waktu maksimal 5 tahun', order: 2, enabled: true },
                    { id: '3', text: 'Harus dibuat secara tertulis', order: 3, enabled: true },
                    { id: '4', text: 'Didaftarkan ke instansi ketenagakerjaan', order: 4, enabled: true },
                ],
            },
            kapanDigunakan: {
                enabled: true,
                title: 'Kapan Digunakan?',
                items: [
                    { id: '5', text: 'Pekerjaan musiman', order: 1, enabled: true },
                    { id: '6', text: 'Pekerjaan proyek tertentu', order: 2, enabled: true },
                    { id: '7', text: 'Pekerjaan sekali selesai', order: 3, enabled: true },
                    { id: '8', text: 'Pekerjaan baru dalam percobaan', order: 4, enabled: true },
                ],
            },
            pertanyaanUmum: {
                enabled: true,
                title: 'Pertanyaan Umum',
                items: [
                    {
                        id: '9',
                        question: 'Apa beda PKWT dan PKWTT?',
                        answer: 'PKWT untuk pekerjaan tertentu dan waktu terbatas, sedangkan PKWTT (Perjanjian Kerja Waktu Tidak Tertentu) untuk pekerjaan tetap tanpa batas waktu.',
                        order: 1,
                        enabled: true,
                    },
                    {
                        id: '10',
                        question: 'Berapa lama maksimal masa PKWT?',
                        answer: 'Maksimal 5 tahun sesuai UU Ketenagakerjaan, dengan perpanjangan maksimal 2 kali dan masa istirahat minimal 30 hari antar perpanjangan.',
                        order: 2,
                        enabled: true,
                    },
                    {
                        id: '11',
                        question: 'Apakah pekerja PKWT berhak mendapat THR?',
                        answer: 'Ya, pekerja PKWT berhak mendapat THR setelah bekerja secara terus-menerus selama 1 bulan atau lebih.',
                        order: 3,
                        enabled: true,
                    },
                    {
                        id: '12',
                        question: 'Bagaimana jika PKWT berakhir?',
                        answer: 'Perusahaan wajib memberikan uang pesangon dan/atau uang penghargaan masa kerja sesuai ketentuan yang berlaku.',
                        order: 4,
                        enabled: true,
                    },
                ] as QAItem[],
            },
        },
    },
    syaratKetentuanSection: {
        enabled: true,
        title: 'Syarat & Ketentuan',
        subtitle: 'Persyaratan legal dan ketentuan yang harus dipenuhi',
        cards: {
            syaratSah: {
                enabled: true,
                title: 'Syarat Sah PKWT',
                items: [
                    { id: '13', text: 'Dibuat secara tertulis dalam bahasa Indonesia', order: 1, enabled: true },
                    { id: '14', text: 'Mencantumkan identitas lengkap kedua belah pihak', order: 2, enabled: true },
                    { id: '15', text: 'Menyebutkan jenis pekerjaan yang diperjanjikan', order: 3, enabled: true },
                    { id: '16', text: 'Mencantumkan besarnya upah dan cara pembayarannya', order: 4, enabled: true },
                    { id: '17', text: 'Menyebutkan jangka waktu berlakunya perjanjian', order: 5, enabled: true },
                    { id: '18', text: 'Mencantumkan tempat pekerjaan', order: 6, enabled: true },
                ],
            },
            jenisPekerjaan: {
                enabled: true,
                title: 'Jenis Pekerjaan yang Bisa PKWT',
                items: [
                    { id: '19', text: 'Pekerjaan yang sekali selesai atau sementara', order: 1, enabled: true },
                    { id: '20', text: 'Pekerjaan yang diperkirakan penyelesaiannya ≤ 3 tahun', order: 2, enabled: true },
                    { id: '21', text: 'Pekerjaan musiman', order: 3, enabled: true },
                    { id: '22', text: 'Pekerjaan yang berhubungan dengan produk baru, aktivitas baru, atau produk tambahan yang masih dalam percobaan', order: 4, enabled: true },
                    { id: '23', text: 'Pekerjaan bersifat musiman', order: 5, enabled: true },
                ],
            },
            persyaratanLegal: {
                enabled: true,
                title: 'Persyaratan Legal',
                items: [
                    { id: '24', text: 'Harus dibuat dalam bahasa Indonesia', order: 1, enabled: true },
                    { id: '25', text: 'Maksimal 2 kali perpanjangan', order: 2, enabled: true },
                    { id: '26', text: 'Wajib didaftarkan ke Dinas Tenaga Kerja', order: 3, enabled: true },
                    { id: '27', text: 'Masa istirahat minimal 30 hari', order: 4, enabled: true },
                ],
            },
        },
    },
    hakKewajibanSection: {
        enabled: true,
        title: 'Hak & Kewajiban',
        subtitle: 'Hak yang diperoleh dan kewajiban yang harus dipenuhi',
        cards: {
            hakPekerja: {
                enabled: true,
                title: 'Hak Pekerja PKWT',
                items: [
                    { id: '28', text: 'Upah sesuai kesepakatan', order: 1, enabled: true },
                    { id: '29', text: 'Jaminan sosial (BPJS)', order: 2, enabled: true },
                    { id: '30', text: 'Cuti tahunan setelah 12 bulan', order: 3, enabled: true },
                    { id: '31', text: 'Uang pesangon saat berakhir', order: 4, enabled: true },
                    { id: '32', text: 'Keselamatan dan kesehatan kerja', order: 5, enabled: true },
                ],
            },
            kewajibanPekerja: {
                enabled: true,
                title: 'Kewajiban Pekerja PKWT',
                items: [
                    { id: '33', text: 'Melaksanakan pekerjaan dengan baik', order: 1, enabled: true },
                    { id: '34', text: 'Mematuhi peraturan perusahaan', order: 2, enabled: true },
                    { id: '35', text: 'Menjaga kerahasiaan perusahaan', order: 3, enabled: true },
                    { id: '36', text: 'Menyelesaikan pekerjaan tepat waktu', order: 4, enabled: true },
                    { id: '37', text: 'Mengikuti prosedur K3', order: 5, enabled: true },
                ],
            },
        },
    },
    konsultasiSection: {
        enabled: true,
        title: 'Konsultasi',
        subtitle: 'Layanan bantuan dan konsultasi profesional',
        cards: {
            layananKonsultasi: {
                enabled: true,
                title: 'Layanan Konsultasi',
                items: [
                    { id: '38', text: 'Review dan analisis kontrak PKWT', order: 1, enabled: true },
                    { id: '39', text: 'Bantuan penyusunan dokumen', order: 2, enabled: true },
                    { id: '40', text: 'Mediasi perselisihan', order: 3, enabled: true },
                    { id: '41', text: 'Pendaftaran ke Dinas Tenaga Kerja', order: 4, enabled: true },
                    { id: '42', text: 'Konsultasi hukum ketenagakerjaan', order: 5, enabled: true },
                ],
            },
            hubungiKami: {
                enabled: true,
                title: 'Hubungi Kami',
                contacts: [
                    {
                        id: 'contact-1',
                        type: 'phone',
                        label: 'Telepon',
                        value: '(0543) 12345',
                        icon: 'Phone',
                        color: 'cyan',
                        enabled: true,
                        order: 1,
                    },
                    {
                        id: 'contact-2',
                        type: 'email',
                        label: 'Email',
                        value: 'pkwt@disnaker.paserkab.go.id',
                        icon: 'Mail',
                        color: 'green',
                        enabled: true,
                        order: 2,
                    },
                    {
                        id: 'contact-3',
                        type: 'address',
                        label: 'Alamat',
                        value: 'Jl. Jenderal Sudirman No. 123, Tanah Grogot',
                        icon: 'MapPin',
                        color: 'orange',
                        enabled: true,
                        order: 3,
                    },
                ],
                buttonText: 'Jadwalkan Konsultasi',
                buttonEnabled: true,
            },
        },
    },
};

function getInitialConfig(type: GuideType): GuideConfig {
    return type === 'pkwtt' ? toPkwttConfig(initialPkwtConfig) : initialPkwtConfig;
}

export function useGuidePublic(type: GuideType) {
    const initial = useMemo(() => getInitialConfig(type), [type]);
    const [config, setConfig] = useState<GuideConfig>(initial);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const fetchConfig = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await request<{ ok: boolean; data: GuideConfig; message?: string }>(
                    `${API_BASE}/api/public/guide/${type}`
                );

                if (!cancelled) {
                    if (response.ok && response.data) setConfig(response.data);
                    else {
                        setError(response.message || 'Gagal memuat panduan');
                        setConfig(initial);
                    }
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(toUserMessage(err, 'Gagal memuat panduan'));
                    setConfig(initial);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchConfig();
        return () => {
            cancelled = true;
        };
    }, [type, initial]);

    return { config, loading, error };
}

export function useGuideConfig(type: GuideType) {
    const initial = useMemo(() => getInitialConfig(type), [type]);
    const [config, setConfig] = useState<GuideConfig>(initial);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const fetchConfig = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await request<{ ok: boolean; data: GuideConfig; message?: string }>(
                    `${API_BASE}/api/config/guide/${type}`
                );

                if (!cancelled) {
                    if (response.ok && response.data) setConfig(response.data);
                    else {
                        setError(response.message || 'Gagal memuat konfigurasi');
                        setConfig(initial);
                    }
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(toUserMessage(err, 'Gagal memuat konfigurasi'));
                    setConfig(initial);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchConfig();
        return () => {
            cancelled = true;
        };
    }, [type, initial]);

    const saveConfig = async (newConfig: GuideConfig) => {
        try {
            setSaving(true);
            setError(null);

            const response = await request<{ ok: boolean; message: string; data: GuideConfig }>(
                `${API_BASE}/api/config/guide/${type}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(newConfig),
                }
            );

            if (response.ok && response.data) {
                setConfig(response.data);
                return { success: true };
            }

            const errorMsg = response.message || 'Gagal menyimpan konfigurasi';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } catch (err: any) {
            const errorMsg = toUserMessage(err, 'Gagal menyimpan konfigurasi');
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setSaving(false);
        }
    };

    return { config, setConfig, loading, error, saving, saveConfig };
}
