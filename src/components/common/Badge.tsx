import React from 'react';
import { AttendanceStatus } from '../../types';

interface BadgeProps {
  status: AttendanceStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-semibold px-2.5 py-1',
    lg: 'text-sm font-semibold px-3 py-1.5',
  }[size];

  switch (normalized) {
    case 'HADIR':
      return (
        <span
          id={`badge-hadir-${Math.random().toString(36).substring(2, 6)}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 whitespace-nowrap ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          HADIR
        </span>
      );
    case 'IZIN':
      return (
        <span
          id={`badge-izin-${Math.random().toString(36).substring(2, 6)}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-300 dark:border-sky-800 whitespace-nowrap ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
          IZIN
        </span>
      );
    case 'SAKIT':
      return (
        <span
          id={`badge-sakit-${Math.random().toString(36).substring(2, 6)}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300 dark:border-amber-800 whitespace-nowrap ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          SAKIT
        </span>
      );
    case 'ALPA':
      return (
        <span
          id={`badge-alpa-${Math.random().toString(36).substring(2, 6)}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-300 dark:border-rose-800 whitespace-nowrap ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          ALPA
        </span>
      );
    case 'AKTIF':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border border-teal-300 dark:border-teal-800 whitespace-nowrap ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
          Aktif
        </span>
      );
    case 'NON-AKTIF':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700 whitespace-nowrap ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Non-Aktif
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};
