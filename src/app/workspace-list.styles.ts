import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/core/theme';

export const createStyles = (theme: AppTheme) => StyleSheet.create({
  content: { padding: theme.spacing.lg, gap: theme.spacing.md },
  heading: { color: theme.colors.text, fontSize: theme.typography.title, fontWeight: '800' },
  subheading: { color: theme.colors.muted, fontSize: theme.typography.body },
  card: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radii.lg, padding: theme.spacing.lg, gap: theme.spacing.sm },
  workspaceName: { color: theme.colors.text, fontSize: theme.typography.subtitle, fontWeight: '700' },
  metadata: { color: theme.colors.muted, fontSize: theme.typography.caption },
});
