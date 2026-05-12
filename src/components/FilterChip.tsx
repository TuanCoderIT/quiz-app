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
      style={({ pressed }) => [
        styles.chip,
        active ? styles.activeChip : styles.inactiveChip,
        pressed ? styles.pressedChip : null,
      ]}
    >
      <Text style={[styles.label, active ? styles.activeLabel : styles.inactiveLabel]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  activeChip: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
    elevation: 2,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
  },
  inactiveChip: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F3F4F6',
  },
  pressedChip: {
    opacity: 0.82,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  activeLabel: {
    color: '#FFFFFF',
  },
  inactiveLabel: {
    color: '#64748B',
  },
});
