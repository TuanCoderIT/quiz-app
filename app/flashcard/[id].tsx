import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { flashcardDecks } from '../(tabs)/flashcard';

const { width } = Dimensions.get('window');

export default function FlashcardDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const deck = flashcardDecks.find(d => d.id === Number(id));

  if (!deck) return null;

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header Section */}
        <LinearGradient
          colors={[`${deck.color}`, '#FFFFFF']}
          className="px-6 pt-16 pb-10"
          style={{ paddingTop: insets.top + 20 }}
        >
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-white/80 mb-6 shadow-sm"
          >
            <Ionicons name="arrow-back" size={24} color={deck.accent} />
          </TouchableOpacity>
          
          <Text className="text-slate-900 text-3xl font-bold mb-2">{deck.title}</Text>
          <Text className="text-slate-500 text-base leading-6 mb-6">{deck.description}</Text>

          {/* Stats Bar */}
          <View className="flex-row items-center bg-white p-5 rounded-3xl shadow-sm border border-gray-50">
            <View className="flex-1 items-center border-r border-gray-100">
              <Text className="text-slate-400 text-xs font-bold uppercase mb-1">Tổng cộng</Text>
              <Text className="text-slate-900 text-2xl font-bold">{deck.cardCount}</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-emerald-600 text-xs font-bold uppercase mb-1">Đã thuộc</Text>
              <Text className="text-emerald-900 text-2xl font-bold">{deck.masteredCount}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Study Button */}
        <View className="px-6 mb-10">
          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/flashcard/study', params: { id: deck.id } })}
            activeOpacity={0.8}
            className="rounded-3xl shadow-xl shadow-primary/20 overflow-hidden"
          >
            <LinearGradient
              colors={[deck.accent, deck.accent + 'DD']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="py-5 items-center justify-center flex-row"
            >
              <Ionicons name="book" size={24} color="#FFFFFF" />
              <Text className="text-white font-bold text-xl ml-3">Học ngay bây giờ</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Word List */}
        <View className="px-6">
          <Text className="text-slate-900 text-xl font-bold mb-5">Danh sách từ vựng</Text>
          {deck.cards.map((card, index) => (
            <Animated.View 
              key={card.id}
              entering={FadeInUp.delay(index * 100).duration(600)}
              className="bg-gray-50 p-5 rounded-2xl mb-4 flex-row items-center justify-between border border-gray-100"
            >
              <View className="flex-1 pr-4">
                <Text className="text-slate-900 text-lg font-bold mb-1">{card.term}</Text>
                <Text className="text-slate-500 text-sm">{card.definition}</Text>
              </View>
              <View className="w-8 h-8 rounded-full bg-white items-center justify-center shadow-sm">
                <Ionicons name="volume-medium" size={18} color={deck.accent} />
              </View>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
