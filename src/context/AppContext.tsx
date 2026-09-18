import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  User,
  UserRole,
  Siswa,
  Pembina,
  Ekstrakurikuler,
  Anggota,
  Jadwal,
  AbsensiRecord,
  AttendanceStatus,
  ProfilSekolah,
} from '../types';
import {
  INITIAL_SEKOLAH,
  INITIAL_KELAS,
  INITIAL_PEMBINA,
  INITIAL_EKSKUL,
  INITIAL_SISWA,
  INITIAL_ANGGOTA,
  INITIAL_JADWAL,
  INITIAL_ABSENSI,
  INITIAL_USERS,
} from '../data/initialData';
import {
  saveSnapshotToVault,
  checkStoragePersisted,
  requestPersistentStorage,
  createBackupPayload,
  BackupPayload,
} from '../utils/storageVault';
import {
  subscribeSchoolData,
  saveSchoolDataToCloud,
  fetchSchoolDataFromCloud,
  loginWithGoogle,
  logoutFirebaseAuth,
  onAuthChange,
  CloudSchoolData,
} from '../firebase/firestoreService';
import type { User as FirebaseUser } from 'firebase/auth';

export interface Toast {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  // Auth
  currentUser: User | null;
  login: (username: string, password?: string) => boolean;
  logout: () => void;

  // Cloud Firebase Synchronization
  cloudSyncStatus: 'connected' | 'syncing' | 'offline' | 'error' | 'connecting';
  lastCloudSyncTime: Date | null;
  firebaseUser: FirebaseUser | null;
  forcePushToCloud: () => Promise<{ success: boolean; message: string }>;
  forcePullFromCloud: () => Promise<{ success: boolean; message: string }>;
  signInWithGoogleAccount: () => Promise<{ success: boolean; message: string }>;

  // Safe Storage & Vault
  isStoragePersisted: boolean;
  requestPersistence: () => Promise<boolean>;
  arsipAbsensi: AbsensiRecord[];
  archiveOldRecords: (cutoffDate: string, note?: string) => { success: boolean; count: number };
  restoreArchivedRecords: () => void;
  restoreFromBackup: (payload: BackupPayload) => { success: boolean; message: string };

  // Active view
  currentMenu: string;
  setCurrentMenu: (menu: string) => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Toasts
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', title?: string) => void;
  removeToast: (id: string) => void;

  // Data Collections
  siswa: Siswa[];
  pembina: Pembina[];
  ekskul: Ekstrakurikuler[];
  anggota: Anggota[];
  jadwal: Jadwal[];
  absensi: AbsensiRecord[];
  users: User[];
  kelas: string[];
  profilSekolah: ProfilSekolah;

  // CRUD Siswa / Murid
  addSiswa: (data: Omit<Siswa, 'id'>) => boolean;
  updateSiswa: (id: string, data: Partial<Siswa>) => void;
  deleteSiswa: (id: string) => void;
  deleteMultipleSiswa: (ids: string[]) => void;
  deleteAllSiswa: () => void;

  // CRUD Pembina
  addPembina: (data: Omit<Pembina, 'id'>) => boolean;
  updatePembina: (id: string, data: Partial<Pembina>) => void;
  deletePembina: (id: string) => void;

  // CRUD Ekskul
  addEkskul: (data: Omit<Ekstrakurikuler, 'id'>) => boolean;
  updateEkskul: (id: string, data: Partial<Ekstrakurikuler>) => void;
  deleteEkskul: (id: string) => void;

  // CRUD Anggota
  addAnggota: (siswaId: string, ekskulId: string, tahunAjaran: string) => { success: boolean; message: string };
  removeAnggota: (id: string) => void;

  // CRUD Jadwal
  addJadwal: (data: Omit<Jadwal, 'id'>) => void;
  updateJadwal: (id: string, data: Partial<Jadwal>) => void;
  deleteJadwal: (id: string) => void;

  // Absensi Logic
  checkExistingAttendance: (ekskulId: string, tanggal: string) => boolean;
  getAttendanceForDateAndEkskul: (ekskulId: string, tanggal: string) => AbsensiRecord[];
  saveBatchAbsensi: (
    ekskulId: string,
    tanggal: string,
    items: { siswaId: string; status: AttendanceStatus; keterangan: string }[],
    allowOverwrite?: boolean
  ) => { success: boolean; message: string; count?: number };
  updateAbsensiRecord: (id: string, status: AttendanceStatus, keterangan: string) => void;
  deleteAbsensiRecord: (id: string) => void;

