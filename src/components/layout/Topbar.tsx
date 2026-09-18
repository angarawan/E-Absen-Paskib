import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  Sun,
  Moon,
  Shield,
  GraduationCap,
  UserCheck,
  HardDriveDownload,
  Lock,
} from 'lucide-react';
import { UserRole } from '../../types';

interface TopbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const {
    currentUser,
    currentMenu,
    setCurrentMenu,
    isDarkMode,
    toggleDarkMode,
    profilSekolah,
    isStoragePersisted,
  } = useApp();

  // Helper title for current menu
  const getPageTitle = (menu: string): { title: string; subtitle: string } => {
    switch (menu) {
      case 'dashboard':
        return {
          title: 'Dashboard Utama',
          subtitle: `Ringkasan kehadiran & aktivitas ekstrakurikuler`,
        };
      case 'siswa':
        return {
          title: 'Data Siswa',
          subtitle: 'Kelola data identitas, kelas, dan status keaktifan siswa',
        };
      case 'pembina':
        return {
          title: 'Data Pembina',
          subtitle: 'Kelola data guru pembina dan ekstrakurikuler yang diampu',
        };
      case 'ekskul':
      case 'ekskul-siswa':
        return {
          title: 'Data Ekstrakurikuler',
          subtitle: 'Daftar ekstrakurikuler, jadwal hari, tempat, dan pembina',
        };
      case 'anggota':
        return {
          title: 'Data Anggota',
          subtitle: 'Pendaftaran dan pemetaan siswa dalam kegiatan ekstrakurikuler',
        };
      case 'jadwal':
      case 'jadwal-siswa':
        return {
          title: 'Jadwal Kegiatan',
          subtitle: 'Agenda waktu latihan dan lokasi pelaksanaan ekstrakurikuler',
        };
      case 'absensi-form':
        return {
          title: 'Input Absensi Siswa',
          subtitle: 'Catat kehadiran siswa secara cepat, akurat, dan real-time',
        };
      case 'riwayat-absensi':
      case 'riwayat-siswa':
        return {
          title: 'Riwayat Absensi',
          subtitle: 'Daftar log absensi dengan filter tanggal, ekskul, dan status',
        };
      case 'rekap':
        return {
          title: 'Rekapitulasi Kehadiran',
          subtitle: 'Laporan persentase kehadiran lengkap dengan fitur Export Excel dan Print',
        };
      case 'pengaturan-user':
        return {
          title: 'Manajemen Pengguna',
          subtitle: 'Kelola akun login admin, pembina, dan siswa',
        };
      case 'pengaturan-sekolah':
        return {
          title: 'Profil Sekolah',
          subtitle: 'Informasi sekolah, kepala sekolah, dan tahun ajaran',
        };
      default:
        return {
          title: 'Absensi Ekstrakurikuler',
          subtitle: 'Sistem informasi presensi ekstrakurikuler',
        };
    }
  };

  const { title, subtitle } = getPageTitle(currentMenu);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Shield className="w-3 h-3" />
            ADMIN
          </span>
        );
      case 'PEMBINA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <UserCheck className="w-3 h-3" />
            PEMBINA
          </span>
        );
      case 'SISWA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <GraduationCap className="w-3 h-3" />
            SISWA
          </span>
        );
    }
  };

  return (
    <header
      id="app-topbar"
      className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 h-16 flex items-center justify-between transition-colors"
    >
      {/* Left: Hamburger menu toggle & page title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isSidebarOpen ? 'Sembunyikan menu navigasi' : 'Tampilkan menu navigasi'}
          aria-label={isSidebarOpen ? 'Sembunyikan menu' : 'Tampilkan menu'}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
            {title}
          </h2>
          <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400 truncate">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Semester & Tahun Ajaran Tag */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
          <span>TA: {profilSekolah.tahunAjaran}</span>
          <span>•</span>
          <span>Sem: {profilSekolah.semester}</span>
        </div>

        {/* Secure Storage Status Indicator */}
        {currentUser?.role === 'ADMIN' && (
          <button
            id="btn-topbar-vault-status"
            onClick={() => setCurrentMenu('arsip-cadangan')}
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isStoragePersisted
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
            }`}
            title="Sistem Penyimpanan Terproteksi & Cadangan Data"
          >
            <HardDriveDownload className="w-3.5 h-3.5" />
            <span>{isStoragePersisted ? 'Data Terproteksi' : 'Cadangan Data'}</span>
          </button>
        )}

        {/* Read-Only Current User Profile (Role switcher removed for security) */}
        {currentUser && (
          <div
            id="user-profile-badge"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60"
            title={`Masuk sebagai: ${currentUser.name} (${currentUser.username})`}
          >
            <span className="hidden sm:inline text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[130px] md:max-w-[180px] truncate">
              {currentUser.name}
            </span>
            {getRoleBadge(currentUser.role)}
          </div>
        )}

        {/* Dark Mode Toggle */}
        <button
          id="btn-toggle-dark-mode"
          onClick={toggleDarkMode}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={isDarkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};
