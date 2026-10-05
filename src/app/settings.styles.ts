import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/core/theme';

export const createStyles = (theme: AppTheme) => StyleSheet.create({
  content: { padding: theme.spacing.lg, gap: theme.spacing.md },
  heading: { color: theme.colors.text, fontSize: theme.typography.title, fontWeight: '800' },
  section: { color: theme.colors.muted, fontSize: theme.typography.caption, fontWeight: '800', textTransform: 'uppercase', marginTop: theme.spacing.md },
  row: { minHeight: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.md, backgroundColor: theme.colors.surface, borderRadius: theme.radii.md, borderColor: theme.colors.border, borderWidth: 1, gap: theme.spacing.md },
  rowLabel: { color: theme.colors.text, fontSize: theme.typography.body, fontWeight: '600', flex: 1 },
  rowHint: { color: theme.colors.muted, fontSize: theme.typography.caption },
});
