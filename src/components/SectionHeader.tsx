import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '../theme';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

export const SectionHeader = ({ title, subtitle, right }: SectionHeaderProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[4],
  },
  copy: {
    flex: 1,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 25,
  },
  subtitle: {
    marginTop: Spacing[1.5],
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  right: {
    flexShrink: 0,
  },
});
