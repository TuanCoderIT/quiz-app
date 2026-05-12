import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface AchievementCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  index: number;
  className?: string;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ 
  label, 
  value, 
  icon, 
  color,
  index,
  className = ''
}) => {
  return (
    <Animated.View 
      entering={FadeInUp.delay(index * 100).duration(500)}
      className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-50 ${className}`}
    >
      <View 
        className="w-10 h-10 rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: `${color}15` }}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="text-text-primary text-lg font-bold">
        {value}
      </Text>
      <Text className="text-text-secondary text-xs font-medium mt-0.5">
        {label}
      </Text>
    </Animated.View>
  );
};

export default AchievementCard;