  // Settings
  updateProfilSekolah: (data: Partial<ProfilSekolah>) => void;
  addUser: (data: Omit<User, 'id'>) => boolean;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  resetUserPassword: (id: string, newPassword: string) => void;
  resetToDemoData: () => void;
}

const STORAGE_PREFIX = 'absensi_ekskul_';

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Safe localStorage helper
  const loadStorage = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      if (item) {
        return JSON.parse(item);
      }
    } catch {
      // ignore
    }
    return fallback;
  };

  const saveStorage = <T,>(key: string, data: T) => {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
    } catch {
      // ignore
    }
  };

  // State initialization
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    loadStorage<User | null>('currentUser', INITIAL_USERS[0])
  );
  const [currentMenu, setCurrentMenu] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() =>
    loadStorage<boolean>('darkMode', false)
  );
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Database Collections
  const [siswa, setSiswa] = useState<Siswa[]>(() => loadStorage<Siswa[]>('siswa', INITIAL_SISWA));
  const [pembina, setPembina] = useState<Pembina[]>(() => loadStorage<Pembina[]>('pembina', INITIAL_PEMBINA));
  const [ekskul, setEkskul] = useState<Ekstrakurikuler[]>(() => loadStorage<Ekstrakurikuler[]>('ekskul', INITIAL_EKSKUL));
  const [anggota, setAnggota] = useState<Anggota[]>(() => loadStorage<Anggota[]>('anggota', INITIAL_ANGGOTA));
  const [jadwal, setJadwal] = useState<Jadwal[]>(() => loadStorage<Jadwal[]>('jadwal', INITIAL_JADWAL));
  const [absensi, setAbsensi] = useState<AbsensiRecord[]>(() => loadStorage<AbsensiRecord[]>('absensi', INITIAL_ABSENSI));
  const [arsipAbsensi, setArsipAbsensi] = useState<AbsensiRecord[]>(() =>
    loadStorage<AbsensiRecord[]>('arsipAbsensi', [])
  );
  const [users, setUsers] = useState<User[]>(() => loadStorage<User[]>('users', INITIAL_USERS));
  const [isStoragePersisted, setIsStoragePersisted] = useState(false);

  const kelas = useMemo(() => {
    return Array.from(new Set(siswa.map((s) => s.kelas).filter(Boolean))).sort();
  }, [siswa]);
  const [profilSekolah, setProfilSekolah] = useState<ProfilSekolah>(() =>
    loadStorage<ProfilSekolah>('profilSekolah', INITIAL_SEKOLAH)
  );

  // Sync with localStorage
  useEffect(() => saveStorage('currentUser', currentUser), [currentUser]);
  useEffect(() => saveStorage('darkMode', isDarkMode), [isDarkMode]);
  useEffect(() => saveStorage('siswa', siswa), [siswa]);
  useEffect(() => saveStorage('pembina', pembina), [pembina]);
  useEffect(() => saveStorage('ekskul', ekskul), [ekskul]);
  useEffect(() => saveStorage('anggota', anggota), [anggota]);
  useEffect(() => saveStorage('jadwal', jadwal), [jadwal]);
  useEffect(() => saveStorage('absensi', absensi), [absensi]);
  useEffect(() => saveStorage('arsipAbsensi', arsipAbsensi), [arsipAbsensi]);
  useEffect(() => saveStorage('users', users), [users]);
  useEffect(() => saveStorage('profilSekolah', profilSekolah), [profilSekolah]);

  // Synchronize Browser Favicon, Apple-Touch-Icon & Web App Manifest with School Logo
  useEffect(() => {
    if (!profilSekolah?.logoUrl) return;

    try {
      // Update Tab Favicon
      let iconLink = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!iconLink) {
        iconLink = document.createElement('link');
        iconLink.rel = 'icon';
        document.head.appendChild(iconLink);
      }
      iconLink.href = profilSekolah.logoUrl;

      // Update Apple Touch Icon (for iOS Safari home screen)
      let appleLink = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
      if (!appleLink) {
        appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        document.head.appendChild(appleLink);
      }
      appleLink.href = profilSekolah.logoUrl;

      // Update Dynamic PWA Manifest with school emblem & identity
      const dynamicManifest = {
        id: '/',
        start_url: '/',
        scope: '/',
        name: `Absensi Ekstrakurikuler - ${profilSekolah.namaSekolah || 'Sekolah'}`,
        short_name: 'AbsenEkskul',
        description: `Sistem Presensi & Ekstrakurikuler ${profilSekolah.namaSekolah}`,
        display: 'standalone',
        orientation: 'portrait-primary',
        theme_color: '#1d4ed8',
        background_color: '#0f172a',
        icons: [
          {
            src: profilSekolah.logoUrl,
            sizes: '192x192',
            type: profilSekolah.logoUrl.startsWith('data:image/svg') ? 'image/svg+xml' : 'image/png',
            purpose: 'any',
          },
          {
            src: profilSekolah.logoUrl,
            sizes: '512x512',
            type: profilSekolah.logoUrl.startsWith('data:image/svg') ? 'image/svg+xml' : 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      };

      const manifestBlob = new Blob([JSON.stringify(dynamicManifest)], { type: 'application/json' });
      const manifestUrl = URL.createObjectURL(manifestBlob);
      let manifestLink = document.querySelector<HTMLLinkElement>("link[rel='manifest']");
      if (manifestLink) {
        manifestLink.href = manifestUrl;
      }
    } catch {
      // Fallback to static manifest
    }
  }, [profilSekolah?.logoUrl, profilSekolah?.namaSekolah]);

  // Check persistent storage status on startup & auto request
  useEffect(() => {
    checkStoragePersisted().then((persisted) => {
      setIsStoragePersisted(persisted);
      if (!persisted) {
        requestPersistentStorage().then((granted) => {
          setIsStoragePersisted(granted);
        });
      }
    });
  }, []);

  // Automatic Vault Snapshot Mirror to IndexedDB
  useEffect(() => {
    const payload = createBackupPayload({
      siswa,
      pembina,
      ekskul,
      anggota,
      jadwal,
      absensi,
      profilSekolah,
      users,
      arsipAbsensi,
    });
    saveSnapshotToVault(payload);
  }, [siswa, pembina, ekskul, anggota, jadwal, absensi, profilSekolah, users, arsipAbsensi]);

  // Cloud Firebase Real-Time Synchronization State
  const [cloudSyncStatus, setCloudSyncStatus] = useState<
    'connected' | 'syncing' | 'offline' | 'error' | 'connecting'
  >('connecting');
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<Date | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const isRemoteUpdateRef = useRef(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInitializedFromCloud = useRef(false);

  // 1. Firebase Auth listener
  useEffect(() => {
    const unsub = onAuthChange((user) => {
      setFirebaseUser(user);
    });
    return () => unsub();
  }, []);

  // 2. Real-time Firebase Firestore Subscription
  useEffect(() => {
    const unsubscribe = subscribeSchoolData(
      (cloudData: CloudSchoolData) => {
        // If the Firestore document doesn't exist yet, seed it once with local data
        if (!cloudData || Object.keys(cloudData).length === 0) {
          if (!hasInitializedFromCloud.current) {
            hasInitializedFromCloud.current = true;
            saveSchoolDataToCloud({
              siswa,
              pembina,
              ekskul,
              anggota,
              jadwal,
              absensi,
              arsipAbsensi,
              profilSekolah,
              users,
            }).then(() => {
              setCloudSyncStatus('connected');
              setLastCloudSyncTime(new Date());
            });
          }
          return;
        }

        hasInitializedFromCloud.current = true;
        isRemoteUpdateRef.current = true;

        if (Array.isArray(cloudData.siswa) && cloudData.siswa.length > 0) setSiswa(cloudData.siswa);
        if (Array.isArray(cloudData.pembina) && cloudData.pembina.length > 0) setPembina(cloudData.pembina);
        if (Array.isArray(cloudData.ekskul) && cloudData.ekskul.length > 0) setEkskul(cloudData.ekskul);
        if (Array.isArray(cloudData.anggota)) setAnggota(cloudData.anggota);
        if (Array.isArray(cloudData.jadwal)) setJadwal(cloudData.jadwal);
        if (Array.isArray(cloudData.absensi)) setAbsensi(cloudData.absensi);
        if (Array.isArray(cloudData.arsipAbsensi)) setArsipAbsensi(cloudData.arsipAbsensi);
        if (cloudData.profilSekolah) setProfilSekolah(cloudData.profilSekolah);
        if (Array.isArray(cloudData.users) && cloudData.users.length > 0) setUsers(cloudData.users);

        setCloudSyncStatus('connected');
        setLastCloudSyncTime(new Date());

        setTimeout(() => {
          isRemoteUpdateRef.current = false;
        }, 800);
      },
      (err) => {
        console.warn('Firestore subscription error:', err);
        setCloudSyncStatus('offline');
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // 3. Debounced Auto-Sync to Firebase when local data changes
  useEffect(() => {
    // If update originated from Firestore snapshot, do not push back
    if (isRemoteUpdateRef.current || !hasInitializedFromCloud.current) {
      return;
    }

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      setCloudSyncStatus('syncing');
      const res = await saveSchoolDataToCloud(
        {
          siswa,
          pembina,
          ekskul,
          anggota,
          jadwal,
          absensi,
          arsipAbsensi,
          profilSekolah,
          users,
        },
        currentUser?.name || 'Sistem Sekolah'
      );

      if (res.success) {
        setCloudSyncStatus('connected');
        setLastCloudSyncTime(new Date());
      } else {
        setCloudSyncStatus('error');
      }
    }, 1500);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [siswa, pembina, ekskul, anggota, jadwal, absensi, arsipAbsensi, profilSekolah, users]);

  // 4. Force Push to Cloud
  const forcePushToCloud = async () => {
    setCloudSyncStatus('syncing');
    const res = await saveSchoolDataToCloud(
      {
        siswa,
        pembina,
        ekskul,
        anggota,
        jadwal,
        absensi,
        arsipAbsensi,
        profilSekolah,
        users,
      },
      currentUser?.name || 'Admin Sekolah'
    );
    if (res.success) {
      setCloudSyncStatus('connected');
      setLastCloudSyncTime(new Date());
      return { success: true, message: 'Data berhasil disinkronkan ke Cloud Firebase!' };
    }
    setCloudSyncStatus('error');
    return { success: false, message: res.error || 'Gagal sinkronisasi ke Cloud' };
  };

  // 5. Force Pull from Cloud
  const forcePullFromCloud = async () => {
    setCloudSyncStatus('syncing');
    const res = await fetchSchoolDataFromCloud();
    if (res.success && res.data) {
      isRemoteUpdateRef.current = true;
      if (res.data.siswa) setSiswa(res.data.siswa);
      if (res.data.pembina) setPembina(res.data.pembina);
      if (res.data.ekskul) setEkskul(res.data.ekskul);
      if (res.data.anggota) setAnggota(res.data.anggota);
      if (res.data.jadwal) setJadwal(res.data.jadwal);
      if (res.data.absensi) setAbsensi(res.data.absensi);
      if (res.data.arsipAbsensi) setArsipAbsensi(res.data.arsipAbsensi);
      if (res.data.profilSekolah) setProfilSekolah(res.data.profilSekolah);
      if (res.data.users) setUsers(res.data.users);

      setCloudSyncStatus('connected');
      setLastCloudSyncTime(new Date());

      setTimeout(() => {
        isRemoteUpdateRef.current = false;
      }, 500);

      return { success: true, message: 'Data terbaru dari Cloud berhasil dimuat!' };
    }
    setCloudSyncStatus('error');
    return { success: false, message: res.error || 'Gagal memuat data dari Cloud' };
  };

  // 6. Sign in with Google
  const signInWithGoogleAccount = async () => {
    const res = await loginWithGoogle();
    if (res.success && res.user) {
      return { success: true, message: `Berhasil login sebagai ${res.user.displayName || res.user.email}` };
    }
    return { success: false, message: res.error || 'Gagal login dengan Google' };
  };

  // Request Persistent Storage explicitly
  const requestPersistence = async (): Promise<boolean> => {
    const granted = await requestPersistentStorage();
    setIsStoragePersisted(granted);
    return granted;
  };

  // Archive old attendance records before a cut-off date
  const archiveOldRecords = (cutoffDate: string, note?: string) => {
    const toArchive = absensi.filter((a) => a.tanggal <= cutoffDate);
    if (toArchive.length === 0) {
      return { success: false, count: 0 };
    }

    const remaining = absensi.filter((a) => a.tanggal > cutoffDate);
    const enriched = toArchive.map((item) => ({
      ...item,
      keterangan: note
        ? `${item.keterangan ? item.keterangan + ' | ' : ''}[Arsip: ${note}]`
        : item.keterangan,
    }));

    setArsipAbsensi((prev) => [...enriched, ...prev]);
    setAbsensi(remaining);
    return { success: true, count: toArchive.length };
  };

  // Restore archived records back into active history
  const restoreArchivedRecords = () => {
    if (arsipAbsensi.length === 0) return;
    setAbsensi((prev) => [...arsipAbsensi, ...prev]);
    setArsipAbsensi([]);
  };

  // Restore full system data from backup JSON payload
  const restoreFromBackup = (payload: BackupPayload) => {
    try {
      if (!payload || !payload.data) {
        return { success: false, message: 'Format berkas cadangan tidak valid.' };
      }
      const { data } = payload;
      if (data.siswa && Array.isArray(data.siswa)) setSiswa(data.siswa);
      if (data.pembina && Array.isArray(data.pembina)) setPembina(data.pembina);
      if (data.ekskul && Array.isArray(data.ekskul)) setEkskul(data.ekskul);
      if (data.anggota && Array.isArray(data.anggota)) setAnggota(data.anggota);
      if (data.jadwal && Array.isArray(data.jadwal)) setJadwal(data.jadwal);
      if (data.absensi && Array.isArray(data.absensi)) setAbsensi(data.absensi);
      if (data.profilSekolah) setProfilSekolah(data.profilSekolah);
      if (data.users && Array.isArray(data.users)) setUsers(data.users);
      if (data.arsipAbsensi && Array.isArray(data.arsipAbsensi)) setArsipAbsensi(data.arsipAbsensi);

      return { success: true, message: 'Seluruh data berhasil dipulihkan dari berkas cadangan.' };
    } catch (err: any) {
      return { success: false, message: `Gagal memulihkan: ${err.message || 'Kesalahan sistem'}` };
    }
  };

  // Dark mode effect on HTML root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Toast functions
  const addToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    title?: string
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth functions
  const login = (username: string, password?: string): boolean => {
    const trimmedUser = username.trim().toLowerCase();
    const found = users.find((u) => u.username.toLowerCase() === trimmedUser);
    if (!found) {
      addToast('Username tidak ditemukan!', 'error');
      return false;
    }

    if (password && found.password && found.password !== password.trim()) {
      addToast('Kata sandi salah!', 'error');
      return false;
    }

    setCurrentUser(found);
    setCurrentMenu('dashboard');
    addToast(`Selamat datang, ${found.name} (${found.role})!`, 'success');
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentMenu('dashboard');
    addToast('Anda telah berhasil keluar.', 'info');
  };

  // CRUD Siswa
  const addSiswa = (data: Omit<Siswa, 'id'>): boolean => {
    if (siswa.some((s) => s.nis === data.nis)) {
      addToast(`NIS ${data.nis} sudah terdaftar!`, 'error');
      return false;
    }
    const newId = `sis-${Date.now().toString().slice(-4)}`;
    const newSiswa: Siswa = { ...data, id: newId };
    setSiswa((prev) => [newSiswa, ...prev]);

    // Also create user account for this student automatically
    const defaultUsername = `siswa_${data.nis}`;
    if (!users.some((u) => u.username === defaultUsername)) {
      const newUser: User = {
        id: `usr-${newId}`,
        username: defaultUsername,
        password: 'siswa123',
        name: data.nama,
        role: 'SISWA',
        status: 'Aktif',
        refId: newId,
      };
      setUsers((prev) => [...prev, newUser]);
    }

    addToast(`Murid "${data.nama}" berhasil ditambahkan.`, 'success');
    return true;
  };

  const updateSiswa = (id: string, data: Partial<Siswa>) => {
    setSiswa((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );
    // Update linked user name if modified
    if (data.nama) {
      setUsers((prev) =>
        prev.map((u) => (u.refId === id ? { ...u, name: data.nama! } : u))
      );
    }
    addToast('Data murid berhasil diperbarui.', 'success');
  };

  const deleteSiswa = (id: string) => {
    const target = siswa.find((s) => s.id === id);
    setSiswa((prev) => prev.filter((s) => s.id !== id));
    // Remove memberships and attendance
    setAnggota((prev) => prev.filter((a) => a.siswaId !== id));
    setAbsensi((prev) => prev.filter((ab) => ab.siswaId !== id));
    setUsers((prev) => prev.filter((u) => u.refId !== id));
    addToast(`Murid "${target?.nama || id}" berhasil dihapus.`, 'info');
  };

  const deleteMultipleSiswa = (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const idSet = new Set(ids);
    setSiswa((prev) => prev.filter((s) => !idSet.has(s.id)));
    setAnggota((prev) => prev.filter((a) => !idSet.has(a.siswaId)));
    setAbsensi((prev) => prev.filter((ab) => !idSet.has(ab.siswaId)));
    setUsers((prev) => prev.filter((u) => !u.refId || !idSet.has(u.refId)));
    addToast(`${ids.length} data murid berhasil dihapus.`, 'info');
  };

  const deleteAllSiswa = () => {
    if (siswa.length === 0) {
      addToast('Tidak ada data murid untuk dihapus.', 'warning');
      return;
    }
    const count = siswa.length;
    const allIds = new Set(siswa.map((s) => s.id));
    setSiswa([]);
    setAnggota((prev) => prev.filter((a) => !allIds.has(a.siswaId)));
    setAbsensi((prev) => prev.filter((ab) => !allIds.has(ab.siswaId)));
    setUsers((prev) => prev.filter((u) => !u.refId || !allIds.has(u.refId)));
    addToast(`Semua ${count} data murid berhasil dihapus.`, 'info');
  };

  // CRUD Pembina
  const addPembina = (data: Omit<Pembina, 'id'>): boolean => {
    if (pembina.some((p) => p.nip === data.nip)) {
      addToast(`NIP ${data.nip} sudah terdaftar!`, 'error');
      return false;
    }
    const newId = `pem-${Date.now().toString().slice(-4)}`;
    const newPembina: Pembina = { ...data, id: newId };
    setPembina((prev) => [newPembina, ...prev]);

    // Auto create user account
    const defaultUsername = `pembina_${data.nip.split(' ')[0] || newId}`;
    if (!users.some((u) => u.username === defaultUsername)) {
      setUsers((prev) => [
        ...prev,
        {
          id: `usr-${newId}`,
          username: defaultUsername,
          password: 'pembina123',
          name: data.nama,
          role: 'PEMBINA',
          status: 'Aktif',
          email: data.email,
          refId: newId,
        },
      ]);
    }

    addToast(`Pembina "${data.nama}" berhasil ditambahkan.`, 'success');
    return true;
  };

  const updatePembina = (id: string, data: Partial<Pembina>) => {
    setPembina((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
    if (data.nama) {
      setUsers((prev) =>
        prev.map((u) => (u.refId === id ? { ...u, name: data.nama! } : u))
      );
    }
    addToast('Data pembina berhasil diperbarui.', 'success');
  };

  const deletePembina = (id: string) => {
    const target = pembina.find((p) => p.id === id);
    setPembina((prev) => prev.filter((p) => p.id !== id));
    setUsers((prev) => prev.filter((u) => u.refId !== id));
    // Clear pembina in ekskul
    setEkskul((prev) =>
      prev.map((e) => (e.pembinaId === id ? { ...e, pembinaId: '' } : e))
    );
    addToast(`Pembina "${target?.nama || id}" telah dihapus.`, 'info');
  };

  // CRUD Ekskul
  const addEkskul = (data: Omit<Ekstrakurikuler, 'id'>): boolean => {
    if (ekskul.some((e) => e.kode.toUpperCase() === data.kode.toUpperCase())) {
      addToast(`Kode Ekskul ${data.kode} sudah digunakan!`, 'error');
      return false;
    }
    const newId = `eks-${Date.now().toString().slice(-4)}`;
    const newEks: Ekstrakurikuler = { ...data, id: newId };
    setEkskul((prev) => [newEks, ...prev]);

    // If pembina assigned, update pembina.ekskulIds
    if (data.pembinaId) {
      setPembina((prev) =>
        prev.map((p) =>
          p.id === data.pembinaId
            ? { ...p, ekskulIds: Array.from(new Set([...p.ekskulIds, newId])) }
            : p
        )
      );
    }

    addToast(`Ekstrakurikuler "${data.nama}" berhasil dibuat.`, 'success');
    return true;
  };

  const updateEkskul = (id: string, data: Partial<Ekstrakurikuler>) => {
    setEkskul((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...data } : e))
    );
    if (data.pembinaId !== undefined) {
      setPembina((prev) =>
        prev.map((p) => {
          if (p.id === data.pembinaId) {
            return { ...p, ekskulIds: Array.from(new Set([...p.ekskulIds, id])) };
          }
          return { ...p, ekskulIds: p.ekskulIds.filter((eid) => eid !== id) };
        })
      );
    }
    addToast('Data ekstrakurikuler berhasil diperbarui.', 'success');
  };

  const deleteEkskul = (id: string) => {
    const target = ekskul.find((e) => e.id === id);
    setEkskul((prev) => prev.filter((e) => e.id !== id));
    setAnggota((prev) => prev.filter((a) => a.ekskulId !== id));
    setJadwal((prev) => prev.filter((j) => j.ekskulId !== id));
    setAbsensi((prev) => prev.filter((ab) => ab.ekskulId !== id));
    setPembina((prev) =>
      prev.map((p) => ({ ...p, ekskulIds: p.ekskulIds.filter((eid) => eid !== id) }))
    );
    addToast(`Ekstrakurikuler "${target?.nama || id}" telah dihapus.`, 'info');
  };

  // CRUD Anggota
  const addAnggota = (
    siswaId: string,
    ekskulId: string,
    tahunAjaran: string
  ): { success: boolean; message: string } => {
    const exists = anggota.some(
      (a) => a.siswaId === siswaId && a.ekskulId === ekskulId && a.status === 'Aktif'
    );
    if (exists) {
      return {
        success: false,
        message: 'Siswa tersebut sudah terdaftar aktif di ekstrakurikuler ini.',
      };
    }
    const newAnggota: Anggota = {
      id: `ang-${Date.now().toString().slice(-4)}`,
      siswaId,
      ekskulId,
      tahunAjaran,
      status: 'Aktif',
      tanggalDaftar: new Date().toISOString().split('T')[0],
    };
    setAnggota((prev) => [newAnggota, ...prev]);
    addToast('Anggota berhasil didaftarkan!', 'success');
    return { success: true, message: 'Berhasil didaftarkan' };
  };

  const removeAnggota = (id: string) => {
    setAnggota((prev) => prev.filter((a) => a.id !== id));
    addToast('Anggota telah dikeluarkan dari kegiatan.', 'info');
  };

  // CRUD Jadwal
  const addJadwal = (data: Omit<Jadwal, 'id'>) => {
    const newId = `jad-${Date.now().toString().slice(-4)}`;
    setJadwal((prev) => [...prev, { ...data, id: newId }]);
    addToast('Jadwal baru berhasil ditambahkan.', 'success');
  };

  const updateJadwal = (id: string, data: Partial<Jadwal>) => {
    setJadwal((prev) => prev.map((j) => (j.id === id ? { ...j, ...data } : j)));
    addToast('Jadwal berhasil diperbarui.', 'success');
  };

  const deleteJadwal = (id: string) => {
    setJadwal((prev) => prev.filter((j) => j.id !== id));
    addToast('Jadwal berhasil dihapus.', 'info');
  };

  // ABSENSI RULES & OPERATIONS
  const checkExistingAttendance = (ekskulId: string, tanggal: string): boolean => {
    return absensi.some((a) => a.ekskulId === ekskulId && a.tanggal === tanggal);
  };

  const getAttendanceForDateAndEkskul = (ekskulId: string, tanggal: string): AbsensiRecord[] => {
    return absensi.filter((a) => a.ekskulId === ekskulId && a.tanggal === tanggal);
  };

  const saveBatchAbsensi = (
    ekskulId: string,
    tanggal: string,
    items: { siswaId: string; status: AttendanceStatus; keterangan: string }[],
    allowOverwrite = false
  ): { success: boolean; message: string; count?: number } => {
    if (!ekskulId || !tanggal || items.length === 0) {
      return { success: false, message: 'Data absensi tidak lengkap.' };
    }

    const alreadyExists = checkExistingAttendance(ekskulId, tanggal);

    if (alreadyExists && !allowOverwrite) {
      return {
        success: false,
        message: 'Siswa sudah melakukan absensi pada tanggal tersebut.',
      };
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const recordedByName = currentUser?.name || 'Petugas';

    // If overwrite, remove existing for this ekskul and date
    let updatedAbsensi = absensi;
    if (alreadyExists && allowOverwrite) {
      updatedAbsensi = absensi.filter(
        (a) => !(a.ekskulId === ekskulId && a.tanggal === tanggal)
      );
    }

    const newRecords: AbsensiRecord[] = items.map((item, index) => ({
      id: `abs-${Date.now()}-${index}`,
      ekskulId,
      siswaId: item.siswaId,
      tanggal,
      status: item.status,
      keterangan: item.keterangan || '',
      createdAt: nowStr,
      recordedBy: recordedByName,
    }));

    setAbsensi([...newRecords, ...updatedAbsensi]);
    addToast(`Absensi berhasil disimpan untuk ${items.length} siswa.`, 'success');
    return {
      success: true,
      message: 'Absensi berhasil disimpan ke database.',
      count: items.length,
    };
  };

  const updateAbsensiRecord = (id: string, status: AttendanceStatus, keterangan: string) => {
    setAbsensi((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status, keterangan } : a))
    );
    addToast('Status absensi berhasil diperbarui.', 'success');
  };

  const deleteAbsensiRecord = (id: string) => {
    setAbsensi((prev) => prev.filter((a) => a.id !== id));
    addToast('Catatan absensi telah dihapus.', 'info');
  };

  // Settings
  const updateProfilSekolah = (data: Partial<ProfilSekolah>) => {
    setProfilSekolah((prev) => ({ ...prev, ...data }));
    addToast('Profil sekolah berhasil diperbarui.', 'success');
  };

  const addUser = (data: Omit<User, 'id'>): boolean => {
    if (users.some((u) => u.username.toLowerCase() === data.username.toLowerCase())) {
      addToast(`Username "${data.username}" sudah digunakan!`, 'error');
      return false;
    }
    const newId = `usr-${Date.now().toString().slice(-4)}`;
    setUsers((prev) => [...prev, { ...data, id: newId }]);
    addToast(`Pengguna "${data.username}" berhasil ditambahkan.`, 'success');
    return true;
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
    addToast('Data pengguna berhasil diperbarui.', 'success');
  };

  const deleteUser = (id: string) => {
    if (currentUser?.id === id) {
      addToast('Tidak dapat menghapus akun yang sedang aktif digunakan!', 'error');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    addToast('Pengguna telah dihapus.', 'info');
  };

  const resetUserPassword = (id: string, newPassword: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, password: newPassword } : u))
    );
    addToast('Password pengguna berhasil direset.', 'success');
  };

  const resetToDemoData = () => {
    setSiswa(INITIAL_SISWA);
    setPembina(INITIAL_PEMBINA);
    setEkskul(INITIAL_EKSKUL);
    setAnggota(INITIAL_ANGGOTA);
    setJadwal(INITIAL_JADWAL);
    setAbsensi(INITIAL_ABSENSI);
    setUsers(INITIAL_USERS);
    setProfilSekolah(INITIAL_SEKOLAH);
    setCurrentUser(INITIAL_USERS[0]);
    setCurrentMenu('dashboard');
    addToast('Seluruh data berhasil di-reset ke data demo awal.', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        cloudSyncStatus,
        lastCloudSyncTime,
        firebaseUser,
        forcePushToCloud,
        forcePullFromCloud,
        signInWithGoogleAccount,
        isStoragePersisted,
        requestPersistence,
        arsipAbsensi,
        archiveOldRecords,
        restoreArchivedRecords,
        restoreFromBackup,
        currentMenu,
        setCurrentMenu,
        isDarkMode,
        toggleDarkMode,
        toasts,
        addToast,
        removeToast,
        siswa,
        pembina,
        ekskul,
        anggota,
        jadwal,
        absensi,
        users,
        kelas,
        profilSekolah,
        addSiswa,
        updateSiswa,
        deleteSiswa,
        deleteMultipleSiswa,
        deleteAllSiswa,
        addPembina,
        updatePembina,
        deletePembina,
        addEkskul,
        updateEkskul,
        deleteEkskul,
        addAnggota,
        removeAnggota,
        addJadwal,
        updateJadwal,
        deleteJadwal,
        checkExistingAttendance,
        getAttendanceForDateAndEkskul,
        saveBatchAbsensi,
        updateAbsensiRecord,
        deleteAbsensiRecord,
        updateProfilSekolah,
        addUser,
        updateUser,
        deleteUser,
        resetUserPassword,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
