import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '../theme';

type BadgeVariant = 'ai' | 'premium' | 'success' | 'warning' | 'error' | 'neutral';

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
};

const badgeVariants = {
  ai: {
    backgroundColor: 'rgba(6,182,212,0.12)',
    borderColor: 'rgba(6,182,212,0.24)',
    color: Colors.secondary[600],
  },
  premium: {
    backgroundColor: 'rgba(124,58,237,0.1)',
    borderColor: 'rgba(124,58,237,0.18)',
    color: Colors.premium.DEFAULT,
  },
  success: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderColor: 'rgba(16,185,129,0.18)',
    color: Colors.success,
  },
  warning: {
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderColor: 'rgba(245,158,11,0.2)',
    color: Colors.warning,
  },
  error: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.18)',
    color: Colors.error,
  },
  neutral: {
    backgroundColor: 'rgba(255,255,255,0.64)',
    borderColor: 'rgba(148,163,184,0.22)',
    color: Colors.textSecondary,
  },
} as const;

export const Badge = ({ label, variant = 'neutral' }: BadgeProps) => {
  const variantStyles = badgeVariants[variant];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
        },
      ]}
    >
      <Text style={[styles.label, { color: variantStyles.color }]}>{label}</Text>
    </View>
  );
};

export const AIChip = ({ label = 'AI' }: Partial<BadgeProps>) => (
  <Badge label={label} variant="ai" />
);

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
  },
});
