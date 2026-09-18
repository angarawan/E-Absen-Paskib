import { Siswa, Pembina, Ekstrakurikuler, Anggota, Jadwal, AbsensiRecord, User, ProfilSekolah } from '../types';
import { PRESET_LOGOS } from './presetLogos';

export const INITIAL_SEKOLAH: ProfilSekolah = {
  namaSekolah: 'SMA NEGERI 1 TELADAN NUSANTARA',
  npsn: '20234567',
  alamat: 'Jl. Pendidikan No. 45, Kompleks Pendidikan, Jakarta',
  kepalaSekolah: 'Dr. H. Muhammad Arifin, M.Pd.',
  nipKepalaSekolah: '19700415 199512 1 002',
  semester: 'Ganjil',
  tahunAjaran: '2024/2025',
  logoUrl: PRESET_LOGOS[0].dataUrl,
  temaSinematik: 'midnight',
};

export const INITIAL_KELAS: string[] = [
  'X-IPA 1',
  'X-IPS 2',
  'XI-IPA 1',
  'XI-IPS 1',
  'XII-MIPA 1'
];

export const INITIAL_PEMBINA: Pembina[] = [
  {
    id: 'pem-1',
    nip: '19820315 200801 1 005',
    nama: 'Budi Santoso, S.Pd.',
    noHp: '081234567890',
    email: 'budi.santoso@sekolah.sch.id',
    ekskulIds: ['eks-1'], // Pramuka
    status: 'Aktif'
  },
  {
    id: 'pem-2',
    nip: '19850720 200902 2 004',
    nama: 'Siti Rahmawati, S.Kep., Ners',
    noHp: '082198765432',
    email: 'siti.rahmawati@sekolah.sch.id',
    ekskulIds: ['eks-2'], // PMR
    status: 'Aktif'
  },
  {
    id: 'pem-3',
    nip: '19900210 201503 1 007',
    nama: 'Hendra Wijaya, M.Or.',
    noHp: '085311223344',
    email: 'hendra.wijaya@sekolah.sch.id',
    ekskulIds: ['eks-3'], // Futsal
    status: 'Aktif'
  },
  {
    id: 'pem-4',
    nip: '19881105 201201 1 003',
    nama: 'Agus Setiawan, S.Pd.Jas.',
    noHp: '087755667788',
    email: 'agus.setiawan@sekolah.sch.id',
    ekskulIds: ['eks-4'], // Bola Voli
    status: 'Aktif'
  },
  {
    id: 'pem-5',
    nip: '19920918 201804 2 006',
    nama: 'Dewi Lestari, S.Sn.',
    noHp: '089644332211',
    email: 'dewi.lestari@sekolah.sch.id',
    ekskulIds: ['eks-5'], // Seni Tari
    status: 'Aktif'
  }
];

export const INITIAL_EKSKUL: Ekstrakurikuler[] = [
  {
    id: 'eks-1',
    kode: 'EKS-PRA',
    nama: 'Pramuka',
    pembinaId: 'pem-1',
    hari: 'Jumat',
    jam: '15:00 - 17:00',
    tempat: 'Lapangan Utama & Aula Terbuka',
    keterangan: 'Kegiatan kepanduan, kepemimpinan, dan kemandirian.',
    status: 'Aktif'
  },
  {
    id: 'eks-2',
    kode: 'EKS-PMR',
    nama: 'PMR (Palang Merah Remaja)',
    pembinaId: 'pem-2',
    hari: 'Rabu',
    jam: '15:30 - 17:00',
    tempat: 'Ruang UKS & Lapangan Samping',
    keterangan: 'Pelatihan pertolongan pertama, kesehatan remaja, dan bakti sosial.',
    status: 'Aktif'
  },
  {
    id: 'eks-3',
    kode: 'EKS-FUT',
    nama: 'Futsal',
    pembinaId: 'pem-3',
    hari: 'Selasa',
    jam: '15:30 - 17:30',
    tempat: 'Lapangan Olahraga Tertutup',
    keterangan: 'Latihan teknik dasar, fisik, taktik tim, dan persiapan turnamen.',
    status: 'Aktif'
  },
  {
    id: 'eks-4',
    kode: 'EKS-VOL',
    nama: 'Bola Voli',
    pembinaId: 'pem-4',
    hari: 'Kamis',
    jam: '15:30 - 17:30',
    tempat: 'Lapangan Voli Outdoor',
    keterangan: 'Pengembangan kemampuan passing, smash, serve, dan kekompakan tim.',
    status: 'Aktif'
  },
  {
    id: 'eks-5',
    kode: 'EKS-TAR',
    nama: 'Seni Tari',
    pembinaId: 'pem-5',
    hari: 'Sabtu',
    jam: '09:00 - 11:30',
    tempat: 'Sanggar Seni & Tari Sekolah',
    keterangan: 'Pelestarian tari tradisional nusantara dan kreasi modern untuk pentas seni.',
    status: 'Aktif'
  }
];

