import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '../theme';

type PillTabOption<T extends string> = {
  label: string;
  value: T;
};

type PillTabsProps<T extends string> = {
  options: PillTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export const PillTabs = <T extends string>({
  options,
  value,
  onChange,
}: PillTabsProps<T>) => {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <Pressable
            accessibilityRole="button"
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.tab, isActive && styles.activeTab]}
          >
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing[2],
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.54)',
    padding: Spacing[1],
  },
  tab: {
    minHeight: 40,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[3],
  },
  activeTab: {
    backgroundColor: Colors.white,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  activeLabel: {
    color: Colors.primary.DEFAULT,
  },
});
