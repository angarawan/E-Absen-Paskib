import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  School,
  Save,
  Building,
  MapPin,
  Calendar,
  UserCheck,
  ShieldCheck,
  Upload,
  Link as LinkIcon,
  Trash2,
  Sparkles,
  CheckCircle2,
  Palette,
  Eye,
  FileText,
  Smartphone,
} from 'lucide-react';
import { PRESET_LOGOS } from '../../data/presetLogos';
import { ProfilSekolah } from '../../types';

export const ProfilSekolahView: React.FC = () => {
  const { profilSekolah, updateProfilSekolah } = useApp();

  const [formData, setFormData] = useState<ProfilSekolah>(profilSekolah);
  const [urlInput, setUrlInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress & optimize image via canvas to keep localStorage safe and fast
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Berkas yang dipilih harus berupa file gambar (PNG, JPG, SVG, WebP).'));
        return;
      }

      // If it's an SVG, read directly as text or dataURL
      if (file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Gagal membaca berkas SVG.'));
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const MAX_DIM = 360;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/png'));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => reject(new Error('Format gambar tidak dapat diproses.'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Gagal memproses berkas gambar.'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (file: File | undefined) => {
    if (!file) return;
    setUploadError('');
    try {
      const dataUrl = await processImageFile(file);
      setFormData((prev) => ({ ...prev, logoUrl: dataUrl }));
    } catch (err: any) {
      setUploadError(err.message || 'Gagal mengunggah logo');
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setUploadError('');
    setFormData((prev) => ({ ...prev, logoUrl: urlInput.trim() }));
    setUrlInput('');
  };

  const handleSelectPreset = (dataUrl: string) => {
    setUploadError('');
    setFormData((prev) => ({ ...prev, logoUrl: dataUrl }));
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfilSekolah(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const cinematicThemes = [
    {
      id: 'midnight',
      name: 'Midnight Cinema',
      desc: 'Obsidian & Biru Malam Sinematik',
      dotColor: 'bg-blue-500',
      glowClass: 'from-blue-600/30 to-indigo-950/80',
    },
    {
      id: 'emerald',
      name: 'Emerald Noir',
      desc: 'Hijau Hutan & Aura Zamrud Elegan',
      dotColor: 'bg-emerald-500',
      glowClass: 'from-emerald-600/30 to-teal-950/80',
    },
    {
      id: 'amber',
      name: 'Sunset Cinema',
      desc: 'Senja Keemasan & Amber Sinematik',
      dotColor: 'bg-amber-500',
      glowClass: 'from-amber-600/30 to-yellow-950/80',
    },
    {
      id: 'velvet',
      name: 'Velvet Aurora',
      desc: 'Ungu Megah & Spektrum Sinematik',
      dotColor: 'bg-purple-500',
      glowClass: 'from-purple-600/30 to-fuchsia-950/80',
    },
    {
      id: 'obsidian',
      name: 'Obsidian Studio',
      desc: 'Monokrom Gelap & Film Studio',
      dotColor: 'bg-slate-400',
      glowClass: 'from-slate-600/30 to-zinc-950/80',
    },
  ] as const;

  const currentTheme = formData.temaSinematik || 'midnight';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title Card */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Pengaturan Profil & Identitas Sekolah
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Ganti logo sekolah secara manual, pilih nuansa latar sinematik, dan perbarui data lembaga
              </p>
            </div>
          </div>

          <button
            id="btn-simpan-profil-sekolah-atas"
            onClick={handleSubmit}
            type="button"
            className="self-start sm:self-center flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-fadeIn">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Pengaturan profil sekolah dan logo berhasil diperbarui & disimpan secara otomatis!</span>
          </div>
        )}

        {uploadError && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            {uploadError}
          </div>
        )}
      </div>

      {/* SECTION 1: GANTI LOGO PROFIL SEKOLAH SECARA MANUAL */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Logo Profil Sekolah (Ganti Manual)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Logo akan ditampilkan pada Kop Surat Laporan, Menu Sidebar, dan Halaman Login
              </p>
            </div>
          </div>

          {formData.logoUrl && (
            <button
              type="button"
              id="btn-hapus-logo"
              onClick={handleRemoveLogo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Logo</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Kolom Kiri: Upload & Masukkan Logo */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Drag & Drop File Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-500" />
                <span>Unggah Berkas Gambar (PNG, JPG, SVG, WebP)</span>
              </label>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileChange(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                    : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="input-file-logo"
                  accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Klik untuk pilih file gambar, atau tarik & lepas ke sini
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Maksimal ukuran otomatis disesuaikan agar optimal dan jernih
                </p>
              </div>
            </div>

            {/* 2. Paste URL Logo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
                <span>Atau Masukkan Tautan / URL Gambar</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  id="input-url-logo"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://contoh-sekolah.sch.id/logo.png"
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  id="btn-terapkan-url-logo"
                  onClick={handleApplyUrl}
                  disabled={!urlInput.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs disabled:opacity-40 transition-colors"
                >
                  Terapkan
                </button>
              </div>
            </div>

            {/* 3. Preset Pilihan Logo Indonesia */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Gunakan Logo Preset Pendidikan Nasional (1-Klik):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PRESET_LOGOS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.dataUrl)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      formData.logoUrl === preset.dataUrl
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <img
                      src={preset.dataUrl}
                      alt={preset.name}
                      className="w-8 h-8 object-contain shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                        {preset.name}
                      </p>
                      <span className="text-[10px] text-slate-400">{preset.category}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Pratinjau Langsung (Live Preview) */}
          <div className="lg:col-span-5 bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-750 p-5 space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Eye className="w-4 h-4 text-blue-500" />
              <span>Pratinjau Tampilan Logo</span>
            </div>

            {/* Preview Box Utama */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center flex flex-col items-center justify-center min-h-[140px]">
              {formData.logoUrl ? (
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center mb-2">
                    <img
                      src={formData.logoUrl}
                      alt="Pratinjau Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {formData.namaSekolah}
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Logo Aktif
                  </span>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-2">
                    <School className="w-7 h-7" />
                  </div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Belum ada logo yang dipilih
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Silakan unggah atau pilih dari preset
                  </p>
                </div>
              )}
            </div>

            {/* Simulasi Tampilan pada Komponen Aplikasi */}
            <div className="space-y-3 pt-2">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Simulasi di Komponen Aplikasi:
              </p>

              {/* 1. Simulasi Sidebar */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Sidebar logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Sparkles className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                    Bilah Menu (Sidebar)
                  </p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {formData.namaSekolah}
                  </p>
                </div>
              </div>

              {/* 2. Simulasi KOP Surat Laporan */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Kop Surat Laporan & Rekapitulasi
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 truncate">
                    Dicantumkan resmi di bagian atas cetak PDF & Excel
                  </p>
                </div>
              </div>

              {/* 3. Simulasi Ikon Instalasi Aplikasi (PWA) di Layar Utama HP / Desktop */}
              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 p-1 flex items-center justify-center shrink-0 shadow-xs border border-blue-500/30">
                  <img
                    src={formData.logoUrl || '/pwa-192x192.png'}
                    alt="PWA Icon Preview"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase flex items-center gap-1">
                    <Smartphone className="w-3 h-3" />
                    Ikon Instalasi Aplikasi (Layar Utama HP & Laptop)
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 truncate">
                    Otomatis menjadi ikon peramban & saat aplikasi dipasang (PWA)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: WARNA LATAR BELAKANG SINEMATIK */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Pilihan Warna Latar Belakang Sinematik
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pilih atmosfer warna sinematik dengan efek pencahayaan studio film yang elegan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cinematicThemes.map((th) => {
            const isActive = currentTheme === th.id;
            return (
              <button
                key={th.id}
                type="button"
                id={`btn-tema-${th.id}`}
                onClick={() => setFormData((prev) => ({ ...prev, temaSinematik: th.id }))}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isActive
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-slate-800 ring-2 ring-blue-500/30 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50'
                }`}
              >
                {/* Visual Ambient Glow Indicator */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${th.dotColor} shadow-xs ring-2 ring-white/20`} />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {th.name}
                    </span>
                  </div>
                  {isActive && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider">
                      Aktif
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {th.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: FORMULIR IDENTITAS SEKOLAH LENGKAP */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Data Identitas Lembaga Pendidikan
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Digunakan sebagai informasi resmi pada kop dokumen dan rekapitulasi kehadiran
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-500" />
                <span>Nama Sekolah</span>
              </label>
              <input
                type="text"
                required
                value={formData.namaSekolah}
                onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
                placeholder="Contoh: SMA Negeri 1 Harapan Bangsa"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NPSN (Nomor Pokok Sekolah Nasional)
              </label>
              <input
                type="text"
                required
                value={formData.npsn}
                onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                placeholder="Contoh: 20104521"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Alamat Lengkap Sekolah</span>
            </label>
            <input
              type="text"
              required
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              placeholder="Contoh: Jl. Pendidikan No. 45, Kota Jakarta Selatan"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Tahun Ajaran</span>
              </label>
              <input
                type="text"
                required
                value={formData.tahunAjaran}
                onChange={(e) => setFormData({ ...formData, tahunAjaran: e.target.value })}
                placeholder="Contoh: 2024/2025"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Semester Berjalan
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value as 'Ganjil' | 'Genap' })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                <span>Nama Kepala Sekolah</span>
              </label>
              <input
                type="text"
                required
                value={formData.kepalaSekolah}
                onChange={(e) => setFormData({ ...formData, kepalaSekolah: e.target.value })}
                placeholder="Contoh: Dr. H. Mulyadi, M.Pd."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NIP Kepala Sekolah
              </label>
              <input
                type="text"
                value={formData.nipKepalaSekolah}
                onChange={(e) => setFormData({ ...formData, nipKepalaSekolah: e.target.value })}
                placeholder="Contoh: 19680512 199403 1 003"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              id="btn-simpan-profil-sekolah-bawah"
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Seluruh Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