export const INITIAL_SISWA: Siswa[] = [
  { id: 'sis-01', nis: '10201', nisn: '0061234501', nama: 'Aditya Pratama', jenisKelamin: 'L', kelas: 'X-IPA 1', noHp: '081311112201', status: 'Aktif' },
  { id: 'sis-02', nis: '10202', nisn: '0061234502', nama: 'Annisa Rahma Putri', jenisKelamin: 'P', kelas: 'X-IPA 1', noHp: '081311112202', status: 'Aktif' },
  { id: 'sis-03', nis: '10203', nisn: '0061234503', nama: 'Bagus Setiawan', jenisKelamin: 'L', kelas: 'X-IPA 1', noHp: '081311112203', status: 'Aktif' },
  { id: 'sis-04', nis: '10204', nisn: '0061234504', nama: 'Cantika Dewi', jenisKelamin: 'P', kelas: 'X-IPA 1', noHp: '081311112204', status: 'Aktif' },
  { id: 'sis-05', nis: '10205', nisn: '0061234505', nama: 'Dimas Rizky Anggara', jenisKelamin: 'L', kelas: 'X-IPS 2', noHp: '081311112205', status: 'Aktif' },
  { id: 'sis-06', nis: '10206', nisn: '0061234506', nama: 'Dinda Ayu Larasati', jenisKelamin: 'P', kelas: 'X-IPS 2', noHp: '081311112206', status: 'Aktif' },
  { id: 'sis-07', nis: '10207', nisn: '0061234507', nama: 'Fajar Nugroho', jenisKelamin: 'L', kelas: 'X-IPS 2', noHp: '081311112207', status: 'Aktif' },
  { id: 'sis-08', nis: '10208', nisn: '0061234508', nama: 'Gita Maharani', jenisKelamin: 'P', kelas: 'X-IPS 2', noHp: '081311112208', status: 'Aktif' },
  { id: 'sis-09', nis: '10209', nisn: '0061234509', nama: 'Hafiz Maulana', jenisKelamin: 'L', kelas: 'XI-IPA 1', noHp: '081311112209', status: 'Aktif' },
  { id: 'sis-10', nis: '10210', nisn: '0061234510', nama: 'Indah Permatasari', jenisKelamin: 'P', kelas: 'XI-IPA 1', noHp: '081311112210', status: 'Aktif' },
  { id: 'sis-11', nis: '10211', nisn: '0061234511', nama: 'Joko Prabowo', jenisKelamin: 'L', kelas: 'XI-IPA 1', noHp: '081311112211', status: 'Aktif' },
  { id: 'sis-12', nis: '10212', nisn: '0061234512', nama: 'Kirana Wulandari', jenisKelamin: 'P', kelas: 'XI-IPA 1', noHp: '081311112212', status: 'Aktif' },
  { id: 'sis-13', nis: '10213', nisn: '0061234513', nama: 'Lukman Hakim', jenisKelamin: 'L', kelas: 'XI-IPS 1', noHp: '081311112213', status: 'Aktif' },
  { id: 'sis-14', nis: '10214', nisn: '0061234514', nama: 'Maya Safitri', jenisKelamin: 'P', kelas: 'XI-IPS 1', noHp: '081311112214', status: 'Aktif' },
  { id: 'sis-15', nis: '10215', nisn: '0061234515', nama: 'Nabil Kurniawan', jenisKelamin: 'L', kelas: 'XI-IPS 1', noHp: '081311112215', status: 'Aktif' },
  { id: 'sis-16', nis: '10216', nisn: '0061234516', nama: 'Olivia Ramadhani', jenisKelamin: 'P', kelas: 'XI-IPS 1', noHp: '081311112216', status: 'Aktif' },
  { id: 'sis-17', nis: '10217', nisn: '0061234517', nama: 'Putra Ramadhan', jenisKelamin: 'L', kelas: 'XII-MIPA 1', noHp: '081311112217', status: 'Aktif' },
  { id: 'sis-18', nis: '10218', nisn: '0061234518', nama: 'Qonita Syarifah', jenisKelamin: 'P', kelas: 'XII-MIPA 1', noHp: '081311112218', status: 'Aktif' },
  { id: 'sis-19', nis: '10219', nisn: '0061234519', nama: 'Rian Hidayat', jenisKelamin: 'L', kelas: 'XII-MIPA 1', noHp: '081311112219', status: 'Aktif' },
  { id: 'sis-20', nis: '10220', nisn: '0061234520', nama: 'Siti Nurhaliza', jenisKelamin: 'P', kelas: 'XII-MIPA 1', noHp: '081311112220', status: 'Aktif' }
];

