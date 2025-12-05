import type { Employee, Contract } from '../types/employeeTypes';
import type { Company } from '../types/companyTypes';
import type { Approval, ApprovalEmployee } from '../types/approvalTypes';

/**
 * Dummy employee data for development and testing
 */
export const dummyEmployees: Employee[] = [
    {
        id: '1',
        fullName: 'Budi Santoso',
        nik: '1234567890123456',
        address: 'Jl. Merdeka No. 10, RT 01/RW 02',
        city: 'Jakarta Pusat',
        district: 'Gambir',
        birthPlace: 'Jakarta',
        birthDate: '1985-05-15',
        company: 'PT Maju Bersama',
        currentContract: 'PKWT 1 Tahun',
        totalContracts: 3
    },
    {
        id: '2',
        fullName: 'Siti Aminah',
        nik: '2345678901234567',
        address: 'Jl. Sudirman No. 25, RT 03/RW 04',
        city: 'Jakarta Selatan',
        district: 'Kebayoran Baru',
        birthPlace: 'Bandung',
        birthDate: '1990-08-22',
        company: 'PT Sejahtera Abadi',
        currentContract: 'PKWTT',
        totalContracts: 2
    },
    {
        id: '3',
        fullName: 'Andi Wijaya',
        nik: '3456789012345678',
        address: 'Jl. Gatot Subroto No. 15, RT 05/RW 06',
        city: 'Jakarta Selatan',
        district: 'Mampang Prapatan',
        birthPlace: 'Surabaya',
        birthDate: '1988-11-30',
        company: 'PT Teknologi Canggih',
        currentContract: 'PKWT 6 Bulan',
        totalContracts: 4
    },
    {
        id: '4',
        fullName: 'Dewi Lestari',
        nik: '4567890123456789',
        address: 'Jl. Thamrin No. 8, RT 02/RW 03',
        city: 'Jakarta Pusat',
        district: 'Menteng',
        birthPlace: 'Yogyakarta',
        birthDate: '1992-03-10',
        company: 'PT Maju Bersama',
        currentContract: 'PKWT 2 Tahun',
        totalContracts: 3
    },
    {
        id: '5',
        fullName: 'Rudi Hartono',
        nik: '5678901234567890',
        address: 'Jl. KH. Wahid Hasyim No. 30, RT 04/RW 05',
        city: 'Jakarta Pusat',
        district: 'Tanah Abang',
        birthPlace: 'Semarang',
        birthDate: '1987-07-18',
        company: 'PT Sejahtera Abadi',
        currentContract: 'PKWTT',
        totalContracts: 2
    },
    {
        id: '6',
        fullName: 'Maya Sari',
        nik: '6789012345678901',
        address: 'Jl. HR Rasuna Said No. 20, RT 06/RW 07',
        city: 'Jakarta Selatan',
        district: 'Setiabudi',
        birthPlace: 'Medan',
        birthDate: '1993-09-25',
        company: 'PT Teknologi Canggih',
        currentContract: 'PKWT 1 Tahun',
        totalContracts: 3
    },
    {
        id: '7',
        fullName: 'Agus Prasetyo',
        nik: '7890123456789012',
        address: 'Jl. MH Thamrin No. 12, RT 01/RW 02',
        city: 'Jakarta Pusat',
        district: 'Gambir',
        birthPlace: 'Jakarta',
        birthDate: '1989-12-05',
        company: 'PT Maju Bersama',
        currentContract: 'PKWT 6 Bulan',
        totalContracts: 4
    },
    {
        id: '8',
        fullName: 'Lina Marlina',
        nik: '8901234567890123',
        address: 'Jl. Jenderal Sudirman No. 5, RT 03/RW 04',
        city: 'Jakarta Pusat',
        district: 'Tanah Abang',
        birthPlace: 'Bandung',
        birthDate: '1991-04-14',
        company: 'PT Sejahtera Abadi',
        currentContract: 'PKWTT',
        totalContracts: 2
    },
    {
        id: '9',
        fullName: 'Eko Susanto',
        nik: '9012345678901234',
        address: 'Jl. Gajah Mada No. 18, RT 05/RW 06',
        city: 'Jakarta Barat',
        district: 'Tambora',
        birthPlace: 'Surabaya',
        birthDate: '1986-10-20',
        company: 'PT Teknologi Canggih',
        currentContract: 'PKWT 2 Tahun',
        totalContracts: 3
    },
    {
        id: '10',
        fullName: 'Rina Fitriani',
        nik: '0123456789012345',
        address: 'Jl. Hayam Wuruk No. 22, RT 02/RW 03',
        city: 'Jakarta Barat',
        district: 'Taman Sari',
        birthPlace: 'Yogyakarta',
        birthDate: '1994-06-30',
        company: 'PT Maju Bersama',
        currentContract: 'PKWT 1 Tahun',
        totalContracts: 2
    },
    {
        id: '11',
        fullName: 'Dedi Kurniawan',
        nik: '1122334455667788',
        address: 'Jl. Diponegoro No. 14, RT 04/RW 05',
        city: 'Bandung',
        district: 'Cicendo',
        birthPlace: 'Bandung',
        birthDate: '1984-02-15',
        company: 'PT Sejahtera Abadi',
        currentContract: 'PKWTT',
        totalContracts: 3
    },
    {
        id: '12',
        fullName: 'Yuni Astuti',
        nik: '2233445566778899',
        address: 'Jl. Asia Afrika No. 5, RT 01/RW 02',
        city: 'Bandung',
        district: 'Sumur Bandung',
        birthPlace: 'Jakarta',
        birthDate: '1995-08-12',
        company: 'PT Teknologi Canggih',
        currentContract: 'PKWT 6 Bulan',
        totalContracts: 4
    },
    {
        id: '13',
        fullName: 'Hendra Setiawan',
        nik: '3344556677889900',
        address: 'Jl. Pasteur No. 33, RT 03/RW 04',
        city: 'Bandung',
        district: 'Sukajadi',
        birthPlace: 'Surabaya',
        birthDate: '1983-11-28',
        company: 'PT Maju Bersama',
        currentContract: 'PKWT 2 Tahun',
        totalContracts: 3
    },
    {
        id: '14',
        fullName: 'Wati Susanti',
        nik: '4455667788990011',
        address: 'Jl. Cihampelas No. 10, RT 05/RW 06',
        city: 'Bandung',
        district: 'Cihampelas',
        birthPlace: 'Yogyakarta',
        birthDate: '1996-05-19',
        company: 'PT Sejahtera Abadi',
        currentContract: 'PKWT 1 Tahun',
        totalContracts: 2
    },
    {
        id: '15',
        fullName: 'Joko Widodo',
        nik: '5566778899001122',
        address: 'Jl. Dago No. 25, RT 02/RW 03',
        city: 'Bandung',
        district: 'Coblong',
        birthPlace: 'Semarang',
        birthDate: '1982-09-08',
        company: 'PT Teknologi Canggih',
        currentContract: 'PKWTT',
        totalContracts: 4
    }
];

