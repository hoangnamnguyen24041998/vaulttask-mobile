import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/core/theme';

export const createStyles = (theme: AppTheme) => StyleSheet.create({
  content: { flexGrow: 1, padding: theme.spacing.lg, gap: theme.spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { flex: 1, color: theme.colors.text, fontSize: theme.typography.title, fontWeight: '800' },
  label: { color: theme.colors.muted, fontWeight: '700', fontSize: theme.typography.caption },
  input: { minHeight: 50, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radii.md, backgroundColor: theme.colors.surface, paddingHorizontal: theme.spacing.md, color: theme.colors.text },
  multiline: { minHeight: 120, paddingTop: theme.spacing.md, textAlignVertical: 'top' },
  error: { color: theme.colors.danger, fontSize: theme.typography.caption },
  delete: { color: theme.colors.danger, fontWeight: '700', fontSize: theme.typography.body, textAlign: 'center', padding: theme.spacing.md },
});
