import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, auth, googleProvider } from './config';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  Siswa,
  Pembina,
  Ekstrakurikuler,
  Anggota,
  Jadwal,
  AbsensiRecord,
  ProfilSekolah,
  User,
} from '../types';

export interface CloudSchoolData {
  siswa?: Siswa[];
  pembina?: Pembina[];
  ekskul?: Ekstrakurikuler[];
  anggota?: Anggota[];
  jadwal?: Jadwal[];
  absensi?: AbsensiRecord[];
  arsipAbsensi?: AbsensiRecord[];
  profilSekolah?: ProfilSekolah;
  users?: User[];
  updatedAt?: Timestamp | null;
  updatedBy?: string;
}

const COLLECTION_NAME = 'app_sync';
const DOC_ID = 'school_current';

/**
 * Listen to real-time updates from Cloud Firestore
 */
export function subscribeSchoolData(
  onData: (data: CloudSchoolData) => void,
  onError?: (err: Error) => void
) {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as CloudSchoolData;
          onData(data);
        } else {
          // Document does not exist yet
          onData({});
        }
      },
      (error) => {
        console.warn('Firestore subscription error:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.warn('Failed to attach Firestore listener:', error);
    if (onError && error instanceof Error) onError(error);
    return () => {};
  }
}

/**
 * Save complete or partial school data to Firestore Cloud
 */
export async function saveSchoolDataToCloud(
  partialData: Partial<CloudSchoolData>,
  userIdentifier?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    const payload = {
      ...partialData,
      updatedAt: serverTimestamp(),
      updatedBy: userIdentifier || 'Sistem Sekolah',
    };
    await setDoc(docRef, payload, { merge: true });
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menyimpan ke Firestore';
    console.error('Error saving to Firestore:', err);
    return { success: false, error: message };
  }
}

/**
 * Fetch current school data once from Firestore
 */
export async function fetchSchoolDataFromCloud(): Promise<{
  success: boolean;
  data?: CloudSchoolData;
  error?: string;
}> {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { success: true, data: snap.data() as CloudSchoolData };
    }
    return { success: true, data: undefined };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil data dari Firestore';
    return { success: false, error: message };
  }
}

/**
 * Sign In with Google Account
 */
export async function loginWithGoogle(): Promise<{
  success: boolean;
  user?: FirebaseUser;
  error?: string;
}> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal login Google';
    return { success: false, error: message };
  }
}

/**
 * Sign Out from Firebase Auth
 */
export async function logoutFirebaseAuth(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Logout error:', err);
  }
}

/**
 * Auth state listener
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