/**
 * Dummy contract history data for development and testing
 */
export const dummyContracts: Contract[] = [
    // Contracts for Budi Santoso (id: '1')
    {
        id: 'c1-1',
        employeeId: '1',
        title: 'PKWT Tahun Pertama',
        company: 'PT Maju Bersama',
        startDate: '2022-01-15',
        duration: '12 bulan'
    },
    {
        id: 'c1-2',
        employeeId: '1',
        title: 'PKWT Perpanjangan',
        company: 'PT Maju Bersama',
        startDate: '2023-01-15',
        duration: '12 bulan'
    },
    {
        id: 'c1-3',
        employeeId: '1',
        title: 'PKWT Terbaru',
        company: 'PT Maju Bersama',
        startDate: '2024-01-15',
        duration: '12 bulan'
    },

    // Contracts for Siti Aminah (id: '2')
    {
        id: 'c2-1',
        employeeId: '2',
        title: 'PKWTT Awal',
        company: 'PT Sejahtera Abadi',
        startDate: '2021-06-01',
        duration: 'Tetap'
    },
    {
        id: 'c2-2',
        employeeId: '2',
        title: 'PKWTT Lanjutan',
        company: 'PT Sejahtera Abadi',
        startDate: '2023-06-01',
        duration: 'Tetap'
    },

    // Contracts for Andi Wijaya (id: '3')
    {
        id: 'c3-1',
        employeeId: '3',
        title: 'PKWT Proyek A',
        company: 'PT Teknologi Canggih',
        startDate: '2021-11-01',
        duration: '6 bulan'
    },
    {
        id: 'c3-2',
        employeeId: '3',
        title: 'PKWT Proyek B',
        company: 'PT Teknologi Canggih',
        startDate: '2022-05-01',
        duration: '6 bulan'
    },
    {
        id: 'c3-3',
        employeeId: '3',
        title: 'PKWT Proyek C',
        company: 'PT Teknologi Canggih',
        startDate: '2022-11-01',
        duration: '6 bulan'
    },
    {
        id: 'c3-4',
        employeeId: '3',
        title: 'PKWT Proyek D',
        company: 'PT Teknologi Canggih',
        startDate: '2023-05-01',
        duration: '6 bulan'
    },

    // Contracts for Dewi Lestari (id: '4')
    {
        id: 'c4-1',
        employeeId: '4',
        title: 'PKWT Marketing',
        company: 'PT Maju Bersama',
        startDate: '2022-03-01',
        duration: '12 bulan'
    },
    {
        id: 'c4-2',
        employeeId: '4',
        title: 'PKWT Marketing Perpanjangan',
        company: 'PT Maju Bersama',
        startDate: '2023-03-01',
        duration: '12 bulan'
    },
    {
        id: 'c4-3',
        employeeId: '4',
        title: 'PKWT Marketing Terbaru',
        company: 'PT Maju Bersama',
        startDate: '2024-03-01',
        duration: '24 bulan'
    },

    // Contracts for Rudi Hartono (id: '5')
    {
        id: 'c5-1',
        employeeId: '5',
        title: 'PKWTT Keuangan',
        company: 'PT Sejahtera Abadi',
        startDate: '2020-09-01',
        duration: 'Tetap'
    },
    {
        id: 'c5-2',
        employeeId: '5',
        title: 'PKWTT Keuangan Lanjutan',
        company: 'PT Sejahtera Abadi',
        startDate: '2023-09-01',
        duration: 'Tetap'
    },

    // Contracts for Maya Sari (id: '6')
    {
        id: 'c6-1',
        employeeId: '6',
        title: 'PKWT HRD',
        company: 'PT Teknologi Canggih',
        startDate: '2023-01-10',
        duration: '12 bulan'
    },
    {
        id: 'c6-2',
        employeeId: '6',
        title: 'PKWT HRD Perpanjangan',
        company: 'PT Teknologi Canggih',
        startDate: '2024-01-10',
        duration: '12 bulan'
    },
    {
        id: 'c6-3',
        employeeId: '6',
        title: 'PKWT HRD Tambahan',
        company: 'PT Teknologi Canggih',
        startDate: '2024-07-01',
        duration: '6 bulan'
    },

    // Contracts for Agus Prasetyo (id: '7')
    {
        id: 'c7-1',
        employeeId: '7',
        title: 'PKWT IT Support',
        company: 'PT Maju Bersama',
        startDate: '2021-07-01',
        duration: '6 bulan'
    },
    {
        id: 'c7-2',
        employeeId: '7',
        title: 'PKWT IT Support Perpanjangan',
        company: 'PT Maju Bersama',
        startDate: '2022-01-01',
        duration: '6 bulan'
    },
    {
        id: 'c7-3',
        employeeId: '7',
        title: 'PKWT Sistem',
        company: 'PT Maju Bersama',
        startDate: '2022-07-01',
        duration: '6 bulan'
    },
    {
        id: 'c7-4',
        employeeId: '7',
        title: 'PKWT Sistem Terbaru',
        company: 'PT Maju Bersama',
        startDate: '2023-01-01',
        duration: '6 bulan'
    },

    // Contracts for Lina Marlina (id: '8')
    {
        id: 'c8-1',
        employeeId: '8',
        title: 'PKWTT Sales',
        company: 'PT Sejahtera Abadi',
        startDate: '2022-02-15',
        duration: 'Tetap'
    },
    {
        id: 'c8-2',
        employeeId: '8',
        title: 'PKWTT Sales Lanjutan',
        company: 'PT Sejahtera Abadi',
        startDate: '2024-02-15',
        duration: 'Tetap'
    },

    // Contracts for Eko Susanto (id: '9')
    {
        id: 'c9-1',
        employeeId: '9',
        title: 'PKWT Pengembangan',
        company: 'PT Teknologi Canggih',
        startDate: '2021-12-01',
        duration: '12 bulan'
    },
    {
        id: 'c9-2',
        employeeId: '9',
        title: 'PKWT Pengembangan Perpanjangan',
        company: 'PT Teknologi Canggih',
        startDate: '2022-12-01',
        duration: '12 bulan'
    },
    {
        id: 'c9-3',
        employeeId: '9',
        title: 'PKWT R&D',
        company: 'PT Teknologi Canggih',
        startDate: '2023-12-01',
        duration: '24 bulan'
    },

    // Contracts for Rina Fitriani (id: '10')
    {
        id: 'c10-1',
        employeeId: '10',
        title: 'PKWT Administrasi',
        company: 'PT Maju Bersama',
        startDate: '2023-02-01',
        duration: '12 bulan'
    },
    {
        id: 'c10-2',
        employeeId: '10',
        title: 'PKWT Administrasi Lanjutan',
        company: 'PT Maju Bersama',
        startDate: '2024-02-01',
        duration: '12 bulan'
    },

    // Contracts for Dedi Kurniawan (id: '11')
    {
        id: 'c11-1',
        employeeId: '11',
        title: 'PKWTT Operasional',
        company: 'PT Sejahtera Abadi',
        startDate: '2020-05-01',
        duration: 'Tetap'
    },
    {
        id: 'c11-2',
        employeeId: '11',
        title: 'PKWTT Operasional Lanjutan',
        company: 'PT Sejahtera Abadi',
        startDate: '2023-05-01',
        duration: 'Tetap'
    },
    {
        id: 'c11-3',
        employeeId: '11',
        title: 'PKWT Proyek Khusus',
        company: 'PT Sejahtera Abadi',
        startDate: '2024-01-01',
        duration: '6 bulan'
    },

    // Contracts for Yuni Astuti (id: '12')
    {
        id: 'c12-1',
        employeeId: '12',
        title: 'PKWT Customer Service',
        company: 'PT Teknologi Canggih',
        startDate: '2022-09-01',
        duration: '6 bulan'
    },
    {
        id: 'c12-2',
        employeeId: '12',
        title: 'PKWT Customer Service Perpanjangan',
        company: 'PT Teknologi Canggih',
        startDate: '2023-03-01',
        duration: '6 bulan'
    },
    {
        id: 'c12-3',
        employeeId: '12',
        title: 'PKWT Support',
        company: 'PT Teknologi Canggih',
        startDate: '2023-09-01',
        duration: '6 bulan'
    },
    {
        id: 'c12-4',
        employeeId: '12',
        title: 'PKWT Support Terbaru',
        company: 'PT Teknologi Canggih',
        startDate: '2024-03-01',
        duration: '6 bulan'
    },

    // Contracts for Hendra Setiawan (id: '13')
    {
        id: 'c13-1',
        employeeId: '13',
        title: 'PKWT Manajemen',
        company: 'PT Maju Bersama',
        startDate: '2021-04-01',
        duration: '12 bulan'
    },
    {
        id: 'c13-2',
        employeeId: '13',
        title: 'PKWT Manajemen Perpanjangan',
        company: 'PT Maju Bersama',
        startDate: '2022-04-01',
        duration: '12 bulan'
    },
    {
        id: 'c13-3',
        employeeId: '13',
        title: 'PKWT Eksekutif',
        company: 'PT Maju Bersama',
        startDate: '2023-04-01',
        duration: '24 bulan'
    },

    // Contracts for Wati Susanti (id: '14')
    {
        id: 'c14-1',
        employeeId: '14',
        title: 'PKWT Pemasaran',
        company: 'PT Sejahtera Abadi',
        startDate: '2023-06-01',
        duration: '12 bulan'
    },
    {
        id: 'c14-2',
        employeeId: '14',
        title: 'PKWT Pemasaran Lanjutan',
        company: 'PT Sejahtera Abadi',
        startDate: '2024-06-01',
        duration: '12 bulan'
    },

    // Contracts for Joko Widodo (id: '15')
    {
        id: 'c15-1',
        employeeId: '15',
        title: 'PKWTT Teknologi',
        company: 'PT Teknologi Canggih',
        startDate: '2019-11-01',
        duration: 'Tetap'
    },
    {
        id: 'c15-2',
        employeeId: '15',
        title: 'PKWTT Teknologi Lanjutan',
        company: 'PT Teknologi Canggih',
        startDate: '2022-11-01',
        duration: 'Tetap'
    },
    {
        id: 'c15-3',
        employeeId: '15',
        title: 'PKWT Inovasi',
        company: 'PT Teknologi Canggih',
        startDate: '2023-11-01',
        duration: '12 bulan'
    },
    {
        id: 'c15-4',
        employeeId: '15',
        title: 'PKWT Penelitian',
        company: 'PT Teknologi Canggih',
        startDate: '2024-05-01',
        duration: '12 bulan'
    }
];

