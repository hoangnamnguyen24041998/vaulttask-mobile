import type Model from '@nozbe/watermelondb/Model';
import { useEffect, useState } from 'react';

import { database } from '@/core/database';

export function useDatabaseRecords<T extends Model>(table: string): T[] {
  const [records, setRecords] = useState<T[]>([]);
  useEffect(() => {
    const subscription = database.get<T>(table).query().observe().subscribe(setRecords);
    return () => subscription.unsubscribe();
  }, [table]);
  return records;
}
