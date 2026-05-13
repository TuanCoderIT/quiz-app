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
      className={`min-h-10 px-6 py-2.5 rounded-full mr-2.5 mb-2.5 border items-center justify-center ${
        active
          ? 'bg-primary border-primary shadow-sm shadow-primary/20'
          : 'bg-white border-gray-100'
      }`}
    >
      <Text
        className={`text-sm font-bold ${
          active ? 'text-white' : 'text-text-secondary'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    backgroundColor: 'rgba(255,255,255,0.36)',
    borderColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1.5,
  },
  activeChip: {
    backgroundColor: 'rgba(79,70,229,0.92)',
    borderColor: 'rgba(255,255,255,0.68)',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.34,
    shadowRadius: 28,
    elevation: 7,
  },
});
