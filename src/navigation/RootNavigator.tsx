import { Stack } from 'expo-router';
import React from 'react';

import { useAppTheme } from '@/contexts/AppProviders';

export function RootNavigator() {
  const { theme } = useAppTheme();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="security-gate" />
      <Stack.Screen name="(app)" />
      <Stack.Screen name="workspace/[workspaceId]" />
      <Stack.Screen name="task/[taskId]" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="sync-settings" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}
