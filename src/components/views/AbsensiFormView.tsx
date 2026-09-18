import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import {
  ClipboardCheck,
  Calendar,
  Award,
  Users,
  CheckCheck,
  Save,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  LayoutGrid,
  List,
  Check,
  Info,
  Clock,
  UserCheck,
} from 'lucide-react';

interface AttendanceRow {
  siswaId: string;
  nis: string;
  nama: string;
  kelas: string;
  status: AttendanceStatus;
  keterangan: string;
}

export const AbsensiFormView: React.FC = () => {
  const {
    ekskul,
    siswa,
    anggota,
    pembina,
    currentUser,
    checkExistingAttendance,
    getAttendanceForDateAndEkskul,
    saveBatchAbsensi,
    setCurrentMenu,
    addToast,
  } = useApp();

  const isPembina = currentUser?.role === 'PEMBINA';

  // Filter available ekskul for current pembina if role is PEMBINA
  const myPembina = pembina.find(
    (p) => p.id === currentUser?.refId || p.nama === currentUser?.name
  );
  const availableEkskuls = useMemo(() => {
    if (isPembina && myPembina) {
      const allowed = ekskul.filter(
        (e) => e.pembinaId === myPembina.id || myPembina.ekskulIds?.includes(e.id)
      );
      return allowed.length > 0 ? allowed : ekskul;
    }
    return ekskul;
  }, [ekskul, isPembina, myPembina]);

  // Selections
  const [selectedEkskulId, setSelectedEkskulId] = useState<string>(() => availableEkskuls[0]?.id || '');
  const [selectedTanggal, setSelectedTanggal] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Mode: 'card' (sederhana & ramah sentuh) vs 'table' (ringkas)
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchMurid, setSearchMurid] = useState('');

  // Table items state
  const [attendanceRows, setAttendanceRows] = useState<AttendanceRow[]>([]);
  const [alreadyExists, setAlreadyExists] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [lastMarkedFeedback, setLastMarkedFeedback] = useState<{
    nama: string;
    status: AttendanceStatus;
    waktu: string;
  } | null>(null);

  // When ekskul or date changes, populate students and check duplicates
  useEffect(() => {
    if (!selectedEkskulId || !selectedTanggal) {
      setAttendanceRows([]);
      setAlreadyExists(false);
      return;
    }

    const exists = checkExistingAttendance(selectedEkskulId, selectedTanggal);
    setAlreadyExists(exists);
    setSaveSuccessNotice(false);

    // Get active members of this ekskul
    const memberRecords = anggota.filter(
      (a) => a.ekskulId === selectedEkskulId && a.status === 'Aktif'
    );

    if (exists) {
      // Load saved attendance
      const savedRecords = getAttendanceForDateAndEkskul(selectedEkskulId, selectedTanggal);
      const rows: AttendanceRow[] = memberRecords.map((m) => {
        const s = siswa.find((item) => item.id === m.siswaId);
        const record = savedRecords.find((r) => r.siswaId === m.siswaId);
        return {
          siswaId: m.siswaId,
          nis: s?.nis || '-',
          nama: s?.nama || 'Siswa',
          kelas: s?.kelas || '-',
          status: record?.status || 'HADIR',
          keterangan: record?.keterangan || '',
        };
      });
      setAttendanceRows(rows);
    } else {
      // Fresh new attendance - default to HADIR
      const rows: AttendanceRow[] = memberRecords.map((m) => {
        const s = siswa.find((item) => item.id === m.siswaId);
        return {
          siswaId: m.siswaId,
          nis: s?.nis || '-',
          nama: s?.nama || 'Siswa',
          kelas: s?.kelas || '-',
          status: 'HADIR',
          keterangan: '',
        };
      });
      setAttendanceRows(rows);
    }
  }, [selectedEkskulId, selectedTanggal, anggota, siswa]);

  // Handle status toggle for a specific row with instant feedback
  const handleStatusChange = (siswaId: string, status: AttendanceStatus) => {
    const student = siswa.find((s) => s.id === siswaId);
    setAttendanceRows((prev) =>
      prev.map((r) => (r.siswaId === siswaId ? { ...r, status } : r))
    );
    setSaveSuccessNotice(false);

    if (student) {
      const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastMarkedFeedback({
        nama: student.nama,
        status,
        waktu: nowTime,
      });

      // Quick toast feedback for immediate response
      const statusLabel = {
        HADIR: 'Hadir',
        IZIN: 'Izin',
        SAKIT: 'Sakit',
        ALPA: 'Alpa',
      }[status];
      addToast(`${student.nama} ditandai: ${statusLabel}`, status === 'HADIR' ? 'success' : 'info');
    }
  };

  // Handle keterangan change
  const handleKeteranganChange = (siswaId: string, text: string) => {
    setAttendanceRows((prev) =>
      prev.map((r) => (r.siswaId === siswaId ? { ...r, keterangan: text } : r))
    );
    setSaveSuccessNotice(false);
  };

  // Set all students to HADIR
  const handleSetAllHadir = () => {
    setAttendanceRows((prev) =>
      prev.map((r) => ({
        ...r,
        status: 'HADIR',
        keterangan: r.status !== 'HADIR' ? '' : r.keterangan,
      }))
    );
    setSaveSuccessNotice(false);
    addToast('Semua siswa diset status HADIR.', 'info');
  };

  // Save attendance
  const handleSave = (allowOverwrite = false) => {
    if (!selectedEkskulId || !selectedTanggal) {
      addToast('Pilih ekstrakurikuler dan tanggal terlebih dahulu!', 'warning');
      return;
    }

    if (attendanceRows.length === 0) {
      addToast('Tidak ada siswa anggota yang terdaftar pada kegiatan ini.', 'warning');
      return;
    }

    setIsSubmitting(true);

    const items = attendanceRows.map((r) => ({
      siswaId: r.siswaId,
      status: r.status,
      keterangan: r.keterangan,
    }));

    const result = saveBatchAbsensi(selectedEkskulId, selectedTanggal, items, allowOverwrite);

    setIsSubmitting(false);

    if (result.success) {
      setAlreadyExists(true);
      setSaveSuccessNotice(true);
      setLastMarkedFeedback(null);
      setTimeout(() => setSaveSuccessNotice(false), 8000);
    } else {
      addToast(result.message, 'error');
    }
  };

  const selectedEkskulObj = ekskul.find((e) => e.id === selectedEkskulId);

  // Summary counts of current form
  const countHadir = attendanceRows.filter((r) => r.status === 'HADIR').length;
  const countIzin = attendanceRows.filter((r) => r.status === 'IZIN').length;
  const countSakit = attendanceRows.filter((r) => r.status === 'SAKIT').length;
  const countAlpa = attendanceRows.filter((r) => r.status === 'ALPA').length;

  // Filtered rows by search
  const displayedRows = useMemo(() => {
    if (!searchMurid) return attendanceRows;
    const term = searchMurid.toLowerCase();
    return attendanceRows.filter(
      (r) => r.nama.toLowerCase().includes(term) || r.kelas.toLowerCase().includes(term) || r.nis.includes(term)
    );
  }, [attendanceRows, searchMurid]);

  const setToday = () => {
    setSelectedTanggal(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-5">
      {/* Header & Quick Selector Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Absensi Kehadiran Siswa
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih kegiatan dan tanggal, lalu tandai status kehadiran siswa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('card')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  viewMode === 'card'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Daftar 1 Baris</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Tabel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Inputs: Ekskul & Tanggal */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
          <div className="md:col-span-7">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              <span>Pilih Ekstrakurikuler</span>
            </label>
            <select
              id="select-absensi-ekskul"
              value={selectedEkskulId}
              onChange={(e) => setSelectedEkskulId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            >
              {availableEkskuls.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nama} ({e.hari} • {e.jam}) - {e.tempat}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Tanggal Absensi</span>
              </label>
              <button
                type="button"
                onClick={setToday}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Hari Ini
              </button>
            </div>
            <input
              id="input-absensi-tanggal"
              type="date"
              value={selectedTanggal}
              onChange={(e) => setSelectedTanggal(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Selected Info & Total Registered */}
        {selectedEkskulObj && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs gap-2">
            <div className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Jadwal: <strong>{selectedEkskulObj.hari}, {selectedEkskulObj.jam}</strong> di <strong>{selectedEkskulObj.tempat}</strong>
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
              {attendanceRows.length} Siswa Terdaftar
            </span>
          </div>
        )}
      </div>

      {/* Save Success Notice Banner with Instant Feedback */}
      {saveSuccessNotice && (
        <div
          id="banner-sukses-absensi"
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 dark:from-emerald-950/60 dark:to-teal-950/60 border-2 border-emerald-500 dark:border-emerald-600 text-emerald-950 dark:text-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg backdrop-blur-xs animate-in slide-in-from-top-3 duration-300"
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-black text-emerald-950 dark:text-emerald-200">
                  Absensi Berhasil Disimpan!
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                  Terverifikasi
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 mt-0.5 font-medium">
                Data kehadiran <strong>{attendanceRows.length} siswa</strong> ({countHadir} Hadir, {countIzin} Izin, {countSakit} Sakit, {countAlpa} Alpa) untuk kegiatan <strong>{selectedEkskulObj?.nama}</strong> pada tanggal <strong>{selectedTanggal}</strong> telah berhasil dicatat ke sistem.
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-tutup-banner-sukses"
            onClick={() => setSaveSuccessNotice(false)}
            className="self-end sm:self-center px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shrink-0 shadow-xs"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Instant Micro-Feedback Banner when student attendance button is clicked */}
      {lastMarkedFeedback && !saveSuccessNotice && (
        <div
          id="banner-feedback-siswa-instan"
          className="p-3.5 rounded-2xl bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-blue-950 dark:text-blue-100 flex items-center justify-between gap-3 shadow-xs animate-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <p className="text-xs sm:text-sm font-semibold">
              Feedback Instan: Kehadiran <strong className="text-blue-700 dark:text-blue-300">{lastMarkedFeedback.nama}</strong> berhasil diset ke status{' '}
              <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-600 text-white ml-1">
                {lastMarkedFeedback.status}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-2">
                (Pukul {lastMarkedFeedback.waktu} WIB)
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLastMarkedFeedback(null)}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* Warning Banner if Already Exists */}
      {alreadyExists && (
        <div
          id="alert-absensi-duplikat"
          className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-xs sm:text-sm text-amber-900 dark:text-amber-100">
                Siswa sudah melakukan absensi pada tanggal tersebut.
              </h5>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                Data kehadiran {selectedEkskulObj?.nama} ({selectedTanggal}) sudah tersimpan di sistem. Anda dapat mengubah status lalu menekan tombol "Perbarui Data Absensi".
              </p>
            </div>
          </div>

          <button
            id="btn-perbarui-absensi"
            type="button"
            onClick={() => handleSave(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Perbarui Data Absensi</span>
          </button>
        </div>
      )}

      {/* Action Bar & Quick Status Pills */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Counts Summary without words: H:6 S:0 I:0 A:0 */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-black">
          <span
            id="stat-h-count"
            title="Hadir"
            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
          >
            H:{countHadir}
          </span>
          <span
            id="stat-s-count"
            title="Sakit"
            className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
          >
            S:{countSakit}
          </span>
          <span
            id="stat-i-count"
            title="Izin"
            className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
          >
            I:{countIzin}
          </span>
          <span
            id="stat-a-count"
            title="Alpa"
            className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
          >
            A:{countAlpa}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari murid..."
              value={searchMurid}
              onChange={(e) => setSearchMurid(e.target.value)}
              className="w-32 sm:w-40 pl-8 pr-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Button HADIR SEMUA */}
          <button
            id="btn-hadir-semua"
            type="button"
            onClick={handleSetAllHadir}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
            title="Set semua siswa menjadi status HADIR"
          >
            <CheckCheck className="w-4 h-4" />
            <span>✓ Hadirkan Semua</span>
          </button>
        </div>
      </div>

      {/* Main Content: Card View (Touch / Sederhana) or Table View */}
      {attendanceRows.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">
          <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Belum ada murid yang terdaftar pada kegiatan ekstrakurikuler ini.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Silakan daftarkan anggota ekstrakurikuler terlebih dahulu.
          </p>
          <button
            onClick={() => setCurrentMenu('anggota')}
            className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
          >
            Daftarkan Anggota Ekskul
          </button>
        </div>
      ) : viewMode === 'card' ? (
        /* MODE DAFTAR 1 BARIS (KOMPAK & MUAT 1 BARIS DENGAN NAMA SISWA) */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {displayedRows.map((row, idx) => {
            const isHadir = row.status === 'HADIR';
            const isIzin = row.status === 'IZIN';
            const isSakit = row.status === 'SAKIT';
            const isAlpa = row.status === 'ALPA';

            return (
              <div
                key={row.siswaId}
                className={`p-2.5 sm:px-4 sm:py-2.5 transition-colors ${
                  isHadir
                    ? 'hover:bg-slate-50/80 dark:hover:bg-slate-800/30'
                    : isSakit
                    ? 'bg-amber-50/40 dark:bg-amber-950/20'
                    : isIzin
                    ? 'bg-sky-50/40 dark:bg-sky-950/20'
                    : 'bg-rose-50/40 dark:bg-rose-950/20'
                }`}
              >
                {/* 1 BARIS: No & Nama Siswa di kiri, Tombol kecil H, S, I, A di kanan */}
                <div className="flex items-center justify-between gap-2">
                  {/* Kiri: Nomor, Nama Siswa, Kelas */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-400 w-5 sm:w-6 text-right shrink-0">
                      {idx + 1}.
                    </span>
                    <div className="min-w-0 flex-1 flex items-baseline gap-1.5 sm:gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {row.nama}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium shrink-0">
                        ({row.kelas})
                      </span>
                    </div>
                  </div>

                  {/* Kanan: Tombol kecil H, S, I, A + Field Keterangan */}
                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    {/* Tombol H (Hadir) */}
                    <button
                      type="button"
                      id={`btn-hadir-${row.siswaId}`}
                      onClick={() => handleStatusChange(row.siswaId, 'HADIR')}
                      title="Hadir"
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-black flex items-center justify-center transition-all ${
                        isHadir
                          ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-600/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40'
                      }`}
                    >
                      H
                    </button>

                    {/* Tombol S (Sakit) */}
                    <button
                      type="button"
                      id={`btn-sakit-${row.siswaId}`}
                      onClick={() => handleStatusChange(row.siswaId, 'SAKIT')}
                      title="Sakit"
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-black flex items-center justify-center transition-all ${
                        isSakit
                          ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/40'
                      }`}
                    >
                      S
                    </button>

                    {/* Tombol I (Izin) */}
                    <button
                      type="button"
                      id={`btn-izin-${row.siswaId}`}
                      onClick={() => handleStatusChange(row.siswaId, 'IZIN')}
                      title="Izin"
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-black flex items-center justify-center transition-all ${
                        isIzin
                          ? 'bg-sky-600 text-white shadow-xs ring-2 ring-sky-600/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-sky-50 hover:text-sky-700 dark:hover:bg-sky-950/40'
                      }`}
                    >
                      I
                    </button>

                    {/* Tombol A (Alpa) */}
                    <button
                      type="button"
                      id={`btn-alpa-${row.siswaId}`}
                      onClick={() => handleStatusChange(row.siswaId, 'ALPA')}
                      title="Alpa / Tanpa Keterangan"
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-black flex items-center justify-center transition-all ${
                        isAlpa
                          ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-600/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40'
                      }`}
                    >
                      A
                    </button>

                    {/* Input keterangan inline pada desktop/tablet */}
                    <div className="hidden md:block ml-2 w-44 lg:w-56 shrink-0">
                      <input
                        type="text"
                        value={row.keterangan}
                        onChange={(e) => handleKeteranganChange(row.siswaId, e.target.value)}
                        placeholder="Ket (opsional)..."
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Input keterangan di mobile jika bukan HADIR atau jika sudah ada keterangan */}
                {(!isHadir || row.keterangan) && (
                  <div className="md:hidden mt-2 pl-7 pr-1">
                    <input
                      type="text"
                      value={row.keterangan}
                      onChange={(e) => handleKeteranganChange(row.siswaId, e.target.value)}
                      placeholder={
                        isSakit
                          ? 'Alasan sakit (misal: demam, flu)...'
                          : isIzin
                          ? 'Alasan izin (misal: urusan keluarga)...'
                          : 'Alasan alpa...'
                      }
                      className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* MODE TABEL RINGKAS */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase text-[11px] font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-3 sm:px-4 py-3 w-12 text-center">No</th>
                  <th className="px-3 sm:px-4 py-3">Nama Siswa</th>
                  <th className="px-3 sm:px-4 py-3">Kelas</th>
                  <th className="px-3 sm:px-4 py-3 text-center">Status (H / S / I / A)</th>
                  <th className="px-3 sm:px-4 py-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayedRows.map((row, idx) => {
                  const isHadir = row.status === 'HADIR';
                  const isSakit = row.status === 'SAKIT';
                  const isIzin = row.status === 'IZIN';
                  const isAlpa = row.status === 'ALPA';

                  return (
                    <tr
                      key={row.siswaId}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-3 sm:px-4 py-2.5 text-center text-slate-400 font-medium whitespace-nowrap">
                        {idx + 1}
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        <div>{row.nama}</div>
                        <div className="text-[11px] text-slate-400 font-normal">NIS: {row.nis}</div>
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {row.kelas}
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                          <button
                            type="button"
                            id={`table-btn-hadir-${row.siswaId}`}
                            onClick={() => handleStatusChange(row.siswaId, 'HADIR')}
                            title="Hadir"
                            className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center transition-all ${
                              isHadir
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400'
                            }`}
                          >
                            H
                          </button>
                          <button
                            type="button"
                            id={`table-btn-sakit-${row.siswaId}`}
                            onClick={() => handleStatusChange(row.siswaId, 'SAKIT')}
                            title="Sakit"
                            className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center transition-all ${
                              isSakit
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-400'
                            }`}
                          >
                            S
                          </button>
                          <button
                            type="button"
                            id={`table-btn-izin-${row.siswaId}`}
                            onClick={() => handleStatusChange(row.siswaId, 'IZIN')}
                            title="Izin"
                            className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center transition-all ${
                              isIzin
                                ? 'bg-sky-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-sky-700 dark:hover:text-sky-400'
                            }`}
                          >
                            I
                          </button>
                          <button
                            type="button"
                            id={`table-btn-alpa-${row.siswaId}`}
                            onClick={() => handleStatusChange(row.siswaId, 'ALPA')}
                            title="Alpa"
                            className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center transition-all ${
                              isAlpa
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-400'
                            }`}
                          >
                            A
                          </button>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-2.5">
                        <input
                          type="text"
                          value={row.keterangan}
                          onChange={(e) => handleKeteranganChange(row.siswaId, e.target.value)}
                          placeholder="Keterangan..."
                          className="w-full min-w-[140px] px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar with Save Button */}
      <div className="sticky bottom-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <UserCheck className="w-4 h-4 text-blue-600" />
          <span>
            Total Absen: <strong>{attendanceRows.length} Siswa</strong> ({countHadir} Hadir, {countIzin} Izin, {countSakit} Sakit, {countAlpa} Alpa)
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="btn-simpan-absensi"
            type="button"
            disabled={attendanceRows.length === 0 || isSubmitting}
            onClick={() => handleSave(alreadyExists)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{alreadyExists ? 'SIMPAN PERUBAHAN ABSENSI' : 'SIMPAN ABSENSI SEKARANG'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
