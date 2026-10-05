import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Text } from 'react-native';

import { ActionButton } from '@/components/ActionButton';
import { NetworkStatusBanner } from '@/components/NetworkStatusBanner';
import { ScrollPage } from '@/components/Screen';
import { useAppTheme, useAuth } from '@/contexts/AppProviders';
import { appStorage, storageKeys } from '@/core/storage';
import { nativeSecureVault } from '@/native/secureVault';
import { createStyles } from '@/app/security-gate.styles';

export function SecurityGateScreen() {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { session, signOutUser, markGateUnlocked } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const unlock = async () => {
    setBusy(true);
    setError('');
    try {
      let authenticated = false;
      if (nativeSecureVault) {
        authenticated = await nativeSecureVault.authenticate('Unlock your VaultTask workspace');
      } else {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Unlock your VaultTask workspace',
          cancelLabel: 'Cancel',
          disableDeviceFallback: false,
        });
        authenticated = result.success;
      }
      if (!authenticated) {
        setError('Authentication was not completed. Try again to unlock your workspace.');
        return;
      }
      markGateUnlocked();
      router.replace('/(app)');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Biometric authentication is unavailable.');
    } finally {
      setBusy(false);
    }
  };

  const skip = () => {
    appStorage.set(storageKeys.biometricsEnabled, false);
    markGateUnlocked();
    router.replace('/(app)');
  };

  return (
    <ScrollPage contentContainerStyle={styles.content}>
      <NetworkStatusBanner />
      <Text style={styles.icon}>◈</Text>
      <Text style={styles.title}>Secure workspace</Text>
      <Text style={styles.subtitle}>
        {session?.email ? `Welcome back, ${session.email}.` : 'Authenticate to unlock your local workspace.'}
      </Text>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <ActionButton busy={busy} label="Unlock with biometrics" onPress={() => void unlock()} />
      <ActionButton label="Turn off biometric gate" onPress={skip} secondary />
      <ActionButton label="Sign out" onPress={() => {
        void signOutUser().then(() => router.replace('/login')).catch(cause =>
          Alert.alert('Sign out failed', cause instanceof Error ? cause.message : 'Please try again.'));
      }} secondary />
    </ScrollPage>
  );
}