/**
 * Dummy company data for development and testing
 */
export const dummyCompanies: Company[] = [
    {
        id: '1',
        name: 'PT Maju Bersama',
        address: 'Jl. Merdeka No. 10, RT 01/RW 02',
        city: 'Jakarta Pusat',
        district: 'Gambir',
        subdistrict: 'Gambir',
        phone: '021-12345678',
        website: 'https://majubersama.co.id',
        about: 'Perusahaan terkemuka di bidang perdagangan dan distribusi dengan jaringan luas di seluruh Indonesia. Berkomitmen untuk memberikan pelayanan terbaik kepada pelanggan.',
        logo: '',
        activePkwts: 15,
        activePkwtts: 8
    },
    {
        id: '2',
        name: 'PT Sejahtera Abadi',
        address: 'Jl. Sudirman No. 25, RT 03/RW 04',
        city: 'Jakarta Selatan',
        district: 'Kebayoran Baru',
        subdistrict: 'Kebayoran',
        phone: '021-23456789',
        website: 'https://sejahteraabadi.com',
        about: 'Perusahaan manufaktur yang bergerak di bidang produksi barang konsumen. Memiliki pabrik modern dan tenaga kerja yang terampil.',
        logo: '',
        activePkwts: 12,
        activePkwtts: 10
    },
    {
        id: '3',
        name: 'PT Teknologi Canggih',
        address: 'Jl. Gatot Subroto No. 15, RT 05/RW 06',
        city: 'Jakarta Selatan',
        district: 'Mampang Prapatan',
        subdistrict: 'Mampang',
        phone: '021-34567890',
        website: 'https://teknologicanggih.id',
        about: 'Perusahaan teknologi informasi yang menyediakan solusi digital untuk berbagai industri. Fokus pada pengembangan perangkat lunak dan sistem integrasi.',
        logo: '',
        activePkwts: 18,
        activePkwtts: 7
    },
    {
        id: '4',
        name: 'PT Inovasi Digital',
        address: 'Jl. Thamrin No. 8, RT 02/RW 03',
        city: 'Jakarta Pusat',
        district: 'Menteng',
        subdistrict: 'Menteng',
        phone: '021-45678901',
        website: 'https://inovasidigital.co.id',
        about: 'Startup teknologi yang berfokus pada pengembangan aplikasi mobile dan platform digital. Memiliki tim pengembang muda dan kreatif.',
        logo: '',
        activePkwts: 22,
        activePkwtts: 5
    },
    {
        id: '5',
        name: 'PT Solusi Bisnis',
        address: 'Jl. KH. Wahid Hasyim No. 30, RT 04/RW 05',
        city: 'Jakarta Pusat',
        district: 'Tanah Abang',
        subdistrict: 'Bendungan Hilir',
        phone: '021-56789012',
        website: 'https://solusibisnis.com',
        about: 'Perusahaan konsultan bisnis yang membantu perusahaan dalam mengoptimalkan operasional dan meningkatkan efisiensi. Berpengalaman di berbagai sektor industri.',
        logo: '',
        activePkwts: 9,
        activePkwtts: 12
    },
    {
        id: '6',
        name: 'PT Kreasi Indonesia',
        address: 'Jl. HR Rasuna Said No. 20, RT 06/RW 07',
        city: 'Jakarta Selatan',
        district: 'Setiabudi',
        subdistrict: 'Kuningan',
        phone: '021-67890123',
        website: 'https://kreasiindonesia.id',
        about: 'Perusahaan kreatif yang bergerak di bidang desain, branding, dan pemasaran digital. Membantu merek membangun identitas dan strategi pemasaran yang efektif.',
        logo: '',
        activePkwts: 14,
        activePkwtts: 9
    },
    {
        id: '7',
        name: 'PT Harmoni Sejahtera',
        address: 'Jl. MH Thamrin No. 12, RT 01/RW 02',
        city: 'Jakarta Pusat',
        district: 'Gambir',
        subdistrict: 'Gambir',
        phone: '021-78901234',
        website: 'https://harmonisejahtera.co.id',
        about: 'Perusahaan properti yang mengembangkan berbagai proyek perumahan dan komersial. Berkomitmen untuk menciptakan lingkungan hunian yang nyaman dan modern.',
        logo: '',
        activePkwts: 11,
        activePkwtts: 6
    },
    {
        id: '8',
        name: 'PT Global Mandiri',
        address: 'Jl. Jenderal Sudirman No. 5, RT 03/RW 04',
        city: 'Jakarta Pusat',
        district: 'Tanah Abang',
        subdistrict: 'Bendungan Hilir',
        phone: '021-89012345',
        website: 'https://globalmandiri.com',
        about: 'Perusahaan multinasional yang bergerak di bidang perdagangan internasional. Memiliki jaringan bisnis di berbagai negara.',
        logo: '',
        activePkwts: 19,
        activePkwtts: 4
    },
    {
        id: '9',
        name: 'PT Bangun Masa Depan',
        address: 'Jl. Gajah Mada No. 18, RT 05/RW 06',
        city: 'Jakarta Barat',
        district: 'Tambora',
        subdistrict: 'Tambora',
        phone: '021-90123456',
        website: 'https://bangunmasadepan.id',
        about: 'Perusahaan konstruksi yang mengerjakan berbagai proyek infrastruktur dan bangunan. Memiliki pengalaman dalam proyek skala besar.',
        logo: '',
        activePkwts: 7,
        activePkwtts: 15
    },
    {
        id: '10',
        name: 'PT Sinar Harapan',
        address: 'Jl. Hayam Wuruk No. 22, RT 02/RW 03',
        city: 'Jakarta Barat',
        district: 'Taman Sari',
        subdistrict: 'Glodok',
        phone: '021-01234567',
        website: 'https://sinarharapan.co.id',
        about: 'Perusahaan distribusi barang elektronik dan peralatan rumah tangga. Menyediakan berbagai produk berkualitas dengan harga kompetitif.',
        logo: '',
        activePkwts: 13,
        activePkwtts: 8
    },
    {
        id: '11',
        name: 'PT Cipta Karya',
        address: 'Jl. Diponegoro No. 14, RT 04/RW 05',
        city: 'Bandung',
        district: 'Cicendo',
        subdistrict: 'Cicendo',
        phone: '022-1234567',
        website: 'https://ciptakarya.co.id',
        about: 'Perusahaan manufaktur yang memproduksi berbagai komponen industri. Berkomitmen untuk kualitas dan inovasi dalam setiap produk.',
        logo: '',
        activePkwts: 16,
        activePkwtts: 7
    },
    {
        id: '12',
        name: 'PT Daya Manunggal',
        address: 'Jl. Asia Afrika No. 5, RT 01/RW 02',
        city: 'Bandung',
        district: 'Sumur Bandung',
        subdistrict: 'Braga',
        phone: '022-2345678',
        website: 'https://dayamanunggal.com',
        about: 'Perusahaan logistik dan pengiriman barang yang handal. Menyediakan layanan pengiriman cepat dan aman ke seluruh Indonesia.',
        logo: '',
        activePkwts: 8,
        activePkwtts: 11
    },
    {
        id: '13',
        name: 'PT Sentosa Jaya',
        address: 'Jl. Pasteur No. 33, RT 03/RW 04',
        city: 'Bandung',
        district: 'Sukajadi',
        subdistrict: 'Sukawarna',
        phone: '022-3456789',
        website: 'https://sentosajaya.id',
        about: 'Perusahaan ritel yang mengoperasikan berbagai toko swalayan. Menyediakan berbagai kebutuhan sehari-hari dengan harga terjangkau.',
        logo: '',
        activePkwts: 20,
        activePkwtts: 6
    },
    {
        id: '14',
        name: 'PT Makmur Bersama',
        address: 'Jl. Cihampelas No. 10, RT 05/RW 06',
        city: 'Bandung',
        district: 'Cihampelas',
        subdistrict: 'Cihampelas',
        phone: '022-4567890',
        website: 'https://makmurbersama.com',
        about: 'Perusahaan tekstil yang memproduksi berbagai jenis kain dan pakaian jadi. Memiliki pabrik modern dengan teknologi terbaru.',
        logo: '',
        activePkwts: 10,
        activePkwtts: 9
    },
    {
        id: '15',
        name: 'PT Nusantara Sejahtera',
        address: 'Jl. Dago No. 25, RT 02/RW 03',
        city: 'Bandung',
        district: 'Coblong',
        subdistrict: 'Dago',
        phone: '022-5678901',
        website: 'https://nusantarasejahtera.co.id',
        about: 'Perusahaan agribisnis yang bergerak di bidang pengolahan hasil pertanian. Memiliki berbagai produk olahan berkualitas tinggi.',
        logo: '',
        activePkwts: 17,
        activePkwtts: 8
    }
];

