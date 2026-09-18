import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Percent,
  User as UserIcon,
  Phone,
  BookmarkCheck,
  Send,
  Sparkles,
  Info,
} from 'lucide-react';
import { StatusBadge } from '../common/Badge';

export const DashboardSiswa: React.FC = () => {
  const {
    currentUser,
    siswa,
    ekskul,
    anggota,
    absensi,
    jadwal,
    addToast,
    saveBatchAbsensi,
  } = useApp();

  // Find linked siswa
  const mySiswa = siswa.find(
    (s) => s.id === currentUser?.refId || s.nama === currentUser?.name
  ) || siswa[0];

  // Ekskuls followed by this student
  const myAnggota = anggota.filter(
    (a) => a.siswaId === mySiswa.id && a.status === 'Aktif'
  );
  const myEkskulIds = myAnggota.map((a) => a.ekskulId);
  const myEkskuls = ekskul.filter((e) => myEkskulIds.includes(e.id));

  // State for Presensi Mandiri Murid
  const [selectedPresensiEkskulId, setSelectedPresensiEkskulId] = useState<string>(
    () => myEkskuls[0]?.id || ''
  );
  const [presensiStatus, setPresensiStatus] = useState<AttendanceStatus>('HADIR');
  const [presensiKeterangan, setPresensiKeterangan] = useState<string>('');
  const [isSubmittingPresensi, setIsSubmittingPresensi] = useState<boolean>(false);
  const [presensiFeedbackBanner, setPresensiFeedbackBanner] = useState<{
    ekskulNama: string;
    status: AttendanceStatus;
    tanggal: string;
    waktu: string;
  } | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const activePresensiEkskulId = selectedPresensiEkskulId || myEkskuls[0]?.id || '';
  const currentEkskulObj = ekskul.find((e) => e.id === activePresensiEkskulId);

  // Check if today already attended for selected ekskul
  const todayRecord = absensi.find(
    (a) => a.siswaId === mySiswa.id && a.ekskulId === activePresensiEkskulId && a.tanggal === todayStr
  );

  // My attendance records
  const myAbsensi = absensi
    .filter((a) => a.siswaId === mySiswa.id)
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  // Calculations for stats
  const totalPertemuan = myAbsensi.length;
  const hadir = myAbsensi.filter((a) => a.status === 'HADIR').length;
  const izin = myAbsensi.filter((a) => a.status === 'IZIN').length;
  const sakit = myAbsensi.filter((a) => a.status === 'SAKIT').length;
  const alpa = myAbsensi.filter((a) => a.status === 'ALPA').length;

  const persentase = totalPertemuan > 0 ? Math.round((hadir / totalPertemuan) * 100) : 0;

  // Schedules of student's ekskuls
  const myJadwal = jadwal.filter((j) => myEkskulIds.includes(j.ekskulId));

  const getEkskulName = (id: string) => {
    return ekskul.find((e) => e.id === id)?.nama || 'Kegiatan';
  };

  // Handle student self-attendance submission
  const handleLaporPresensi = () => {
    if (!activePresensiEkskulId) {
      addToast('Anda belum terdaftar pada ekstrakurikuler manapun.', 'warning');
      return;
    }

    setIsSubmittingPresensi(true);

    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const ketText = presensiKeterangan.trim() || (presensiStatus === 'HADIR' ? 'Presensi Mandiri Murid' : '-');

    const result = saveBatchAbsensi(
      activePresensiEkskulId,
      todayStr,
      [{ siswaId: mySiswa.id, status: presensiStatus, keterangan: ketText }],
      true
    );

    setIsSubmittingPresensi(false);

    if (result.success) {
      const ekskulName = currentEkskulObj?.nama || 'Ekstrakurikuler';
      // Set feedback banner
      setPresensiFeedbackBanner({
        ekskulNama: ekskulName,
        status: presensiStatus,
        tanggal: todayStr,
        waktu: nowTime,
      });

      // Show instant toast notification
      const statusLabel = {
        HADIR: 'Hadir',
        IZIN: 'Izin',
        SAKIT: 'Sakit',
        ALPA: 'Alpa',
      }[presensiStatus];

      addToast(
        `Absensi berhasil! Kehadiran Anda dicatat sebagai "${statusLabel}" untuk kegiatan ${ekskulName}.`,
        'success',
        'Presensi Berhasil'
      );
    } else {
      addToast(result.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Account Notice */}
      <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-200">
        <div className="flex items-center gap-2">
          <BookmarkCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            Akun Anda dibuatkan oleh <strong>Guru Pembina Ekstrakurikuler</strong>. Gunakan portal ini untuk mengecek jadwal latihan dan riwayat kehadiran Anda.
          </span>
        </div>
      </div>

      {/* Instant Feedback Banner when Attendance is successfully submitted */}
      {presensiFeedbackBanner && (
        <div
          id="banner-sukses-presensi-siswa"
          className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 dark:from-emerald-950/70 dark:to-teal-950/70 border-2 border-emerald-500 text-emerald-950 dark:text-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl backdrop-blur-xs animate-in slide-in-from-top-3 duration-300"
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-black text-emerald-950 dark:text-emerald-200">
                  Presensi Berhasil Dilakukan!
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
                  {presensiFeedbackBanner.status}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 mt-1 font-medium">
                Halo <strong>{mySiswa.nama}</strong>, Anda telah berhasil melakukan presensi untuk kegiatan{' '}
                <strong>{presensiFeedbackBanner.ekskulNama}</strong> pada hari ini (<strong>{presensiFeedbackBanner.tanggal}</strong>, pukul {presensiFeedbackBanner.waktu} WIB). Data kehadiran langsung tersimpan ke rekapitulasi sekolah.
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-tutup-feedback-presensi"
            onClick={() => setPresensiFeedbackBanner(null)}
            className="self-end sm:self-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shrink-0 shadow-xs"
          >
            Selesai
          </button>
        </div>
      )}

      {/* Student Profile Card (Requirement 13) */}
      <div
        id="card-profil-siswa"
        className="p-6 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-md"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white font-bold text-2xl shadow-inner">
              {mySiswa.nama.charAt(0)}
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 mb-1">
                Murid Aktif
              </span>
              <h3 className="text-xl sm:text-2xl font-black">{mySiswa.nama}</h3>
              <p className="text-sm text-blue-100 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>Kelas: <strong>{mySiswa.kelas}</strong></span>
                <span>•</span>
                <span>NIS: {mySiswa.nis}</span>
                <span>•</span>
                <span>NISN: {mySiswa.nisn}</span>
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm px-5 py-3.5 rounded-xl border border-white/20 text-center self-start md:self-auto">
            <p className="text-xs text-blue-200 uppercase font-semibold tracking-wider">
              Persentase Kehadiran Saya
            </p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-3xl font-black text-white">{persentase}%</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white text-blue-800">
                {persentase >= 80 ? 'Sangat Baik' : persentase >= 60 ? 'Cukup' : 'Perlu Ditingkatkan'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Widget Presensi Mandiri Murid Hari Ini */}
      {myEkskuls.length > 0 && (
        <div
          id="card-presensi-mandiri"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Presensi Mandiri Murid Hari Ini
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Lakukan absensi langsung untuk sesi latihan kegiatan ekstrakurikuler hari ini ({todayStr})
                </p>
              </div>
            </div>

            {/* Quick Ekskul Selector if multiple */}
            {myEkskuls.length > 1 && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Pilih Ekskul:
                </label>
                <select
                  id="select-ekskul-presensi"
                  value={activePresensiEkskulId}
                  onChange={(e) => setSelectedPresensiEkskulId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100"
                >
                  {myEkskuls.map((ek) => (
                    <option key={ek.id} value={ek.id}>
                      {ek.nama}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {todayRecord ? (
            /* Already checked in today */
            <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    Anda sudah berhasil melakukan absensi hari ini!
                  </h5>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                    Kegiatan: <strong>{currentEkskulObj?.nama}</strong> • Status:{' '}
                    <strong className="uppercase">{todayRecord.status}</strong>{' '}
                    {todayRecord.keterangan ? `(${todayRecord.keterangan})` : ''}
                  </p>
                </div>
              </div>
              <StatusBadge status={todayRecord.status} size="sm" />
            </div>
          ) : (
            /* Not yet checked in - Show attendance action */
            <div className="mt-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Kegiatan Terpilih:
                  </span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {currentEkskulObj?.nama} ({currentEkskulObj?.hari}, {currentEkskulObj?.jam})
                  </p>
                </div>

                {/* Status Selection Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPresensiStatus('HADIR')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      presensiStatus === 'HADIR'
                        ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-600/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    Hadir
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresensiStatus('IZIN')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      presensiStatus === 'IZIN'
                        ? 'bg-sky-600 text-white shadow-xs ring-2 ring-sky-600/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 hover:text-sky-700'
                    }`}
                  >
                    Izin
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresensiStatus('SAKIT')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      presensiStatus === 'SAKIT'
                        ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-600/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    Sakit
                  </button>
                </div>
              </div>

              {/* Optional note if not HADIR */}
              {presensiStatus !== 'HADIR' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Alasan / Keterangan {presensiStatus}:
                  </label>
                  <input
                    type="text"
                    value={presensiKeterangan}
                    onChange={(e) => setPresensiKeterangan(e.target.value)}
                    placeholder={
                      presensiStatus === 'SAKIT'
                        ? 'Contoh: Demam flu / beristirahat di rumah'
                        : 'Contoh: Ada keperluan keluarga mendesak'
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  />
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  id="btn-kirim-presensi-siswa"
                  onClick={handleLaporPresensi}
                  disabled={isSubmittingPresensi}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingPresensi ? 'Memproses...' : 'Catat Kehadiran Saya Sekarang'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6 Statistics Cards (Requirement 13: Total Ekstrakurikuler, Total Pertemuan, Hadir, Izin, Sakit, Alpa) */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Statistik Kehadiran Saya
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Ekskul Diikuti
              </span>
              <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {myEkskuls.length}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Kegiatan aktif</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Pertemuan
              </span>
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalPertemuan}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Sesi latihan</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                Hadir
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-200 mt-1">
              {hadir}
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Tepat waktu</p>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-800 dark:text-sky-300">
                Izin
              </span>
              <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>
            <p className="text-2xl font-black text-sky-700 dark:text-sky-200 mt-1">
              {izin}
            </p>
            <p className="text-[10px] text-sky-600 dark:text-sky-400 mt-0.5">Izin terkonfirmasi</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                Sakit
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-700 dark:text-amber-200 mt-1">
              {sakit}
            </p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">Ada surat sakit</p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                Alpa
              </span>
              <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <p className="text-2xl font-black text-rose-700 dark:text-rose-200 mt-1">
              {alpa}
            </p>
            <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">Tanpa kabar</p>
          </div>
        </div>
      </div>

      {/* Ekstrakurikuler Diikuti & Jadwal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span>Ekstrakurikuler yang Diikuti</span>
          </h4>
          <div className="space-y-3">
            {myEkskuls.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Anda belum terdaftar pada ekstrakurikuler manapun.
              </p>
            ) : (
              myEkskuls.map((ek) => (
                <div
                  key={ek.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {ek.nama}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {ek.kode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {ek.keterangan}
                  </p>
                  <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-3">
                    <span>Hari: <strong>{ek.hari}</strong></span>
                    <span>Waktu: <strong>{ek.jam}</strong></span>
                    <span>Tempat: <strong>{ek.tempat}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span>Jadwal Kegiatan Saya</span>
          </h4>
          <div className="space-y-3">
            {myJadwal.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Tidak ada jadwal kegiatan.
              </p>
            ) : (
              myJadwal.map((j) => {
                const ek = ekskul.find((e) => e.id === j.ekskulId);
                return (
                  <div
                    key={j.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {ek?.nama}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {j.hari}, pukul {j.jamMulai} - {j.jamSelesai} WIB
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Lokasi: {j.tempat}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      {j.hari}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Riwayat Absensi Saya Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Riwayat Absensi Saya
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daftar lengkap rekam jejak kehadiran kegiatan ekstrakurikuler yang Anda ikuti
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Ekstrakurikuler</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3">Dicatat Oleh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {myAbsensi.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Belum ada riwayat absensi untuk Anda.
                  </td>
                </tr>
              ) : (
                myAbsensi.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-medium whitespace-nowrap text-slate-800 dark:text-slate-200">
                      {row.tanggal}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                      {getEkskulName(row.ekskulId)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={row.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {row.keterangan || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {row.recordedBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
