import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFlashcardStore } from '../../src/stores/flashcard.store';

export default function FlashcardDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const deckId = Array.isArray(id) ? id[0] : id;

  const cachedDeck = useFlashcardStore((state) =>
    deckId ? state.decks.find((deck) => String(deck.id) === String(deckId)) : undefined
  );
  const detailDeck = useFlashcardStore((state) =>
    deckId ? state.deckDetails[String(deckId)] : undefined
  );
  const isDetailLoading = useFlashcardStore((state) => state.isDetailLoading);
  const isStatusUpdating = useFlashcardStore((state) => state.isStatusUpdating);
  const error = useFlashcardStore((state) => state.error);
  const fetchDeckById = useFlashcardStore((state) => state.fetchDeckById);
  const submitDeck = useFlashcardStore((state) => state.submitDeck);

  const deck = detailDeck || cachedDeck;

  useEffect(() => {
    if (deckId) {
      void fetchDeckById(deckId);
    }
  }, [deckId, fetchDeckById]);

  const renderState = ({
    icon,
    title,
    message,
    loading,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    message: string;
    loading?: boolean;
  }) => (
    <View
      className="flex-1 bg-white items-center justify-center px-8"
      style={{ paddingTop: insets.top }}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#4F46E5" />
      ) : (
        <Ionicons name={icon} size={46} color="#94A3B8" />
      )}
      <Text className="text-slate-900 text-xl font-bold mt-5">{title}</Text>
      <Text className="text-slate-500 text-center mt-2 leading-6">{message}</Text>
      <TouchableOpacity
        onPress={() => router.back()}
        className="mt-8 px-6 py-3 rounded-2xl border border-slate-200"
      >
        <Text className="text-slate-700 font-bold">Quay lại</Text>
      </TouchableOpacity>
    </View>
  );

  if (!deckId) {
    return renderState({
      icon: 'alert-circle-outline',
      title: 'Thiếu mã bộ thẻ',
      message: 'Không tìm thấy mã bộ thẻ trong đường dẫn hiện tại.',
    });
  }

  if (isDetailLoading && !deck) {
    return renderState({
      icon: 'layers-outline',
      title: 'Đang tải bộ thẻ',
      message: 'Đang lấy dữ liệu flashcard từ API.',
      loading: true,
    });
  }

  if (!deck) {
    return renderState({
      icon: 'cloud-offline-outline',
      title: 'Không tải được bộ thẻ',
      message: error || 'Bộ thẻ này không tồn tại hoặc bạn chưa có quyền truy cập.',
    });
  }

  const canSubmitDeck = deck.status === 'draft';

  const handleSubmitForReview = async () => {
    try {
      await submitDeck(deck.id);
      Alert.alert('Đã gửi duyệt', 'Bộ thẻ đã được chuyển sang trạng thái chờ duyệt.');
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Không gửi duyệt được bộ thẻ này.';
      Alert.alert('Không gửi được', message);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50" showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[deck.accent, '#111827']}
        className="px-6 pb-8"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          {canSubmitDeck ? (
            <TouchableOpacity
              onPress={handleSubmitForReview}
              disabled={isStatusUpdating}
              className="px-4 py-2 bg-white rounded-full flex-row items-center"
            >
              {isStatusUpdating ? (
                <ActivityIndicator size="small" color={deck.accent} />
              ) : (
                <Ionicons name="send" size={16} color={deck.accent} />
              )}
              <Text className="font-bold ml-2" style={{ color: deck.accent }}>
                Gửi duyệt
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() =>
                router.push({ pathname: '/flashcard/study', params: { id: deck.id } })
              }
              className="px-4 py-2 bg-white rounded-full flex-row items-center"
            >
              <Ionicons name="play" size={16} color={deck.accent} />
              <Text className="font-bold ml-2" style={{ color: deck.accent }}>
                Học ngay
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text className="text-white/75 text-sm font-bold uppercase tracking-widest mb-3">
          {deck.category}
        </Text>
        <Text className="text-white text-3xl font-bold leading-10 mb-3">
          {deck.title}
        </Text>
        <Text className="text-white/80 text-base leading-6">{deck.description}</Text>

        <View className="flex-row mt-7">
          <View className="flex-1 bg-white/15 rounded-3xl p-4 mr-3">
            <Text className="text-white text-2xl font-bold">{deck.cardCount}</Text>
            <Text className="text-white/70 text-xs font-semibold mt-1">Tổng thẻ</Text>
          </View>
          <View className="flex-1 bg-white/15 rounded-3xl p-4 mr-3">
            <Text className="text-white text-2xl font-bold">{deck.masteredCount}</Text>
            <Text className="text-white/70 text-xs font-semibold mt-1">Đã thuộc</Text>
          </View>
          <View className="flex-1 bg-white/15 rounded-3xl p-4">
            <Text className="text-white text-2xl font-bold">{deck.dueCount}</Text>
            <Text className="text-white/70 text-xs font-semibold mt-1">Cần ôn</Text>
          </View>
        </View>
      </LinearGradient>

      <View className="px-6 py-6">
        <Text className="text-slate-900 text-xl font-bold mb-4">Danh sách thẻ</Text>

        {deck.cards.length > 0 ? (
          deck.cards.map((card, index) => (
            <Animated.View key={card.id} entering={FadeInUp.delay(index * 70).duration(420)}>
              <View className="bg-white rounded-3xl p-5 mb-4 border border-slate-100">
                <View className="flex-row items-start justify-between mb-3">
                  <Text className="text-slate-400 font-bold">#{index + 1}</Text>
                  {card.progress?.status ? (
                    <View className="px-3 py-1 rounded-full bg-slate-100">
                      <Text className="text-slate-500 text-xs font-bold">
                        {card.progress.status}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text className="text-slate-900 text-lg font-bold mb-2">
                  {card.term}
                </Text>
                <Text className="text-slate-600 leading-6">{card.definition}</Text>
                {card.explanation ? (
                  <Text className="text-slate-400 leading-6 mt-3">
                    {card.explanation}
                  </Text>
                ) : null}
              </View>
            </Animated.View>
          ))
        ) : (
          <View className="bg-white rounded-3xl p-8 items-center border border-slate-100">
            <Ionicons name="file-tray-outline" size={40} color="#94A3B8" />
            <Text className="text-slate-900 font-bold mt-4">Chưa có thẻ</Text>
            <Text className="text-slate-500 text-center mt-2">
              API chưa trả về danh sách thẻ cho bộ này.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
