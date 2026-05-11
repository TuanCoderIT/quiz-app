import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FilterChip } from '../../src/components/FilterChip';
import { CategoryCard } from '../../src/components/CategoryCard';
import { PracticeQuizCard } from '../../src/components/PracticeQuizCard';

const topics = [
  { label: 'Toán học', icon: 'calculator-outline' as const },
  { label: 'Tiếng Anh', icon: 'language-outline' as const },
  { label: 'Lịch sử', icon: 'time-outline' as const },
  { label: 'Khoa học', icon: 'flask-outline' as const },
  { label: 'Lập trình', icon: 'code-slash-outline' as const },
];

const mockQuizzes = [
  {
    id: '1',
    title: 'Đại số cơ bản',
    description: 'Kiểm tra kiến thức về phương trình bậc nhất và các phép tính cơ bản.',
    difficulty: 'Dễ' as const,
    questionCount: 10,
    timeEstimate: '10 phút'
  },
  {
    id: '2',
    title: 'Ngữ pháp Tiếng Anh',
    description: 'Ôn tập về các thì trong tiếng Anh và cấu trúc câu phức tạp.',
    difficulty: 'Trung bình' as const,
    questionCount: 15,
    timeEstimate: '15 phút'
  },
  {
    id: '3',
    title: 'React Native Advanced',
    description: 'Thử thách với các khái niệm chuyên sâu về Reanimated và Performance.',
    difficulty: 'Khó' as const,
    questionCount: 20,
    timeEstimate: '25 phút'
  }
];

const PracticeScreen = () => {
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

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
                active={activeFilter === filter}
                onPress={() => setActiveFilter(filter)}
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
            {topics.map((topic) => (
              <CategoryCard
                key={topic.label}
                label={topic.label}
                icon={topic.icon}
              />
            ))}
          </ScrollView>
        </View>

        {/* Quiz List */}
        <View className="px-5">
          <Text className="text-text-primary text-xl font-bold mb-6">
            Danh sách bài tập
          </Text>
          {mockQuizzes.map((quiz) => (
            <PracticeQuizCard
              key={quiz.id}
              title={quiz.title}
              description={quiz.description}
              difficulty={quiz.difficulty}
              questionCount={quiz.questionCount}
              timeEstimate={quiz.timeEstimate}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PracticeScreen;
