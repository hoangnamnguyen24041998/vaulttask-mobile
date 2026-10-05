import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import { ActionButton } from '@/components/ActionButton';
import { NetworkStatusBanner } from '@/components/NetworkStatusBanner';
import { ScrollPage } from '@/components/Screen';
import { useAppTheme } from '@/contexts/AppProviders';
import { Task, type TaskStatus } from '@/core/database';
import { deleteTask, updateTask } from '@/core/dataService';
import { useDatabaseRecords } from '@/hooks/useDatabaseRecords';
import { createStyles } from '@/app/task-detail.styles';

export function TaskDetailModal() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const task = useDatabaseRecords<Task>('tasks').find(item => item.id === taskId);
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!task) {
    return (
      <ScrollPage contentContainerStyle={styles.content}>
        <Text style={styles.error}>This task is no longer available.</Text>
        <ActionButton label="Close" onPress={() => router.back()} />
      </ScrollPage>
    );
  }
  return <TaskEditor key={task.id} task={task} />;
}

function TaskEditor({ task }: { task: Task }) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(task.dueAt ? new Date(task.dueAt).toISOString().slice(0, 10) : '');
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [error, setError] = useState('');

  const save = async () => {
    setError('');
    let dueAt: number | null = null;
    if (dueDate.trim()) {
      const parsed = Date.parse(`${dueDate.trim()}T12:00:00`);
      if (Number.isNaN(parsed)) {
        setError('Enter a valid date using YYYY-MM-DD.');
        return;
      }
      dueAt = parsed;
    }
    try {
      await updateTask(task.id, { title, description, status, dueAt });
      router.back();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save the task.');
    }
  };

  const remove = () => Alert.alert(
    'Delete task?',
    'This task will be removed from this device and queued for sync.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteTask(task.id).then(() => router.back()).catch(cause =>
            setError(cause instanceof Error ? cause.message : 'Unable to delete the task.'));
        },
      },
    ],
  );

  return (
    <ScrollPage contentContainerStyle={styles.content}>
      <NetworkStatusBanner />
      <View style={styles.header}>
        <Text style={styles.title}>Task details</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Close task details" onPress={() => router.back()}>
          <Text style={{ color: theme.colors.primary, fontSize: theme.typography.body, fontWeight: '700' }}>Close</Text>
        </Pressable>
      </View>
      <Text style={styles.label}>Title</Text>
      <TextInput accessibilityLabel="Task title" onChangeText={setTitle} style={styles.input} value={title} />
      <Text style={styles.label}>Notes</Text>
      <TextInput accessibilityLabel="Task notes" multiline onChangeText={setDescription} style={[styles.input, styles.multiline]} value={description} />
      <Text style={styles.label}>Due date (YYYY-MM-DD)</Text>
      <TextInput accessibilityLabel="Due date" onChangeText={setDueDate} placeholder="2026-12-31" placeholderTextColor={theme.colors.muted} style={styles.input} value={dueDate} />
      <Text style={styles.label}>Status</Text>
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        {([
          ['todo', 'To do'],
          ['doing', 'In progress'],
          ['done', 'Done'],
        ] as const).map(([value, label]) => (
          <Pressable key={value} onPress={() => setStatus(value)} style={{ flex: 1, padding: theme.spacing.sm, borderRadius: theme.radii.md, backgroundColor: status === value ? theme.colors.primary : theme.colors.surfaceMuted, alignItems: 'center' }}>
            <Text style={{ color: status === value ? theme.colors.primaryText : theme.colors.text, fontSize: theme.typography.caption }}>{label}</Text>
          </Pressable>
        ))}
      </View>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <ActionButton label="Save changes" onPress={() => void save()} />
      <Pressable accessibilityRole="button" onPress={remove}><Text style={styles.delete}>Delete task</Text></Pressable>
    </ScrollPage>
  );
}
