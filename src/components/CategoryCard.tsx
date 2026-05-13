import React from 'react';
import { StyleProp, StyleSheet, View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CategoryCardProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  label,
  icon,
  onPress,
  active,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.card, active && styles.activeCard, style]}
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1.5,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 6,
  },
  activeCard: {
    backgroundColor: 'rgba(79,70,229,0.94)',
    borderColor: 'rgba(255,255,255,0.68)',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.32,
  },
});
