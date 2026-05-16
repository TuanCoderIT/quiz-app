import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  onPress,
}) => {
  const getDifficultyStyles = () => {
    switch (difficulty) {
      case 'Dễ': return { text: '#10B981', bg: '#10B98112' };
      case 'Trung bình': return { text: '#F59E0B', bg: '#F59E0B12' };
      case 'Khó': return { text: '#EF4444', bg: '#EF444412' };
      default: return { text: '#64748B', bg: '#F1F5F9' };
    }
  };

  const difficultyStyles = getDifficultyStyles();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
        </View>
        <View style={[styles.difficultyPill, { backgroundColor: difficultyStyles.bg }]}>
          <Text style={[styles.difficultyText, { color: difficultyStyles.text }]}>
            {difficulty}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{questionCount} câu hỏi</Text>
        <View style={styles.metaDot} />
        <Text style={styles.metaText}>{timeEstimate}</Text>
      </View>

      <TouchableOpacity
        onPress={onPress || (() => router.push(`/quiz/${id}`))}
        activeOpacity={0.8}
        style={styles.actionWrapper}
      >
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.action}
        >
          <Text style={styles.actionText}>Xem chi tiết</Text>
          <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.68)',
    padding: 20,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 22,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerText: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 19,
  },
  difficultyPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  actionWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  action: {
    height: 48,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginRight: 6,
  },
});