/**
 * Dummy approval data for development and testing
 */
export const dummyApprovals: Approval[] = [
    {
        id: 'a1',
        companyId: '1',
        companyName: 'PT Maju Bersama',
        employeeCount: 5,
        status: 'pending',
        submissionDate: '2025-11-25',
        pkwtType: 'PKWT',
        contractDuration: '12 bulan',
        contractFile: '/files/contracts/maju-bersama-pkwt-2025-1.pdf',
        submissionNotes: 'Permohonan perpanjangan kontrak untuk 5 karyawan dengan durasi 12 bulan.'
    },
    {
        id: 'a2',
        companyId: '2',
        companyName: 'PT Sejahtera Abadi',
        employeeCount: 3,
        status: 'pending',
        submissionDate: '2025-11-26',
        pkwtType: 'PKWT',
        contractDuration: '6 bulan',
        contractFile: '/files/contracts/sejahtera-abadi-pkwt-2025-2.pdf',
        submissionNotes: 'Permohonan kontrak baru untuk proyek jangka pendek.'
    },
    {
        id: 'a3',
        companyId: '3',
        companyName: 'PT Teknologi Canggih',
        employeeCount: 7,
        status: 'pending',
        submissionDate: '2025-11-27',
        pkwtType: 'PKWTT',
        contractDuration: 'Tetap',
        contractFile: '/files/contracts/teknologi-canggih-pkwtt-2025-3.pdf',
        submissionNotes: 'Permohonan pengalihan status karyawan dari PKWT ke PKWTT.'
    },
    {
        id: 'a4',
        companyId: '4',
        companyName: 'PT Inovasi Digital',
        employeeCount: 2,
        status: 'pending',
        submissionDate: '2025-11-28',
        pkwtType: 'PKWT',
        contractDuration: '24 bulan',
        contractFile: '/files/contracts/inovasi-digital-pkwt-2025-4.pdf',
        submissionNotes: 'Permohonan kontrak jangka panjang untuk posisi spesialis.'
    },
    {
        id: 'a5',
        companyId: '5',
        companyName: 'PT Solusi Bisnis',
        employeeCount: 4,
        status: 'pending',
        submissionDate: '2025-11-29',
        pkwtType: 'PKWTT',
        contractDuration: 'Tetap',
        contractFile: '/files/contracts/solusi-bisnis-pkwtt-2025-5.pdf',
        submissionNotes: 'Permohonan pengangkatan karyawan tetap untuk divisi keuangan.'
    },
    {
        id: 'a6',
        companyId: '6',
        companyName: 'PT Kreasi Indonesia',
        employeeCount: 6,
        status: 'pending',
        submissionDate: '2025-11-30',
        pkwtType: 'PKWT',
        contractDuration: '12 bulan',
        contractFile: '/files/contracts/kreasi-indonesia-pkwt-2025-6.pdf',
        submissionNotes: 'Permohonan perpanjangan kontrak untuk tim kreatif.'
    },
    {
        id: 'a7',
        companyId: '7',
        companyName: 'PT Harmoni Sejahtera',
        employeeCount: 3,
        status: 'pending',
        submissionDate: '2025-12-01',
        pkwtType: 'PKWT',
        contractDuration: '6 bulan',
        contractFile: '/files/contracts/harmoni-sejahtera-pkwt-2025-7.pdf',
        submissionNotes: 'Permohonan kontrak untuk proyek renovasi.'
    },
    {
        id: 'a8',
        companyId: '8',
        companyName: 'PT Global Mandiri',
        employeeCount: 8,
        status: 'pending',
        submissionDate: '2025-12-02',
        pkwtType: 'PKWTT',
        contractDuration: 'Tetap',
        contractFile: '/files/contracts/global-mandiri-pkwtt-2025-8.pdf',
        submissionNotes: 'Permohonan pengangkatan karyawan tetap untuk cabang baru.'
    },
    {
        id: 'a9',
        companyId: '9',
        companyName: 'PT Bangun Masa Depan',
        employeeCount: 4,
        status: 'pending',
        submissionDate: '2025-12-03',
        pkwtType: 'PKWT',
        contractDuration: '12 bulan',
        contractFile: '/files/contracts/bangun-masa-depan-pkwt-2025-9.pdf',
        submissionNotes: 'Permohonan perpanjangan kontrak untuk tim konstruksi.'
    },
    {
        id: 'a10',
        companyId: '10',
        companyName: 'PT Sinar Harapan',
        employeeCount: 5,
        status: 'pending',
        submissionDate: '2025-12-04',
        pkwtType: 'PKWT',
        contractDuration: '24 bulan',
        contractFile: '/files/contracts/sinar-harapan-pkwt-2025-10.pdf',
        submissionNotes: 'Permohonan kontrak jangka panjang untuk manajemen gudang.'
    },
    {
        id: 'a11',
        companyId: '11',
        companyName: 'PT Cipta Karya',
        employeeCount: 3,
        status: 'pending',
        submissionDate: '2025-11-20',
        pkwtType: 'PKWTT',
        contractDuration: 'Tetap',
        contractFile: '/files/contracts/cipta-karya-pkwtt-2025-11.pdf',
        submissionNotes: 'Permohonan pengangkatan karyawan tetap untuk divisi produksi.'
    },
    {
        id: 'a12',
        companyId: '12',
        companyName: 'PT Daya Manunggal',
        employeeCount: 6,
        status: 'pending',
        submissionDate: '2025-11-22',
        pkwtType: 'PKWT',
        contractDuration: '12 bulan',
        contractFile: '/files/contracts/daya-manunggal-pkwt-2025-12.pdf',
        submissionNotes: 'Permohonan perpanjangan kontrak untuk tim logistik.'
    },
    {
        id: 'a13',
        companyId: '13',
        companyName: 'PT Sentosa Jaya',
        employeeCount: 4,
        status: 'pending',
        submissionDate: '2025-11-24',
        pkwtType: 'PKWT',
        contractDuration: '6 bulan',
        contractFile: '/files/contracts/sentosa-jaya-pkwt-2025-13.pdf',
        submissionNotes: 'Permohonan kontrak untuk proyek ekspansi toko.'
    },
    {
        id: 'a14',
        companyId: '14',
        companyName: 'PT Makmur Bersama',
        employeeCount: 2,
        status: 'pending',
        submissionDate: '2025-12-01',
        pkwtType: 'PKWTT',
        contractDuration: 'Tetap',
        contractFile: '/files/contracts/makmur-bersama-pkwtt-2025-14.pdf',
        submissionNotes: 'Permohonan pengangkatan karyawan tetap untuk posisi desainer.'
    },
    {
        id: 'a15',
        companyId: '15',
        companyName: 'PT Nusantara Sejahtera',
        employeeCount: 5,
        status: 'pending',
        submissionDate: '2025-12-03',
        pkwtType: 'PKWT',
        contractDuration: '12 bulan',
        contractFile: '/files/contracts/nusantara-sejahtera-pkwt-2025-15.pdf',
        submissionNotes: 'Permohonan perpanjangan kontrak untuk tim lapangan.'
    },
    {
        id: 'a16',
        companyId: '1',
        companyName: 'PT Maju Bersama',
        employeeCount: 3,
        status: 'approved',
        submissionDate: '2025-11-15',
        pkwtType: 'PKWT',
        contractDuration: '6 bulan',
        contractFile: '/files/contracts/maju-bersama-pkwt-2025-16.pdf',
        submissionNotes: 'Permohonan kontrak untuk proyek khusus.'
    },
    {
        id: 'a17',
        companyId: '2',
        companyName: 'PT Sejahtera Abadi',
        employeeCount: 4,
        status: 'rejected',
        submissionDate: '2025-11-10',
        pkwtType: 'PKWTT',
        contractDuration: 'Tetap',
        contractFile: '/files/contracts/sejahtera-abadi-pkwtt-2025-17.pdf',
        submissionNotes: 'Permohonan pengangkatan karyawan tetap - ditolak karena dokumen tidak lengkap.'
    }
];
/**
 * Dummy approval employee data for development and testing
 */
