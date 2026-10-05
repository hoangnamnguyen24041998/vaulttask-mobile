import { appSchema, Database, tableSchema } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import Model from '@nozbe/watermelondb/Model';
import { Platform } from 'react-native';

export type TaskStatus = 'todo' | 'doing' | 'done';
export type OutboxOperation = 'set' | 'delete';

export class Workspace extends Model {
  static table = 'workspaces';
  get name(): string { return this._getRaw('name') as string; }
  set name(value: string) { this._setRaw('name', value); }
  get color(): string { return this._getRaw('color') as string; }
  set color(value: string) { this._setRaw('color', value); }
  get updatedAt(): number { return this._getRaw('updated_at') as number; }
}

export class Task extends Model {
  static table = 'tasks';
  get workspaceId(): string { return this._getRaw('workspace_id') as string; }
  set workspaceId(value: string) { this._setRaw('workspace_id', value); }
  get title(): string { return this._getRaw('title') as string; }
  set title(value: string) { this._setRaw('title', value); }
  get description(): string { return this._getRaw('description') as string; }
  set description(value: string) { this._setRaw('description', value); }
  get status(): TaskStatus { return this._getRaw('status') as TaskStatus; }
  set status(value: TaskStatus) { this._setRaw('status', value); }
  get dueAt(): number | null { return this._getRaw('due_at') as number | null; }
  set dueAt(value: number | null) { this._setRaw('due_at', value); }
  get updatedAt(): number { return this._getRaw('updated_at') as number; }
  set updatedAt(value: number) { this._setRaw('updated_at', value); }
}

export class OutboxEntry extends Model {
  static table = 'sync_outbox';
  get entityId(): string { return this._getRaw('entity_id') as string; }
  get entityType(): string { return this._getRaw('entity_type') as string; }
  get operation(): OutboxOperation { return this._getRaw('operation') as OutboxOperation; }
  get payload(): string { return this._getRaw('payload') as string; }
  get createdAt(): number { return this._getRaw('created_at') as number; }
}

const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'workspaces',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'workspace_id', type: 'string', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'due_at', type: 'number', isOptional: true },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'sync_outbox',
      columns: [
        { name: 'entity_id', type: 'string', isIndexed: true },
        { name: 'entity_type', type: 'string' },
        { name: 'operation', type: 'string' },
        { name: 'payload', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
});

const adapter = Platform.OS === 'web'
  ? new LokiJSAdapter({ schema, useWebWorker: false })
  : new SQLiteAdapter({ schema, jsi: true, onSetUpError: error => console.error('Database setup failed', error) });

export const database = new Database({
  adapter,
  modelClasses: [Workspace, Task, OutboxEntry],
});
