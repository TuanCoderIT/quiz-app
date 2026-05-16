import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { FlashcardReviewRating } from '../../src/features/flashcard/types';
import { useFlashcardStore } from '../../src/stores/flashcard.store';

export default function FlashcardStudyScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const deckId = Array.isArray(id) ? id[0] : id;

  const studyDeck = useFlashcardStore((state) =>
    deckId ? state.studyDecks[String(deckId)] : undefined
  );
  const fallbackDeck = useFlashcardStore((state) =>
    deckId
      ? state.deckDetails[String(deckId)] ||
        state.decks.find((deck) => String(deck.id) === String(deckId))
      : undefined
  );
  const isStudyLoading = useFlashcardStore((state) => state.isStudyLoading);
  const error = useFlashcardStore((state) => state.error);
  const fetchStudyDeck = useFlashcardStore((state) => state.fetchStudyDeck);
  const submitReview = useFlashcardStore((state) => state.submitReview);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deck = studyDeck || fallbackDeck;
  const currentCard = deck?.cards[currentIndex];

  const flip = useSharedValue(0);
  const cardScale = useSharedValue(1);

  useEffect(() => {
    if (deckId) {
      void fetchStudyDeck(deckId);
    }
  }, [deckId, fetchStudyDeck]);

  useEffect(() => {
    setCurrentIndex(0);
    setShowResult(false);
    setMasteredCount(0);
    setIsSubmitting(false);
    flip.value = 0;
    cardScale.value = 1;
  }, [cardScale, deckId, flip]);

  useEffect(() => {
    if (deck && currentIndex >= deck.cards.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, deck]);

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

  const handleFlip = () => {
    if (!currentCard || isSubmitting) {
      return;
    }

    flip.value = withTiming(flip.value === 0 ? 1 : 0, { duration: 400 });
  };

  const nextCard = async (rating: FlashcardReviewRating) => {
    if (!deck || !currentCard || isSubmitting) {
      cardScale.value = withSpring(1);
      return;
    }

    setIsSubmitting(true);

    try {
      await submitReview(currentCard.id, rating, deck.id);

      if (rating === 'easy') {
        setMasteredCount((prev) => prev + 1);
      }

      if (currentIndex < deck.cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        flip.value = 0;
        cardScale.value = withSpring(1);
      } else {
        setShowResult(true);
      }
    } catch {
      cardScale.value = withSpring(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const queueNextCard = (rating: FlashcardReviewRating) => {
    void nextCard(rating);
  };

  const handleReview = (rating: FlashcardReviewRating) => {
    if (isSubmitting || !currentCard) {
      return;
    }

    cardScale.value = withSpring(0.8, {}, () => {
      runOnJS(queueNextCard)(rating);
    });
  };

  const resetStudy = () => {
    setCurrentIndex(0);
    setMasteredCount(0);
    setShowResult(false);
    setIsSubmitting(false);
    flip.value = 0;
    cardScale.value = 1;
  };

  if (!deckId) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-8">
        <Ionicons name="alert-circle-outline" size={44} color="#94A3B8" />
        <Text className="text-slate-900 text-xl font-bold mt-5">Thiếu mã bộ thẻ</Text>
        <Text className="text-slate-500 text-center mt-2">
          Không tìm thấy mã bộ thẻ trong đường dẫn hiện tại.
        </Text>
      </View>
    );
  }

  if (isStudyLoading && !deck) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-8">
        <ActivityIndicator size="small" color="#4F46E5" />
        <Text className="text-slate-900 text-xl font-bold mt-5">Đang tải thẻ học</Text>
        <Text className="text-slate-500 text-center mt-2">
          Đang lấy dữ liệu học từ API flashcard.
        </Text>
      </View>
    );
  }

  if (!deck) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-8">
        <Ionicons name="cloud-offline-outline" size={44} color="#94A3B8" />
        <Text className="text-slate-900 text-xl font-bold mt-5">
          Không tìm thấy bộ thẻ
        </Text>
        <Text className="text-slate-500 text-center mt-2">
          {error || 'Bộ thẻ này không tồn tại hoặc chưa có dữ liệu học.'}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-8 px-6 py-3 rounded-2xl border border-slate-200"
        >
          <Text className="text-slate-700 font-bold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (deck.cards.length === 0) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-8">
        <Ionicons name="file-tray-outline" size={44} color="#94A3B8" />
        <Text className="text-slate-900 text-xl font-bold mt-5">Chưa có thẻ</Text>
        <Text className="text-slate-500 text-center mt-2">
          API chưa trả về thẻ nào cho bộ này.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-8 px-6 py-3 rounded-2xl border border-slate-200"
        >
          <Text className="text-slate-700 font-bold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          onPress={resetStudy}
          className="bg-blue-600 w-full py-5 rounded-3xl items-center mb-4"
        >
          <Text className="text-white font-bold text-lg">Học lại từ đầu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          className="w-full py-5 rounded-3xl items-center border border-gray-200"
        >
          <Text className="text-slate-600 font-bold text-lg">
            Quay lại danh sách
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: deck.color || '#F1F5F9' }}>
      <SafeAreaView className="flex-1">
        <View className="px-6 py-4 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="close" size={28} color="#64748B" />
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-slate-900 font-bold text-lg">Học lật thẻ</Text>
            <Text className="text-slate-500 text-xs">
              {currentIndex + 1} / {deck.cards.length}
            </Text>
          </View>
          <View className="w-10" />
        </View>

        <View className="px-10 mt-2">
          <View className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
            <View
              className="h-full bg-white rounded-full"
              style={{ width: `${((currentIndex + 1) / deck.cards.length) * 100}%` }}
            />
          </View>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleFlip}
            className="w-full aspect-[3/4]"
          >
            <Animated.View
              style={[styles.card, frontAnimatedStyle, { backgroundColor: '#FFFFFF' }]}
              className="shadow-2xl shadow-black/10 items-center justify-center p-10"
            >
              <Text className="text-slate-400 text-sm uppercase tracking-widest mb-10">
                Mặt trước
              </Text>
              <Text className="text-slate-900 text-4xl font-bold text-center">
                {currentCard?.term}
              </Text>
              <View className="absolute bottom-10 items-center">
                <Ionicons name="finger-print" size={24} color="#CBD5E1" />
                <Text className="text-slate-300 text-xs mt-2">Bấm để lật</Text>
              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.card,
                backAnimatedStyle,
                { backgroundColor: '#FFFFFF', position: 'absolute' },
              ]}
              className="shadow-2xl shadow-black/10 items-center justify-center p-10"
            >
              <Text className="text-slate-400 text-sm uppercase tracking-widest mb-10">
                Mặt sau
              </Text>
              <Text className="text-slate-800 text-2xl font-medium text-center leading-10">
                {currentCard?.definition}
              </Text>
              {currentCard?.explanation ? (
                <Text className="text-slate-400 text-center leading-6 mt-5">
                  {currentCard.explanation}
                </Text>
              ) : null}
              <View className="absolute bottom-10 items-center">
                <Ionicons name="checkmark-circle-outline" size={24} color="#CBD5E1" />
                <Text className="text-slate-300 text-xs mt-2">Định nghĩa</Text>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {error ? (
          <Text className="text-rose-500 text-center text-xs px-8 mb-3">{error}</Text>
        ) : null}

        <View className="px-5 pb-10 flex-row">
          <TouchableOpacity
            disabled={isSubmitting}
            onPress={() => handleReview('again')}
            className="flex-1 bg-rose-100 py-4 rounded-[24px] items-center border border-rose-200 mr-2"
          >
            <Ionicons name="close-circle" size={25} color="#F43F5E" />
            <Text className="text-rose-600 font-bold text-sm mt-1">Lại</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={isSubmitting}
            onPress={() => handleReview('hard')}
            className="flex-1 bg-amber-100 py-4 rounded-[24px] items-center border border-amber-200 mx-1"
          >
            <Ionicons name="alert-circle" size={25} color="#F59E0B" />
            <Text className="text-amber-700 font-bold text-sm mt-1">Khó</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={isSubmitting}
            onPress={() => handleReview('easy')}
            className="flex-1 bg-emerald-100 py-4 rounded-[24px] items-center border border-emerald-200 ml-2"
          >
            <Ionicons name="checkmark-circle" size={25} color="#10B981" />
            <Text className="text-emerald-700 font-bold text-sm mt-1">Thuộc</Text>
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
  },
});
