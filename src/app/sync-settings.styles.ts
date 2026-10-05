import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/core/theme';

export const createStyles = (theme: AppTheme) => StyleSheet.create({
  content: { flexGrow: 1, padding: theme.spacing.lg, gap: theme.spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { color: theme.colors.text, fontSize: theme.typography.title, fontWeight: '800' },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.md, gap: theme.spacing.xs },
  label: { color: theme.colors.muted, fontSize: theme.typography.caption, fontWeight: '700' },
  value: { color: theme.colors.text, fontSize: theme.typography.subtitle, fontWeight: '700' },
  hint: { color: theme.colors.muted, fontSize: theme.typography.caption, lineHeight: 18 },
  error: { color: theme.colors.danger, fontSize: theme.typography.caption },
});
