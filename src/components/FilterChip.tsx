import React from 'react';
import { Pressable, Text } from 'react-native';

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
      className={`min-h-10 px-6 py-2.5 rounded-full mr-2.5 border items-center justify-center ${
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
