import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, color, className = '' }) => {
  return (
    <View 
      className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-50 mr-3 w-32 ${className}`}
    >
      <View 
        className="w-10 h-10 rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: `${color}15` }}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="text-text-primary text-xl font-bold mb-1">
        {value}
      </Text>
      <Text className="text-text-secondary text-xs font-medium">
        {label}
      </Text>
    </View>
  );
};
