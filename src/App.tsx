import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginView } from './components/views/LoginView';

// Views
import { DashboardAdmin } from './components/views/DashboardAdmin';
import { DashboardPembina } from './components/views/DashboardPembina';
import { DashboardSiswa } from './components/views/DashboardSiswa';
import { SiswaView } from './components/views/SiswaView';
import { PembinaView } from './components/views/PembinaView';
import { EkstrakurikulerView } from './components/views/EkstrakurikulerView';
import { AnggotaView } from './components/views/AnggotaView';
import { JadwalView } from './components/views/JadwalView';
import { AbsensiFormView } from './components/views/AbsensiFormView';
import { RiwayatAbsensiView } from './components/views/RiwayatAbsensiView';
import { RekapKehadiranView } from './components/views/RekapKehadiranView';
import { PenggunaView } from './components/views/PenggunaView';
import { ProfilSekolahView } from './components/views/ProfilSekolahView';
import { ArsipCadanganView } from './components/views/ArsipCadanganView';

function AppContent() {
  const { currentUser, currentMenu, isDarkMode, profilSekolah } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Automatically adjust sidebar on screen resize
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // If not logged in, render the login view
  if (!currentUser) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  // Determine active view content
  const renderContent = () => {
    switch (currentMenu) {
      case 'dashboard':
        if (currentUser.role === 'ADMIN') return <DashboardAdmin />;
        if (currentUser.role === 'PEMBINA') return <DashboardPembina />;
        return <DashboardSiswa />;

      case 'siswa':
        return <SiswaView />;

      case 'pembina':
        return <PembinaView />;

      case 'ekskul':
      case 'ekskul-siswa':
        return <EkstrakurikulerView />;

      case 'anggota':
        return <AnggotaView />;

      case 'jadwal':
      case 'jadwal-siswa':
        return <JadwalView />;

      case 'absensi-form':
      case 'input-absensi':
        return <AbsensiFormView />;

      case 'riwayat-absensi':
      case 'riwayat-siswa':
        return <RiwayatAbsensiView />;

      case 'rekap':
        return <RekapKehadiranView />;

      case 'pengaturan-user':
      case 'pengguna':
        return <PenggunaView />;

      case 'pengaturan-sekolah':
      case 'pengaturan':
        return <ProfilSekolahView />;

      case 'arsip-cadangan':
      case 'cadangan':
        return <ArsipCadanganView />;

      default:
        if (currentUser.role === 'ADMIN') return <DashboardAdmin />;
        if (currentUser.role === 'PEMBINA') return <DashboardPembina />;
        return <DashboardSiswa />;
    }
  };

  const cinematicBgClass = isDarkMode
    ? `cinema-${profilSekolah.temaSinematik || 'midnight'}`
    : 'cinema-light';

  return (
    <div className={`min-h-screen flex ${cinematicBgClass} text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200`}>
      {/* Responsive Navigation Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-[padding] duration-200 ease-in-out ${
          isSidebarOpen ? 'lg:pl-64' : 'pl-0'
        }`}
      >
        <Topbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Global Toast Notification System */}
      <ToastContainer />
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
