import * as XLSX from 'xlsx';
import {
  Siswa,
  Pembina,
  Ekstrakurikuler,
  Anggota,
  Jadwal,
  AbsensiRecord,
  User,
  ProfilSekolah,
} from '../types';

export interface BackupMetadata {
  versi: string;
  waktuPencadangan: string;
  namaSekolah: string;
  npsn: string;
  tahunAjaran: string;
  semester: string;
  totalAbsensi: number;
  totalSiswa: number;
  totalPembina: number;
  totalEkskul: number;
  totalAnggota: number;
  totalJadwal: number;
  checksum: string;
}

export interface BackupPayload {
  version: string;
  app: string;
  createdAt: string;
  metadata: BackupMetadata;
  data: {
    siswa: Siswa[];
    pembina: Pembina[];
    ekskul: Ekstrakurikuler[];
    anggota: Anggota[];
    jadwal: Jadwal[];
    absensi: AbsensiRecord[];
    profilSekolah: ProfilSekolah;
    users: User[];
    arsipAbsensi?: AbsensiRecord[];
  };
}

const DB_NAME = 'EkskulAbsensiVaultDB';
const DB_VERSION = 1;
const STORE_SNAPSHOTS = 'snapshots';
const STORE_ARCHIVES = 'archives';

/**
 * Inisialisasi IndexedDB sebagai kubah penyimpanan lokal persisten (Local Data Vault)
 */
function openVaultDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB tidak didukung pada peramban ini'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_SNAPSHOTS)) {
        db.createObjectStore(STORE_SNAPSHOTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_ARCHIVES)) {
        db.createObjectStore(STORE_ARCHIVES, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Meminta perizinan Persistent Storage ke peramban web (Chrome, Edge, Firefox, Safari)
 * agar browser TIDAK AKAN PERNAH menghapus data secara otomatis saat kehabisan ruang disk.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persisted();
      if (isPersisted) return true;
      const granted = await navigator.storage.persist();
      return granted;
    } catch {
      return false;
    }
  }
  return false;
}

export async function checkStoragePersisted(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persisted) {
    try {
      return await navigator.storage.persisted();
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Menyimpan salinan data otomatis (Snapshot) ke IndexedDB Vault
 */
export async function saveSnapshotToVault(payload: BackupPayload): Promise<boolean> {
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_SNAPSHOTS], 'readwrite');
      const store = tx.objectStore(STORE_SNAPSHOTS);
      const record = {
        id: 'latest_snapshot',
        savedAt: new Date().toISOString(),
        payload,
      };
      store.put(record);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Gagal menyimpan snapshot ke IndexedDB Vault:', err);
    return false;
  }
}

/**
 * Mengambil salinan data snapshot terbaru dari IndexedDB Vault
 */
export async function getLatestSnapshotFromVault(): Promise<BackupPayload | null> {
  try {
    const db = await openVaultDB();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_SNAPSHOTS], 'readonly');
      const store = tx.objectStore(STORE_SNAPSHOTS);
      const req = store.get('latest_snapshot');
      req.onsuccess = () => {
        if (req.result && req.result.payload) {
          resolve(req.result.payload);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Menghasilkan Checksum sederhana untuk memvalidasi integritas data
 */
function generateChecksum(data: unknown): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).toUpperCase();
}

/**
 * Membuat paket cadangan lengkap (Backup Payload)
 */
