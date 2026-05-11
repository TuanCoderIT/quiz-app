import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CategoryCardProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ label, icon, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white px-4 py-3 rounded-2xl mr-3 border border-gray-50 flex-row items-center shadow-sm"
    >
      <View className="w-8 h-8 rounded-lg bg-primary/5 items-center justify-center mr-3">
        <Ionicons name={icon} size={18} color="#4F46E5" />
      </View>
      <Text className="text-text-primary font-bold text-sm">
        {label}
      </Text>
    </TouchableOpacity>
  );
};
