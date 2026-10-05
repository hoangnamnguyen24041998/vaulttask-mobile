import NetInfo from '@react-native-community/netinfo';
import { Redirect, Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth, useAppTheme } from '@/contexts/AppProviders';
import { firebaseConfigured } from '@/core/firebase';
import { forceSync, subscribeToRemoteChanges } from '@/core/dataService';
import { appStorage, storageKeys } from '@/core/storage';

export default function AppTabsLayout() {
  const { theme } = useAppTheme();
  const { session, loading, gateUnlocked } = useAuth();

  useEffect(() => {
    if (!firebaseConfigured || !session || !session.remoteEnabled) return;
    const stopRealtime = subscribeToRemoteChanges(session.uid);
    const stopNetwork = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable !== false) {
        void forceSync(session.uid).catch(error => console.error('Automatic sync failed.', error));
      }
    });
    return () => {
      stopRealtime?.();
      stopNetwork();
    };
  }, [session]);

  if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={theme.colors.primary} /></View>;
  if (!session) return <Redirect href="/login" />;
  if (appStorage.getBoolean(storageKeys.biometricsEnabled) && !gateUnlocked) {
    return <Redirect href="/security-gate" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Workspaces', tabBarLabel: 'Workspaces' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarLabel: 'Settings' }} />
    </Tabs>
  );
}
