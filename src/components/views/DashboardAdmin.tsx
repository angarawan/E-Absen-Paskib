import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserCheck,
  Award,
  UserPlus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Calendar,
  ArrowRight,
  ClipboardList,
  School,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { StatusBadge } from '../common/Badge';

export const DashboardAdmin: React.FC = () => {
  const {
    siswa,
    pembina,
    ekskul,
    anggota,
    absensi,
    arsipAbsensi,
    setCurrentMenu,
    profilSekolah,
  } = useApp();

  // Helper date for today YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Today attendance stats
  const todayAbsensi = absensi.filter((a) => a.tanggal === todayStr);
  const hadirHariIni = todayAbsensi.filter((a) => a.status === 'HADIR').length;
  const izinHariIni = todayAbsensi.filter((a) => a.status === 'IZIN').length;
  const sakitHariIni = todayAbsensi.filter((a) => a.status === 'SAKIT').length;
  const alpaHariIni = todayAbsensi.filter((a) => a.status === 'ALPA').length;

  // Recent attendance (top 8)
  const recentAbsensi = [...absensi]
    .sort((a, b) => new Date(b.createdAt || b.tanggal).getTime() - new Date(a.createdAt || a.tanggal).getTime())
    .slice(0, 8);

  const getSiswaName = (id: string) => {
    return siswa.find((s) => s.id === id)?.nama || 'Siswa tidak ditemukan';
  };

  const getSiswaKelas = (id: string) => {
    return siswa.find((s) => s.id === id)?.kelas || '-';
  };

  const getEkskulName = (id: string) => {
    return ekskul.find((e) => e.id === id)?.nama || 'Ekskul';
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* School Identity Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          {profilSekolah.logoUrl ? (
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-800 p-1.5 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs">
              <img
                src={profilSekolah.logoUrl}
                alt="Logo Sekolah"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <School className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                {profilSekolah.namaSekolah}
              </h2>
              <span className="hidden md:inline px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800 shrink-0">
                NPSN: {profilSekolah.npsn}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Tahun Ajaran {profilSekolah.tahunAjaran} • Semester {profilSekolah.semester} • {profilSekolah.alamat}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            id="btn-kelola-brankas-admin"
            onClick={() => setCurrentMenu('arsip-cadangan')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Brankas & Arsip Data</span>
          </button>
          <button
            onClick={() => setCurrentMenu('pengaturan-sekolah')}
            className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            Kelola Profil & Logo
          </button>
        </div>
      </div>

      {/* Master Data Stats (Cards 1-4) */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Ringkasan Data Master
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            id="card-stat-siswa"
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Siswa
              </p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {siswa.length}
              </h4>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                {siswa.filter((s) => s.status === 'Aktif').length} Siswa Aktif
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div
            id="card-stat-pembina"
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Pembina
              </p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {pembina.length}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Guru & Tenaga Ahli
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div
            id="card-stat-ekskul"
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Ekstrakurikuler
              </p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {ekskul.length}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Pilihan Peminatan
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>

          <div
            id="card-stat-anggota"
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Anggota
              </p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {anggota.length}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Terdaftar di Kegiatan
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <UserPlus className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Today Stats (Cards 5-8) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Presensi Hari Ini ({formatDate(todayStr)})
          </h3>
          <button
            onClick={() => setCurrentMenu('absensi-form')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Catat Absensi Baru</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            id="card-hadir-hari-ini"
            className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                Hadir Hari Ini
              </p>
              <h4 className="text-2xl font-black text-emerald-700 dark:text-emerald-200 mt-1">
                {hadirHariIni}
              </h4>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Siswa hadir tepat waktu
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-200/60 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div
            id="card-izin-hari-ini"
            className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-sky-800 dark:text-sky-300">
                Izin Hari Ini
              </p>
              <h4 className="text-2xl font-black text-sky-700 dark:text-sky-200 mt-1">
                {izinHariIni}
              </h4>
              <p className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">
                Dengan surat/keterangan
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-200/60 dark:bg-sky-800/50 text-sky-700 dark:text-sky-200 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div
            id="card-sakit-hari-ini"
            className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                Sakit Hari Ini
              </p>
              <h4 className="text-2xl font-black text-amber-700 dark:text-amber-200 mt-1">
                {sakitHariIni}
              </h4>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Pemberitahuan sakit
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-200/60 dark:bg-amber-800/50 text-amber-700 dark:text-amber-200 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div
            id="card-alpa-hari-ini"
            className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                Alpa Hari Ini
              </p>
              <h4 className="text-2xl font-black text-rose-700 dark:text-rose-200 mt-1">
                {alpaHariIni}
              </h4>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                Tanpa keterangan
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-200/60 dark:bg-rose-800/50 text-rose-700 dark:text-rose-200 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Absensi Terbaru (Specified in prompt section 3) */}
      <div
        id="section-absensi-terbaru"
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden"
      >
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Absensi Terbaru
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Log kehadiran yang baru saja dicatat oleh pembina kegiatan
            </p>
          </div>
          <button
            onClick={() => setCurrentMenu('riwayat-absensi')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 self-start sm:self-auto"
          >
            <span>Lihat Seluruh Riwayat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-4 sm:px-6 py-3">Tanggal</th>
                <th className="px-4 sm:px-6 py-3">Siswa</th>
                <th className="px-4 sm:px-6 py-3">Ekstrakurikuler</th>
                <th className="px-4 sm:px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentAbsensi.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    Belum ada data absensi yang dicatat.
                  </td>
                </tr>
              ) : (
                recentAbsensi.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-3.5 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {row.tanggal}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">
                        {getSiswaName(row.siswaId)}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Kelas: {getSiswaKelas(row.siswaId)}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                      {getEkskulName(row.ekskulId)}
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                      <StatusBadge status={row.status} />
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
