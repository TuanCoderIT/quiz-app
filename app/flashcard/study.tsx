import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  interpolate, 
  withTiming, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { flashcardDecks } from '../(tabs)/flashcard';

const { width, height } = Dimensions.get('window');

export default function FlashcardStudyScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const deck = flashcardDecks.find(d => d.id === Number(id));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);

  const flip = useSharedValue(0); // 0 = front, 1 = back
  const cardScale = useSharedValue(1);

  // === 1. TOÀN BỘ HOOKS PHẢI ĐẶT Ở ĐÂY (TRÊN CÙNG) ===
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flip.value, [0, 1], [0, 180]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }, { scale: cardScale.value }],
      opacity: flip.value < 0.5 ? 1 : 0,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flip.value, [0, 1], [-180, 0]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }, { scale: cardScale.value }],
      opacity: flip.value > 0.5 ? 1 : 0,
    };
  });

  // === 2. CÁC HÀM LOGIC XỬ LÝ ===
  const handleFlip = () => {
    flip.value = withTiming(flip.value === 0 ? 1 : 0, { duration: 400 });
  };

  const nextCard = (mastered: boolean) => {
    if (mastered) setMasteredCount(prev => prev + 1);
    
    if (deck && currentIndex < deck.cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      flip.value = 0; // Reset về mặt trước
      cardScale.value = withSpring(1);
    } else {
      setShowResult(true);
    }
  };

  const handleReview = (mastered: boolean) => {
    cardScale.value = withSpring(0.8, {}, () => {
      runOnJS(nextCard)(mastered);
    });
  };

  // === 3. CÁC ĐIỀU KIỆN KIỂM TRA ĐẨY XUỐNG DƯỚI NÀY ===
  if (!deck) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-slate-500">Không tìm thấy bộ thẻ dữ liệu.</Text>
      </View>
    );
  }

  const currentCard = deck.cards[currentIndex];

  // Giao diện kết quả (Result View)
  if (showResult) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-10">
        <View className="w-40 h-40 bg-amber-50 rounded-full items-center justify-center mb-8">
          <Ionicons name="trophy" size={80} color="#F59E0B" />
        </View>
        <Text className="text-slate-900 text-3xl font-bold mb-2">Chúc mừng!</Text>
        <Text className="text-slate-500 text-center text-lg mb-10">
          Bạn đã hoàn thành bộ thẻ này và thuộc được {masteredCount}/{deck.cards.length} từ.
        </Text>
        
        <TouchableOpacity 
          onPress={() => { setCurrentIndex(0); setMasteredCount(0); setShowResult(false); flip.value = 0; cardScale.value = 1; }}
          className="bg-blue-600 w-full py-5 rounded-3xl items-center mb-4"
        >
          <Text className="text-white font-bold text-lg">Học lại từ đầu</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-full py-5 rounded-3xl items-center border border-gray-200"
        >
          <Text className="text-slate-600 font-bold text-lg">Quay lại danh sách</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Giao diện học chính
  return (
    <View className="flex-1" style={{ backgroundColor: deck.color || '#F1F5F9' }}>
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
            <Ionicons name="close" size={28} color="#64748B" />
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-slate-900 font-bold text-lg">Học lật thẻ</Text>
            <Text className="text-slate-500 text-xs">{currentIndex + 1} / {deck.cards.length}</Text>
          </View>
          <View className="w-10" />
        </View>

        {/* Progress Bar */}
        <View className="px-10 mt-2">
          <View className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
            <View 
              className="h-full bg-white rounded-full" 
              style={{ width: `${((currentIndex + 1) / deck.cards.length) * 100}%` }} 
            />
          </View>
        </View>

        {/* Card Container */}
        <View className="flex-1 items-center justify-center px-6">
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={handleFlip}
            className="w-full aspect-[3/4]"
          >
            {/* Front Card */}
            <Animated.View 
              style={[styles.card, frontAnimatedStyle, { backgroundColor: '#FFFFFF' }]}
              className="shadow-2xl shadow-black/10 items-center justify-center p-10"
            >
              <Text className="text-slate-400 text-sm uppercase tracking-widest mb-10">Mặt trước</Text>
              <Text className="text-slate-900 text-4xl font-bold text-center">{currentCard?.term}</Text>
              <View className="absolute bottom-10 items-center">
                <Ionicons name="finger-print" size={24} color="#CBD5E1" />
                <Text className="text-slate-300 text-xs mt-2">Bấm để lật</Text>
              </View>
            </Animated.View>

            {/* Back Card */}
            <Animated.View 
              style={[styles.card, backAnimatedStyle, { backgroundColor: '#FFFFFF', position: 'absolute' }]}
              className="shadow-2xl shadow-black/10 items-center justify-center p-10"
            >
              <Text className="text-slate-400 text-sm uppercase tracking-widest mb-10">Mặt sau</Text>
              <Text className="text-slate-800 text-2xl font-medium text-center leading-10">
                {currentCard?.definition}
              </Text>
              <View className="absolute bottom-10 items-center">
                <Ionicons name="checkmark-circle-outline" size={24} color="#CBD5E1" />
                <Text className="text-slate-300 text-xs mt-2">Định nghĩa</Text>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View className="px-8 pb-10 flex-row justify-between">
          <TouchableOpacity 
            onPress={() => handleReview(false)}
            className="bg-rose-100 px-8 py-5 rounded-[28px] flex-row items-center border border-rose-200"
          >
            <Ionicons name="close-circle" size={28} color="#F43F5E" />
            <Text className="text-rose-600 font-bold text-lg ml-3">Chưa thuộc</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => handleReview(true)}
            className="bg-emerald-100 px-8 py-5 rounded-[28px] flex-row items-center border border-emerald-200"
          >
            <Ionicons name="checkmark-circle" size={28} color="#10B981" />
            <Text className="text-emerald-700 font-bold text-lg ml-3">Đã thuộc</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backfaceVisibility: 'hidden',
  }
});