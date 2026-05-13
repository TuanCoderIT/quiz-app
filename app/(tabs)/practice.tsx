import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryCard } from '../../src/components/CategoryCard';
import { FilterChip } from '../../src/components/FilterChip';
import { PracticeQuizCard } from '../../src/components/PracticeQuizCard';
import { useQuizStore } from '../../src/stores/quiz.store';

const difficultyMap: Record<string, 'Dễ' | 'Trung bình' | 'Khó'> = {
  Beginner: 'Dễ',
  Intermediate: 'Trung bình',
  Advanced: 'Khó',
};

const categoryIconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Toán học': 'calculator-outline',
  'Tiếng Anh': 'language-outline',
  'Lập trình': 'code-slash-outline',
  'Lịch sử': 'time-outline',
  'Khoa học': 'flask-outline',
  'Tất cả': 'apps-outline',
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
    <LinearGradient
      colors={['#F7F8FF', '#F0FBFF', '#F8FAFC']}
      locations={[0, 0.48, 1]}
      style={styles.screen}
    >
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 112 }}
        >
          <View className="px-5 mt-5">
            <LinearGradient
              colors={['rgba(255,255,255,0.92)', 'rgba(255,255,255,0.62)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroShell}
            >
              <View style={styles.heroGlow} />
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-5">
                  <Text className="text-slate-400 text-xs font-extrabold mb-2">QUIZ AI</Text>
                  <Text className="text-slate-900 text-3xl font-extrabold leading-9">
                    Luyện tập thông minh
                  </Text>
                  <Text className="text-slate-500 text-base leading-6 mt-3">
                    Chọn chủ đề, lọc độ khó và bắt đầu bài quiz phù hợp với nhịp học hôm nay.
                  </Text>
                </View>

                <View style={styles.aiChip}>
                  <Ionicons name="sparkles" size={14} color="#0891B2" />
                  <Text className="text-cyan-700 text-xs font-extrabold ml-1">AI</Text>
                </View>
              </View>

              <View className="flex-row gap-3 mt-6">
                <View style={styles.statCard} className="flex-1">
                  <Text className="text-slate-500 text-xs font-bold mb-1">Bài quiz</Text>
                  <Text className="text-emerald-500 text-2xl font-extrabold">{exams.length}</Text>
                </View>
                <View style={styles.statCard} className="flex-1">
                  <Text className="text-slate-500 text-xs font-bold mb-1">Chủ đề</Text>
                  <Text className="text-violet-600 text-2xl font-extrabold">
                    {categories.length}
                  </Text>
                </View>
                <View style={styles.statCard} className="flex-1">
                  <Text className="text-slate-500 text-xs font-bold mb-1">Đang lọc</Text>
                  <Text className="text-amber-500 text-2xl font-extrabold">
                    {filteredExams.length}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          <View className="px-5 mt-5">
            <View style={styles.controlPanel}>
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={22} color="#94A3B8" />
                <TextInput
                  placeholder="Tìm kiếm bài quiz..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="flex-1 ml-3 text-text-primary text-base"
                />
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
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
          </View>

          <View className="mt-8">
            <Text className="px-5 text-text-primary text-xl font-bold mb-4">
              Chủ đề phổ biến
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  label={category.name}
                  icon={categoryIconMap[category.name] || 'book-outline'}
                  onPress={() => setSelectedCategoryId(category.id)}
                  active={selectedCategoryId === category.id}
                  style={{ marginTop: 12,marginBottom: 12

                   }}
                />
              ))}
            </ScrollView>
          </View>

          <View className="px-5 mt-9">
            <View className="flex-row items-center justify-between mb-5">
              <View>
                <Text className="text-text-primary text-xl font-bold">
                  Danh sách bài kiểm tra
                </Text>
                <Text className="text-text-secondary text-sm mt-1">
                  {activeDifficulty} · {selectedCategoryId === 'all' ? 'Mọi chủ đề' : 'Đã chọn chủ đề'}
                </Text>
              </View>
              {!isLoading && (
                <View style={styles.countPill}>
                  <Text className="text-primary text-sm font-extrabold">
                    {filteredExams.length} bài
                  </Text>
                </View>
              )}
            </View>

            {isLoading ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text className="text-text-secondary mt-4 text-base font-medium">
                  Đang tải dữ liệu...
                </Text>
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
                <Ionicons name="search-outline" size={48} color="#94A3B8" />
                <Text className="text-text-secondary mt-4 text-base text-center">
                  Không tìm thấy bài kiểm tra nào phù hợp.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  heroShell: {
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    padding: 22,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.14,
    shadowRadius: 42,
    elevation: 10,
  },
  heroGlow: {
    position: 'absolute',
    top: -48,
    right: -40,
    width: '78%',
    height: 170,
    backgroundColor: 'rgba(6,182,212,0.14)',
    transform: [{ rotate: '-10deg' }],
  },
  aiChip: {
    minWidth: 48,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.32)',
    backgroundColor: 'rgba(6,182,212,0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCard: {
    minHeight: 76,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
    backgroundColor: 'rgba(255,255,255,0.56)',
    padding: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
  },
  controlPanel: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.76)',
    backgroundColor: 'rgba(255,255,255,0.58)',
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.08,
    shadowRadius: 34,
    elevation: 6,
  },
  searchBar: {
    minHeight: 54,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(255,255,255,0.64)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  countPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(79,70,229,0.14)',
    backgroundColor: 'rgba(255,255,255,0.66)',
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  loadingCard: {
    minHeight: 180,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
    backgroundColor: 'rgba(255,255,255,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    minHeight: 170,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
    backgroundColor: 'rgba(255,255,255,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});

export default PracticeScreen;
