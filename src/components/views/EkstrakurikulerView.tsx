import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Ekstrakurikuler } from '../../types';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  UserCheck,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/Badge';

export const EkstrakurikulerView: React.FC = () => {
  const {
    ekskul,
    pembina,
    anggota,
    addEkskul,
    updateEkskul,
    deleteEkskul,
    currentUser,
  } = useApp();

  const isAdmin = currentUser?.role === 'ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHari, setSelectedHari] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Ekstrakurikuler, 'id'>>({
    kode: '',
    nama: '',
    pembinaId: pembina[0]?.id || '',
    hari: 'Senin',
    jam: '15:30 - 17:00',
    tempat: 'Lapangan Utama',
    keterangan: '',
    status: 'Aktif',
  });

  const filteredList = useMemo(() => {
    return ekskul.filter((e) => {
      const matchSearch =
        e.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.tempat.toLowerCase().includes(searchTerm.toLowerCase());
      const matchHari = !selectedHari || e.hari === selectedHari;
      return matchSearch && matchHari;
    });
  }, [ekskul, searchTerm, selectedHari]);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      kode: `EKS-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
      nama: '',
      pembinaId: pembina[0]?.id || '',
      hari: 'Jumat',
      jam: '15:30 - 17:00',
      tempat: 'Lapangan Sekolah',
      keterangan: '',
      status: 'Aktif',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (e: Ekstrakurikuler) => {
    setModalMode('edit');
    setCurrentId(e.id);
    setFormData({
      kode: e.kode,
      nama: e.nama,
      pembinaId: e.pembinaId,
      hari: e.hari,
      jam: e.jam,
      tempat: e.tempat,
      keterangan: e.keterangan,
      status: e.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!formData.kode || !formData.nama) {
      alert('Kode dan Nama Ekstrakurikuler wajib diisi!');
      return;
    }

    if (modalMode === 'create') {
      const ok = addEkskul(formData);
      if (ok) setIsModalOpen(false);
    } else if (currentId) {
      updateEkskul(currentId, formData);
      setIsModalOpen(false);
    }
  };

  const handleDelete = (e: Ekstrakurikuler) => {
    if (confirm(`Apakah Anda yakin ingin menghapus ekstrakurikuler "${e.nama}"? Semua jadwal dan absensi terkait akan dihapus.`)) {
      deleteEkskul(e.id);
    }
  };

  const getPembinaName = (id: string) => {
    return pembina.find((p) => p.id === id)?.nama || 'Belum Ditentukan';
  };

  const countMembers = (id: string) => {
    return anggota.filter((a) => a.ekskulId === id && a.status === 'Aktif').length;
  };

  return (
    <div className="space-y-4">
      {/* Search and Action */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-cari-ekskul"
              type="text"
              placeholder="Cari nama ekstrakurikuler, kode, atau tempat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedHari}
              onChange={(e) => setSelectedHari(e.target.value)}
              className="text-xs sm:text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Hari</option>
              <option value="Senin">Senin</option>
              <option value="Selasa">Selasa</option>
              <option value="Rabu">Rabu</option>
              <option value="Kamis">Kamis</option>
              <option value="Jumat">Jumat</option>
              <option value="Sabtu">Sabtu</option>
              <option value="Minggu">Minggu</option>
            </select>

            {isAdmin && (
              <button
                id="btn-tambah-ekskul"
                onClick={openCreateModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Ekskul</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid Cards of Ekstrakurikuler */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredList.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700 transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {item.kode}
                </span>
                <StatusBadge status={item.status.toUpperCase()} size="sm" />
              </div>

              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                {item.nama}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {item.keterangan || 'Tidak ada deskripsi khusus.'}
              </p>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <UserCheck className="w-4 h-4 text-purple-500 shrink-0" />
                  <span className="font-medium truncate">{getPembinaName(item.pembinaId)}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Hari: <strong>{item.hari}</strong></span>
                </div>

                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Jam: {item.jam} WIB</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="truncate">Tempat: {item.tempat}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {countMembers(item.id)} Anggota Terdaftar
              </span>

              {isAdmin && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    title="Edit Ekskul"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Hapus Ekskul"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Tambah Ekstrakurikuler' : 'Edit Ekstrakurikuler'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kode Ekskul <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.kode}
                onChange={(e) => setFormData({ ...formData, kode: e.target.value.toUpperCase() })}
                placeholder="Contoh: EKS-PRA"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Aktif' | 'Non-Aktif' })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Aktif">Aktif</option>
                <option value="Non-Aktif">Non-Aktif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Ekstrakurikuler <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Contoh: Pramuka / Futsal / PMR"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Guru Pembina
            </label>
            <select
              value={formData.pembinaId}
              onChange={(e) => setFormData({ ...formData, pembinaId: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">-- Pilih Pembina --</option>
              {pembina.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} ({p.nip})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hari Latihan
              </label>
              <select
                value={formData.hari}
                onChange={(e) => setFormData({ ...formData, hari: e.target.value as any })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Senin">Senin</option>
                <option value="Selasa">Selasa</option>
                <option value="Rabu">Rabu</option>
                <option value="Kamis">Kamis</option>
                <option value="Jumat">Jumat</option>
                <option value="Sabtu">Sabtu</option>
                <option value="Minggu">Minggu</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jam Pelaksanaan
              </label>
              <input
                type="text"
                value={formData.jam}
                onChange={(e) => setFormData({ ...formData, jam: e.target.value })}
                placeholder="Contoh: 15:30 - 17:30"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tempat / Lokasi Latihan
            </label>
            <input
              type="text"
              value={formData.tempat}
              onChange={(e) => setFormData({ ...formData, tempat: e.target.value })}
              placeholder="Contoh: Lapangan Utama Sekolah / Aula"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Keterangan / Deskripsi
            </label>
            <textarea
              rows={2}
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              placeholder="Tujuan atau deskripsi singkat ekstrakurikuler..."
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
              {modalMode === 'create' ? 'Simpan Ekskul' : 'Perbarui Data'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
