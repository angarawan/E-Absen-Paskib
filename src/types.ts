export type UserRole = 'ADMIN' | 'PEMBINA' | 'SISWA';

export type AttendanceStatus = 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA';

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  status: 'Aktif' | 'Non-Aktif';
  email?: string;
  avatar?: string;
  refId?: string; // id of Siswa or Pembina if linked
}

export interface Siswa {
  id: string;
  nis: string;
  nisn: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  kelas: string;
  noHp: string;
  status: 'Aktif' | 'Non-Aktif';
}

export interface Pembina {
  id: string;
  nip: string;
  nama: string;
  noHp: string;
  email: string;
  ekskulIds: string[]; // Ekstrakurikuler yang dibina
  status: 'Aktif' | 'Non-Aktif';
}

export interface Ekstrakurikuler {
  id: string;
  kode: string;
  nama: string;
  pembinaId: string;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  jam: string; // e.g. "15:00 - 17:00"
  tempat: string;
  keterangan: string;
  status: 'Aktif' | 'Non-Aktif';
}

export interface Anggota {
  id: string;
  siswaId: string;
  ekskulId: string;
  tahunAjaran: string;
  status: 'Aktif' | 'Non-Aktif';
  tanggalDaftar: string;
}

export interface Jadwal {
  id: string;
  ekskulId: string;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  jamMulai: string;
  jamSelesai: string;
  tempat: string;
  pembinaId: string;
}

export interface AbsensiRecord {
  id: string;
  ekskulId: string;
  siswaId: string;
  tanggal: string; // YYYY-MM-DD
  status: AttendanceStatus;
  keterangan: string;
  createdAt: string;
  recordedBy: string; // pembina/admin user id or name
}

export interface ProfilSekolah {
  namaSekolah: string;
  npsn: string;
  alamat: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  semester: 'Ganjil' | 'Genap';
  tahunAjaran: string;
  logoUrl?: string;
  temaSinematik?: 'midnight' | 'emerald' | 'amber' | 'velvet' | 'obsidian';
}

export interface RekapItem {
  siswaId: string;
  nis: string;
  nama: string;
  kelas: string;
  ekskulId: string;
  ekskulNama: string;
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
  totalPertemuan: number;
  persentase: number;
}

export interface ArsipPeriode {
  id: string;
  namaArsip: string;
  tahunAjaran: string;
  semester: string;
  tanggalArsip: string;
  jumlahData: number;
  keterangan?: string;
}
