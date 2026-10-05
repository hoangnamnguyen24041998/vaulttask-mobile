import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  type Persistence,
  type Auth,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const asyncStoragePersistence: Persistence & {
  _isAvailable: () => Promise<boolean>;
  _set: (key: string, value: unknown) => Promise<void>;
  _get: <T>(key: string) => Promise<T | null>;
  _remove: (key: string) => Promise<void>;
  _addListener: (key: string, listener: (value: unknown) => void) => void;
  _removeListener: (key: string, listener: (value: unknown) => void) => void;
  _shouldAllowMigration: boolean;
} = {
  type: 'LOCAL',
  _isAvailable: async () => true,
  _set: (key, value) => AsyncStorage.setItem(key, JSON.stringify(value)),
  _get: async <T,>(key: string) => {
    const value = await AsyncStorage.getItem(key);
    return value === null ? null : JSON.parse(value) as T;
  },
  _remove: key => AsyncStorage.removeItem(key),
  _addListener: () => undefined,
  _removeListener: () => undefined,
  _shouldAllowMigration: true,
};

let auth: Auth | null = null;
let firestore: Firestore | null = null;

if (firebaseConfigured) {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  try {
    auth = initializeAuth(app, { persistence: asyncStoragePersistence });
  } catch (error) {
    if ((error as { code?: string }).code !== 'auth/already-initialized') throw error;
    auth = getAuth(app);
  }
  firestore = getFirestore(app);
}

export { auth, firestore };
