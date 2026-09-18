import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Siswa } from '../../types';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Key,
  Copy,
  Check,
  Printer,
  ShieldAlert,
  Send,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/Badge';

export const SiswaView: React.FC = () => {
  const {
    siswa,
    kelas,
    users,
    addSiswa,
    updateSiswa,
    deleteSiswa,
    resetUserPassword,
    profilSekolah,
    currentUser,
  } = useApp();

  const isAdmin = currentUser?.role === 'ADMIN';
  const isPembina = currentUser?.role === 'PEMBINA';
  const canManage = isAdmin || isPembina;

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Student Account Modal State
  const [selectedAccountStudent, setSelectedAccountStudent] = useState<Siswa | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Batch Print Slips Modal State
  const [isPrintSlipsOpen, setIsPrintSlipsOpen] = useState(false);

  // Form fields
  const [formData, setFormData] = useState<Omit<Siswa, 'id'>>({
    nis: '',
    nisn: '',
    nama: '',
    jenisKelamin: 'L',
    kelas: '',
    noHp: '',
    status: 'Aktif',
  });

  // Filtered list
  const filteredList = useMemo(() => {
    return siswa.filter((s) => {
      const matchSearch =
        s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nis.includes(searchTerm) ||
        s.nisn.includes(searchTerm);
      const matchKelas = !selectedKelas || s.kelas === selectedKelas;
      const matchStatus = !selectedStatus || s.status === selectedStatus;
      return matchSearch && matchKelas && matchStatus;
    });
  }, [siswa, searchTerm, selectedKelas, selectedStatus]);

  // Paginated list
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      nis: '',
      nisn: '',
      nama: '',
      jenisKelamin: 'L',
      kelas: '',
      noHp: '',
      status: 'Aktif',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (s: Siswa) => {
    setModalMode('edit');
    setCurrentId(s.id);
    setFormData({
      nis: s.nis,
      nisn: s.nisn,
      nama: s.nama,
      jenisKelamin: s.jenisKelamin,
      kelas: s.kelas,
      noHp: s.noHp,
      status: s.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nis || !formData.nama) {
      alert('NIS dan Nama Lengkap wajib diisi!');
      return;
    }

    if (modalMode === 'create') {
      const success = addSiswa(formData);
      if (success) {
        setIsModalOpen(false);
        // Find newly added student to show the login card immediately
        const createdSiswa = {
          ...formData,
          id: `sis-${Date.now().toString().slice(-4)}`,
        };
        setSelectedAccountStudent(createdSiswa);
        setIsAccountModalOpen(true);
      }
    } else if (currentId) {
      updateSiswa(currentId, formData);
      setIsModalOpen(false);
    }
  };

  const handleDelete = (s: Siswa) => {
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus data siswa "${s.nama}"? Seluruh akun login, keanggotaan ekskul, dan absensi siswa ini juga akan dibersihkan.`
      )
    ) {
      deleteSiswa(s.id);
    }
  };

  // Find linked user for a student
  const getStudentUser = (s: Siswa) => {
    return (
      users.find((u) => u.refId === s.id) ||
      users.find((u) => u.username === `siswa_${s.nis}`) ||
      users.find((u) => u.name.toLowerCase() === s.nama.toLowerCase() && u.role === 'SISWA')
    );
  };

  // Open account modal for a student
  const openAccountModal = (s: Siswa) => {
    setSelectedAccountStudent(s);
    setCopySuccess(false);
    setIsAccountModalOpen(true);
  };

  // Copy WhatsApp login info
  const handleCopyAccountInfo = () => {
    if (!selectedAccountStudent) return;
    const userObj = getStudentUser(selectedAccountStudent);
    const username = userObj?.username || `siswa_${selectedAccountStudent.nis}`;
    const password = userObj?.password || 'siswa123';

    const message = `*AKUN LOGIN ABSENSI EKSTRAKURIKULER*\n` +
      `Sekolah: ${profilSekolah.namaSekolah}\n` +
      `Nama Siswa: ${selectedAccountStudent.nama}\n` +
      `Kelas: ${selectedAccountStudent.kelas} (NIS: ${selectedAccountStudent.nis})\n\n` +
      `📱 *Username:* ${username}\n` +
      `🔑 *Password:* ${password}\n\n` +
      `Silakan login untuk mengecek catatan kehadiran dan jadwal ekstrakurikuler. Simpan akun ini baik-baik.`;

    navigator.clipboard.writeText(message);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  // Reset student password to default
  const handleResetPassword = () => {
    if (!selectedAccountStudent) return;
    const userObj = getStudentUser(selectedAccountStudent);
    if (userObj) {
      resetUserPassword(userObj.id, 'siswa123');
      alert(`Password untuk ${selectedAccountStudent.nama} berhasil direset ke "siswa123"`);
    } else {
      alert('Akun user belum ditemukan di sistem.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Banner Guru Membuat Akun Murid */}
      {isPembina && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-200">
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <p className="font-bold">
                Manajemen Akun Murid oleh Guru Pembina
              </p>
              <p className="text-blue-700 dark:text-blue-300 mt-0.5">
                Setiap siswa yang Anda tambahkan otomatis memiliki akun login dengan <strong>Username: siswa_[nis]</strong> dan <strong>Password default: siswa123</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPrintSlipsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shrink-0 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Slip Akun Murid</span>
          </button>
        </div>
      )}

      {/* Action and Filter bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-cari-siswa"
              type="text"
              placeholder="Cari nama, NIS, atau NISN..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Kelas */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                id="select-filter-kelas"
                value={selectedKelas}
                onChange={(e) => {
                  setSelectedKelas(e.target.value);
                  setCurrentPage(1);
                }}
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
            </div>

            {/* Filter Status */}
            <select
              id="select-filter-status"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs sm:text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Non-Aktif">Non-Aktif</option>
            </select>

            {/* Print Slips Button */}
            <button
              onClick={() => setIsPrintSlipsOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-colors"
              title="Cetak kartu slip akun murid untuk dibagikan"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Cetak Slip Akun</span>
            </button>

            {/* Add Button (Guru Pembina & Admin) */}
            {canManage && (
              <button
                id="btn-tambah-siswa"
                onClick={openCreateModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Siswa & Buat Akun</span>
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
                <th className="px-4 py-3.5">NIS / NISN</th>
                <th className="px-4 py-3.5">Nama Lengkap</th>
                <th className="px-4 py-3.5">L/P</th>
                <th className="px-4 py-3.5">Kelas</th>
                <th className="px-4 py-3.5">Akun Login</th>
                <th className="px-4 py-3.5">Status</th>
                {canManage && <th className="px-4 py-3.5 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="px-4 py-8 text-center text-slate-400">
                    Tidak ada data siswa yang sesuai dengan filter atau kata kunci.
                  </td>
                </tr>
              ) : (
                paginatedList.map((s) => {
                  const userObj = getStudentUser(s);
                  const username = userObj?.username || `siswa_${s.nis}`;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono whitespace-nowrap text-slate-700 dark:text-slate-300">
                        <span className="font-bold text-slate-900 dark:text-white">{s.nis}</span>
                        <span className="block text-[11px] text-slate-400">{s.nisn}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {s.nama}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                            s.jenisKelamin === 'L'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300'
                          }`}
                        >
                          {s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {s.kelas}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openAccountModal(s)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold transition-colors"
                          title="Klik untuk melihat detail username dan kata sandi murid"
                        >
                          <Key className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-mono">{username}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={s.status.toUpperCase()} size="sm" />
                      </td>
                      {canManage && (
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openAccountModal(s)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                              title="Lihat info login / salin akun untuk murid"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            <button
                              id={`btn-edit-siswa-${s.nis}`}
                              onClick={() => openEditModal(s)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                              title="Edit data siswa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              id={`btn-delete-siswa-${s.nis}`}
                              onClick={() => handleDelete(s)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              title="Hapus data siswa"
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

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Menampilkan {filteredList.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(currentPage * itemsPerPage, filteredList.length)} dari {filteredList.length} siswa
          </div>
          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-slate-800 dark:text-slate-200">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Tambah / Edit Siswa */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Tambah Siswa Baru & Otomatis Buat Akun' : 'Edit Data Siswa'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalMode === 'create' && (
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
              <Key className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Otomatis Dibuatkan Akun Login Murid</span>
                <p className="text-blue-700 dark:text-blue-300 mt-0.5">
                  Murid dapat login langsung menggunakan <strong>Username: siswa_[NIS]</strong> dan <strong>Password: siswa123</strong>.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NIS <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nis}
                onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                placeholder="Contoh: 10221"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NISN
              </label>
              <input
                type="text"
                value={formData.nisn}
                onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                placeholder="Contoh: 0061234521"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap Siswa <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Nama lengkap siswa"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jenis Kelamin
              </label>
              <select
                value={formData.jenisKelamin}
                onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value as 'L' | 'P' })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kelas <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-siswa-kelas"
                type="text"
                required
                value={formData.kelas}
                onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                placeholder="Isi kelas manual (misal: X-RPL 1, XII MIPA 2)"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor HP / WhatsApp
              </label>
              <input
                type="text"
                value={formData.noHp}
                onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                placeholder="Contoh: 081234567890"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Aktif' | 'Non-Aktif' })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Aktif">Aktif</option>
                <option value="Non-Aktif">Non-Aktif</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
            >
              {modalMode === 'create' ? 'Simpan Siswa & Buat Akun' : 'Perbarui Data'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Kartu Akun Login Siswa (Individual) */}
      <Modal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        title="Kartu Akun Login Siswa"
      >
        {selectedAccountStudent && (() => {
          const userObj = getStudentUser(selectedAccountStudent);
          const username = userObj?.username || `siswa_${selectedAccountStudent.nis}`;
          const password = userObj?.password || 'siswa123';

          return (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-sm">
                <p className="text-[11px] uppercase tracking-wider text-blue-200 font-bold">
                  Akun Siswa Dibuatkan oleh Guru Pembina
                </p>
                <h3 className="text-lg font-black mt-1">{selectedAccountStudent.nama}</h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  Kelas {selectedAccountStudent.kelas} • NIS: {selectedAccountStudent.nis}
                </p>
              </div>

              {/* Login Credentials Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Username Login:
                  </span>
                  <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {username}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Password (Kata Sandi):
                  </span>
                  <span className="font-mono font-bold text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {password}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Status Akun:</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Aktif & Siap Digunakan
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyAccountInfo}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
                    copySuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  {copySuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Berhasil Disalin ke Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Format Info Login (WhatsApp)</span>
                    </>
                  )}
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Reset Password (siswa123)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAccountModalOpen(false)}
                    className="py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Modal Cetak Semua Slip Akun Murid (Batch Printable Slips) */}
      <Modal
        isOpen={isPrintSlipsOpen}
        onClose={() => setIsPrintSlipsOpen(false)}
        title="Cetak Kartu Slip Akun Login Murid"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Menampilkan <strong>{filteredList.length} kartu akun murid</strong> siap dicetak / digunting dan dibagikan.
            </p>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Sekarang</span>
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2 grid grid-cols-1 sm:grid-cols-2 gap-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
            {filteredList.map((s) => {
              const u = getStudentUser(s);
              const username = u?.username || `siswa_${s.nis}`;
              const password = u?.password || 'siswa123';

              return (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs space-y-2"
                >
                  <div className="border-b border-slate-100 dark:border-slate-700 pb-1.5 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {profilSekolah.namaSekolah}
                      </h5>
                      <p className="text-[10px] text-slate-400">Slip Akun Absensi Ekstrakurikuler</p>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {s.kelas}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{s.nama}</p>
                    <p className="text-[10px] text-slate-500">NIS: {s.nis}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-slate-900 p-2 rounded-lg font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Username:</span>
                      <strong className="text-blue-600 dark:text-blue-400">{username}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Password:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{password}</strong>
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-400 text-center italic">
                    Dibuatkan oleh Guru Pembina • Jangan berikan password ke orang lain
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsPrintSlipsOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
