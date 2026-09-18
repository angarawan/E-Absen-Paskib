import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Key,
  Shield,
  Search,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/Badge';

export const PenggunaView: React.FC = () => {
  const {
    users,
    pembina,
    siswa,
    addUser,
    updateUser,
    deleteUser,
    resetUserPassword,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    username: string;
    password?: string;
    name: string;
    role: UserRole;
    status: 'Aktif' | 'Non-Aktif';
    refId?: string;
  }>({
    username: '',
    password: '',
    name: '',
    role: 'PEMBINA',
    status: 'Aktif',
    refId: '',
  });

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = !selectedRole || u.role === selectedRole;
      return matchSearch && matchRole;
    });
  }, [users, searchTerm, selectedRole]);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      username: '',
      password: 'password123',
      name: '',
      role: 'PEMBINA',
      status: 'Aktif',
      refId: pembina[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setModalMode('edit');
    setCurrentId(u.id);
    setFormData({
      username: u.username,
      name: u.name,
      role: u.role,
      status: u.status,
      refId: u.refId || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.name) {
      alert('Username dan Nama Lengkap wajib diisi!');
      return;
    }

    if (modalMode === 'create') {
      const ok = addUser({
        username: formData.username,
        password: formData.password || 'password123',
        name: formData.name,
        role: formData.role,
        status: formData.status,
        refId: formData.refId,
      });
      if (ok) setIsModalOpen(false);
    } else if (currentId) {
      updateUser(currentId, {
        username: formData.username,
        name: formData.name,
        role: formData.role,
        status: formData.status,
        refId: formData.refId,
      });
      setIsModalOpen(false);
    }
  };

  const handleReset = (u: User) => {
    const newPass = prompt(`Masukkan password baru untuk user "${u.username}":`, 'password123');
    if (newPass) {
      resetUserPassword(u.id, newPass);
    }
  };

  const handleDelete = (u: User) => {
    if (u.username === 'admin') {
      alert('Akun admin utama tidak dapat dihapus!');
      return;
    }
    if (confirm(`Hapus pengguna "${u.username}"?`)) {
      deleteUser(u.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-cari-pengguna"
              type="text"
              placeholder="Cari username atau nama lengkap pengguna..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="text-xs sm:text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="">Semua Role</option>
              <option value="ADMIN">ADMIN</option>
              <option value="PEMBINA">PEMBINA</option>
              <option value="SISWA">SISWA</option>
            </select>

            <button
              id="btn-tambah-user"
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pengguna</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table (Requirement 13: Username, Role, Status, Hubungkan akun dengan pembina/siswa) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Username</th>
                <th className="px-4 py-3.5">Nama Lengkap</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Terhubung Dengan</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u) => {
                let linkedInfo = 'Akun Sistem';
                if (u.role === 'PEMBINA') {
                  const p = pembina.find((item) => item.id === u.refId);
                  linkedInfo = p ? `Data Pembina: ${p.nama}` : 'Belum dihubungkan';
                } else if (u.role === 'SISWA') {
                  const s = siswa.find((item) => item.id === u.refId);
                  linkedInfo = s ? `Data Siswa: ${s.nama} (${s.kelas})` : 'Belum dihubungkan';
                }

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      @{u.username}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {u.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : u.role === 'PEMBINA'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs whitespace-nowrap">
                      {linkedInfo}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={u.status.toUpperCase()} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleReset(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                          title="Reset password pengguna"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                          title="Edit akun pengguna"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {u.username !== 'admin' && (
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Hapus akun pengguna"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit User */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Username <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                placeholder="misal: ahmad.pembina"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            {modalMode === 'create' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password Awal
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="password123"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Tampilan Pengguna <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nama lengkap atau identitas akun"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Role Akun
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole, refId: '' })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="PEMBINA">PEMBINA</option>
                <option value="SISWA">SISWA</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status Akun
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

          {/* Link user to Pembina or Siswa (Requirement 13) */}
          {formData.role === 'PEMBINA' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hubungkan Akun dengan Data Pembina
              </label>
              <select
                value={formData.refId}
                onChange={(e) => setFormData({ ...formData, refId: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">-- Pilih Data Pembina --</option>
                {pembina.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} ({p.nip})
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.role === 'SISWA' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hubungkan Akun dengan Data Siswa
              </label>
              <select
                value={formData.refId}
                onChange={(e) => setFormData({ ...formData, refId: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">-- Pilih Data Siswa --</option>
                {siswa.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} ({s.nis}) - {s.kelas}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              {modalMode === 'create' ? 'Simpan Akun' : 'Perbarui Akun'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