export const dummyApprovalEmployees: ApprovalEmployee[] = [
    // Employees for approval a1 (PT Maju Bersama - 5 employees)
    {
        id: 'ae1-1',
        approvalId: 'a1',
        employeeId: '1',
        fullName: 'Budi Santoso',
        nik: '1234567890123456',
        birthDate: '1985-05-15',
        previousContracts: 2,
        contractTitle: 'PKWT Tahun Ketiga',
        contractStartDate: '2025-01-15',
        contractDuration: '12 bulan'
    },
    {
        id: 'ae1-2',
        approvalId: 'a1',
        employeeId: '4',
        fullName: 'Dewi Lestari',
        nik: '4567890123456789',
        birthDate: '1992-03-10',
        previousContracts: 2,
        contractTitle: 'PKWT Perpanjangan Marketing',
        contractStartDate: '2025-03-01',
        contractDuration: '12 bulan'
    },
    {
        id: 'ae1-3',
        approvalId: 'a1',
        employeeId: '7',
        fullName: 'Agus Prasetyo',
        nik: '7890123456789012',
        birthDate: '1989-12-05',
        previousContracts: 3,
        contractTitle: 'PKWT Sistem Terbaru',
        contractStartDate: '2025-01-01',
        contractDuration: '12 bulan'
    },
    {
        id: 'ae1-4',
        approvalId: 'a1',
        employeeId: '10',
        fullName: 'Rina Fitriani',
        nik: '0123456789012345',
        birthDate: '1994-06-30',
        previousContracts: 1,
        contractTitle: 'PKWT Administrasi Lanjutan',
        contractStartDate: '2025-02-01',
        contractDuration: '12 bulan'
    },
    {
        id: 'ae1-5',
        approvalId: 'a1',
        employeeId: '13',
        fullName: 'Hendra Setiawan',
        nik: '3344556677889900',
        birthDate: '1983-11-28',
        previousContracts: 2,
        contractTitle: 'PKWT Eksekutif',
        contractStartDate: '2025-04-01',
        contractDuration: '12 bulan'
    },

    // Employees for approval a2 (PT Sejahtera Abadi - 3 employees)
    {
        id: 'ae2-1',
        approvalId: 'a2',
        employeeId: '2',
        fullName: 'Siti Aminah',
        nik: '2345678901234567',
        birthDate: '1990-08-22',
        previousContracts: 1,
        contractTitle: 'PKWT Proyek Khusus',
        contractStartDate: '2025-07-01',
        contractDuration: '6 bulan'
    },
    {
        id: 'ae2-2',
        approvalId: 'a2',
        employeeId: '5',
        fullName: 'Rudi Hartono',
        nik: '5678901234567890',
        birthDate: '1987-07-18',
        previousContracts: 1,
        contractTitle: 'PKWT Keuangan',
        contractStartDate: '2025-07-15',
        contractDuration: '6 bulan'
    },
    {
        id: 'ae2-3',
        approvalId: 'a2',
        employeeId: '8',
        fullName: 'Lina Marlina',
        nik: '8901234567890123',
        birthDate: '1991-04-14',
        previousContracts: 1,
        contractTitle: 'PKWT Sales',
        contractStartDate: '2025-08-01',
        contractDuration: '6 bulan'
    },

    // Employees for approval a3 (PT Teknologi Canggih - 7 employees)
    {
        id: 'ae3-1',
        approvalId: 'a3',
        employeeId: '3',
        fullName: 'Andi Wijaya',
        nik: '3456789012345678',
        birthDate: '1988-11-30',
        previousContracts: 3,
        contractTitle: 'PKWTT Pengembangan',
        contractStartDate: '2025-12-01',
        contractDuration: 'Tetap'
    },
    {
        id: 'ae3-2',
        approvalId: 'a3',
        employeeId: '6',
        fullName: 'Maya Sari',
        nik: '6789012345678901',
        birthDate: '1993-09-25',
        previousContracts: 2,
        contractTitle: 'PKWTT HRD',
        contractStartDate: '2025-12-01',
        contractDuration: 'Tetap'
    },
    {
        id: 'ae3-3',
        approvalId: 'a3',
        employeeId: '9',
        fullName: 'Eko Susanto',
        nik: '9012345678901234',
        birthDate: '1986-10-20',
        previousContracts: 2,
        contractTitle: 'PKWTT R&D',
        contractStartDate: '2025-12-01',
        contractDuration: 'Tetap'
    },
    {
        id: 'ae3-4',
        approvalId: 'a3',
        employeeId: '12',
        fullName: 'Yuni Astuti',
        nik: '2233445566778899',
        birthDate: '1995-08-12',
        previousContracts: 3,
        contractTitle: 'PKWTT Customer Service',
        contractStartDate: '2025-12-01',
        contractDuration: 'Tetap'
    },
    {
        id: 'ae3-5',
        approvalId: 'a3',
        employeeId: '15',
        fullName: 'Joko Widodo',
        nik: '5566778899001122',
        birthDate: '1982-09-08',
        previousContracts: 3,
        contractTitle: 'PKWTT Teknologi',
        contractStartDate: '2025-12-01',
        contractDuration: 'Tetap'
    },
    {
        id: 'ae3-6',
        approvalId: 'a3',
        employeeId: '11',
        fullName: 'Dedi Kurniawan',
        nik: '1122334455667788',
        birthDate: '1984-02-15',
        previousContracts: 2,
        contractTitle: 'PKWTT Operasional',
        contractStartDate: '2025-12-01',
        contractDuration: 'Tetap'
    },
    {
        id: 'ae3-7',
        approvalId: 'a3',
        employeeId: '14',
        fullName: 'Wati Susanti',
        nik: '4455667788990011',
        birthDate: '1996-05-19',
        previousContracts: 1,
        contractTitle: 'PKWTT Pemasaran',
        contractStartDate: '2025-12-01',
        contractDuration: 'Tetap'
    },

    // Employees for other approvals (sample data)
    {
        id: 'ae4-1',
        approvalId: 'a4',
        employeeId: '1',
        fullName: 'Budi Santoso',
        nik: '1234567890123456',
        birthDate: '1985-05-15',
        previousContracts: 2,
        contractTitle: 'PKWT Spesialis Senior',
        contractStartDate: '2025-11-01',
        contractDuration: '24 bulan'
    },
    {
        id: 'ae4-2',
        approvalId: 'a4',
        employeeId: '4',
        fullName: 'Dewi Lestari',
        nik: '4567890123456789',
        birthDate: '1992-03-10',
        previousContracts: 2,
        contractTitle: 'PKWT Spesialis Junior',
        contractStartDate: '2025-11-01',
        contractDuration: '24 bulan'
    },

    // Add more employees for other approvals as needed...
    {
        id: 'ae5-1',
        approvalId: 'a5',
        employeeId: '2',
        fullName: 'Siti Aminah',
        nik: '2345678901234567',
        birthDate: '1990-08-22',
        previousContracts: 1,
        contractTitle: 'PKWTT Keuangan',
        contractStartDate: '2025-12-01',
        contractDuration: 'Tetap'
    },
    {
        id: 'ae5-2',
        approvalId: 'a5',
        employeeId: '5',
        fullName: 'Rudi Hartono',
        nik: '5678901234567890',
        birthDate: '1987-07-18',
        previousContracts: 1,
        contractTitle: 'PKWTT Akuntansi',
        contractStartDate: '2025-12-01',
        contractDuration: 'Tetap'
    },
    {
        id: 'ae5-3',
        approvalId: 'a5',
        employeeId: '8',
        fullName: 'Lina Marlina',
        nik: '8901234567890123',
        birthDate: '1991-04-14',
        previousContracts: 1,
        contractTitle: 'PKWTT Audit',
        contractStartDate: '2025-12-01',
        contractDuration: 'Tetap'
    },
    {
        id: 'ae5-4',
        approvalId: 'a5',
        employeeId: '11',
        fullName: 'Dedi Kurniawan',
        nik: '1122334455667788',
        birthDate: '1984-02-15',
        previousContracts: 2,
        contractTitle: 'PKWTT Pajak',
        contractStartDate: '2025-12-01',
        contractDuration: 'Tetap'
    }
];