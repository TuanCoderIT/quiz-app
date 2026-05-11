import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuizCardProps {
  title: string;
  category: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  questionCount: number;
  onPress?: () => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ 
  title, 
  category, 
  difficulty, 
  questionCount,
  onPress 
}) => {
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'Dễ': return 'text-success bg-success/10';
      case 'Trung bình': return 'text-warning bg-warning/10';
      case 'Khó': return 'text-error bg-error/10';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4 flex-row items-center"
    >
      <View className="w-14 h-14 bg-primary/10 rounded-xl items-center justify-center mr-4">
        <Ionicons name="document-text-outline" size={28} color="#4F46E5" />
      </View>
      
      <View className="flex-1">
        <Text className="text-text-primary text-lg font-bold mb-1" numberOfLines={1}>
          {title}
        </Text>
        
        <View className="flex-row items-center">
          <Text className="text-text-secondary text-sm mr-3">
            {category}
          </Text>
          <View className="w-1 h-1 bg-gray-300 rounded-full mr-3" />
          <Text className="text-text-secondary text-sm">
            {questionCount} câu hỏi
          </Text>
        </View>
      </View>

      <View className={`px-2 py-1 rounded-lg ${getDifficultyColor()}`}>
        <Text className="text-xs font-bold">
          {difficulty}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
