import React from 'react';
import { Text, View } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';

import { useAppTheme } from '@/contexts/AppProviders';

export function NetworkStatusBanner() {
  const { isConnected, isInternetReachable } = useNetInfo();
  const { theme } = useAppTheme();
  if (isConnected !== false && isInternetReachable !== false) return null;
  return (
    <View
      accessibilityRole="alert"
      style={{ backgroundColor: theme.colors.warning, padding: theme.spacing.sm }}
    >
      <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: theme.typography.caption }}>
        Offline — changes are saved on this device and queued to sync.
      </Text>
    </View>
  );
}
