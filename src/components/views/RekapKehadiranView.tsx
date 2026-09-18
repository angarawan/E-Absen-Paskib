import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { RekapItem } from '../../types';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  Search,
  Filter,
  Award,
  Calendar,
  Percent,
  Download,
  FolderArchive,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { exportComprehensiveExcelArchive } from '../../utils/storageVault';

export const RekapKehadiranView: React.FC = () => {
  const {
    absensi,
    arsipAbsensi,
    siswa,
    ekskul,
    anggota,
    profilSekolah,
    currentUser,
    pembina,
    addToast,
  } = useApp();

  const printRef = useRef<HTMLDivElement>(null);
  const isPembina = currentUser?.role === 'PEMBINA';

  // Pembina scope
  const myPembina = pembina.find(
    (p) => p.id === currentUser?.refId || p.nama === currentUser?.name
  );
  const myEkskulIds = isPembina
    ? ekskul.filter((e) => e.pembinaId === myPembina?.id || myPembina?.ekskulIds?.includes(e.id)).map((e) => e.id)
    : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEkskul, setSelectedEkskul] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');

  // Calculate Rekap per Member in Ekstrakurikuler
  const rekapData = useMemo<RekapItem[]>(() => {
    // Collect all registered pairs: (siswa, ekskul)
    const result: RekapItem[] = [];

    // Use active members
    anggota.forEach((ang) => {
      if (ang.status !== 'Aktif') return;
      if (isPembina && myEkskulIds.length > 0 && !myEkskulIds.includes(ang.ekskulId)) {
        return;
      }

      const s = siswa.find((item) => item.id === ang.siswaId);
      const e = ekskul.find((item) => item.id === ang.ekskulId);
      if (!s || !e) return;

      // Filter all attendance records for this student and ekskul
      const studentAttendance = absensi.filter(
        (a) => a.siswaId === ang.siswaId && a.ekskulId === ang.ekskulId
      );

      const hadir = studentAttendance.filter((a) => a.status === 'HADIR').length;
      const izin = studentAttendance.filter((a) => a.status === 'IZIN').length;
      const sakit = studentAttendance.filter((a) => a.status === 'SAKIT').length;
      const alpa = studentAttendance.filter((a) => a.status === 'ALPA').length;
      const totalPertemuan = studentAttendance.length;

      // Persentase Kehadiran = Hadir / Total Pertemuan × 100% (Requirement 12)
      const persentase =
        totalPertemuan > 0 ? Math.round((hadir / totalPertemuan) * 100) : 0;

      result.push({
        siswaId: s.id,
        nis: s.nis,
        nama: s.nama,
        kelas: s.kelas,
        ekskulId: e.id,
        ekskulNama: e.nama,
        hadir,
        izin,
        sakit,
        alpa,
        totalPertemuan,
        persentase,
      });
    });

    return result;
  }, [anggota, absensi, siswa, ekskul, isPembina, myEkskulIds]);

  // Filtered rekap
  const filteredRekap = useMemo(() => {
    return rekapData.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nis.includes(searchTerm) ||
        item.ekskulNama.toLowerCase().includes(searchTerm.toLowerCase());
      const matchEkskul = !selectedEkskul || item.ekskulId === selectedEkskul;
      const matchKelas = !selectedKelas || item.kelas === selectedKelas;
      return matchSearch && matchEkskul && matchKelas;
    });
  }, [rekapData, searchTerm, selectedEkskul, selectedKelas]);

  // Overall totals
  const totalHadir = filteredRekap.reduce((acc, r) => acc + r.hadir, 0);
  const totalIzin = filteredRekap.reduce((acc, r) => acc + r.izin, 0);
  const totalSakit = filteredRekap.reduce((acc, r) => acc + r.sakit, 0);
  const totalAlpa = filteredRekap.reduce((acc, r) => acc + r.alpa, 0);
  const totalPertemuanAll = filteredRekap.reduce((acc, r) => acc + r.totalPertemuan, 0);
  const avgPersentase =
    totalPertemuanAll > 0 ? Math.round((totalHadir / totalPertemuanAll) * 100) : 0;

  // Export to Excel function using xlsx
  const handleExportExcel = () => {
    const dataToExport = filteredRekap.map((item, index) => ({
      No: index + 1,
      NIS: item.nis,
      'Nama Murid': item.nama,
      Kelas: item.kelas,
      Ekstrakurikuler: item.ekskulNama,
      Hadir: item.hadir,
      Izin: item.izin,
      Sakit: item.sakit,
      Alpa: item.alpa,
      'Total Pertemuan': item.totalPertemuan,
      'Persentase Kehadiran (%)': `${item.persentase}%`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Auto-fit column widths
    const colWidths = [
      { wch: 5 },
      { wch: 10 },
      { wch: 25 },
      { wch: 12 },
      { wch: 20 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 16 },
      { wch: 22 },
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Absensi');

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Rekap_Absensi_Ekskul_${dateStr}.xlsx`);
  };

  // Export Comprehensive Multi-Sheet Archive
  const handleExportFullArchive = () => {
    try {
      exportComprehensiveExcelArchive({
        siswa,
        pembina,
        ekskul,
        anggota,
        absensi,
        arsipAbsensi,
        profilSekolah,
      });
      addToast('Buku Besar Arsip Lengkap (Multi-Sheet) berhasil diunduh.', 'success');
    } catch (err: any) {
      addToast(`Gagal mengunduh arsip: ${err.message}`, 'error');
    }
  };

  // Export to CSV function
  const handleExportCSV = () => {
    const headers = [
      'No',
      'NIS',
      'Nama Murid',
      'Kelas',
      'Ekstrakurikuler',
      'Hadir',
      'Izin',
      'Sakit',
      'Alpa',
      'Total Pertemuan',
      'Persentase Kehadiran (%)',
    ];

    const rows = filteredRekap.map((item, index) => [
      index + 1,
      `"${item.nis}"`,
      `"${item.nama.replace(/"/g, '""')}"`,
      `"${item.kelas.replace(/"/g, '""')}"`,
      `"${item.ekskulNama.replace(/"/g, '""')}"`,
      item.hadir,
      item.izin,
      item.sakit,
      item.alpa,
      item.totalPertemuan,
      `"${item.persentase}%"`,
    ]);

    // UTF-8 BOM (\uFEFF) ensures Excel opens Indonesian characters without encoding issues
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Absensi_Ekskul_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Action Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-cari-rekap"
              type="text"
              placeholder="Cari murid atau ekstrakurikuler..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedEkskul}
              onChange={(e) => setSelectedEkskul(e.target.value)}
              className="text-xs sm:text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Ekstrakurikuler</option>
              {(isPembina && myEkskulIds.length > 0 ? ekskul.filter((e) => myEkskulIds.includes(e.id)) : ekskul).map(
                (e) => (
                  <option key={e.id} value={e.id}>
                    {e.nama}
                  </option>
                )
              )}
            </select>

            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="text-xs sm:text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Kelas</option>
              {Array.from(new Set(siswa.map((s) => s.kelas).filter(Boolean)))
                .sort()
                .map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
            </select>

            {/* Export Excel Button */}
            <button
              id="btn-export-excel"
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors whitespace-nowrap"
              title="Unduh laporan rekap dalam format Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel</span>
            </button>

            {/* Export Comprehensive Excel Archive (Multi-Sheet) */}
            <button
              id="btn-export-buku-besar"
              onClick={handleExportFullArchive}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors whitespace-nowrap"
              title="Unduh arsip lengkap seluruh modul sekolah dalam format Excel Multi-Sheet"
            >
              <FolderArchive className="w-4 h-4" />
              <span>Arsip Buku Besar</span>
            </button>

            {/* Export CSV Button */}
            <button
              id="btn-export-csv"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors whitespace-nowrap"
              title="Unduh data laporan dalam format CSV (.csv)"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            {/* Print Button (Requirement 17) */}
            <button
              id="btn-print-rekap"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm shadow-xs transition-colors whitespace-nowrap"
              title="Cetak dokumen rekap kehadiran"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Paper / Sheet View */}
      <div
        ref={printRef}
        id="printable-rekap-sheet"
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs print:p-0 print:border-none print:shadow-none print:bg-white print:text-black"
      >
        {/* Document Formal Header (KOP Surat Sekolah) */}
        <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-4 mb-6 flex items-center gap-4 sm:gap-6">
          {profilSekolah.logoUrl && (
            <div className="w-14 h-14 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
              <img
                src={profilSekolah.logoUrl}
                alt="Logo Sekolah"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
          <div className="flex-1 text-center">
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-wide text-slate-900 dark:text-white print:text-black">
              {profilSekolah.namaSekolah}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 print:text-slate-700 mt-0.5">
              {profilSekolah.alamat} • NPSN: {profilSekolah.npsn}
            </p>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 print:text-black font-semibold">
              <span>LAPORAN REKAPITULASI KEHADIRAN EKSTRAKURIKULER</span>
              <span>
                Tahun Ajaran: {profilSekolah.tahunAjaran} ({profilSekolah.semester})
              </span>
            </div>
          </div>
          {profilSekolah.logoUrl && (
            <div className="w-14 sm:w-20 hidden sm:block shrink-0" />
          )}
        </div>

        {/* Formula calculation reminder box (Requirement 12) */}
        <div className="mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 print:hidden flex items-center justify-between">
          <span>
            Rumus perhitungan otomatis: <strong>Persentase Kehadiran = Hadir / Total Pertemuan × 100%</strong>
          </span>
          <span className="font-bold text-blue-700 dark:text-blue-300">
            Rata-rata Kehadiran: {avgPersentase}%
          </span>
        </div>

        {/* Main Rekap Table (Requirement 12: Nama | Ekstrakurikuler | Hadir | Izin | Sakit | Alpa | Total | Persentase) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse border border-slate-200 dark:border-slate-800 print:border-black">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase text-[11px] font-bold border-b border-slate-200 dark:border-slate-800 print:bg-slate-200 print:text-black">
              <tr>
                <th className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2.5 w-10 text-center">No</th>
                <th className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2.5">NIS</th>
                <th className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2.5">Nama Murid</th>
                <th className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2.5">Kelas</th>
                <th className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2.5">Ekstrakurikuler</th>
                <th className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2.5 text-center bg-emerald-50/50 dark:bg-emerald-950/30">Hadir</th>
                <th className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2.5 text-center bg-sky-50/50 dark:bg-sky-950/30">Izin</th>
                <th className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2.5 text-center bg-amber-50/50 dark:bg-amber-950/30">Sakit</th>
                <th className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2.5 text-center bg-rose-50/50 dark:bg-rose-950/30">Alpa</th>
                <th className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2.5 text-center font-bold">Total</th>
                <th className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2.5 text-center font-bold bg-blue-50 dark:bg-blue-950/40 print:bg-slate-100">
                  Persentase
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 print:divide-black">
              {filteredRekap.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-slate-400">
                    Tidak ada data rekap yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredRekap.map((row, idx) => (
                  <tr key={`${row.siswaId}-${row.ekskulId}`} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                    <td className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2 text-center text-slate-500 font-mono">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2 font-mono text-slate-700 dark:text-slate-300">
                      {row.nis}
                    </td>
                    <td className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2 font-semibold text-slate-900 dark:text-white print:text-black">
                      {row.nama}
                    </td>
                    <td className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2 text-slate-700 dark:text-slate-300">
                      {row.kelas}
                    </td>
                    <td className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2 font-medium text-blue-700 dark:text-blue-300 print:text-black">
                      {row.ekskulNama}
                    </td>
                    <td className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2 text-center font-bold text-emerald-600 dark:text-emerald-400 print:text-black">
                      {row.hadir}
                    </td>
                    <td className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2 text-center font-semibold text-sky-600 dark:text-sky-400 print:text-black">
                      {row.izin}
                    </td>
                    <td className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2 text-center font-semibold text-amber-600 dark:text-amber-400 print:text-black">
                      {row.sakit}
                    </td>
                    <td className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2 text-center font-semibold text-rose-600 dark:text-rose-400 print:text-black">
                      {row.alpa}
                    </td>
                    <td className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2 text-center font-black text-slate-800 dark:text-slate-100 print:text-black">
                      {row.totalPertemuan}
                    </td>
                    <td className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2 text-center font-black">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                          row.persentase >= 80
                            ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60 print:text-black'
                            : row.persentase >= 60
                            ? 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/60 print:text-black'
                            : 'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/60 print:text-black'
                        }`}
                      >
                        {row.persentase}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredRekap.length > 0 && (
              <tfoot className="bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-800 dark:text-slate-100 border-t-2 border-slate-300 dark:border-slate-700 print:bg-slate-200 print:text-black">
                <tr>
                  <td colSpan={5} className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2.5 text-right uppercase">
                    TOTAL KESELURUHAN:
                  </td>
                  <td className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2.5 text-center text-emerald-600 font-black print:text-black">
                    {totalHadir}
                  </td>
                  <td className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2.5 text-center text-sky-600 font-black print:text-black">
                    {totalIzin}
                  </td>
                  <td className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2.5 text-center text-amber-600 font-black print:text-black">
                    {totalSakit}
                  </td>
                  <td className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2.5 text-center text-rose-600 font-black print:text-black">
                    {totalAlpa}
                  </td>
                  <td className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2.5 text-center font-black">
                    {totalPertemuanAll}
                  </td>
                  <td className="border border-slate-200 dark:border-slate-800 print:border-black px-3 py-2.5 text-center font-black text-blue-600 dark:text-blue-400 print:text-black">
                    {avgPersentase}%
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Formal Signature Area for Printing */}
        <div className="hidden print:flex mt-12 justify-between items-start text-xs text-black">
          <div className="w-56 text-center">
            <p>Mengetahui,</p>
            <p className="font-bold">Kepala Sekolah</p>
            <div className="h-20" />
            <p className="font-bold underline">{profilSekolah.kepalaSekolah}</p>
            <p>NIP. {profilSekolah.nipKepalaSekolah}</p>
          </div>

          <div className="w-56 text-center">
            <p>Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold">Koordinator Ekstrakurikuler</p>
            <div className="h-20" />
            <p className="font-bold underline">{currentUser?.name || 'Pembina Ekstrakurikuler'}</p>
            <p>NIP. -</p>
          </div>
        </div>
      </div>
    </div>
  );
};
