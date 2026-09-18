import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Award,
  Users,
  ClipboardCheck,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { StatusBadge } from '../common/Badge';

export const DashboardPembina: React.FC = () => {
  const {
    currentUser,
    pembina,
    ekskul,
    anggota,
    siswa,
    absensi,
    jadwal,
    setCurrentMenu,
  } = useApp();

  // Find this pembina record
  const myPembina = pembina.find(
    (p) => p.id === currentUser?.refId || p.nama === currentUser?.name
  ) || pembina[0];

  // My assigned ekskul
  const myEkskuls = ekskul.filter(
    (e) => e.pembinaId === myPembina?.id || myPembina?.ekskulIds?.includes(e.id)
  );

  const myEkskulIds = myEkskuls.map((e) => e.id);

  // My members
  const myAnggotas = anggota.filter((a) => myEkskulIds.includes(a.ekskulId));

  // Today stats for my ekskuls
  const todayStr = new Date().toISOString().split('T')[0];
  const myTodayAbsensi = absensi.filter(
    (a) => a.tanggal === todayStr && myEkskulIds.includes(a.ekskulId)
  );
  const hadirHariIni = myTodayAbsensi.filter((a) => a.status === 'HADIR').length;
  const izinHariIni = myTodayAbsensi.filter((a) => a.status === 'IZIN').length;
  const sakitHariIni = myTodayAbsensi.filter((a) => a.status === 'SAKIT').length;
  const alpaHariIni = myTodayAbsensi.filter((a) => a.status === 'ALPA').length;

  // Recent attendance for my ekskuls
  const myRecentAbsensi = absensi
    .filter((a) => myEkskulIds.includes(a.ekskulId))
    .sort((a, b) => new Date(b.createdAt || b.tanggal).getTime() - new Date(a.createdAt || a.tanggal).getTime())
    .slice(0, 6);

  // My schedules
  const myJadwals = jadwal.filter((j) => myEkskulIds.includes(j.ekskulId));

  const getSiswa = (id: string) => siswa.find((s) => s.id === id);
  const getEkskul = (id: string) => ekskul.find((e) => e.id === id);

  return (
    <div className="space-y-6">
      {/* Welcome Card for Pembina */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white mb-2">
            Dashboard Pembina
          </span>
          <h3 className="text-xl sm:text-2xl font-black">
            Halo, {myPembina?.nama || currentUser?.name}!
          </h3>
          <p className="text-sm text-blue-100 mt-1">
            NIP: {myPembina?.nip || '-'} • Mengampu {myEkskuls.length} Kegiatan Ekstrakurikuler
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCurrentMenu('absensi-form')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-sm transition-all"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Mulai Catat Absensi</span>
          </button>
          <button
            onClick={() => setCurrentMenu('siswa')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/30 hover:bg-blue-500/50 border border-white/30 text-white font-bold text-xs backdrop-blur-sm transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Kelola Akun Murid</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Ekskul Binaan
          </p>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {myEkskuls.length}
          </h4>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium truncate">
            {myEkskuls.map((e) => e.nama).join(', ') || 'Belum ada'}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total Anggota Siswa
          </p>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {myAnggotas.length}
          </h4>
          <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-1 font-medium">
            Siswa aktif terdaftar
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
          <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            Hadir Hari Ini
          </p>
          <h4 className="text-2xl font-black text-emerald-700 dark:text-emerald-200 mt-1">
            {hadirHariIni}
          </h4>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Dari kegiatan hari ini
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
            Izin / Sakit / Alpa
          </p>
          <h4 className="text-2xl font-black text-amber-700 dark:text-amber-200 mt-1">
            {izinHariIni + sakitHariIni + alpaHariIni}
          </h4>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            Hari ini
          </p>
        </div>
      </div>

      {/* Ekstrakurikuler & Jadwal Binaan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Ekstrakurikuler yang Anda Bina
            </h4>
            <div className="space-y-3">
              {myEkskuls.map((ek) => {
                const countMembers = anggota.filter((a) => a.ekskulId === ek.id).length;
                return (
                  <div
                    key={ek.id}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-base">
                          {ek.nama}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          {ek.kode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Jadwal: {ek.hari}, {ek.jam} • Tempat: {ek.tempat}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        {countMembers} Siswa Terdaftar
                      </p>
                    </div>

                    <button
                      onClick={() => setCurrentMenu('absensi-form')}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      <span>Catat Absensi</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Attendance in My Activities */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Riwayat Absensi Binaan Terakhir
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Data kehadiran terbaru siswa pada kegiatan yang Anda bina
                </p>
              </div>
              <button
                onClick={() => setCurrentMenu('riwayat-absensi')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1"
              >
                <span>Semua Riwayat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Siswa</th>
                    <th className="px-4 py-3">Kegiatan</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {myRecentAbsensi.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                        Belum ada data absensi untuk kegiatan Anda.
                      </td>
                    </tr>
                  ) : (
                    myRecentAbsensi.map((a) => {
                      const s = getSiswa(a.siswaId);
                      const ek = getEkskul(a.ekskulId);
                      return (
                        <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-4 py-3 font-medium whitespace-nowrap">{a.tanggal}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {s?.nama || a.siswaId}
                            </span>
                            <span className="block text-[11px] text-slate-400">
                              {s?.kelas}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                            {ek?.nama}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge status={a.status} size="sm" />
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

        {/* Sidebar info */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Jadwal Latihan Pekan Ini</span>
            </h4>
            <div className="space-y-3">
              {myJadwals.length === 0 ? (
                <p className="text-xs text-slate-400 py-3">Belum ada jadwal tersimpan.</p>
              ) : (
                myJadwals.map((j) => {
                  const ek = getEkskul(j.ekskulId);
                  return (
                    <div
                      key={j.id}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 text-xs"
                    >
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {ek?.nama}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                        Hari {j.hari} • {j.jamMulai} - {j.jamSelesai} WIB
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        Lokasi: {j.tempat}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
