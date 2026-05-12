import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FilterChip } from '../../src/components/FilterChip';
import { CategoryCard } from '../../src/components/CategoryCard';
import { PracticeQuizCard } from '../../src/components/PracticeQuizCard';
import { useQuizStore } from '../../src/stores/quiz.store';
import { useRouter } from 'expo-router';

const difficultyMap: Record<string, 'Dễ' | 'Trung bình' | 'Khó'> = {
  'Beginner': 'Dễ',
  'Intermediate': 'Trung bình',
  'Advanced': 'Khó'
};

const categoryIconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Toán học': 'calculator-outline',
  'Tiếng Anh': 'language-outline',
  'Lập trình': 'code-slash-outline',
  'Lịch sử': 'time-outline',
  'Khoa học': 'flask-outline',
  'Tất cả': 'apps-outline'
};

const PracticeScreen = () => {
  const router = useRouter();
  const { exams, categories, fetchQuizzes, fetchCategories, isLoading } = useQuizStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | number>('all');
  const [activeDifficulty, setActiveDifficulty] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    fetchQuizzes();
    fetchCategories();
  }, []);

  const filteredExams = useMemo(() => {
    return exams.filter(quiz => {
      // Filter by Category
      const matchesCategory = selectedCategoryId === 'all' || quiz.category.id === selectedCategoryId;
      
      // Filter by Difficulty
      const displayDifficulty = difficultyMap[quiz.difficulty] || 'Dễ';
      const matchesDifficulty = activeDifficulty === 'Tất cả' || displayDifficulty === activeDifficulty;
      
      // Filter by Search Query
      const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [exams, selectedCategoryId, activeDifficulty, searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header Title */}
        <View className="px-5 mt-6 mb-6">
          <Text className="text-text-primary text-3xl font-bold mb-2">
            Luyện tập
          </Text>
          <Text className="text-text-secondary text-base">
            Hãy chọn chủ đề bạn muốn thử thách hôm nay!
          </Text>
        </View>

        {/* Search Bar */}
        <View className="px-5 mb-8">
          <View className="bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 flex-row items-center shadow-sm">
            <Ionicons name="search-outline" size={22} color="#94A3B8" />
            <TextInput
              placeholder="Tìm kiếm bài quiz..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-text-primary text-base"
            />
          </View>
        </View>

        {/* Difficulty Filter Chips */}
        <View className="mb-8">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="px-5"
          >
            {['Tất cả', 'Dễ', 'Trung bình', 'Khó'].map((filter) => (
              <FilterChip
                key={filter}
                label={filter}
                active={activeDifficulty === filter}
                onPress={() => setActiveDifficulty(filter)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Topic Categories */}
        <View className="mb-10">
          <Text className="px-5 text-text-primary text-xl font-bold mb-4">
            Chủ đề phổ biến
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="px-5"
          >
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                label={category.name}
                icon={categoryIconMap[category.name] || 'book-outline'}
                onPress={() => setSelectedCategoryId(category.id)}
                active={selectedCategoryId === category.id}
              />
            ))}
          </ScrollView>
        </View>

        {/* Quiz List */}
        <View className="px-5">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-text-primary text-xl font-bold">
              Danh sách bài kiểm tra
            </Text>
            {!isLoading && (
              <Text className="text-text-secondary text-sm">
                {filteredExams.length} bài
              </Text>
            )}
          </View>
          
          {isLoading ? (
            <View className="items-center justify-center py-20">
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
                onPress={() => router.push(`/quiz/${quiz.id}`)} id={''}              />
            ))
          ) : (
            <View className="items-center justify-center py-10">
              <Ionicons name="search-outline" size={48} color="#94A3B8" />
              <Text className="text-text-secondary mt-4 text-base">
                Không tìm thấy bài kiểm tra nào phù hợp.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PracticeScreen;
