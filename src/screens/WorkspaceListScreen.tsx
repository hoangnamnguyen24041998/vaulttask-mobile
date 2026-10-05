import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { NetworkStatusBanner } from '@/components/NetworkStatusBanner';
import { useAppTheme } from '@/contexts/AppProviders';
import { Task, Workspace } from '@/core/database';
import { useDatabaseRecords } from '@/hooks/useDatabaseRecords';
import { createStyles } from '@/app/workspace-list.styles';

export function WorkspaceListScreen() {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const workspaces = useDatabaseRecords<Workspace>('workspaces');
  const tasks = useDatabaseRecords<Task>('tasks');
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <NetworkStatusBanner />
      <FlatList
        contentContainerStyle={styles.content}
        data={workspaces}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View style={{ gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
            <Text style={styles.heading}>Your workspaces</Text>
            <Text style={styles.subheading}>Pick up where you left off.</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.subheading}>Preparing your local workspace…</Text>}
        renderItem={({ item }) => {
          const count = tasks.filter(task => task.workspaceId === item.id && task.status !== 'done').length;
          return (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/workspace/[workspaceId]', params: { workspaceId: item.id } })}
              style={({ pressed }) => [styles.card, { opacity: pressed ? 0.75 : 1 }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                <View style={{ width: 12, height: 44, backgroundColor: item.color, borderRadius: theme.radii.pill }} />
                <View style={{ flex: 1, gap: theme.spacing.xs }}>
                  <Text style={styles.workspaceName}>{item.name}</Text>
                  <Text style={styles.metadata}>{count} active {count === 1 ? 'task' : 'tasks'}</Text>
                </View>
                <Text style={{ color: theme.colors.primary, fontSize: theme.typography.title }}>›</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
