import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Text } from 'react-native';

import { ActionButton } from '@/components/ActionButton';
import { NetworkStatusBanner } from '@/components/NetworkStatusBanner';
import { ScrollPage } from '@/components/Screen';
import { useAppTheme, useAuth } from '@/contexts/AppProviders';
import { OutboxEntry } from '@/core/database';
import { forceSync, getLastSyncAt } from '@/core/dataService';
import { useDatabaseRecords } from '@/hooks/useDatabaseRecords';
import { createStyles } from '@/app/sync-settings.styles';

export function SyncSettingsModal() {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { session } = useAuth();
  const outbox = useDatabaseRecords<OutboxEntry>('sync_outbox');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState(getLastSyncAt());

  const synchronize = async () => {
    setBusy(true);
    setError('');
    try {
      await forceSync(session?.remoteEnabled ? session.uid : undefined);
      setLastSync(getLastSyncAt());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Sync failed. Pending changes were kept.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollPage contentContainerStyle={styles.content}>
      <NetworkStatusBanner />
      <Text style={styles.heading}>Sync diagnostics</Text>
      <Text style={styles.hint}>Local writes are persisted first. Failed remote writes remain in the outbox for a later retry.</Text>
      <Text style={styles.label}>Pending outbox operations</Text>
      <Text accessibilityLabel={`${outbox.length} pending operations`} style={styles.value}>{outbox.length}</Text>
      <Text style={styles.label}>Last successful sync</Text>
      <Text style={styles.value}>{lastSync ? new Date(lastSync).toLocaleString() : 'Never'}</Text>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <ActionButton busy={busy} label="Force sync now" onPress={() => void synchronize()} />
      <ActionButton label="Close" onPress={() => router.back()} secondary />
    </ScrollPage>
  );
}
