import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Jadwal } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const JadwalView: React.FC = () => {
  const {
    jadwal,
    ekskul,
    pembina,
    addJadwal,
    updateJadwal,
    deleteJadwal,
    currentUser,
  } = useApp();

  const isAdmin = currentUser?.role === 'ADMIN';
  const isPembina = currentUser?.role === 'PEMBINA';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Jadwal, 'id'>>({
    ekskulId: ekskul[0]?.id || '',
    hari: 'Senin',
    jamMulai: '15:30',
    jamSelesai: '17:00',
    tempat: 'Lapangan Sekolah',
    pembinaId: pembina[0]?.id || '',
  });

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      ekskulId: ekskul[0]?.id || '',
      hari: 'Senin',
      jamMulai: '15:30',
      jamSelesai: '17:00',
      tempat: 'Lapangan Utama',
      pembinaId: pembina[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (j: Jadwal) => {
    setModalMode('edit');
    setCurrentId(j.id);
    setFormData({
      ekskulId: j.ekskulId,
      hari: j.hari,
      jamMulai: j.jamMulai,
      jamSelesai: j.jamSelesai,
      tempat: j.tempat,
      pembinaId: j.pembinaId,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'create') {
      addJadwal(formData);
      setIsModalOpen(false);
    } else if (currentId) {
      updateJadwal(currentId, formData);
      setIsModalOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus jadwal ini?')) {
      deleteJadwal(id);
    }
  };

  const getEkskul = (id: string) => ekskul.find((e) => e.id === id);
  const getPembina = (id: string) => pembina.find((p) => p.id === id);

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Agenda & Jadwal Kegiatan Ekstrakurikuler
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Jadwal rutin mingguan pelaksanaan kegiatan
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal</span>
          </button>
        )}
      </div>

      {/* Schedule cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jadwal.map((j) => {
          const e = getEkskul(j.ekskulId);
          const p = getPembina(j.pembinaId) || getPembina(e?.pembinaId || '');

          return (
            <div
              key={j.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    {j.hari}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {e?.kode}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {e?.nama || 'Ekstrakurikuler'}
                </h4>

                <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="font-semibold">{j.jamMulai} - {j.jamSelesai} WIB</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{j.tempat}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Pembina: {p?.nama || 'Belum ditentukan'}</span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="pt-3 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-1">
                  <button
                    onClick={() => openEditModal(j)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    title="Edit jadwal"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(j.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Hapus jadwal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal CRUD Jadwal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Tambah Jadwal Kegiatan' : 'Edit Jadwal Kegiatan'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ekstrakurikuler <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.ekskulId}
              onChange={(e) => setFormData({ ...formData, ekskulId: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {ekskul.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nama} ({e.kode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hari
              </label>
              <select
                value={formData.hari}
                onChange={(e) => setFormData({ ...formData, hari: e.target.value as any })}
                className="w-full px-2 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
                Jam Mulai
              </label>
              <input
                type="text"
                value={formData.jamMulai}
                onChange={(e) => setFormData({ ...formData, jamMulai: e.target.value })}
                placeholder="15:30"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jam Selesai
              </label>
              <input
                type="text"
                value={formData.jamSelesai}
                onChange={(e) => setFormData({ ...formData, jamSelesai: e.target.value })}
                placeholder="17:00"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tempat Kegiatan
            </label>
            <input
              type="text"
              value={formData.tempat}
              onChange={(e) => setFormData({ ...formData, tempat: e.target.value })}
              placeholder="Contoh: Lapangan Utama / Aula"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Guru Pembina Pendamping
            </label>
            <select
              value={formData.pembinaId}
              onChange={(e) => setFormData({ ...formData, pembinaId: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {pembina.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama}
                </option>
              ))}
            </select>
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
              Simpan Jadwal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
