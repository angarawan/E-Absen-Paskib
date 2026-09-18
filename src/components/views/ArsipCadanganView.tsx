import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  HardDriveDownload,
  Upload,
  FileSpreadsheet,
  Archive,
  Database,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Copy,
  Check,
  RefreshCw,
  FolderArchive,
  FileText,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  createBackupPayload,
  downloadBackupFile,
  validateBackupFile,
  exportComprehensiveExcelArchive,
  BackupPayload,
} from '../../utils/storageVault';
import { StatusBadge } from '../common/Badge';

export const ArsipCadanganView: React.FC = () => {
  const {
    absensi,
    arsipAbsensi,
    siswa,
    pembina,
    ekskul,
    anggota,
    jadwal,
    users,
    profilSekolah,
    isStoragePersisted,
    requestPersistence,
    restoreFromBackup,
    archiveOldRecords,
    restoreArchivedRecords,
    addToast,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'cadangan' | 'arsip-lama' | 'pulihkan'>('cadangan');

  // Archive Filter
  const [cutoffDate, setCutoffDate] = useState(() => {
    // Default to 1 month ago
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [archiveNote, setArchiveNote] = useState('Arsip kegiatan periode lalu');

  // Restore State
  const [restorePreview, setRestorePreview] = useState<BackupPayload | null>(null);
  const [restoreError, setRestoreError] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  // Stats
  const totalAktif = absensi.length;
  const totalArsip = arsipAbsensi?.length || 0;
  const totalKeseluruhan = totalAktif + totalArsip;

  // Handle Download Backup JSON
  const handleDownloadBackup = () => {
    const payload = createBackupPayload({
      siswa,
      pembina,
      ekskul,
      anggota,
      jadwal,
      absensi,
      profilSekolah,
      users,
      arsipAbsensi: arsipAbsensi || [],
    });
    downloadBackupFile(payload);
    addToast('Berkas cadangan berhasil diunduh dan diamankan!', 'success', 'Cadangan Sukses');
  };

  // Handle Copy Backup to Clipboard
  const handleCopyBackup = () => {
    const payload = createBackupPayload({
      siswa,
      pembina,
      ekskul,
      anggota,
      jadwal,
      absensi,
      profilSekolah,
      users,
      arsipAbsensi: arsipAbsensi || [],
    });
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setIsCopied(true);
    addToast('Seluruh data cadangan disalin ke clipboard!', 'info');
    setTimeout(() => setIsCopied(false), 3000);
  };

  // Handle Export Excel Master Archive
  const handleExportExcelArchive = () => {
    exportComprehensiveExcelArchive({
      absensi,
      arsipAbsensi: arsipAbsensi || [],
      siswa,
      ekskul,
      pembina,
      anggota,
      profilSekolah,
    });
    addToast('Buku Besar Arsip Excel Komprehensif berhasil dibuat!', 'success');
  };

  // Handle Select Backup File to Restore
  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;
    setRestoreError('');
    setRestorePreview(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const res = validateBackupFile(text);
      if (res.valid && res.payload) {
        setRestorePreview(res.payload);
      } else {
        setRestoreError(res.error || 'Berkas cadangan tidak valid atau rusak.');
      }
    };
    reader.onerror = () => {
      setRestoreError('Gagal membaca berkas berkas cadangan dari perangkat Anda.');
    };
    reader.readAsText(file);
  };

  // Execute Restore
  const handleExecuteRestore = () => {
    if (!restorePreview) return;
    if (confirm('Konfirmasi: Pulihkan seluruh data dari berkas cadangan ini? Data saat ini akan diperbarui sesuai berkas cadangan.')) {
      const res = restoreFromBackup(restorePreview);
      if (res.success) {
        addToast(res.message, 'success', 'Pemulihan Berhasil');
        setRestorePreview(null);
      } else {
        addToast(res.message, 'error');
      }
    }
  };

  // Execute Archive Old Records
  const handleExecuteArchive = () => {
    const toArchive = absensi.filter((a) => a.tanggal <= cutoffDate);
    if (toArchive.length === 0) {
      addToast(`Tidak ada data absensi aktif yang bertanggal pada atau sebelum ${cutoffDate}.`, 'warning');
      return;
    }

    if (
      confirm(
        `Arsipkan ${toArchive.length} data absensi yang tercatat pada atau sebelum ${cutoffDate} ke dalam Brankas Arsip Lama? Data akan tetap tersimpan aman dan tidak akan hilang.`
      )
    ) {
      const res = archiveOldRecords(cutoffDate, archiveNote);
      if (res.success) {
        addToast(
          `Berhasil memindahkan ${res.count} data riwayat ke dalam brankas arsip lama yang aman.`,
          'success',
          'Arsip Berhasil Disimpan'
        );
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner: Safe Storage & Protection Hub */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-100">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Sistem Penyimpanan & Arsip Data Terproteksi</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Penyimpanan & Pengarsipan Data Aman
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Seluruh riwayat absensi lama dan data kegiatan ekstrakurikuler sekolah Anda dilindungi dengan penyimpanan ganda lokal (IndexedDB & LocalStorage), persisten terhadap pembersihan cache peramban, serta dapat dicadangkan dan diarsipkan kapan saja.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              id="btn-download-backup-top"
              type="button"
              onClick={handleDownloadBackup}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-800 hover:bg-blue-50 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <HardDriveDownload className="w-4 h-4 text-blue-600" />
              <span>Unduh Cadangan Lengkap (.JSON)</span>
            </button>
            <button
              id="btn-export-excel-archive-top"
              type="button"
              onClick={handleExportExcelArchive}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Buku Besar Arsip (Excel)</span>
            </button>
          </div>
        </div>

        {/* Protection Health Strip */}
        <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-blue-200 block text-[11px]">Status Brankas Peramban:</span>
            <div className="flex items-center gap-1.5 mt-0.5 font-bold text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isStoragePersisted ? 'Permanen & Terproteksi' : 'Aktif (Penyimpanan Ganda)'}</span>
            </div>
          </div>
          <div>
            <span className="text-blue-200 block text-[11px]">Total Rekam Absensi:</span>
            <span className="font-bold text-white text-sm mt-0.5 block">
              {totalKeseluruhan} Data Kehadiran
            </span>
          </div>
          <div>
            <span className="text-blue-200 block text-[11px]">Data Absensi Aktif:</span>
            <span className="font-bold text-white text-sm mt-0.5 block">
              {totalAktif} Sesi Presensi
            </span>
          </div>
          <div>
            <span className="text-blue-200 block text-[11px]">Data dalam Arsip Lama:</span>
            <span className="font-bold text-amber-300 text-sm mt-0.5 block">
              {totalArsip} Data Diarsipkan
            </span>
          </div>
        </div>
      </div>

      {/* Persistence Permission Action If Not Yet Explicitly Granted */}
      {!isStoragePersisted && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-start sm:items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="font-bold">Aktifkan Perlindungan Peramban Permanen (Browser Persistent Storage)</p>
              <p className="text-amber-700 dark:text-amber-300 mt-0.5">
                Izinkan peramban menandai database absensi sekolah ini sebagai penyimpanan permanen agar tidak pernah terhapus secara otomatis oleh sistem operasi saat ruang disk penuh.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={requestPersistence}
            className="self-end sm:self-center px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all shrink-0"
          >
            Aktifkan Sekarang
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('cadangan')}
          className={`pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'cadangan'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Cadangan & Ekspor Data</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('arsip-lama')}
          className={`pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'arsip-lama'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <FolderArchive className="w-4 h-4" />
          <span>Arsip Data Lama ({totalArsip})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pulihkan')}
          className={`pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'pulihkan'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Pulihkan (Restore) Data</span>
        </button>
      </div>

      {/* TAB 1: CADANGAN & EKSPOR DATA AMAN */}
      {activeTab === 'cadangan' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Cadangan Berkas JSON Lengkap */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <HardDriveDownload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Cadangan Berkas Terenkripsi / JSON (.json)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Format cadangan resmi lengkap yang dapat dipulihkan kembali kapan saja
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span>Nama Sekolah:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{profilSekolah.namaSekolah}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tahun Ajaran / Semester:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{profilSekolah.tahunAjaran} ({profilSekolah.semester})</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Absensi Dicadangkan:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{totalKeseluruhan} Catatan</span>
                </div>
                <div className="flex justify-between">
                  <span>Master Siswa & Ekskul:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{siswa.length} Siswa • {ekskul.length} Ekskul</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  id="btn-unduh-file-cadangan"
                  onClick={handleDownloadBackup}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <HardDriveDownload className="w-4 h-4" />
                  <span>Unduh File Cadangan (.JSON)</span>
                </button>
                <button
                  type="button"
                  id="btn-salin-clipboard"
                  onClick={handleCopyBackup}
                  className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                  title="Salin isi data cadangan ke clipboard"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  <span>{isCopied ? 'Tersalin!' : 'Salin Teks'}</span>
                </button>
              </div>
            </div>

            {/* Card 2: Buku Besar Arsip Excel Komprehensif */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Buku Besar Arsip Permanen (Excel .XLSX)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Multi-sheet Excel lengkap untuk dokumen arsip resmi dinas & sekolah
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 border border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Format Lembar Kerja (Sheets) yang Dihasilkan:
                </p>
                <p className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Sheet 1: Rekapitulasi Presensi per Siswa (Persentase & Angka)</span>
                </p>
                <p className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Sheet 2: Buku Besar Log Riwayat Absensi (Semua Tanggal)</span>
                </p>
                <p className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Sheet 3 & 4: Master Lengkap Siswa, Ekskul, dan Guru Pembina</span>
                </p>
              </div>

              <button
                type="button"
                id="btn-unduh-buku-besar-excel"
                onClick={handleExportExcelArchive}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Unduh Buku Besar Arsip Excel (.XLSX)</span>
              </button>
            </div>
          </div>

          {/* Tips Keamanan Penyimpanan Data Sekolah */}
          <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex items-start gap-3.5">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-blue-900 dark:text-blue-200">
              <h4 className="font-bold">Panduan Keamanan Penyimpanan Data Absensi Sekolah</h4>
              <p className="text-blue-800 dark:text-blue-300 leading-relaxed">
                1. Unduh berkas cadangan JSON setiap akhir bulan atau akhir semester dan simpan di Google Drive sekolah, flashdisk guru, atau komputer TU.<br />
                2. Jika berpindah perangkat atau mengganti peramban, Anda dapat memulihkan seluruh data dan riwayat kehadiran secara instan menggunakan menu <strong>Pulihkan (Restore) Data</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PENGARSIPAN DATA LAMA */}
      {activeTab === 'arsip-lama' && (
        <div className="space-y-6">
          {/* Card Form Pengarsipan */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <FolderArchive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Pindahkan Riwayat Presensi Lama ke Brankas Arsip
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Data yang diarsipkan tetap tersimpan aman di database permanen dan tidak akan hilang, sekaligus menjaga kecepatan tampilan absensi harian
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Batas Tanggal Data yang Diarsipkan (Cut-off Date)</span>
                </label>
                <input
                  type="date"
                  value={cutoffDate}
                  onChange={(e) => setCutoffDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Semua absensi pada atau sebelum tanggal ini akan dipindahkan ke arsip lama.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Keterangan Arsip (Misal: Semester Lalu / Tahun Ajaran Sebelumnya)
                </label>
                <input
                  type="text"
                  value={archiveNote}
                  onChange={(e) => setArchiveNote(e.target.value)}
                  placeholder="Contoh: Arsip Semester Ganjil 2024"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                id="btn-eksekusi-arsip"
                onClick={handleExecuteArchive}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-xs"
              >
                <Archive className="w-4 h-4" />
                <span>Simpan ke Brankas Arsip Sekarang</span>
              </button>
            </div>
          </div>

          {/* Tabel Riwayat yang Sedang Berada di Arsip Lama */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Archive className="w-4 h-4 text-amber-500" />
                  <span>Daftar Log dalam Brankas Arsip ({totalArsip} Catatan)</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Data lama yang telah diarsipkan tetap tersimpan 100% aman dan terlindungi
                </p>
              </div>

              {totalArsip > 0 && (
                <button
                  type="button"
                  id="btn-pulihkan-semua-arsip"
                  onClick={() => {
                    if (confirm('Kembalikan seluruh data dari brankas arsip ke tabel riwayat aktif?')) {
                      restoreArchivedRecords();
                      addToast('Seluruh arsip dikembalikan ke data riwayat aktif.', 'info');
                    }
                  }}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Kembalikan ke Riwayat Aktif</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/90 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Siswa</th>
                    <th className="px-4 py-3">Ekstrakurikuler</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Keterangan</th>
                    <th className="px-4 py-3">Pencatat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {totalArsip === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                        Belum ada data lama yang dipindahkan ke arsip. Seluruh data berada pada riwayat aktif.
                      </td>
                    </tr>
                  ) : (
                    arsipAbsensi.map((row) => {
                      const s = siswa.find((item) => item.id === row.siswaId);
                      const e = ekskul.find((item) => item.id === row.ekskulId);
                      return (
                        <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-4 py-3 font-medium whitespace-nowrap text-slate-800 dark:text-slate-200">
                            {row.tanggal}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                              {s?.nama || row.siswaId}
                            </span>
                            <span className="block text-[11px] text-slate-400">{s?.kelas}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                            {e?.nama || row.ekskulId}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge status={row.status} size="sm" />
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {row.keterangan || '-'}
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-[11px] whitespace-nowrap">
                            {row.recordedBy || 'Pembina'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PULIHKAN (RESTORE) DATA DARI CADANGAN */}
      {activeTab === 'pulihkan' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Unggah Berkas Cadangan (.JSON) untuk Dipulihkan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gunakan fitur ini jika Anda baru saja mengganti komputer, menginstal ulang browser, atau ingin mengembalikan riwayat lama
                </p>
              </div>
            </div>

            {/* Drag & Drop Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                id="input-file-backup"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Klik untuk memilih berkas cadangan (.JSON) dari komputer Anda
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Sistem akan memverifikasi integritas berkas secara aman sebelum diterapkan
              </p>
            </div>

            {/* Error banner if file is invalid */}
            {restoreError && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{restoreError}</span>
              </div>
            )}

            {/* Preview Card If Valid */}
            {restorePreview && (
              <div className="p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border-2 border-emerald-500 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                        Berkas Cadangan Terverifikasi & Siap Dipulihkan
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        Dibuat pada: {new Date(restorePreview.createdAt).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-bold">
                    Valid
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white/70 dark:bg-slate-900/60 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Nama Sekolah:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{restorePreview.metadata?.namaSekolah}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Tahun Ajaran:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{restorePreview.metadata?.tahunAjaran} ({restorePreview.metadata?.semester})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Total Log Absensi:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{restorePreview.data.absensi?.length || 0} Data</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Master Siswa:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{restorePreview.data.siswa?.length || 0} Siswa</strong>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRestorePreview(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    id="btn-konfirmasi-restore"
                    onClick={handleExecuteRestore}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Pulihkan Seluruh Data Sekarang</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
