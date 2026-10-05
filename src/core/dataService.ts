import { randomUUID } from 'expo-crypto';
import { Q } from '@nozbe/watermelondb';
import NetInfo from '@react-native-community/netinfo';
import {
  collection,
  doc,
  onSnapshot,
  query,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';

import { auth, firebaseConfigured, firestore } from '@/core/firebase';
import {
  database,
  OutboxEntry,
  Task,
  Workspace,
  type OutboxOperation,
  type TaskStatus,
} from '@/core/database';
import { appStorage, storageKeys } from '@/core/storage';

interface WorkspacePayload {
  id: string;
  name: string;
  color: string;
  updatedAt: number;
}

interface TaskPayload {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueAt: number | null;
  updatedAt: number;
}

async function enqueue(
  entityType: 'workspace' | 'task',
  entityId: string,
  operation: OutboxOperation,
  payload: WorkspacePayload | TaskPayload | null,
): Promise<void> {
  await database.get<OutboxEntry>('sync_outbox').create(entry => {
    entry._setRaw('entity_id', entityId);
    entry._setRaw('entity_type', entityType);
    entry._setRaw('operation', operation);
    entry._setRaw('payload', JSON.stringify(payload));
    entry._setRaw('created_at', Date.now());
  });
}

export async function ensureDefaultWorkspace(): Promise<void> {
  const workspaces = database.get<Workspace>('workspaces');
  const existing = await workspaces.query().fetchCount();
  if (existing > 0) return;

  await database.write(async () => {
    const workspace = await workspaces.create(record => {
      record.name = 'Personal workspace';
      record.color = '#6C4DE6';
      record._setRaw('updated_at', Date.now());
    });
    await enqueue('workspace', workspace.id, 'set', {
      id: workspace.id,
      name: workspace.name,
      color: workspace.color,
      updatedAt: workspace.updatedAt,
    });
  });
}

export async function addTask(workspaceId: string, title: string): Promise<void> {
  const cleanTitle = title.trim();
  if (!cleanTitle) throw new Error('A task title is required.');

  await database.write(async () => {
    const task = await database.get<Task>('tasks').create(record => {
      record.workspaceId = workspaceId;
      record.title = cleanTitle;
      record.description = '';
      record.status = 'todo';
      record.dueAt = null;
      record.updatedAt = Date.now();
    });
    await enqueue('task', task.id, 'set', taskToPayload(task));
  });
}

export async function updateTask(
  taskId: string,
  patch: Partial<Pick<Task, 'title' | 'description' | 'status' | 'dueAt'>>,
): Promise<void> {
  if (patch.title !== undefined && !patch.title.trim()) {
    throw new Error('A task title is required.');
  }
  await database.write(async () => {
    const task = await database.get<Task>('tasks').find(taskId);
    await task.update(record => {
      if (patch.title !== undefined) record.title = patch.title.trim();
      if (patch.description !== undefined) record.description = patch.description;
      if (patch.status !== undefined) record.status = patch.status;
      if (patch.dueAt !== undefined) record.dueAt = patch.dueAt;
      record.updatedAt = Date.now();
    });
    await enqueue('task', task.id, 'set', taskToPayload(task));
  });
}

export async function deleteTask(taskId: string): Promise<void> {
  await database.write(async () => {
    const task = await database.get<Task>('tasks').find(taskId);
    await enqueue('task', task.id, 'delete', null);
    await task.destroyPermanently();
  });
}

function taskToPayload(task: Task): TaskPayload {
  return {
    id: task.id,
    workspaceId: task.workspaceId,
    title: task.title,
    description: task.description,
    status: task.status,
    dueAt: task.dueAt,
    updatedAt: task.updatedAt,
  };
}

export async function getOutboxCount(): Promise<number> {
  return database.get<OutboxEntry>('sync_outbox').query().fetchCount();
}

export function getLastSyncAt(): number | null {
  return appStorage.getNumber(storageKeys.lastSyncAt) ?? null;
}

export async function forceSync(uid?: string): Promise<void> {
  if (!firestore || !uid) throw new Error('Cloud sync is unavailable until Firebase is configured and signed in.');

  const outbox = await database
    .get<OutboxEntry>('sync_outbox')
    .query(Q.sortBy('created_at', Q.asc))
    .fetch();

  for (let offset = 0; offset < outbox.length; offset += 450) {
    const chunk = outbox.slice(offset, offset + 450);
    const batch = writeBatch(firestore);
    for (const entry of chunk) {
      const path = entry.entityType === 'workspace' ? 'workspaces' : 'tasks';
      const reference = doc(firestore, 'users', uid, path, entry.entityId);
      if (entry.operation === 'delete') {
        batch.delete(reference);
      } else {
        const payload: unknown = JSON.parse(entry.payload);
        batch.set(reference, payload);
      }
    }
    await batch.commit();
    await database.write(async () => {
      await database.batch(...chunk.map(entry => entry.prepareDestroyPermanently()));
    });
  }

  appStorage.set(storageKeys.lastSyncAt, Date.now());
}

export function subscribeToRemoteChanges(uid: string): Unsubscribe | null {
  if (!firestore) return null;

  const taskQuery = query(collection(firestore, 'users', uid, 'tasks'));
  const workspaceQuery = query(collection(firestore, 'users', uid, 'workspaces'));
  const unsubscribeTasks = onSnapshot(
    taskQuery,
    snapshot => {
      void database.write(async () => {
        const outbox = await database.get<OutboxEntry>('sync_outbox').query().fetch();
        const pendingIds = new Set(outbox.map(entry => entry.entityId));
        const tasks = database.get<Task>('tasks');
        for (const change of snapshot.docChanges()) {
          const remoteId = change.doc.id;
          if (pendingIds.has(remoteId)) continue;
          const local = await tasks.query(Q.where('id', remoteId)).fetch();
          if (change.type === 'removed') {
            if (local.length) await local[0].destroyPermanently();
            continue;
          }
          const value = change.doc.data() as TaskPayload;
          if (local.length) {
            await local[0].update(record => {
              record.workspaceId = value.workspaceId;
              record.title = value.title;
              record.description = value.description ?? '';
              record.status = value.status;
              record.dueAt = value.dueAt ?? null;
              record.updatedAt = value.updatedAt ?? Date.now();
            });
          } else {
            await tasks.create(record => {
              record._raw.id = remoteId;
              record.workspaceId = value.workspaceId;
              record.title = value.title;
              record.description = value.description ?? '';
              record.status = value.status;
              record.dueAt = value.dueAt ?? null;
              record.updatedAt = value.updatedAt ?? Date.now();
            });
          }
        }
      }).catch(error => console.error('Failed to apply realtime task updates.', error));
    },
    error => console.error('Realtime task sync failed.', error),
  );
  const unsubscribeWorkspaces = onSnapshot(
    workspaceQuery,
    snapshot => {
      void database.write(async () => {
        const outbox = await database.get<OutboxEntry>('sync_outbox').query().fetch();
        const pendingIds = new Set(outbox.map(entry => entry.entityId));
        const workspaces = database.get<Workspace>('workspaces');
        for (const change of snapshot.docChanges()) {
          const remoteId = change.doc.id;
          if (pendingIds.has(remoteId)) continue;
          const local = await workspaces.query(Q.where('id', remoteId)).fetch();
          if (change.type === 'removed') {
            if (local.length) await local[0].destroyPermanently();
            continue;
          }
          const value = change.doc.data() as WorkspacePayload;
          if (local.length) {
            await local[0].update(record => {
              record.name = value.name;
              record.color = value.color;
              record._setRaw('updated_at', value.updatedAt ?? Date.now());
            });
          } else {
            await workspaces.create(record => {
              record._raw.id = remoteId;
              record.name = value.name;
              record.color = value.color;
              record._setRaw('updated_at', value.updatedAt ?? Date.now());
            });
          }
        }
      }).catch(error => console.error('Failed to apply realtime workspace updates.', error));
    },
    error => console.error('Realtime workspace sync failed.', error),
  );

  return () => {
    unsubscribeTasks();
    unsubscribeWorkspaces();
  };
}

export async function purgeLocalDatabase(): Promise<void> {
  await database.unsafeResetDatabase();
}

export async function createGuestIdentity(): Promise<{
  uid: string;
  isAnonymous: true;
  email: null;
  remoteEnabled: boolean;
}> {
  const network = await NetInfo.fetch();
  if (auth && firebaseConfigured && network.isConnected && network.isInternetReachable !== false) {
    const { signInAnonymously } = await import('firebase/auth');
    const result = await signInAnonymously(auth);
    return { uid: result.user.uid, isAnonymous: true, email: null, remoteEnabled: true };
  }
  return { uid: randomUUID(), isAnonymous: true, email: null, remoteEnabled: false };
}

export async function setWorkspaceName(workspaceId: string, name: string): Promise<void> {
  await database.write(async () => {
    const workspace = await database.get<Workspace>('workspaces').find(workspaceId);
    await workspace.update(record => {
      record.name = name.trim();
      record._setRaw('updated_at', Date.now());
    });
    await enqueue('workspace', workspace.id, 'set', {
      id: workspace.id,
      name: workspace.name,
      color: workspace.color,
      updatedAt: workspace.updatedAt,
    });
  });
}
