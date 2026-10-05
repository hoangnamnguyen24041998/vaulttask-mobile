import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, Switch, Text, View } from 'react-native';

import { NetworkStatusBanner } from '@/components/NetworkStatusBanner';
import { ScrollPage } from '@/components/Screen';
import { useAppTheme, useAuth } from '@/contexts/AppProviders';
import { database } from '@/core/database';
import { ensureDefaultWorkspace, purgeLocalDatabase } from '@/core/dataService';
import { appStorage, storageKeys } from '@/core/storage';
import type { Brand } from '@/core/theme';
import { createStyles } from '@/app/settings.styles';

export function SettingsScreen() {
  const { theme, brand, setBrand } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { signOutUser } = useAuth();
  const [biometrics, setBiometrics] = useState(appStorage.getBoolean(storageKeys.biometricsEnabled) ?? false);
  const [purging, setPurging] = useState(false);

  const chooseBrand = (next: Brand) => setBrand(next);
  const toggleBiometrics = (value: boolean) => {
    appStorage.set(storageKeys.biometricsEnabled, value);
    setBiometrics(value);
  };
  const purge = () => Alert.alert('Purge local database?', 'All workspaces, tasks, and pending sync changes on this device will be permanently deleted.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Purge', style: 'destructive', onPress: () => {
      setPurging(true);
      void purgeLocalDatabase()
        .then(ensureDefaultWorkspace)
        .then(() => Alert.alert('Database cleared', 'Local data and the sync outbox were purged. A fresh workspace is ready.'))
        .catch(error => Alert.alert('Purge failed', error instanceof Error ? error.message : 'The database could not be cleared.'))
        .finally(() => setPurging(false));
    } },
  ]);

  return (
    <ScrollPage contentContainerStyle={styles.content}>
      <NetworkStatusBanner />
      <Text style={styles.heading}>Settings</Text>
      <Text style={styles.section}>Brand experience</Text>
      {([
        ['enterprise', 'HDBank Enterprise', 'Structured, high-contrast workspace'],
        ['retail', 'Retail Fintech', 'Warm, approachable personal finance style'],
      ] as const).map(([value, label, hint]) => (
        <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: brand === value }} onPress={() => chooseBrand(value)} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowHint}>{hint}</Text>
          </View>
          <Text style={{ color: brand === value ? theme.colors.primary : theme.colors.muted, fontSize: 20 }}>{brand === value ? '●' : '○'}</Text>
        </Pressable>
      ))}
      <Text style={styles.section}>Security</Text>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowLabel}>Biometric app gate</Text>
          <Text style={styles.rowHint}>Require device authentication at unlock.</Text>
        </View>
        <Switch
          accessibilityLabel="Biometric app gate"
          onValueChange={toggleBiometrics}
          thumbColor={biometrics ? theme.colors.primary : theme.colors.muted}
          value={biometrics}
        />
      </View>
      <Text style={styles.section}>Data & sync</Text>
      <Pressable accessibilityRole="button" onPress={() => router.push('/sync-settings')} style={styles.row}>
        <Text style={styles.rowLabel}>Sync outbox diagnostics</Text>
        <Text style={{ color: theme.colors.primary, fontSize: 20 }}>›</Text>
      </Pressable>
      <Pressable accessibilityRole="button" disabled={purging} onPress={purge} style={styles.row}>
        <Text style={[styles.rowLabel, { color: theme.colors.danger }]}>{purging ? 'Purging local database…' : 'Purge local SQLite database'}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => {
        void signOutUser().then(() => router.replace('/login')).catch(error =>
          Alert.alert('Sign out failed', error instanceof Error ? error.message : 'Please try again.'));
      }} style={styles.row}>
        <Text style={styles.rowLabel}>Sign out</Text>
      </Pressable>
      <Text style={styles.rowHint}>{database.adapter ? 'Offline-first storage is active on this device.' : 'Local storage is unavailable.'}</Text>
    </ScrollPage>
  );
}
