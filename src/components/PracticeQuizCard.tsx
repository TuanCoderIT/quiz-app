import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PracticeQuizCardProps {
  title: string;
  description: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  questionCount: number;
  timeEstimate: string;
  onPress?: () => void;
}

export const PracticeQuizCard: React.FC<PracticeQuizCardProps> = ({
  title,
  description,
  difficulty,
  questionCount,
  timeEstimate,
  onPress
}) => {
  const getDifficultyStyles = () => {
    switch (difficulty) {
      case 'Dễ': return { text: '#10B981', bg: '#10B98115' };
      case 'Trung bình': return { text: '#F59E0B', bg: '#F59E0B15' };
      case 'Khó': return { text: '#EF4444', bg: '#EF444415' };
      default: return { text: '#64748B', bg: '#F1F5F9' };
    }
  };

  const styles = getDifficultyStyles();

  return (
    <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-5">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-2">
          <Text className="text-text-primary text-xl font-bold mb-1">
            {title}
          </Text>
          <Text className="text-text-secondary text-sm leading-5" numberOfLines={2}>
            {description}
          </Text>
        </View>
        <View 
          className="px-3 py-1.5 rounded-xl"
          style={{ backgroundColor: styles.bg }}
        >
          <Text className="font-bold text-xs" style={{ color: styles.text }}>
            {difficulty}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mb-6">
        <View className="flex-row items-center mr-5">
          <Ionicons name="help-circle-outline" size={16} color="#94A3B8" />
          <Text className="text-text-secondary text-sm ml-1.5">{questionCount} câu hỏi</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={16} color="#94A3B8" />
          <Text className="text-text-secondary text-sm ml-1.5">{timeEstimate}</Text>
        </View>
      </View>

      <TouchableOpacity 
        onPress={onPress}
        activeOpacity={0.8}
        className="bg-primary/5 py-3.5 rounded-2xl flex-row items-center justify-center border border-primary/10"
      >
        <Text className="text-primary font-bold mr-2 text-base">Bắt đầu ngay</Text>
        <Ionicons name="chevron-forward" size={18} color="#4F46E5" />
      </TouchableOpacity>
    </View>
  );
};
