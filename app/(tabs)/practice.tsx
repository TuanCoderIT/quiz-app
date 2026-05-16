import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground } from '../../src/components/AppBackground';
import { CategoryCard } from '../../src/components/CategoryCard';
import { FilterChip } from '../../src/components/FilterChip';
import { PracticeQuizCard } from '../../src/components/PracticeQuizCard';
import { useQuizStore } from '../../src/stores/quiz.store';

const difficultyMap: Record<string, 'Dễ' | 'Trung bình' | 'Khó'> = {
  Beginner: 'Dễ',
  Intermediate: 'Trung bình',
  Advanced: 'Khó',
};

const difficultyFilters = ['Tất cả', 'Dễ', 'Trung bình', 'Khó'];

const PracticeScreen = () => {
  const router = useRouter();
  const { exams, categories, fetchQuizzes, fetchCategories, isLoading } = useQuizStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | number>('all');
  const [activeDifficulty, setActiveDifficulty] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    fetchQuizzes();
    fetchCategories();
  }, [fetchCategories, fetchQuizzes]);

  const filteredExams = useMemo(() => {
    return exams.filter((quiz) => {
      const matchesCategory = selectedCategoryId === 'all' || quiz.category.id === selectedCategoryId;
      const displayDifficulty = difficultyMap[quiz.difficulty] || 'Dễ';
      const matchesDifficulty = activeDifficulty === 'Tất cả' || displayDifficulty === activeDifficulty;
      const matchesSearch =
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [activeDifficulty, exams, searchQuery, selectedCategoryId]);

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View style={styles.heroTextBlock}>
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>QUIZ AI</Text>
                </View>
                <Text style={styles.heroTitle}>Luyện tập thông minh</Text>
                <Text style={styles.heroSubtitle}>
                  Chọn chủ đề, lọc độ khó và bắt đầu bài quiz phù hợp.
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Bài quiz</Text>
                <Text style={[styles.statValue, { color: '#10B981' }]}>{exams.length}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Chủ đề</Text>
                <Text style={[styles.statValue, { color: '#7C3AED' }]}>{categories.length}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Đang lọc</Text>
                <Text style={[styles.statValue, { color: '#F59E0B' }]}>{filteredExams.length}</Text>
              </View>
            </View>
          </View>

          {/* Search & Filter */}
          <View style={styles.searchPanel}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color="#94A3B8" />
              <TextInput
                placeholder="Tìm kiếm bài quiz..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 14 }}
            >
              {difficultyFilters.map((filter) => (
                <FilterChip
                  key={filter}
                  label={filter}
                  active={activeDifficulty === filter}
                  onPress={() => setActiveDifficulty(filter)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chủ đề phổ biến</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  label={category.name}
                  onPress={() => setSelectedCategoryId(category.id)}
                  active={selectedCategoryId === category.id}
                />
              ))}
            </ScrollView>
          </View>

          {/* Quiz List */}
          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <View>
                <Text style={styles.listTitle}>Danh sách bài kiểm tra</Text>
                <Text style={styles.listSubtitle}>
                  {activeDifficulty} · {selectedCategoryId === 'all' ? 'Mọi chủ đề' : 'Đã chọn chủ đề'}
                </Text>
              </View>
              {!isLoading && (
                <View style={styles.countPill}>
                  <Text style={styles.countText}>{filteredExams.length} bài</Text>
                </View>
              )}
            </View>

            {isLoading ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
              </View>
            ) : filteredExams.length > 0 ? (
              filteredExams.map((quiz) => (
                <PracticeQuizCard
                  key={quiz.id}
                  title={quiz.title}
                  description={quiz.description}
                  difficulty={difficultyMap[quiz.difficulty] || 'Dễ'}
                  questionCount={quiz.questions}
                  timeEstimate={`${quiz.duration} phút`}
                  id={quiz.id}
                  onPress={() =>
                    router.push({
                      pathname: '/quiz/[id]',
                      params: { id: String(quiz.id) },
                    })
                  }
                />
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="search-outline" size={40} color="#94A3B8" />
                <Text style={styles.emptyText}>
                  Không tìm thấy bài kiểm tra nào phù hợp.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 112,
  },

  // Hero
  heroCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.7)',
    padding: 22,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.06,
    shadowRadius: 28,
    elevation: 2,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroTextBlock: {
    flex: 1,
  },
  aiBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: 'rgba(6,182,212,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  aiBadgeText: {
    color: '#0891B2',
    fontSize: 10,
    fontWeight: '800',
  },
  heroTitle: {
    color: '#0F172A',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
  },
  heroSubtitle: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    minHeight: 68,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.6)',
    padding: 12,
  },
  statLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },

  // Search
  searchPanel: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.7)',
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 22,
    elevation: 2,
  },
  searchBar: {
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderWidth: 1,
    borderColor: 'rgba(203,213,225,0.5)',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#0F172A',
    fontSize: 15,
  },

  // Sections
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  listSection: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  listSubtitle: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 2,
  },
  countPill: {
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  countText: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '700',
  },

  // States
  loadingCard: {
    minHeight: 160,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 14,
  },
  emptyCard: {
    minHeight: 150,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
});

export default PracticeScreen;
