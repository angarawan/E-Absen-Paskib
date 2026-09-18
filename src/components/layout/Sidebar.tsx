import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Award,
  UserPlus,
  Calendar,
  ClipboardCheck,
  History,
  FileSpreadsheet,
  Settings,
  School,
  LogOut,
  X,
  Sparkles,
  Database,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser, currentMenu, setCurrentMenu, logout, profilSekolah } = useApp();

  if (!currentUser) return null;

  const role = currentUser.role;

  const handleNavClick = (menu: string) => {
    setCurrentMenu(menu);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const navItemClass = (active: boolean) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      active
        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Logo */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            {profilSekolah.logoUrl ? (
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs">
                <img
                  src={profilSekolah.logoUrl}
                  alt="Logo Sekolah"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase truncate">
                E-ABSENSI EKSKUL
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                {profilSekolah.namaSekolah}
              </p>
            </div>
          </div>
          <button
            id="sidebar-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Sembunyikan menu"
            aria-label="Tutup sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {/* ============ ADMIN MENU ============ */}
          {role === 'ADMIN' && (
            <>
              <div>
                <button
                  id="menu-dashboard"
                  onClick={() => handleNavClick('dashboard')}
                  className={`w-full ${navItemClass(currentMenu === 'dashboard')}`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>DASHBOARD</span>
                </button>
              </div>

              <div>
                <div className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                  DATA MASTER
                </div>
                <div className="space-y-1">
                  <button
                    id="menu-siswa"
                    onClick={() => handleNavClick('siswa')}
                    className={`w-full ${navItemClass(currentMenu === 'siswa')}`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Siswa</span>
                  </button>
                  <button
                    id="menu-pembina"
                    onClick={() => handleNavClick('pembina')}
                    className={`w-full ${navItemClass(currentMenu === 'pembina')}`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Pembina</span>
                  </button>
                  <button
                    id="menu-ekskul"
                    onClick={() => handleNavClick('ekskul')}
                    className={`w-full ${navItemClass(currentMenu === 'ekskul')}`}
                  >
                    <Award className="w-4 h-4" />
                    <span>Ekstrakurikuler</span>
                  </button>
                  <button
                    id="menu-anggota"
                    onClick={() => handleNavClick('anggota')}
                    className={`w-full ${navItemClass(currentMenu === 'anggota')}`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Anggota</span>
                  </button>
                  <button
                    id="menu-jadwal"
                    onClick={() => handleNavClick('jadwal')}
                    className={`w-full ${navItemClass(currentMenu === 'jadwal')}`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Jadwal</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                  ABSENSI
                </div>
                <div className="space-y-1">
                  <button
                    id="menu-absensi"
                    onClick={() => handleNavClick('absensi-form')}
                    className={`w-full ${navItemClass(currentMenu === 'absensi-form')}`}
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span>Absensi</span>
                  </button>
                  <button
                    id="menu-riwayat"
                    onClick={() => handleNavClick('riwayat-absensi')}
                    className={`w-full ${navItemClass(currentMenu === 'riwayat-absensi')}`}
                  >
                    <History className="w-4 h-4" />
                    <span>Riwayat Absensi</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                  LAPORAN
                </div>
                <div className="space-y-1">
                  <button
                    id="menu-rekap"
                    onClick={() => handleNavClick('rekap')}
                    className={`w-full ${navItemClass(currentMenu === 'rekap')}`}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Rekap Kehadiran</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                  PENGATURAN
                </div>
                <div className="space-y-1">
                  <button
                    id="menu-pengguna"
                    onClick={() => handleNavClick('pengaturan-user')}
                    className={`w-full ${navItemClass(currentMenu === 'pengaturan-user')}`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Pengguna</span>
                  </button>
                  <button
                    id="menu-sekolah"
                    onClick={() => handleNavClick('pengaturan-sekolah')}
                    className={`w-full ${navItemClass(currentMenu === 'pengaturan-sekolah')}`}
                  >
                    <School className="w-4 h-4" />
                    <span>Profil Sekolah</span>
                  </button>
                  <button
                    id="menu-arsip-cadangan"
                    onClick={() => handleNavClick('arsip-cadangan')}
                    className={`w-full ${navItemClass(currentMenu === 'arsip-cadangan')}`}
                  >
                    <Database className="w-4 h-4 text-emerald-500" />
                    <span>Cadangan & Arsip Data</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ============ PEMBINA MENU ============ */}
          {role === 'PEMBINA' && (
            <>
              <div>
                <button
                  id="menu-dashboard-pembina"
                  onClick={() => handleNavClick('dashboard')}
                  className={`w-full ${navItemClass(currentMenu === 'dashboard')}`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard Pembina</span>
                </button>
              </div>

              <div>
                <div className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                  ABSENSI SISWA
                </div>
                <div className="space-y-1">
                  <button
                    id="menu-absensi-pembina"
                    onClick={() => handleNavClick('absensi-form')}
                    className={`w-full ${navItemClass(currentMenu === 'absensi-form')}`}
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span>Catat Kehadiran</span>
                  </button>
                  <button
                    id="menu-rekap-pembina"
                    onClick={() => handleNavClick('rekap')}
                    className={`w-full ${navItemClass(currentMenu === 'rekap')}`}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Rekap Kehadiran</span>
                  </button>
                  <button
                    id="menu-riwayat-pembina"
                    onClick={() => handleNavClick('riwayat-absensi')}
                    className={`w-full ${navItemClass(currentMenu === 'riwayat-absensi')}`}
                  >
                    <History className="w-4 h-4" />
                    <span>Riwayat Absensi</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                  MURID & KEGIATAN
                </div>
                <div className="space-y-1">
                  <button
                    id="menu-siswa-pembina"
                    onClick={() => handleNavClick('siswa')}
                    className={`w-full ${navItemClass(currentMenu === 'siswa')}`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Data & Akun Murid</span>
                  </button>
                  <button
                    id="menu-anggota-pembina"
                    onClick={() => handleNavClick('anggota')}
                    className={`w-full ${navItemClass(currentMenu === 'anggota')}`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Anggota Ekskul</span>
                  </button>
                  <button
                    id="menu-jadwal-pembina"
                    onClick={() => handleNavClick('jadwal')}
                    className={`w-full ${navItemClass(currentMenu === 'jadwal')}`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Jadwal Latihan</span>
                  </button>
                  <button
                    id="menu-ekskul-binaan"
                    onClick={() => handleNavClick('ekskul')}
                    className={`w-full ${navItemClass(currentMenu === 'ekskul')}`}
                  >
                    <Award className="w-4 h-4" />
                    <span>Ekstrakurikuler</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                  ARSIP & DATA
                </div>
                <div className="space-y-1">
                  <button
                    id="menu-arsip-cadangan-pembina"
                    onClick={() => handleNavClick('arsip-cadangan')}
                    className={`w-full ${navItemClass(currentMenu === 'arsip-cadangan')}`}
                  >
                    <Database className="w-4 h-4 text-emerald-500" />
                    <span>Cadangan & Arsip Data</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ============ SISWA MENU ============ */}
          {role === 'SISWA' && (
            <>
              <div>
                <button
                  id="menu-dashboard-siswa"
                  onClick={() => handleNavClick('dashboard')}
                  className={`w-full ${navItemClass(currentMenu === 'dashboard')}`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard Siswa</span>
                </button>
              </div>

              <div>
                <div className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                  KEGIATAN SAYA
                </div>
                <div className="space-y-1">
                  <button
                    id="menu-ekskul-siswa"
                    onClick={() => handleNavClick('ekskul-siswa')}
                    className={`w-full ${navItemClass(currentMenu === 'ekskul-siswa')}`}
                  >
                    <Award className="w-4 h-4" />
                    <span>Ekstrakurikuler Diikuti</span>
                  </button>
                  <button
                    id="menu-jadwal-siswa"
                    onClick={() => handleNavClick('jadwal-siswa')}
                    className={`w-full ${navItemClass(currentMenu === 'jadwal-siswa')}`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Jadwal Kegiatan</span>
                  </button>
                  <button
                    id="menu-riwayat-siswa"
                    onClick={() => handleNavClick('riwayat-siswa')}
                    className={`w-full ${navItemClass(currentMenu === 'riwayat-siswa')}`}
                  >
                    <History className="w-4 h-4" />
                    <span>Riwayat Absensi Saya</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer User & Logout */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {currentUser.username} • <span className="font-semibold text-blue-600 dark:text-blue-400">{currentUser.role}</span>
              </p>
            </div>
          </div>
          <button
            id="sidebar-logout-btn"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
};
