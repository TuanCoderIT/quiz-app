import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  onPress,
}) => {
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'Dễ': return { text: '#10B981', bg: '#10B98112' };
      case 'Trung bình': return { text: '#F59E0B', bg: '#F59E0B12' };
      case 'Khó': return { text: '#EF4444', bg: '#EF444412' };
      default: return { text: '#64748B', bg: '#F1F5F9' };
    }
  };

  const colors = getDifficultyColor();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.card}
    >
      <View style={[styles.accent, { backgroundColor: colors.text }]} />

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.meta}>
          {category} · {questionCount} câu hỏi
        </Text>
      </View>

      <View style={[styles.difficultyPill, { backgroundColor: colors.bg }]}>
        <Text style={[styles.difficultyText, { color: colors.text }]}>
          {difficulty}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.65)',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 1,
  },
  accent: {
    width: 4,
    height: 36,
    borderRadius: 2,
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  title: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  meta: {
    color: '#64748B',
    fontSize: 13,
  },
  difficultyPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginLeft: 10,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
