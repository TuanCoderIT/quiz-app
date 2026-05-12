import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CategoryCardProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  active?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ label, icon, onPress, active }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`px-4 py-3 rounded-2xl mr-3 flex-row items-center shadow-sm border ${
        active ? 'bg-primary border-primary' : 'bg-white border-gray-50'
      }`}
    >
      <View className={`w-8 h-8 rounded-lg items-center justify-center mr-3 ${
        active ? 'bg-white/20' : 'bg-primary/5'
      }`}>
        <Ionicons name={icon} size={18} color={active ? '#FFFFFF' : '#4F46E5'} />
      </View>
      <Text className={`font-bold text-sm ${
        active ? 'text-white' : 'text-text-primary'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};
