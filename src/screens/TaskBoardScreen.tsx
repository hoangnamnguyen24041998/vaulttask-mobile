import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { NetworkStatusBanner } from '@/components/NetworkStatusBanner';
import { Page } from '@/components/Screen';
import { useAppTheme } from '@/contexts/AppProviders';
import { Task, Workspace, type TaskStatus } from '@/core/database';
import { addTask, updateTask } from '@/core/dataService';
import { useDatabaseRecords } from '@/hooks/useDatabaseRecords';
import { createStyles } from '@/app/task-board.styles';

const statusOrder: TaskStatus[] = ['todo', 'doing', 'done'];
const labels: Record<TaskStatus, string> = { todo: 'To do', doing: 'In progress', done: 'Done' };

export function TaskBoardScreen() {
  const { workspaceId } = useLocalSearchParams<{ workspaceId: string }>();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState<'all' | TaskStatus>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const tasks = useDatabaseRecords<Task>('tasks').filter(task => task.workspaceId === workspaceId);
  const workspace = useDatabaseRecords<Workspace>('workspaces').find(item => item.id === workspaceId);

  const createTask = async () => {
    try {
      await addTask(workspaceId, title);
      setTitle('');
    } catch (error) {
      Alert.alert('Could not add task', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const visible = filter === 'all' ? tasks : tasks.filter(task => task.status === filter);
  const renderTask = (item: Task) => (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/task/[taskId]', params: { taskId: item.id } })}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.76 : 1 }]}
    >
      <View style={styles.row}>
        <Pressable
          accessibilityLabel={item.status === 'done' ? 'Mark task incomplete' : 'Mark task complete'}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: item.status === 'done' }}
          onPress={() => {
            const next = item.status === 'done' ? 'todo' : 'done';
            void updateTask(item.id, { status: next }).catch(error => Alert.alert('Update failed', String(error)));
          }}
          style={{ width: 26, height: 26, borderWidth: 2, borderColor: item.status === 'done' ? theme.colors.primary : theme.colors.border, borderRadius: theme.radii.sm, alignItems: 'center', justifyContent: 'center' }}
        >
          {item.status === 'done' ? <Text style={{ color: theme.colors.primary, fontWeight: '800' }}>✓</Text> : null}
        </Pressable>
        <View style={{ flex: 1, gap: theme.spacing.xs }}>
          <Text style={[styles.title, item.status === 'done' && { textDecorationLine: 'line-through', color: theme.colors.muted }]}>{item.title}</Text>
          {item.dueAt ? <Text style={styles.meta}>Due {new Date(item.dueAt).toLocaleDateString()}</Text> : null}
        </View>
        <Text style={{ color: theme.colors.muted, fontSize: theme.typography.title }}>›</Text>
      </View>
    </Pressable>
  );

  return (
    <Page>
      <NetworkStatusBanner />
      <View style={styles.content}>
        <Text style={styles.heading}>{workspace?.name ?? 'Task board'}</Text>
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>‹ Workspaces</Text>
        </Pressable>
        <View style={styles.row}>
          <TextInput
            accessibilityLabel="New task"
            onChangeText={setTitle}
            onSubmitEditing={() => void createTask()}
            placeholder="Add a task…"
            placeholderTextColor={theme.colors.muted}
            returnKeyType="done"
            style={styles.input}
            value={title}
          />
          <Pressable accessibilityLabel="Add task" accessibilityRole="button" onPress={() => void createTask()} style={styles.addButton}>
            <Text style={{ color: theme.colors.primaryText, fontSize: 24, fontWeight: '700' }}>+</Text>
          </Pressable>
        </View>
        <View style={styles.row}>
          {(['list', 'kanban'] as const).map(mode => (
            <Pressable key={mode} accessibilityRole="button" onPress={() => setViewMode(mode)} style={[styles.filter, viewMode === mode && { backgroundColor: theme.colors.primary }]}>
              <Text style={{ color: viewMode === mode ? theme.colors.primaryText : theme.colors.text, fontSize: theme.typography.caption, fontWeight: '700' }}>
                {mode === 'list' ? 'List' : 'Kanban'}
              </Text>
            </Pressable>
          ))}
          {viewMode === 'list' && (['all', ...statusOrder] as const).map(status => (
            <Pressable key={status} accessibilityRole="button" onPress={() => setFilter(status)} style={[styles.filter, filter === status && { backgroundColor: theme.colors.primary }]}>
              <Text style={{ color: filter === status ? theme.colors.primaryText : theme.colors.text, fontSize: theme.typography.caption, fontWeight: '700' }}>
                {status === 'all' ? 'All' : labels[status]}
              </Text>
            </Pressable>
          ))}
        </View>
        {viewMode === 'list' ? (
          <FlatList
            contentContainerStyle={{ gap: theme.spacing.sm, paddingBottom: theme.spacing.lg }}
            data={visible}
            keyboardShouldPersistTaps="handled"
            keyExtractor={item => item.id}
            ListEmptyComponent={<Text style={styles.meta}>No tasks here yet. Add one above.</Text>}
            renderItem={({ item, index }) => (
              <View>
                {(filter === 'all' && (index === 0 || visible[index - 1]?.status !== item.status)) && (
                  <Text style={styles.section}>{labels[item.status]}</Text>
                )}
                {renderTask(item)}
              </View>
            )}
          />
        ) : (
          <ScrollView horizontal contentContainerStyle={{ gap: theme.spacing.sm, paddingBottom: theme.spacing.lg }} showsHorizontalScrollIndicator={false}>
            {statusOrder.map(status => (
              <View key={status} style={styles.lane}>
                <Text style={styles.section}>{labels[status]} · {tasks.filter(task => task.status === status).length}</Text>
                <ScrollView contentContainerStyle={{ gap: theme.spacing.sm }}>
                  {tasks.filter(task => task.status === status).map(task => <View key={task.id}>{renderTask(task)}</View>)}
                </ScrollView>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </Page>
  );
}
