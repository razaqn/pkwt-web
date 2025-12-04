import type { Employee, Contract } from '../types/employeeTypes';

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