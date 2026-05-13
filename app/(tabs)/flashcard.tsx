import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Mock Data
export const flashcardDecks = [
  {
    id: 1,
    title: 'IELTS Vocabulary: Education',
    cardCount: 25,
    masteredCount: 15,
    color: '#E0F2FE', // Blue Pastel
    accent: '#0EA5E9',
    description: 'Essential words for academic education topics.',
    cards: [
      { id: 1, term: 'Curriculum', definition: 'Chương trình giảng dạy' },
      { id: 2, term: 'Pedagogy', definition: 'Sư phạm học' },
      { id: 3, term: 'Literacy', definition: 'Sự biết chữ' },
      { id: 4, term: 'Compulsory', definition: 'Bắt buộc' },
      { id: 5, term: 'Academic', definition: 'Học thuật' },
    ]
  },
  {
    id: 2,
    title: 'React Native Hooks',
    cardCount: 12,
    masteredCount: 8,
    color: '#F0FDF4', // Green Pastel
    accent: '#10B981',
    description: 'Learn common hooks and their usage.',
    cards: [
      { id: 1, term: 'useState', definition: 'Quản lý state trong functional component' },
      { id: 2, term: 'useEffect', definition: 'Xử lý side effects (fetch API, timer...)' },
      { id: 3, term: 'useMemo', definition: 'Memoize giá trị tính toán' },
    ]
  },
  {
    id: 3,
    title: 'Japanese N5: Kanji',
    cardCount: 40,
    masteredCount: 12,
    color: '#FFF1F2', // Rose Pastel
    accent: '#F43F5E',
    description: 'Basic kanji for JLPT N5 level.',
    cards: [
      { id: 1, term: '山 (Sơn)', definition: 'Núi' },
      { id: 2, term: '川 (Xuyên)', definition: 'Sông' },
    ]
  }
];

const DeckCard = ({ deck, index }: { deck: any, index: number }) => {
  const router = useRouter();
  const progress = (deck.masteredCount / deck.cardCount) * 100;

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 150).duration(600)}
      className="mb-5"
    >
      <TouchableOpacity 
        onPress={() => router.push(`/flashcard/${deck.id}`)}
        activeOpacity={0.9}
        className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200/50 flex-row items-center justify-between border border-gray-50"
      >
        <View className="flex-1 mr-4">
          <View className="flex-row items-center mb-2">
            <View className="w-2 h-6 rounded-full mr-3" style={{ backgroundColor: deck.accent }} />
            <Text className="text-slate-900 text-lg font-bold" numberOfLines={1}>{deck.title}</Text>
          </View>
          
          <Text className="text-slate-500 text-xs mb-4">
            {deck.cardCount} thẻ • {deck.masteredCount} đã thuộc
          </Text>

          {/* Progress Bar */}
          <View className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <View 
              className="h-full rounded-full" 
              style={{ width: `${progress}%`, backgroundColor: deck.accent }} 
            />
          </View>
        </View>

        {/* Quick Start Button */}
        <TouchableOpacity 
          onPress={() => router.push({ pathname: '/flashcard/study', params: { id: deck.id } })}
          className="w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-primary/20"
          style={{ backgroundColor: deck.accent }}
        >
          <Ionicons name="play" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function FlashcardTab() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="px-6 py-4 flex-row justify-between items-center">
          <View>
            <Text className="text-slate-900 text-3xl font-bold">Flashcards</Text>
            <Text className="text-slate-500 text-sm mt-1">Học nhanh, nhớ lâu mỗi ngày</Text>
          </View>
          <TouchableOpacity className="w-12 h-12 rounded-full bg-white items-center justify-center shadow-sm border border-gray-100">
            <Ionicons name="add" size={28} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        >
          {/* Stats Overview */}
          <View className="flex-row mb-8 mt-4">
            <View className="bg-indigo-50 p-4 rounded-3xl flex-1 mr-3 border border-indigo-100">
              <Text className="text-indigo-600 text-xs font-bold uppercase mb-1">Hôm nay</Text>
              <Text className="text-indigo-900 text-2xl font-bold">+12 từ</Text>
            </View>
            <View className="bg-emerald-50 p-4 rounded-3xl flex-1 border border-emerald-100">
              <Text className="text-emerald-600 text-xs font-bold uppercase mb-1">Đã thuộc</Text>
              <Text className="text-emerald-900 text-2xl font-bold">156 từ</Text>
            </View>
          </View>

          <Text className="text-slate-900 text-xl font-bold mb-5">Bộ thẻ của bạn</Text>
          
          {flashcardDecks.map((deck, index) => (
            <DeckCard key={deck.id} deck={deck} index={index} />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
