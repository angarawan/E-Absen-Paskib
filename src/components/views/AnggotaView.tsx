import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Plus,
  Trash2,
  Filter,
  UserCheck,
  Award,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/Badge';

export const AnggotaView: React.FC = () => {
  const {
    anggota,
    siswa,
    ekskul,
    addAnggota,
    removeAnggota,
    profilSekolah,
    currentUser,
    pembina,
  } = useApp();

  const isAdmin = currentUser?.role === 'ADMIN';
  const isPembina = currentUser?.role === 'PEMBINA';

  // Find Pembina ekskuls if current user is Pembina
  const myPembina = pembina.find((p) => p.id === currentUser?.refId || p.nama === currentUser?.name);
  const myEkskulIds = isPembina
    ? ekskul.filter((e) => e.pembinaId === myPembina?.id || myPembina?.ekskulIds?.includes(e.id)).map((e) => e.id)
    : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEkskul, setSelectedEkskul] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSiswaId, setNewSiswaId] = useState('');
  const [newEkskulId, setNewEkskulId] = useState('');
  const [tahunAjaran, setTahunAjaran] = useState(profilSekolah.tahunAjaran);

  // Filtered members
  const filteredAnggota = useMemo(() => {
    return anggota.filter((a) => {
      // Pembina restriction if applicable
      if (isPembina && myEkskulIds.length > 0 && !myEkskulIds.includes(a.ekskulId)) {
        return false;
      }

      const s = siswa.find((item) => item.id === a.siswaId);
      const e = ekskul.find((item) => item.id === a.ekskulId);

      const matchSearch =
        s?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s?.nis.includes(searchTerm) ||
        e?.nama.toLowerCase().includes(searchTerm.toLowerCase());

      const matchEkskul = !selectedEkskul || a.ekskulId === selectedEkskul;
      const matchKelas = !selectedKelas || s?.kelas === selectedKelas;

      return matchSearch && matchEkskul && matchKelas;
    });
  }, [anggota, siswa, ekskul, isPembina, myEkskulIds, searchTerm, selectedEkskul, selectedKelas]);

  const openAddModal = () => {
    setNewSiswaId(siswa[0]?.id || '');
    setNewEkskulId(isPembina && myEkskulIds.length > 0 ? myEkskulIds[0] : (ekskul[0]?.id || ''));
    setTahunAjaran(profilSekolah.tahunAjaran);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiswaId || !newEkskulId) {
      alert('Siswa dan Ekstrakurikuler harus dipilih!');
      return;
    }
    const res = addAnggota(newSiswaId, newEkskulId, tahunAjaran);
    if (res.success) {
      setIsModalOpen(false);
    } else {
      alert(res.message);
    }
  };

  const handleRemove = (id: string, sName: string, eName: string) => {
    if (confirm(`Keluarkan ${sName} dari ekstrakurikuler ${eName}?`)) {
      removeAnggota(id);
    }
  };

  const getSiswa = (id: string) => siswa.find((s) => s.id === id);
  const getEkskul = (id: string) => ekskul.find((e) => e.id === id);

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-cari-anggota"
              type="text"
              placeholder="Cari nama siswa, NIS, atau nama ekskul..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Ekskul */}
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

            {/* Filter Kelas */}
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="text-xs sm:text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Kelas</option>
              {Array.from(new Set(siswa.map((s) => s.kelas))).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>

            {(isAdmin || isPembina) && (
              <button
                id="btn-tambah-anggota"
                onClick={openAddModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Daftarkan Siswa</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5">NIS</th>
                <th className="px-4 py-3.5">Nama Siswa</th>
                <th className="px-4 py-3.5">Kelas</th>
                <th className="px-4 py-3.5">Ekstrakurikuler</th>
                <th className="px-4 py-3.5">Tahun Ajaran</th>
                <th className="px-4 py-3.5">Status</th>
                {(isAdmin || isPembina) && <th className="px-4 py-3.5 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAnggota.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Tidak ada data anggota yang terdaftar sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredAnggota.map((row) => {
                  const s = getSiswa(row.siswaId);
                  const e = getEkskul(row.ekskulId);
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {s?.nis || '-'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {s?.nama || row.siswaId}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {s?.kelas || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {e?.nama || row.ekskulId}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {row.tahunAjaran}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={row.status.toUpperCase()} size="sm" />
                      </td>
                      {(isAdmin || isPembina) && (
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleRemove(row.id, s?.nama || '', e?.nama || '')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Keluarkan dari ekstrakurikuler"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          Total: {filteredAnggota.length} anggota terdaftar • Catatan: Siswa diperbolehkan mengikuti lebih dari 1 kegiatan.
        </div>
      </div>

      {/* Modal Hubungkan Siswa dengan Ekskul */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Daftarkan Siswa ke Ekstrakurikuler"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pilih Siswa <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={newSiswaId}
              onChange={(e) => setNewSiswaId(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {siswa
                .filter((s) => s.status === 'Aktif')
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} ({s.nis}) - {s.kelas}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pilih Ekstrakurikuler <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={newEkskulId}
              onChange={(e) => setNewEkskulId(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {(isPembina && myEkskulIds.length > 0 ? ekskul.filter((e) => myEkskulIds.includes(e.id)) : ekskul)
                .filter((e) => e.status === 'Aktif')
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nama} ({e.kode}) - Hari {e.hari}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tahun Ajaran
            </label>
            <input
              type="text"
              required
              value={tahunAjaran}
              onChange={(e) => setTahunAjaran(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
            >
              Daftarkan Sekarang
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
