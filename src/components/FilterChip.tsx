import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, active, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`px-6 py-2.5 rounded-full mr-2.5 border ${
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
    </TouchableOpacity>
  );
};
