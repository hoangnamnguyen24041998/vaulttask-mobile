import { createMMKV } from 'react-native-mmkv';

export const appStorage = createMMKV({ id: 'vaulttask-app' });

export const storageKeys = {
  session: 'session.cache.v1',
  brand: 'design.brand.v1',
  biometricsEnabled: 'security.biometrics.v1',
  lastSyncAt: 'sync.last-success.v1',
} as const;

export interface CachedSession {
  uid: string;
  isAnonymous: boolean;
  email: string | null;
  remoteEnabled: boolean;
}

export function getCachedSession(): CachedSession | null {
  const value = appStorage.getString(storageKeys.session);
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'uid' in parsed &&
      typeof parsed.uid === 'string' &&
      'isAnonymous' in parsed &&
      typeof parsed.isAnonymous === 'boolean'
    ) {
      return {
        uid: parsed.uid,
        isAnonymous: parsed.isAnonymous,
        email: 'email' in parsed && typeof parsed.email === 'string' ? parsed.email : null,
        remoteEnabled: !('remoteEnabled' in parsed) || parsed.remoteEnabled === true,
      };
    }
  } catch (error) {
    console.warn('Invalid cached session; clearing it.', error);
  }

  appStorage.remove(storageKeys.session);
  return null;
}

export function setCachedSession(session: CachedSession | null): void {
  if (session) appStorage.set(storageKeys.session, JSON.stringify(session));
  else appStorage.remove(storageKeys.session);
}
