import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, active, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.chip, active && styles.activeChip]}
    >
      <Text style={[styles.text, active && styles.activeText]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  text: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  activeText: {
    color: '#FFFFFF',
  },
});
