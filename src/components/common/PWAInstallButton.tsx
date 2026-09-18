import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useApp } from '../../context/AppContext';
import { Download, Smartphone, X, CheckCircle2, Share2, PlusSquare } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full' | 'sidebar';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { profilSekolah } = useApp();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already installed as native standalone app, no need to show
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuideModal(true);
    }
  };

  const buttonContent = (
    <>
      <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
      <span className="truncate">Pasang Aplikasi</span>
    </>
  );

  return (
    <>
      {variant === 'sidebar' ? (
        <button
          id="btn-install-pwa-sidebar"
          type="button"
          onClick={handleInstallClick}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200/80 dark:border-blue-800/60 transition-all text-left"
          title="Pasang aplikasi ke layar utama HP / Laptop dengan logo sekolah"
        >
          {profilSekolah.logoUrl ? (
            <img
              src={profilSekolah.logoUrl}
              alt="Logo Sekolah"
              className="w-4 h-4 object-contain rounded-full shrink-0"
            />
          ) : (
            <Download className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="truncate font-bold text-xs">Pasang Aplikasi</p>
            <p className="text-[10px] text-blue-600/80 dark:text-blue-400/80 truncate">Icon logo sekolah</p>
          </div>
        </button>
      ) : variant === 'full' ? (
        <button
          id="btn-install-pwa-full"
          type="button"
          onClick={handleInstallClick}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Pasang ke Layar Utama (Logo Sekolah)</span>
        </button>
      ) : (
        <button
          id="btn-install-pwa-topbar"
          type="button"
          onClick={handleInstallClick}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold transition-all shrink-0"
          title="Pasang aplikasi ke layar utama HP / Komputer menggunakan logo sekolah"
        >
          {buttonContent}
        </button>
      )}

      {/* Guide Modal for browsers where beforeinstallprompt is not auto-prompted or iOS Safari */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 p-1.5 flex items-center justify-center shrink-0">
                  <img
                    src={profilSekolah.logoUrl || '/pwa-192x192.png'}
                    alt="Logo Sekolah"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Pasang ke Layar Utama
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ikon aplikasi akan otomatis menggunakan logo sekolah
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
              {isIOS ? (
                <>
                  <p className="font-bold text-slate-900 dark:text-white">
                    Cara pasang di iPhone / iPad (Safari):
                  </p>
                  <ol className="space-y-2 list-decimal list-inside text-slate-600 dark:text-slate-300">
                    <li>
                      Ketuk tombol <strong>Bagikan (Share <Share2 className="inline w-3.5 h-3.5 text-blue-600" />)</strong> di bilah bawah Safari.
                    </li>
                    <li>
                      Gulir ke bawah dan pilih <strong>"Tambah ke Layar Utama" (Add to Home Screen <PlusSquare className="inline w-3.5 h-3.5 text-blue-600" />)</strong>.
                    </li>
                    <li>
                      Ikon logo sekolah akan langsung terpasang di layar utama iPhone Anda.
                    </li>
                  </ol>
                </>
              ) : (
                <>
                  <p className="font-bold text-slate-900 dark:text-white">
                    Cara pasang di Android / Chrome / Edge:
                  </p>
                  <ol className="space-y-2 list-decimal list-inside text-slate-600 dark:text-slate-300">
                    <li>
                      Ketuk tombol menu <strong>titik tiga (⋮)</strong> di pojok kanan atas peramban.
                    </li>
                    <li>
                      Pilih menu <strong>"Instal aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
                    </li>
                    <li>
                      Konfirmasi pemasangan. Aplikasi siap dibuka langsung seperti aplikasi HP dengan logo sekolah!
                    </li>
                  </ol>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
