import { Redirect } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth, useAppTheme } from '@/contexts/AppProviders';
import { ensureDefaultWorkspace } from '@/core/dataService';
import { WorkspaceListScreen } from '@/screens/WorkspaceListScreen';

export default function WorkspacesRoute() {
  const { session, loading } = useAuth();
  const { theme } = useAppTheme();
  useEffect(() => {
    if (session) void ensureDefaultWorkspace().catch(error => console.error('Workspace initialization failed.', error));
  }, [session]);
  if (loading) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={theme.colors.primary} /></View>;
  }
  if (!session) return <Redirect href="/login" />;
  return <WorkspaceListScreen />;
}
