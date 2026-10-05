import React, { useMemo, useState } from 'react';
import { Alert, Text, TextInput } from 'react-native';
import { router } from 'expo-router';

import { ActionButton } from '@/components/ActionButton';
import { NetworkStatusBanner } from '@/components/NetworkStatusBanner';
import { ScrollPage } from '@/components/Screen';
import { useAppTheme, useAuth } from '@/contexts/AppProviders';
import { appStorage, storageKeys } from '@/core/storage';
import { createStyles } from '@/app/login.styles';

export function LoginScreen() {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { signIn, continueAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const nextRoute = () => router.replace(
    appStorage.getBoolean(storageKeys.biometricsEnabled) ? '/security-gate' : '/(app)',
  );

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await signIn(email, password);
      nextRoute();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign in.');
    } finally {
      setBusy(false);
    }
  };

  const guest = async () => {
    setBusy(true);
    try {
      await continueAsGuest();
      nextRoute();
    } catch (cause) {
      Alert.alert('Guest sign-in failed', cause instanceof Error ? cause.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollPage contentContainerStyle={styles.content}>
      <NetworkStatusBanner />
      <Text style={styles.brandMark}><Text style={styles.markText}>V</Text></Text>
      <Text style={styles.eyebrow}>VaultTask Mobile</Text>
      <Text style={styles.title}>Your work, securely in sync.</Text>
      <Text style={styles.subtitle}>Plan confidently online or offline. Your changes stay on this device until they can sync.</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        accessibilityLabel="Email"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="you@example.com"
        placeholderTextColor={theme.colors.muted}
        style={styles.input}
        value={email}
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        accessibilityLabel="Password"
        autoComplete="password"
        onChangeText={setPassword}
        onSubmitEditing={() => void submit()}
        placeholder="Enter your password"
        placeholderTextColor={theme.colors.muted}
        secureTextEntry
        style={styles.input}
        value={password}
      />
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <ActionButton busy={busy} label="Sign in" onPress={() => void submit()} />
      <ActionButton busy={busy} label="Continue as Guest" onPress={() => void guest()} secondary />
      <Text style={styles.footnote}>Guest work is saved locally. Configure Firebase to enable account sign-in and cloud sync.</Text>
    </ScrollPage>
  );
}
