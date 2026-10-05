import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth, useAppTheme } from '@/contexts/AppProviders';
import { appStorage, storageKeys } from '@/core/storage';
import { createStyles } from '@/app/index.styles';

export default function InitialRoute() {
  const { session, loading, gateUnlocked } = useAuth();
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }
  if (!session) return <Redirect href="/login" />;
  return appStorage.getBoolean(storageKeys.biometricsEnabled) && !gateUnlocked
    ? <Redirect href="/security-gate" />
    : <Redirect href="/(app)" />;
}
