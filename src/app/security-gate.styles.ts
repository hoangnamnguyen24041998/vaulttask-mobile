import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/core/theme';

export const createStyles = (theme: AppTheme) => StyleSheet.create({
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg, gap: theme.spacing.md },
  icon: { width: 88, height: 88, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radii.pill, backgroundColor: theme.colors.surfaceMuted },
  iconText: { color: theme.colors.primary, fontSize: 36 },
  title: { color: theme.colors.text, fontWeight: '800', fontSize: theme.typography.title, textAlign: 'center' },
  subtitle: { color: theme.colors.muted, fontSize: theme.typography.body, lineHeight: 24, textAlign: 'center', marginBottom: theme.spacing.md },
  error: { color: theme.colors.danger, textAlign: 'center', fontSize: theme.typography.caption },
});
