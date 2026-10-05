import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { auth } from '@/core/firebase';
import { createGuestIdentity } from '@/core/dataService';
import { appStorage, getCachedSession, setCachedSession, storageKeys, type CachedSession } from '@/core/storage';
import { themes, type AppTheme, type Brand } from '@/core/theme';

interface AuthContextValue {
  session: CachedSession | null;
  loading: boolean;
  gateUnlocked: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  continueAsGuest: () => Promise<void>;
  signOutUser: () => Promise<void>;
  markGateUnlocked: () => void;
}

interface ThemeContextValue {
  theme: AppTheme;
  brand: Brand;
  setBrand: (brand: Brand) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppProviders({ children }: React.PropsWithChildren) {
  const [session, setSession] = useState<CachedSession | null>(() => getCachedSession());
  const [loading, setLoading] = useState(Boolean(auth));
  const [gateUnlocked, setGateUnlocked] = useState(false);
  const [brand, setBrandValue] = useState<Brand>(() =>
    appStorage.getString(storageKeys.brand) === 'enterprise' ? 'enterprise' : 'retail',
  );

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, user => {
      const cached = getCachedSession();
      const nextSession = user
        ? { uid: user.uid, isAnonymous: user.isAnonymous, email: user.email, remoteEnabled: true }
        : cached?.remoteEnabled === false ? cached : null;
      setSession(nextSession);
      setCachedSession(nextSession);
      if (!user) setGateUnlocked(false);
      setLoading(false);
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error('Email sign-in is not configured. Add the Firebase EXPO_PUBLIC_ environment variables.');
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    const nextSession = {
      uid: result.user.uid,
      isAnonymous: result.user.isAnonymous,
      email: result.user.email,
      remoteEnabled: true,
    };
    setCachedSession(nextSession);
    setSession(nextSession);
    setGateUnlocked(false);
  }, []);

  const continueAsGuest = useCallback(async () => {
    const nextSession = await createGuestIdentity();
    setCachedSession(nextSession);
    setSession(nextSession);
    setGateUnlocked(false);
  }, []);

  const signOutUser = useCallback(async () => {
    if (auth) await signOut(auth);
    setCachedSession(null);
    setSession(null);
    setGateUnlocked(false);
  }, []);

  const markGateUnlocked = useCallback(() => setGateUnlocked(true), []);

  const setBrand = useCallback((nextBrand: Brand) => {
    appStorage.set(storageKeys.brand, nextBrand);
    setBrandValue(nextBrand);
  }, []);

  const authValue = useMemo(
    () => ({ session, loading, gateUnlocked, signIn, continueAsGuest, signOutUser, markGateUnlocked }),
    [session, loading, gateUnlocked, signIn, continueAsGuest, signOutUser, markGateUnlocked],
  );
  const themeValue = useMemo(
    () => ({ brand, theme: themes[brand], setBrand }),
    [brand, setBrand],
  );

  return (
    <AuthContext.Provider value={authValue}>
      <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AppProviders.');
  return context;
}

export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme must be used within AppProviders.');
  return context;
}
