import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/core/theme';

export const createStyles = (theme: AppTheme) => StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', padding: theme.spacing.lg, gap: theme.spacing.md },
  brandMark: { width: 56, height: 56, borderRadius: theme.radii.lg, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  markText: { color: theme.colors.primaryText, fontSize: theme.typography.title, fontWeight: '800' },
  eyebrow: { color: theme.colors.primary, fontWeight: '700', fontSize: theme.typography.caption, letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { color: theme.colors.text, fontSize: theme.typography.display, fontWeight: '800' },
  subtitle: { color: theme.colors.muted, fontSize: theme.typography.body, lineHeight: 24, marginBottom: theme.spacing.md },
  label: { color: theme.colors.text, fontSize: theme.typography.caption, fontWeight: '700', marginBottom: theme.spacing.xs },
  input: { minHeight: 52, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radii.md, backgroundColor: theme.colors.surface, paddingHorizontal: theme.spacing.md, color: theme.colors.text, fontSize: theme.typography.body },
  footnote: { color: theme.colors.muted, fontSize: theme.typography.caption, textAlign: 'center', lineHeight: 18 },
  error: { color: theme.colors.danger, fontSize: theme.typography.caption },
});
