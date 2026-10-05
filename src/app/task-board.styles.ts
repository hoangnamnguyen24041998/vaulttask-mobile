import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/core/theme';

export const createStyles = (theme: AppTheme) => StyleSheet.create({
  content: { flex: 1, padding: theme.spacing.md, gap: theme.spacing.md },
  heading: { color: theme.colors.text, fontSize: theme.typography.title, fontWeight: '800' },
  row: { flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'center' },
  input: { flex: 1, minHeight: 50, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radii.md, backgroundColor: theme.colors.surface, paddingHorizontal: theme.spacing.md, color: theme.colors.text },
  addButton: { minWidth: 54, minHeight: 50, borderRadius: theme.radii.md, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radii.md, padding: theme.spacing.md, gap: theme.spacing.sm },
  title: { color: theme.colors.text, fontWeight: '700', fontSize: theme.typography.body },
  meta: { color: theme.colors.muted, fontSize: theme.typography.caption },
  section: { color: theme.colors.muted, fontWeight: '700', fontSize: theme.typography.caption, textTransform: 'uppercase', marginTop: theme.spacing.sm },
  filter: { borderRadius: theme.radii.pill, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, backgroundColor: theme.colors.surfaceMuted },
  lane: { width: 260, gap: theme.spacing.sm, padding: theme.spacing.sm, backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radii.md },
});
