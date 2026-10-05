import React from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/contexts/AppProviders';

export function Page({ children, ...props }: ViewProps) {
  const { theme } = useAppTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={[styles.page, { backgroundColor: theme.colors.background }]} {...props}>
        {children}
      </View>
    </SafeAreaView>
  );
}

export function ScrollPage({ children, contentContainerStyle, ...props }: ScrollViewProps) {
  const { theme } = useAppTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        {...props}
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={[styles.scroll, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  page: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 32 },
});
