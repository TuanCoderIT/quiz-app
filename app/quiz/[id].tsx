import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground } from '../../src/components/AppBackground';
import { getQuizById } from '../../src/features/quiz/api';
import { QuizInfo } from '../../src/types/quiz';

export default function QuizDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [quiz, setQuiz] = useState<QuizInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [buttonY, setButtonY] = useState(0);
  const [showSticky, setShowSticky] = useState(false);

  const scrollY = useSharedValue(0);

  useEffect(() => {
    if (id) {
      fetchQuizDetail();
    }
  }, [id]);

  const fetchQuizDetail = async () => {
    try {
      setLoading(true);
      const data = await getQuizById(Number(id));
      setQuiz(data as unknown as QuizInfo);
    } catch (error) {
      console.error("Lỗi lấy chi tiết quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.y;
    scrollY.value = offset;
    
    if (offset > buttonY && !showSticky) {
      setShowSticky(true);
    } else if (offset <= buttonY && showSticky) {
      setShowSticky(false);
    }
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    setButtonY(y + height);
  };

  const stickyButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: withTiming(showSticky ? 0 : 100, { duration: 300 }) }
      ],
      opacity: withTiming(showSticky ? 1 : 0, { duration: 300 }),
    };
  });

  if (loading) {
    return (
      <AppBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      </AppBackground>
    );
  }

  if (!quiz) return null;

  const isLocked = !quiz.is_purchased && quiz.price_token > 0;
  const isExhausted = quiz.attempts >= quiz.max_attempts && quiz.max_attempts > 0;

  const getButtonContent = () => {
    if (isExhausted) return { text: "Hết lượt làm bài", disabled: true, icon: "lock-closed" };
    if (isLocked) return { text: `Mở khóa (${quiz.price_token} Token)`, disabled: false, icon: "key" };
    return { text: "Bắt đầu làm bài", disabled: false, icon: "flash" };
  };

  const btn = getButtonContent();

  const handleStartQuiz = () => {
    router.push({
      pathname: '/quiz/take',
      params: { id: String(quiz.id) },
    });
  };

  return (
    <AppBackground>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết Quiz</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.heroCard}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: 'rgba(6,182,212,0.08)' }]}>
              <Text style={[styles.badgeText, { color: '#0891B2' }]}>
                {quiz.category || "General"}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: 'rgba(16,185,129,0.08)' }]}>
              <Text style={[styles.badgeText, { color: '#10B981' }]}>
                {quiz.difficulty}
              </Text>
            </View>
          </View>
          
          <Text style={styles.heroTitle}>{quiz.title}</Text>

          <View style={styles.heroFooter}>
            <Text style={styles.priceText}>
              {quiz.price_token === 0 ? "Miễn phí" : `${quiz.price_token} Token`}
            </Text>
            <Text style={styles.ratingText}>4.8/5</Text>
          </View>
        </Animated.View>

        {/* Primary CTA */}
        <View onLayout={handleLayout} style={styles.ctaWrapper}>
          <TouchableOpacity
            disabled={btn.disabled}
            onPress={handleStartQuiz}
            activeOpacity={0.8}
            style={[styles.ctaButton, btn.disabled && styles.ctaDisabled]}
          >
            {btn.disabled ? (
              <>
                <Ionicons name={btn.icon as any} size={18} color="#94A3B8" />
                <Text style={styles.ctaDisabledText}>{btn.text}</Text>
              </>
            ) : (
              <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaGradient}
              >
                <Ionicons name={btn.icon as any} size={18} color="#FFFFFF" />
                <Text style={styles.ctaText}>{btn.text}</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Tổng quan</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Số câu hỏi</Text>
              <Text style={styles.statValue}>{quiz.questions_count}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Thời gian</Text>
              <Text style={styles.statValue}>{quiz.duration}m</Text>
            </View>
          </View>
          <View style={[styles.statsGrid, { marginTop: 8 }]}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Lượt còn lại</Text>
              <Text style={styles.statValue}>
                {quiz.max_attempts === 0 ? "∞" : quiz.max_attempts - quiz.attempts}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Điểm đạt</Text>
              <Text style={styles.statValue}>{quiz.passing_score}%</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.contentBlock}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.bodyText}>
            {quiz.description || "Chưa có mô tả cho bài kiểm tra này."}
          </Text>
        </Animated.View>

        {/* Learning Objectives */}
        {quiz.learning_objectives && quiz.learning_objectives.length > 0 && (
          <View style={styles.contentBlock}>
            <Text style={styles.sectionTitle}>Mục tiêu học tập</Text>
            {quiz.learning_objectives.map((obj, i) => (
              <View key={i} style={styles.objectiveRow}>
                <View style={styles.objectiveDot} />
                <Text style={styles.objectiveText}>{obj}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Prerequisites */}
        {quiz.prerequisites && quiz.prerequisites.length > 0 && (
          <View style={styles.contentBlock}>
            <Text style={styles.sectionTitle}>Điều kiện tiên quyết</Text>
            <View style={styles.glassCard}>
              {quiz.prerequisites.map((pre, i) => (
                <Text key={i} style={styles.prerequisiteText}>• {pre}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Tags */}
        {quiz.tags && quiz.tags.length > 0 && (
          <View style={styles.tagsSection}>
            {quiz.tags.map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <Animated.View
        style={[
          stickyButtonStyle,
          styles.stickyBar,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <TouchableOpacity
          disabled={btn.disabled}
          onPress={handleStartQuiz}
          activeOpacity={0.8}
          style={[styles.stickyButton, btn.disabled && styles.ctaDisabled]}
        >
          {btn.disabled ? (
            <>
              <Ionicons name={btn.icon as any} size={18} color="#94A3B8" />
              <Text style={styles.ctaDisabledText}>{btn.text}</Text>
            </>
          ) : (
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.stickyGradient}
            >
              <Ionicons name={btn.icon as any} size={18} color="#FFFFFF" />
              <Text style={styles.ctaText}>{btn.text}</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
      </Animated.View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226,232,240,0.55)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(241,245,249,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },

  // Hero
  heroCard: {
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.65)',
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 28,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    color: '#0F172A',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 16,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '700',
  },
  ratingText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },

  // CTA
  ctaWrapper: {
    marginTop: 20,
  },
  ctaButton: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  ctaGradient: {
    height: 54,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  ctaDisabled: {
    backgroundColor: '#E2E8F0',
    height: 54,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabledText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },

  // Stats
  statsSection: {
    marginTop: 28,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statItem: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.65)',
    padding: 16,
  },
  statLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  statValue: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '800',
  },

  // Content
  contentBlock: {
    marginTop: 28,
  },
  bodyText: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 23,
  },
  objectiveRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  objectiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4F46E5',
    marginTop: 7,
    marginRight: 12,
  },
  objectiveText: {
    flex: 1,
    color: '#334155',
    fontSize: 15,
    lineHeight: 22,
  },
  glassCard: {
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.65)',
    padding: 16,
  },
  prerequisiteText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 4,
  },

  // Tags
  tagsSection: {
    marginTop: 28,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.65)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },

  // Sticky
  stickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(226,232,240,0.65)',
    paddingHorizontal: 20,
    paddingTop: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  stickyButton: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  stickyGradient: {
    height: 52,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