export const INITIAL_ANGGOTA: Anggota[] = [
  // Pramuka (eks-1)
  { id: 'ang-01', siswaId: 'sis-01', ekskulId: 'eks-1', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-15' },
  { id: 'ang-02', siswaId: 'sis-02', ekskulId: 'eks-1', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-15' },
  { id: 'ang-03', siswaId: 'sis-05', ekskulId: 'eks-1', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-16' },
  { id: 'ang-04', siswaId: 'sis-09', ekskulId: 'eks-1', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-16' },
  { id: 'ang-05', siswaId: 'sis-13', ekskulId: 'eks-1', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-17' },
  { id: 'ang-06', siswaId: 'sis-17', ekskulId: 'eks-1', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-17' },

  // PMR (eks-2)
  { id: 'ang-07', siswaId: 'sis-02', ekskulId: 'eks-2', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-15' }, // follows >1 ekskul
  { id: 'ang-08', siswaId: 'sis-04', ekskulId: 'eks-2', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-15' },
  { id: 'ang-09', siswaId: 'sis-06', ekskulId: 'eks-2', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-16' },
  { id: 'ang-10', siswaId: 'sis-10', ekskulId: 'eks-2', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-16' },
  { id: 'ang-11', siswaId: 'sis-14', ekskulId: 'eks-2', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-17' },
  { id: 'ang-12', siswaId: 'sis-18', ekskulId: 'eks-2', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-17' },

  // Futsal (eks-3)
  { id: 'ang-13', siswaId: 'sis-01', ekskulId: 'eks-3', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-15' }, // follows >1 ekskul
  { id: 'ang-14', siswaId: 'sis-03', ekskulId: 'eks-3', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-15' },
  { id: 'ang-15', siswaId: 'sis-07', ekskulId: 'eks-3', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-16' },
  { id: 'ang-16', siswaId: 'sis-11', ekskulId: 'eks-3', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-16' },
  { id: 'ang-17', siswaId: 'sis-15', ekskulId: 'eks-3', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-17' },
  { id: 'ang-18', siswaId: 'sis-19', ekskulId: 'eks-3', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-17' },

  // Bola Voli (eks-4)
  { id: 'ang-19', siswaId: 'sis-03', ekskulId: 'eks-4', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-15' },
  { id: 'ang-20', siswaId: 'sis-05', ekskulId: 'eks-4', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-15' },
  { id: 'ang-21', siswaId: 'sis-08', ekskulId: 'eks-4', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-16' },
  { id: 'ang-22', siswaId: 'sis-12', ekskulId: 'eks-4', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-16' },
  { id: 'ang-23', siswaId: 'sis-16', ekskulId: 'eks-4', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-17' },
  { id: 'ang-24', siswaId: 'sis-17', ekskulId: 'eks-4', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-17' },

  // Seni Tari (eks-5)
  { id: 'ang-25', siswaId: 'sis-04', ekskulId: 'eks-5', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-15' },
  { id: 'ang-26', siswaId: 'sis-06', ekskulId: 'eks-5', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-15' },
  { id: 'ang-27', siswaId: 'sis-08', ekskulId: 'eks-5', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-16' },
  { id: 'ang-28', siswaId: 'sis-10', ekskulId: 'eks-5', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-16' },
  { id: 'ang-29', siswaId: 'sis-14', ekskulId: 'eks-5', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-17' },
  { id: 'ang-30', siswaId: 'sis-20', ekskulId: 'eks-5', tahunAjaran: '2024/2025', status: 'Aktif', tanggalDaftar: '2024-07-17' }
];

export const INITIAL_JADWAL: Jadwal[] = [
  { id: 'jad-1', ekskulId: 'eks-1', hari: 'Jumat', jamMulai: '15:00', jamSelesai: '17:00', tempat: 'Lapangan Utama & Aula', pembinaId: 'pem-1' },
  { id: 'jad-2', ekskulId: 'eks-2', hari: 'Rabu', jamMulai: '15:30', jamSelesai: '17:00', tempat: 'Ruang UKS & Lapangan Samping', pembinaId: 'pem-2' },
  { id: 'jad-3', ekskulId: 'eks-3', hari: 'Selasa', jamMulai: '15:30', jamSelesai: '17:30', tempat: 'Lapangan Olahraga Tertutup', pembinaId: 'pem-3' },
  { id: 'jad-4', ekskulId: 'eks-4', hari: 'Kamis', jamMulai: '15:30', jamSelesai: '17:30', tempat: 'Lapangan Voli Outdoor', pembinaId: 'pem-4' },
  { id: 'jad-5', ekskulId: 'eks-5', hari: 'Sabtu', jamMulai: '09:00', jamSelesai: '11:30', tempat: 'Sanggar Seni & Tari', pembinaId: 'pem-5' }
];

// Helper to get formatted date string: YYYY-MM-DD
function getRecentDateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

const TODAY_STR = getRecentDateStr(0);
const YESTERDAY_STR = getRecentDateStr(1);
const TWO_DAYS_AGO_STR = getRecentDateStr(2);
const LAST_WEEK_STR = getRecentDateStr(7);

export const INITIAL_ABSENSI: AbsensiRecord[] = [
  // Today's attendance (Futsal)
  { id: 'abs-001', ekskulId: 'eks-3', siswaId: 'sis-01', tanggal: TODAY_STR, status: 'HADIR', keterangan: 'Tepat waktu', createdAt: `${TODAY_STR} 15:35:00`, recordedBy: 'Hendra Wijaya, M.Or.' },
  { id: 'abs-002', ekskulId: 'eks-3', siswaId: 'sis-03', tanggal: TODAY_STR, status: 'HADIR', keterangan: 'Tepat waktu', createdAt: `${TODAY_STR} 15:35:00`, recordedBy: 'Hendra Wijaya, M.Or.' },
  { id: 'abs-003', ekskulId: 'eks-3', siswaId: 'sis-07', tanggal: TODAY_STR, status: 'IZIN', keterangan: 'Ada urusan keluarga', createdAt: `${TODAY_STR} 15:35:00`, recordedBy: 'Hendra Wijaya, M.Or.' },
  { id: 'abs-004', ekskulId: 'eks-3', siswaId: 'sis-11', tanggal: TODAY_STR, status: 'SAKIT', keterangan: 'Demam flu', createdAt: `${TODAY_STR} 15:35:00`, recordedBy: 'Hendra Wijaya, M.Or.' },
  { id: 'abs-005', ekskulId: 'eks-3', siswaId: 'sis-15', tanggal: TODAY_STR, status: 'HADIR', keterangan: 'Tepat waktu', createdAt: `${TODAY_STR} 15:35:00`, recordedBy: 'Hendra Wijaya, M.Or.' },
  { id: 'abs-006', ekskulId: 'eks-3', siswaId: 'sis-19', tanggal: TODAY_STR, status: 'ALPA', keterangan: 'Tanpa keterangan', createdAt: `${TODAY_STR} 15:35:00`, recordedBy: 'Hendra Wijaya, M.Or.' },

  // Yesterday's attendance (PMR)
  { id: 'abs-007', ekskulId: 'eks-2', siswaId: 'sis-02', tanggal: YESTERDAY_STR, status: 'HADIR', keterangan: 'Mengikuti materi pertolongan', createdAt: `${YESTERDAY_STR} 15:40:00`, recordedBy: 'Siti Rahmawati, S.Kep., Ners' },
  { id: 'abs-008', ekskulId: 'eks-2', siswaId: 'sis-04', tanggal: YESTERDAY_STR, status: 'HADIR', keterangan: 'Tepat waktu', createdAt: `${YESTERDAY_STR} 15:40:00`, recordedBy: 'Siti Rahmawati, S.Kep., Ners' },
  { id: 'abs-009', ekskulId: 'eks-2', siswaId: 'sis-06', tanggal: YESTERDAY_STR, status: 'HADIR', keterangan: 'Tepat waktu', createdAt: `${YESTERDAY_STR} 15:40:00`, recordedBy: 'Siti Rahmawati, S.Kep., Ners' },
  { id: 'abs-010', ekskulId: 'eks-2', siswaId: 'sis-10', tanggal: YESTERDAY_STR, status: 'IZIN', keterangan: 'Surat izin terlampir', createdAt: `${YESTERDAY_STR} 15:40:00`, recordedBy: 'Siti Rahmawati, S.Kep., Ners' },
  { id: 'abs-011', ekskulId: 'eks-2', siswaId: 'sis-14', tanggal: YESTERDAY_STR, status: 'HADIR', keterangan: 'Tepat waktu', createdAt: `${YESTERDAY_STR} 15:40:00`, recordedBy: 'Siti Rahmawati, S.Kep., Ners' },
  { id: 'abs-012', ekskulId: 'eks-2', siswaId: 'sis-18', tanggal: YESTERDAY_STR, status: 'SAKIT', keterangan: 'Sakit gigi', createdAt: `${YESTERDAY_STR} 15:40:00`, recordedBy: 'Siti Rahmawati, S.Kep., Ners' },

  // Two days ago (Pramuka)
  { id: 'abs-013', ekskulId: 'eks-1', siswaId: 'sis-01', tanggal: TWO_DAYS_AGO_STR, status: 'HADIR', keterangan: 'Latihan baris berbaris', createdAt: `${TWO_DAYS_AGO_STR} 15:10:00`, recordedBy: 'Budi Santoso, S.Pd.' },
  { id: 'abs-014', ekskulId: 'eks-1', siswaId: 'sis-02', tanggal: TWO_DAYS_AGO_STR, status: 'HADIR', keterangan: 'Latihan tali temali', createdAt: `${TWO_DAYS_AGO_STR} 15:10:00`, recordedBy: 'Budi Santoso, S.Pd.' },
  { id: 'abs-015', ekskulId: 'eks-1', siswaId: 'sis-05', tanggal: TWO_DAYS_AGO_STR, status: 'HADIR', keterangan: 'Tepat waktu', createdAt: `${TWO_DAYS_AGO_STR} 15:10:00`, recordedBy: 'Budi Santoso, S.Pd.' },
  { id: 'abs-016', ekskulId: 'eks-1', siswaId: 'sis-09', tanggal: TWO_DAYS_AGO_STR, status: 'HADIR', keterangan: 'Tepat waktu', createdAt: `${TWO_DAYS_AGO_STR} 15:10:00`, recordedBy: 'Budi Santoso, S.Pd.' },
  { id: 'abs-017', ekskulId: 'eks-1', siswaId: 'sis-13', tanggal: TWO_DAYS_AGO_STR, status: 'HADIR', keterangan: 'Tepat waktu', createdAt: `${TWO_DAYS_AGO_STR} 15:10:00`, recordedBy: 'Budi Santoso, S.Pd.' },
  { id: 'abs-018', ekskulId: 'eks-1', siswaId: 'sis-17', tanggal: TWO_DAYS_AGO_STR, status: 'IZIN', keterangan: 'Lomba akademik', createdAt: `${TWO_DAYS_AGO_STR} 15:10:00`, recordedBy: 'Budi Santoso, S.Pd.' },

  // Last week (Seni Tari)
  { id: 'abs-019', ekskulId: 'eks-5', siswaId: 'sis-04', tanggal: LAST_WEEK_STR, status: 'HADIR', keterangan: 'Latihan tari saman', createdAt: `${LAST_WEEK_STR} 09:15:00`, recordedBy: 'Dewi Lestari, S.Sn.' },
  { id: 'abs-020', ekskulId: 'eks-5', siswaId: 'sis-06', tanggal: LAST_WEEK_STR, status: 'HADIR', keterangan: 'Tepat waktu', createdAt: `${LAST_WEEK_STR} 09:15:00`, recordedBy: 'Dewi Lestari, S.Sn.' },
  { id: 'abs-021', ekskulId: 'eks-5', siswaId: 'sis-08', tanggal: LAST_WEEK_STR, status: 'HADIR', keterangan: 'Tepat waktu', createdAt: `${LAST_WEEK_STR} 09:15:00`, recordedBy: 'Dewi Lestari, S.Sn.' },
  { id: 'abs-022', ekskulId: 'eks-5', siswaId: 'sis-10', tanggal: LAST_WEEK_STR, status: 'HADIR', keterangan: 'Tepat waktu', createdAt: `${LAST_WEEK_STR} 09:15:00`, recordedBy: 'Dewi Lestari, S.Sn.' },
  { id: 'abs-023', ekskulId: 'eks-5', siswaId: 'sis-14', tanggal: LAST_WEEK_STR, status: 'HADIR', keterangan: 'Tepat waktu', createdAt: `${LAST_WEEK_STR} 09:15:00`, recordedBy: 'Dewi Lestari, S.Sn.' },
  { id: 'abs-024', ekskulId: 'eks-5', siswaId: 'sis-20', tanggal: LAST_WEEK_STR, status: 'HADIR', keterangan: 'Tepat waktu', createdAt: `${LAST_WEEK_STR} 09:15:00`, recordedBy: 'Dewi Lestari, S.Sn.' }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    username: 'admin',
    password: 'admin123',
    name: 'Administrator Sekolah',
    role: 'ADMIN',
    status: 'Aktif',
    email: 'admin@sekolah.sch.id'
  },
  {
    id: 'usr-pem-1',
    username: 'pembina',
    password: 'pembina123',
    name: 'Budi Santoso, S.Pd.',
    role: 'PEMBINA',
    status: 'Aktif',
    email: 'budi.santoso@sekolah.sch.id',
    refId: 'pem-1'
  },
  {
    id: 'usr-pem-3',
    username: 'hendra',
    password: 'pembina123',
    name: 'Hendra Wijaya, M.Or.',
    role: 'PEMBINA',
    status: 'Aktif',
    email: 'hendra.wijaya@sekolah.sch.id',
    refId: 'pem-3'
  },
  {
    id: 'usr-sis-1',
    username: 'siswa',
    password: 'siswa123',
    name: 'Aditya Pratama',
    role: 'SISWA',
    status: 'Aktif',
    email: 'aditya.pratama@siswa.sch.id',
    refId: 'sis-01'
  },
  {
    id: 'usr-sis-2',
    username: 'annisa',
    password: 'siswa123',
    name: 'Annisa Rahma Putri',
    role: 'SISWA',
    status: 'Aktif',
    email: 'annisa.rahma@siswa.sch.id',
    refId: 'sis-02'
  }
];