export function createBackupPayload(params: {
  siswa: Siswa[];
  pembina: Pembina[];
  ekskul: Ekstrakurikuler[];
  anggota: Anggota[];
  jadwal: Jadwal[];
  absensi: AbsensiRecord[];
  profilSekolah: ProfilSekolah;
  users: User[];
  arsipAbsensi?: AbsensiRecord[];
}): BackupPayload {
  const {
    siswa,
    pembina,
    ekskul,
    anggota,
    jadwal,
    absensi,
    profilSekolah,
    users,
    arsipAbsensi = [],
  } = params;

  const totalAbsensiAll = absensi.length + arsipAbsensi.length;
  const nowStr = new Date().toISOString();

  const dataToHash = {
    absensiLength: totalAbsensiAll,
    siswaLength: siswa.length,
    pembinaLength: pembina.length,
    ekskulLength: ekskul.length,
  };

  const metadata: BackupMetadata = {
    versi: '2.0.0',
    waktuPencadangan: nowStr,
    namaSekolah: profilSekolah.namaSekolah,
    npsn: profilSekolah.npsn,
    tahunAjaran: profilSekolah.tahunAjaran,
    semester: profilSekolah.semester,
    totalAbsensi: totalAbsensiAll,
    totalSiswa: siswa.length,
    totalPembina: pembina.length,
    totalEkskul: ekskul.length,
    totalAnggota: anggota.length,
    totalJadwal: jadwal.length,
    checksum: generateChecksum(dataToHash),
  };

  return {
    version: '2.0.0',
    app: 'Absensi_Ekstrakurikuler_Sekolah',
    createdAt: nowStr,
    metadata,
    data: {
      siswa,
      pembina,
      ekskul,
      anggota,
      jadwal,
      absensi,
      profilSekolah,
      users,
      arsipAbsensi,
    },
  };
}

/**
 * Mengunduh berkas cadangan aman ke komputer pengguna (.json)
 */
export function downloadBackupFile(payload: BackupPayload, customFilename?: string) {
  const dateStr = new Date().toISOString().split('T')[0];
  const safeSchool = (payload.metadata.namaSekolah || 'SEKOLAH')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 25);
  const filename = customFilename || `CADANGAN_ABSENSI_${safeSchool}_${dateStr}.json`;

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Memvalidasi berkas cadangan JSON sebelum dipulihkan (Restore)
 */
export function validateBackupFile(jsonString: string): {
  valid: boolean;
  payload?: BackupPayload;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'Berkas tidak berformat JSON yang valid.' };
    }

    if (!parsed.data || typeof parsed.data !== 'object') {
      return { valid: false, error: 'Struktur data cadangan tidak lengkap (elemen data hilang).' };
    }

    const { siswa, pembina, ekskul, anggota, absensi, profilSekolah } = parsed.data;

    if (!Array.isArray(siswa) || !Array.isArray(pembina) || !Array.isArray(ekskul) || !Array.isArray(absensi)) {
      return { valid: false, error: 'Format tabel utama (siswa/pembina/ekskul/absensi) tidak valid.' };
    }

    return {
      valid: true,
      payload: parsed as BackupPayload,
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `Gagal membaca berkas: ${err.message || 'Format berkas rusak'}`,
    };
  }
}

/**
 * Menghasilkan Buku Besar Arsip Excel Komprehensif (Multi-Sheet)
 * Berisi Rekapitulasi, Seluruh Log Kehadiran, Siswa, dan Ekskul
 */
