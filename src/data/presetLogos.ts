// Preset Logo Sekolah & Organisasi Pendidikan Indonesia (Scalable Vector Data URIs)

export interface PresetLogo {
  id: string;
  name: string;
  category: string;
  dataUrl: string;
}

// Tut Wuri Handayani vector representation
const TUT_WURI_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="46" fill="#1D4ED8" stroke="#FBBF24" stroke-width="3"/>
  <circle cx="50" cy="50" r="38" fill="#1E40AF"/>
  <!-- Sayap & Api Pendidikan (Tut Wuri Handayani stylization) -->
  <path d="M50 20 L58 36 L74 38 L62 50 L66 66 L50 57 L34 66 L38 50 L26 38 L42 36 Z" fill="#FBBF24"/>
  <circle cx="50" cy="46" r="10" fill="#DC2626"/>
  <path d="M47 38 Q50 32 53 38 Q55 43 50 47 Q45 43 47 38 Z" fill="#FEF08A"/>
  <path d="M35 72 Q50 68 65 72 L62 76 Q50 72 38 76 Z" fill="#FFFFFF"/>
</svg>
`)}`;

// Kemenag / Madrasah stylization vector
const KEMENAG_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <polygon points="50,6 94,50 50,94 6,50" fill="#047857" stroke="#FBBF24" stroke-width="3"/>
  <circle cx="50" cy="50" r="32" fill="#065F46"/>
  <circle cx="50" cy="50" r="26" fill="#FFFFFF"/>
  <circle cx="50" cy="50" r="22" fill="#047857"/>
  <!-- Buku / Kitab & Timbangan Kemenag stylization -->
  <path d="M36 58 Q50 52 64 58 L62 64 Q50 58 38 64 Z" fill="#FBBF24"/>
  <path d="M44 40 L56 40 L50 54 Z" fill="#FEF08A"/>
  <circle cx="50" cy="35" r="4" fill="#FBBF24"/>
</svg>
`)}`;

// Pramuka / Tunas Kelapa vector
const PRAMUKA_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="46" fill="#78350F" stroke="#F59E0B" stroke-width="3"/>
  <circle cx="50" cy="50" r="38" fill="#451A03"/>
  <!-- Silhouette Tunas Kelapa -->
  <path d="M50 20 Q54 28 51 36 Q62 30 70 38 Q65 44 54 44 Q56 56 60 76 L40 76 Q44 56 46 44 Q35 44 30 38 Q38 30 49 36 Q46 28 50 20 Z" fill="#FBBF24"/>
  <circle cx="50" cy="79" r="3" fill="#FBBF24"/>
</svg>
`)}`;

// Academic Shield / Lambang Sekolah Unggulan
const SHIELD_SEKOLAH_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <!-- Perisai Sekolah Modern -->
  <path d="M50 8 L84 20 L84 55 Q84 78 50 92 Q16 78 16 55 L16 20 Z" fill="#1E3A8A" stroke="#38BDF8" stroke-width="3"/>
  <path d="M50 14 L78 24 L78 54 Q78 73 50 86 Q22 73 22 54 L22 24 Z" fill="#0F172A"/>
  <!-- Buku Terbuka & Obor -->
  <path d="M28 60 Q50 52 50 66 Q50 52 72 60 L70 66 Q50 58 50 72 Q50 58 30 66 Z" fill="#38BDF8"/>
  <path d="M48 34 Q50 24 52 34 Q55 42 50 48 Q45 42 48 34 Z" fill="#F59E0B"/>
  <polygon points="50,22 53,28 60,29 55,34 56,40 50,37 44,40 45,34 40,29 47,28" fill="#FDE047"/>
</svg>
`)}`;

// Bintang Emas Berprestasi
const BINTANG_EMAS_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="46" fill="#0F172A" stroke="#EAB308" stroke-width="3"/>
  <circle cx="50" cy="50" r="40" fill="#1E293B" stroke="#FACC15" stroke-dasharray="3,3" stroke-width="1.5"/>
  <polygon points="50,16 58,34 78,35 62,48 67,67 50,56 33,67 38,48 22,35 42,34" fill="#EAB308" stroke="#CA8A04" stroke-width="1"/>
  <circle cx="50" cy="45" r="9" fill="#0F172A"/>
  <path d="M44 45 L48 49 L56 41" fill="none" stroke="#FDE047" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`)}`;

export const PRESET_LOGOS: PresetLogo[] = [
  {
    id: 'tut-wuri',
    name: 'Kemendikbud (Tut Wuri Handayani)',
    category: 'Nasional',
    dataUrl: TUT_WURI_SVG,
  },
  {
    id: 'kemenag',
    name: 'Kemenag (Madrasah / Keagamaan)',
    category: 'Kemenag',
    dataUrl: KEMENAG_SVG,
  },
  {
    id: 'pramuka',
    name: 'Gerakan Pramuka (Tunas Kelapa)',
    category: 'Ekskul',
    dataUrl: PRAMUKA_SVG,
  },
  {
    id: 'shield-modern',
    name: 'Perisai Sekolah Modern',
    category: 'Umum',
    dataUrl: SHIELD_SEKOLAH_SVG,
  },
  {
    id: 'bintang-emas',
    name: 'Bintang Emas Prestasi',
    category: 'Kehormatan',
    dataUrl: BINTANG_EMAS_SVG,
  },
];
