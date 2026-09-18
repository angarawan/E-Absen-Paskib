import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      className="fixed top-5 right-5 sm:top-6 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-3 sm:px-0"
    >
      {toasts.map((toast) => {
        const typeConfig = {
          success: {
            container: 'border-emerald-500/80 bg-white/95 dark:bg-slate-900/95 shadow-emerald-500/10',
            iconBg: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
            titleColor: 'text-emerald-950 dark:text-emerald-200',
            textColor: 'text-slate-700 dark:text-slate-200',
            accentBar: 'bg-emerald-500',
          },
          error: {
            container: 'border-rose-500/80 bg-white/95 dark:bg-slate-900/95 shadow-rose-500/10',
            iconBg: 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
            titleColor: 'text-rose-950 dark:text-rose-200',
            textColor: 'text-slate-700 dark:text-slate-200',
            accentBar: 'bg-rose-500',
          },
          warning: {
            container: 'border-amber-500/80 bg-white/95 dark:bg-slate-900/95 shadow-amber-500/10',
            iconBg: 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
            titleColor: 'text-amber-950 dark:text-amber-200',
            textColor: 'text-slate-700 dark:text-slate-200',
            accentBar: 'bg-amber-500',
          },
          info: {
            container: 'border-blue-500/80 bg-white/95 dark:bg-slate-900/95 shadow-blue-500/10',
            iconBg: 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60',
            titleColor: 'text-blue-950 dark:text-blue-200',
            textColor: 'text-slate-700 dark:text-slate-200',
            accentBar: 'bg-blue-500',
          },
        }[toast.type];

        const Icon = {
          success: CheckCircle2,
          error: AlertCircle,
          warning: AlertTriangle,
          info: Info,
        }[toast.type];

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto relative overflow-hidden flex items-start gap-3.5 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${typeConfig.container} animate-in fade-in slide-in-from-top-3`}
            role="alert"
          >
            {/* Left accent indicator bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${typeConfig.accentBar}`} />

            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${typeConfig.iconBg}`}>
              <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              {toast.title && (
                <h5 className={`font-bold text-xs uppercase tracking-wider mb-0.5 ${typeConfig.titleColor}`}>
                  {toast.title}
                </h5>
              )}
              <p className={`text-xs sm:text-sm font-medium leading-relaxed ${typeConfig.textColor}`}>
                {toast.message}
              </p>
            </div>

            <button
              id={`toast-close-${toast.id}`}
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 mt-0.5"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
