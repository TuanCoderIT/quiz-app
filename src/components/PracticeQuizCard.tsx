import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface PracticeQuizCardProps {
  id: string | number;
  title: string;
  description: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  questionCount: number;
  timeEstimate: string;
  onPress?: () => void;
}

export const PracticeQuizCard: React.FC<PracticeQuizCardProps> = ({
  id,
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

  const difficultyStyles = getDifficultyStyles();

  return (
    <View style={styles.card} className="p-5 rounded-3xl border shadow-sm mb-5">
      <View style={styles.cardSheen} />
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
          style={{ backgroundColor: difficultyStyles.bg }}
        >
          <Text className="font-bold text-xs" style={{ color: difficultyStyles.text }}>
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
        onPress={onPress || (() => router.push(`/quiz/${id}`))}
        activeOpacity={0.8}
        className="rounded-2xl overflow-hidden"
      >
        <LinearGradient
          colors={['rgba(79,70,229,0.95)', 'rgba(124,58,237,0.9)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.action}
        >
          <Text className="text-white font-bold mr-2 text-base">Xem chi tiết</Text>
          <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.46)',
    borderColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1.5,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.18,
    shadowRadius: 42,
    elevation: 10,
  },
  cardSheen: {
    position: 'absolute',
    top: -72,
    left: -46,
    width: 230,
    height: 160,
    backgroundColor: 'rgba(255,255,255,0.68)',
    transform: [{ rotate: '16deg' }],
  },
  action: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.62)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.34,
    shadowRadius: 30,
  },
});