export function exportComprehensiveExcelArchive(params: {
  absensi: AbsensiRecord[];
  arsipAbsensi?: AbsensiRecord[];
  siswa: Siswa[];
  ekskul: Ekstrakurikuler[];
  pembina: Pembina[];
  anggota: Anggota[];
  profilSekolah: ProfilSekolah;
}) {
  const { absensi, arsipAbsensi = [], siswa, ekskul, pembina, anggota, profilSekolah } = params;

  const allAbsensi = [...absensi, ...arsipAbsensi].sort(
    (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
  );

  const wb = XLSX.utils.book_new();

  // SHEET 1: REKAPITULASI KEHADIRAN PER SISWA
  const rekapRows: any[] = [];
  anggota.forEach((ang) => {
    const s = siswa.find((item) => item.id === ang.siswaId);
    const e = ekskul.find((item) => item.id === ang.ekskulId);
    if (!s || !e) return;

    const studentAtt = allAbsensi.filter(
      (a) => a.siswaId === ang.siswaId && a.ekskulId === ang.ekskulId
    );

    const hadir = studentAtt.filter((a) => a.status === 'HADIR').length;
    const izin = studentAtt.filter((a) => a.status === 'IZIN').length;
    const sakit = studentAtt.filter((a) => a.status === 'SAKIT').length;
    const alpa = studentAtt.filter((a) => a.status === 'ALPA').length;
    const total = studentAtt.length;
    const persentase = total > 0 ? `${Math.round((hadir / total) * 100)}%` : '0%';

    rekapRows.push({
      'NIS': s.nis,
      'NISN': s.nisn,
      'Nama Siswa': s.nama,
      'Kelas': s.kelas,
      'Ekstrakurikuler': e.nama,
      'Hadir': hadir,
      'Izin': izin,
      'Sakit': sakit,
      'Alpa': alpa,
      'Total Pertemuan': total,
      'Persentase Kehadiran': persentase,
      'Status Keanggotaan': ang.status,
    });
  });

  const wsRekap = XLSX.utils.json_to_sheet(rekapRows);
  XLSX.utils.book_append_sheet(wb, wsRekap, 'Rekapitulasi Kehadiran');

  // SHEET 2: BUKU BESAR LOG RIWAYAT LENGKAP
  const logRows = allAbsensi.map((a, idx) => {
    const s = siswa.find((item) => item.id === a.siswaId);
    const e = ekskul.find((item) => item.id === a.ekskulId);
    return {
      'No': idx + 1,
      'Tanggal': a.tanggal,
      'Waktu Catat': a.createdAt || '-',
      'Nama Siswa': s?.nama || a.siswaId,
      'NIS': s?.nis || '-',
      'Kelas': s?.kelas || '-',
      'Ekstrakurikuler': e?.nama || a.ekskulId,
      'Status': a.status,
      'Keterangan': a.keterangan || '-',
      'Dicatat Oleh': a.recordedBy || 'Pembina',
    };
  });

  const wsLogs = XLSX.utils.json_to_sheet(logRows);
  XLSX.utils.book_append_sheet(wb, wsLogs, 'Seluruh Log Absensi');

  // SHEET 3: MASTER SISWA
  const siswaRows = siswa.map((s, idx) => ({
    'No': idx + 1,
    'NIS': s.nis,
    'NISN': s.nisn,
    'Nama Lengkap': s.nama,
    'L/P': s.jenisKelamin,
    'Kelas': s.kelas,
    'No HP': s.noHp,
    'Status': s.status,
  }));
  const wsSiswa = XLSX.utils.json_to_sheet(siswaRows);
  XLSX.utils.book_append_sheet(wb, wsSiswa, 'Master Siswa');

  // SHEET 4: MASTER EKSTRAKURIKULER & PEMBINA
  const ekskulRows = ekskul.map((e, idx) => {
    const p = pembina.find((item) => item.id === e.pembinaId);
    return {
      'No': idx + 1,
      'Kode': e.kode,
      'Nama Kegiatan': e.nama,
      'Pembina': p?.nama || '-',
      'NIP Pembina': p?.nip || '-',
      'Hari': e.hari,
      'Waktu': e.jam,
      'Tempat': e.tempat,
      'Keterangan': e.keterangan,
      'Status': e.status,
    };
  });
  const wsEkskul = XLSX.utils.json_to_sheet(ekskulRows);
  XLSX.utils.book_append_sheet(wb, wsEkskul, 'Master Ekskul');

  // SHEET 5: IDENTITAS SEKOLAH
  const sekolahRows = [
    { 'Properti': 'Nama Sekolah', 'Nilai': profilSekolah.namaSekolah },
    { 'Properti': 'NPSN', 'Nilai': profilSekolah.npsn },
    { 'Properti': 'Alamat', 'Nilai': profilSekolah.alamat },
    { 'Properti': 'Kepala Sekolah', 'Nilai': profilSekolah.kepalaSekolah },
    { 'Properti': 'NIP Kepala Sekolah', 'Nilai': profilSekolah.nipKepalaSekolah },
    { 'Properti': 'Tahun Ajaran', 'Nilai': profilSekolah.tahunAjaran },
    { 'Properti': 'Semester', 'Nilai': profilSekolah.semester },
    { 'Properti': 'Tanggal Ekspor Arsip', 'Nilai': new Date().toLocaleString('id-ID') },
    { 'Properti': 'Total Rekam Kehadiran', 'Nilai': allAbsensi.length },
  ];
  const wsSekolah = XLSX.utils.json_to_sheet(sekolahRows);
  XLSX.utils.book_append_sheet(wb, wsSekolah, 'Profil Lembaga');

  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `BUKU_BESAR_ARSIP_ABSENSI_${dateStr}.xlsx`;
  XLSX.writeFile(wb, filename);
}
