import React from 'react';
import { StatusBar } from 'expo-status-bar';

import { AppProviders } from '@/contexts/AppProviders';
import { RootNavigator } from '@/navigation/RootNavigator';

function AppShell() {
  return (
    <>
      <StatusBar style="dark" />
      <RootNavigator />
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <AppShell />
    </AppProviders>
  );
}
