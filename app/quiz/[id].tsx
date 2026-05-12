import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  StatusBar,
  NativeScrollEvent,
  NativeSyntheticEvent,
  LayoutChangeEvent
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { getQuizById } from '../../src/features/quiz/api';
import { QuizInfo } from '../../src/types/quiz';

// Color Palette (60-30-10)
// 60% Background/Surface: #F8FAFC (Light Background), #FFFFFF (Surface)
// 30% Structure/Text: #0F172A (Primary Text), #64748B (Secondary)
// 10% Accent/CTA: #F59E0B (Amber)

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
      setQuiz(data.data || data);
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

  const renderBadge = (text: string, color: string) => (
    <View 
      className="px-3 py-1 rounded-full mr-2" 
      style={{ backgroundColor: `${color}15` }}
    >
      <Text className="text-xs font-bold" style={{ color }}>{text}</Text>
    </View>
  );

  const StatItem = ({ icon, label, value }: { icon: any, label: string, value: string | number }) => (
    <View className="bg-white p-4 rounded-2xl flex-1 m-1 border border-gray-100 shadow-sm">
      <Ionicons name={icon} size={20} color="#06B6D4" />
      <Text className="text-slate-500 text-xs mt-2 font-medium">{label}</Text>
      <Text className="text-slate-900 text-lg font-bold">{value}</Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-[#F8FAFC] items-center justify-center">
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  if (!quiz) return null;

  const isLocked = !quiz.is_purchased && quiz.price_token > 0;
  const isExhausted = quiz.attempts >= quiz.max_attempts && quiz.max_attempts > 0;

  const getButtonContent = () => {
    if (isExhausted) return { text: "Hết lượt làm bài", color: "#EF4444", disabled: true, icon: "lock-closed" };
    if (isLocked) return { text: `Mở khóa (${quiz.price_token} Token)`, color: "#F59E0B", disabled: false, icon: "key" };
    return { text: "Bắt đầu làm bài", color: "#4F46E5", disabled: false, icon: "flash" };
  };

  const btn = getButtonContent();

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View 
        className="px-4 pb-4 pt-12 flex-row items-center justify-between bg-white z-10 border-b border-gray-100 shadow-sm"
        style={{ paddingTop: insets.top + 10 }}
      >
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-50"
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-slate-900 text-lg font-bold">Quiz Details</Text>
        <View className="w-10" />
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <Animated.View 
          entering={FadeIn.duration(600)}
          className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl shadow-slate-200/50"
        >
          <View className="flex-row mb-4">
            {renderBadge(quiz.category || "General", "#06B6D4")}
            {renderBadge(quiz.difficulty, "#10B981")}
          </View>
          
          <Text className="text-slate-900 text-3xl font-bold mb-4 leading-tight">
            {quiz.title}
          </Text>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-amber-500/10 p-2 rounded-lg mr-2">
                <Ionicons name="diamond" size={16} color="#F59E0B" />
              </View>
              <Text className="text-amber-600 font-bold">
                {quiz.price_token === 0 ? "Miễn phí" : `${quiz.price_token} Token`}
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text className="text-slate-500 text-xs ml-1 font-medium">(4.8/5)</Text>
            </View>
          </View>
        </Animated.View>

        {/* Dynamic Action Button */}
        <View onLayout={handleLayout} className="mt-8">
          <TouchableOpacity 
            disabled={btn.disabled}
            className={`flex-row items-center justify-center py-4 rounded-2xl shadow-lg shadow-amber-500/20 ${btn.disabled ? 'bg-slate-200' : ''}`}
            style={{ backgroundColor: btn.disabled ? undefined : btn.color }}
          >
            <Ionicons name={btn.icon as any} size={20} color="#FFFFFF" />
            <Text className="text-white font-bold text-lg ml-2">{btn.text}</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Grid */}
        <View className="mt-8">
          <Text className="text-slate-900 text-xl font-bold mb-4">Tổng quan</Text>
          <View className="flex-row flex-wrap">
            <StatItem icon="list" label="Số câu hỏi" value={quiz.questions_count} />
            <StatItem icon="time-outline" label="Thời gian" value={`${quiz.duration}m`} />
          </View>
          <View className="flex-row flex-wrap mt-2">
            <StatItem icon="refresh" label="Lượt còn lại" value={quiz.max_attempts === 0 ? "∞" : quiz.max_attempts - quiz.attempts} />
            <StatItem icon="ribbon-outline" label="Điểm đạt" value={`${quiz.passing_score}%`} />
          </View>
        </View>

        {/* Content Blocks */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} className="mt-10">
          <Text className="text-slate-900 text-xl font-bold mb-3">Mô tả</Text>
          <Text className="text-slate-600 text-base leading-6">
            {quiz.description || "Chưa có mô tả cho bài kiểm tra này."}
          </Text>
        </Animated.View>

        {quiz.learning_objectives && quiz.learning_objectives.length > 0 && (
          <View className="mt-8">
            <Text className="text-slate-900 text-xl font-bold mb-4">Mục tiêu học tập</Text>
            {quiz.learning_objectives.map((obj, i) => (
              <View key={i} className="flex-row items-start mb-3">
                <View className="mt-1 bg-cyan-500/10 p-1 rounded-full">
                  <Ionicons name="checkmark" size={14} color="#06B6D4" />
                </View>
                <Text className="text-slate-700 text-base ml-3 flex-1">{obj}</Text>
              </View>
            ))}
          </View>
        )}

        {quiz.prerequisites && quiz.prerequisites.length > 0 && (
          <View className="mt-8">
            <Text className="text-slate-900 text-xl font-bold mb-3">Điều kiện tiên quyết</Text>
            <View className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              {quiz.prerequisites.map((pre, i) => (
                <Text key={i} className="text-slate-600 text-sm mb-1">• {pre}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Tags */}
        <View className="mt-10 flex-row flex-wrap">
          {(quiz.tags || []).map((tag, i) => (
            <View key={i} className="bg-white px-3 py-1.5 rounded-lg mr-2 mb-2 border border-gray-100 shadow-sm">
              <Text className="text-slate-500 text-xs font-medium">#{tag}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <Animated.View 
        style={[
          stickyButtonStyle,
          { 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            backgroundColor: '#FFFFFF',
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: Math.max(insets.bottom, 16),
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -10 },
            shadowOpacity: 0.1,
            shadowRadius: 15,
            elevation: 20,
          }
        ]}
      >
        <TouchableOpacity 
          disabled={btn.disabled}
          className="flex-row items-center justify-center py-4 rounded-2xl shadow-lg shadow-primary/20"
          style={{ backgroundColor: btn.disabled ? '#E2E8F0' : btn.color }}
        >
          <Ionicons name={btn.icon as any} size={20} color="#FFFFFF" />
          <Text className="text-white font-bold text-lg ml-2">{btn.text}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
