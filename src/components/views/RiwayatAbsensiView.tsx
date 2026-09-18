import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AbsensiRecord, AttendanceStatus } from '../../types';
import {
  Search,
  Calendar,
  Filter,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  Database,
  Archive,
  FolderArchive,
  ShieldCheck,
} from 'lucide-react';
import { StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const RiwayatAbsensiView: React.FC = () => {
  const {
    absensi,
    arsipAbsensi,
    siswa,
    ekskul,
    updateAbsensiRecord,
    deleteAbsensiRecord,
    currentUser,
    pembina,
    setCurrentMenu,
  } = useApp();

  const isPembina = currentUser?.role === 'PEMBINA';
  const isAdmin = currentUser?.role === 'ADMIN';
  const isSiswa = currentUser?.role === 'SISWA';

  // Toggle active vs archived records
  const [viewScope, setViewScope] = useState<'aktif' | 'arsip' | 'semua'>('aktif');

  // Find linked siswa if current user is SISWA
  const mySiswa = siswa.find(
    (s) => s.id === currentUser?.refId || s.nama === currentUser?.name
  );

  // Find Pembina's assigned ekskul
  const myPembina = pembina.find(
    (p) => p.id === currentUser?.refId || p.nama === currentUser?.name
  );
  const myEkskulIds = isPembina
    ? ekskul.filter((e) => e.pembinaId === myPembina?.id || myPembina?.ekskulIds?.includes(e.id)).map((e) => e.id)
    : [];

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTanggal, setFilterTanggal] = useState('');
  const [filterEkskul, setFilterEkskul] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKelas, setFilterKelas] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState<AbsensiRecord | null>(null);
  const [editStatus, setEditStatus] = useState<AttendanceStatus>('HADIR');
  const [editKeterangan, setEditKeterangan] = useState('');

  // Filtered attendance
  const filteredList = useMemo(() => {
    const listToFilter =
      viewScope === 'arsip'
        ? (arsipAbsensi || [])
        : viewScope === 'semua'
        ? [...absensi, ...(arsipAbsensi || [])]
        : absensi;

    return listToFilter.filter((item) => {
      // Siswa boundary (only their own records)
      if (isSiswa && mySiswa && item.siswaId !== mySiswa.id) {
        return false;
      }

      // Pembina boundary
      if (isPembina && myEkskulIds.length > 0 && !myEkskulIds.includes(item.ekskulId)) {
        return false;
      }

      const s = siswa.find((st) => st.id === item.siswaId);
      const e = ekskul.find((ek) => ek.id === item.ekskulId);

      const matchSearch =
        s?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s?.nis.includes(searchTerm) ||
        e?.nama.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTanggal = !filterTanggal || item.tanggal === filterTanggal;
      const matchEkskul = !filterEkskul || item.ekskulId === filterEkskul;
      const matchStatus = !filterStatus || item.status === filterStatus;
      const matchKelas = !filterKelas || s?.kelas === filterKelas;

      return matchSearch && matchTanggal && matchEkskul && matchStatus && matchKelas;
    });
  }, [
    absensi,
    arsipAbsensi,
    viewScope,
    siswa,
    ekskul,
    isPembina,
    myEkskulIds,
    searchTerm,
    filterTanggal,
    filterEkskul,
    filterStatus,
    filterKelas,
  ]);

  // Paginated list
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const openEditModal = (rec: AbsensiRecord) => {
    setEditingRecord(rec);
    setEditStatus(rec.status);
    setEditKeterangan(rec.keterangan || '');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecord) {
      updateAbsensiRecord(editingRecord.id, editStatus, editKeterangan);
      setEditingRecord(null);
    }
  };

  const handleDelete = (rec: AbsensiRecord) => {
    if (confirm('Apakah Anda yakin ingin menghapus baris absensi ini?')) {
      deleteAbsensiRecord(rec.id);
    }
  };

  const getSiswa = (id: string) => siswa.find((s) => s.id === id);
  const getEkskul = (id: string) => ekskul.find((e) => e.id === id);

  return (
    <div className="space-y-4">
      {/* Top Scope & Safe Archive Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setViewScope('aktif');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewScope === 'aktif'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Riwayat Aktif ({absensi.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setViewScope('arsip');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              viewScope === 'arsip'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5 text-amber-500" />
            <span>Brankas Arsip ({arsipAbsensi?.length || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setViewScope('semua');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewScope === 'semua'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Semua Data ({absensi.length + (arsipAbsensi?.length || 0)})
          </button>
        </div>

        {(isAdmin || isPembina) && (
          <button
            type="button"
            id="btn-ke-pusat-arsip"
            onClick={() => setCurrentMenu('arsip-cadangan')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold transition-all border border-blue-200 dark:border-blue-800"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Kelola Cadangan & Brankas Arsip</span>
          </button>
        )}
      </div>

      {/* Search and Multi-Filter (Requirement 11) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
        {/* Top search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-cari-riwayat"
            type="text"
            placeholder="Cari berdasarkan nama murid, NIS, atau ekstrakurikuler..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 4 Filters: Tanggal, Ekstrakurikuler, Status, Kelas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          {/* Filter Tanggal */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Filter Tanggal
            </label>
            <input
              type="date"
              value={filterTanggal}
              onChange={(e) => {
                setFilterTanggal(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Filter Ekstrakurikuler */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Ekstrakurikuler
            </label>
            <select
              value={filterEkskul}
              onChange={(e) => {
                setFilterEkskul(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="">Semua Ekskul</option>
              {ekskul.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Status Absensi
            </label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="">Semua Status</option>
              <option value="HADIR">HADIR</option>
              <option value="IZIN">IZIN</option>
              <option value="SAKIT">SAKIT</option>
              <option value="ALPA">ALPA</option>
            </select>
          </div>

          {/* Filter Kelas */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Kelas
            </label>
            <select
              value={filterKelas}
              onChange={(e) => {
                setFilterKelas(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="">Semua Kelas</option>
              {Array.from(new Set(siswa.map((s) => s.kelas))).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table (Requirement 11: Tanggal | Nama Siswa | Kelas | Ekstrakurikuler | Status | Keterangan) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Tanggal</th>
                <th className="px-4 py-3.5">Nama Murid</th>
                <th className="px-4 py-3.5">Kelas</th>
                <th className="px-4 py-3.5">Ekstrakurikuler</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Keterangan</th>
                {(isAdmin || isPembina) && <th className="px-4 py-3.5 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Tidak ada catatan absensi yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                paginatedList.map((row) => {
                  const s = getSiswa(row.siswaId);
                  const e = getEkskul(row.ekskulId);
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{row.tanggal}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {s?.nama || row.siswaId}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {s?.kelas || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">
                        {e?.nama || row.ekskulId}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={row.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {row.keterangan || '-'}
                      </td>
                      {(isAdmin || isPembina) && (
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(row)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                              title="Ubah status absensi"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(row)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Hapus baris absensi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Menampilkan {paginatedList.length} dari {filteredList.length} data absensi
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Hal {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Edit Status Absensi */}
      <Modal
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        title="Ubah Status Absensi Murid"
      >
        {editingRecord && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
              <div>Murid: <strong>{getSiswa(editingRecord.siswaId)?.nama}</strong></div>
              <div>Ekstrakurikuler: <strong>{getEkskul(editingRecord.ekskulId)?.nama}</strong></div>
              <div>Tanggal: <strong>{editingRecord.tanggal}</strong></div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Status Kehadiran
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['HADIR', 'SAKIT', 'IZIN', 'ALPA'] as AttendanceStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setEditStatus(st)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      editStatus === st
                        ? st === 'HADIR'
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : st === 'SAKIT'
                          ? 'bg-amber-500 text-white border-amber-600'
                          : st === 'IZIN'
                          ? 'bg-sky-500 text-white border-sky-600'
                          : 'bg-rose-500 text-white border-rose-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {st === 'HADIR' ? 'H (Hadir)' : st === 'SAKIT' ? 'S (Sakit)' : st === 'IZIN' ? 'I (Izin)' : 'A (Alpa)'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Keterangan
              </label>
              <input
                type="text"
                value={editKeterangan}
                onChange={(e) => setEditKeterangan(e.target.value)}
                placeholder="Alasan izin / sakit / lainnya..."
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
