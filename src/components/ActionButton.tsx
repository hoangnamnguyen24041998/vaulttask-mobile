import React from 'react';
import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

import { useAppTheme } from '@/contexts/AppProviders';

interface ActionButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  busy?: boolean;
  secondary?: boolean;
}

export function ActionButton({ label, busy, secondary, disabled, ...props }: ActionButtonProps) {
  const { theme } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || busy}
      style={({ pressed }) => [
        {
          minHeight: 52,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radii.md,
          backgroundColor: secondary ? theme.colors.surfaceMuted : theme.colors.primary,
          opacity: pressed || disabled ? 0.72 : 1,
        },
      ]}
      {...props}
    >
      {busy ? (
        <ActivityIndicator color={secondary ? theme.colors.text : theme.colors.primaryText} />
      ) : (
        <Text
          style={{
            color: secondary ? theme.colors.text : theme.colors.primaryText,
            fontWeight: '700',
            fontSize: theme.typography.body,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
