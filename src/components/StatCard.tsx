import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Spacing } from '../theme';
import { GlassCard } from './GlassCard';

type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
};

export const StatCard = ({
  label,
  value,
  helper,
  accentColor = Colors.primary.DEFAULT,
  style,
}: StatCardProps) => {
  return (
    <GlassCard style={style} contentStyle={styles.content}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: Spacing[2],
    padding: Spacing[5],
  },
  accent: {
    height: 3,
    width: 32,
    borderRadius: 999,
  },
  label: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
  },
  value: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  helper: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
});
