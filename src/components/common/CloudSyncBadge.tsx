import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Cloud,
  CloudUpload,
  CloudDownload,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  X,
  Database,
  ExternalLink,
} from 'lucide-react';

export const CloudSyncBadge: React.FC = () => {
  const {
    cloudSyncStatus,
    lastCloudSyncTime,
    forcePushToCloud,
    forcePullFromCloud,
    signInWithGoogleAccount,
    firebaseUser,
    addToast,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePush = async () => {
    setIsProcessing(true);
    const res = await forcePushToCloud();
    setIsProcessing(false);
    if (res.success) {
      addToast('Data lokal berhasil disinkronkan ke Cloud Firebase!', 'success', 'Sinkronisasi Cloud');
    } else {
      addToast(res.message, 'error');
    }
  };

  const handlePull = async () => {
    setIsProcessing(true);
    const res = await forcePullFromCloud();
    setIsProcessing(false);
    if (res.success) {
      addToast('Data terbaru berhasil diambil dari Cloud Firebase!', 'success', 'Data Diperbarui');
    } else {
      addToast(res.message, 'error');
    }
  };

  const handleGoogleLogin = async () => {
    setIsProcessing(true);
    const res = await signInWithGoogleAccount();
    setIsProcessing(false);
    if (res.success) {
      addToast('Berhasil masuk dengan akun Google!', 'success');
    } else {
      addToast(res.message, 'error');
    }
  };

  return (
    <>
      <button
        id="btn-cloud-sync-status"
        type="button"
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
          cloudSyncStatus === 'connected'
            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            : cloudSyncStatus === 'syncing'
            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
            : cloudSyncStatus === 'offline'
            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
        }`}
        title="Status Sinkronisasi Cloud Firebase (Otomatis & Real-Time)"
      >
        {cloudSyncStatus === 'connected' ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline font-bold">Cloud Live</span>
          </>
        ) : cloudSyncStatus === 'syncing' ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
            <span className="hidden md:inline">Sinkronisasi...</span>
          </>
        ) : (
          <>
            <CloudOff className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline">Lokal / Offline</span>
          </>
        )}
      </button>

      {/* Cloud Sync Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Cloud Database Firebase
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sinkronisasi otomatis multi-perangkat (Laptop, HP, Tablet)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Status Koneksi:</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Terhubung ke Cloud Firestore
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Sinkronisasi Real-Time:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Aktif (Setiap perubahan otomatis tersimpan)
                </span>
              </div>
              {lastCloudSyncTime && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Terakhir Diperbarui:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {lastCloudSyncTime.toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              )}
              {firebaseUser && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">Akun Google:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 truncate max-w-[200px]">
                    {firebaseUser.email}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Aksi Sinkronisasi Manual:
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  id="btn-cloud-push-now"
                  type="button"
                  disabled={isProcessing}
                  onClick={handlePush}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all active:scale-98 disabled:opacity-50"
                >
                  <CloudUpload className="w-4 h-4" />
                  <span>Kirim Data ke Cloud</span>
                </button>
                <button
                  id="btn-cloud-pull-now"
                  type="button"
                  disabled={isProcessing}
                  onClick={handlePull}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all active:scale-98 disabled:opacity-50"
                >
                  <CloudDownload className="w-4 h-4 text-blue-600" />
                  <span>Tarik Data Terbaru</span>
                </button>
              </div>

              {!firebaseUser && (
                <button
                  id="btn-cloud-google-signin"
                  type="button"
                  disabled={isProcessing}
                  onClick={handleGoogleLogin}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                    />
                  </svg>
                  <span>Tautkan Akun Google (Opsional)</span>
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
