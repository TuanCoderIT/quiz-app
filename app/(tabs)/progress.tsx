import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Mock Data
const stats = [
  { label: 'Điểm trung bình', value: '86%', icon: 'stats-chart', color: '#6366F1' },
  { label: 'Tỷ lệ chính xác', value: '78%', icon: 'checkmark-circle', color: '#10B981' },
  { label: 'Chuỗi ngày học', value: '12 Days', icon: 'flame', color: '#F59E0B' },
  { label: 'Quiz hoàn thành', value: '24', icon: 'book', color: '#8B5CF6' },
];

const weakTopics = [
  { name: 'Ngữ pháp cơ bản', progress: 52, color: '#EF4444' },
  { name: 'Cấu trúc thuật toán', progress: 65, color: '#F59E0B' },
  { name: 'Kiến thức lịch sử', progress: 58, color: '#F43F5E' },
];

const recentActivities = [
  { id: 1, title: 'React Native Advanced', score: 95, date: '12 May, 2024', status: 'Passed' },
  { id: 2, title: 'English Grammar Quiz', score: 45, date: '11 May, 2024', status: 'Failed' },
  { id: 3, title: 'World History #01', score: 82, date: '10 May, 2024', status: 'Passed' },
  { id: 4, title: 'Basic Mathematics', score: 78, date: '08 May, 2024', status: 'Passed' },
];

// Reusable Components
const StatCard = ({ item, index }: { item: any, index: number }) => (
  <Animated.View 
    entering={FadeInUp.delay(index * 100).duration(600)}
    className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-4"
    style={{ width: (width - 56) / 2 }}
  >
    <View className="w-10 h-10 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: `${item.color}15` }}>
      <Ionicons name={item.icon} size={20} color={item.color} />
    </View>
    <Text className="text-gray-500 text-xs font-medium mb-1">{item.label}</Text>
    <Text className="text-slate-900 text-xl font-bold">{item.value}</Text>
  </Animated.View>
);

const ProgressBar = ({ progress, color }: { progress: number, color: string }) => (
  <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
    <Animated.View 
      entering={FadeInRight.delay(800).duration(1000)}
      className="h-full rounded-full"
      style={{ width: `${progress}%`, backgroundColor: color }}
    />
  </View>
);

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-slate-50">
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Fixed Header */}
        <View className="px-6 py-4">
          <Text className="text-slate-900 text-3xl font-bold">Your Progress</Text>
          <Text className="text-slate-500 text-base mt-1">Track your learning performance</Text>
        </View>

        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}
        >
          {/* 1. Overview Hero Card */}
          <Animated.View 
            entering={FadeInUp.duration(800)}
            className="mb-8"
          >
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-6 rounded-[32px] shadow-lg shadow-indigo-200"
            >
              <View className="flex-row justify-between items-center mb-6">
                <View>
                  <Text className="text-white/80 text-sm font-medium">Danh hiệu hiện tại</Text>
                  <Text className="text-white text-2xl font-bold mt-1">Chuyên gia AI 🏆</Text>
                </View>
                <View className="bg-white/20 p-3 rounded-2xl">
                  <Ionicons name="trophy" size={28} color="#FFFFFF" />
                </View>
              </View>

              <View className="h-[1px] bg-white/20 mb-6" />

              <View className="flex-row justify-between">
                <View>
                  <Text className="text-white/70 text-xs uppercase tracking-wider">Tổng thời gian học</Text>
                  <Text className="text-white text-lg font-bold mt-1">42h 15m</Text>
                </View>
                <TouchableOpacity className="bg-white px-4 py-2 rounded-xl self-center">
                  <Text className="text-indigo-600 font-bold text-sm">Chi tiết</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* 2. Core Statistics Grid */}
          <View className="flex-row flex-wrap justify-between">
            {stats.map((item, index) => (
              <StatCard key={index} item={item} index={index} />
            ))}
          </View>

          {/* 3. Weak Topics Section */}
          <View className="mt-6 mb-8">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-slate-900 text-xl font-bold">Chủ đề cần cải thiện</Text>
              <TouchableOpacity>
                <Text className="text-indigo-600 font-bold text-sm">Xem gợi ý</Text>
              </TouchableOpacity>
            </View>
            
            <View className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
              {weakTopics.map((topic, index) => (
                <View key={index} className={index !== 0 ? 'mt-6' : ''}>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-slate-700 font-bold">{topic.name}</Text>
                    <Text className="text-slate-900 font-bold">{topic.progress}%</Text>
                  </View>
                  <ProgressBar progress={topic.progress} color={topic.color} />
                </View>
              ))}
            </View>
          </View>

          {/* 4. Recent Activity */}
          <View className="mt-2">
            <Text className="text-slate-900 text-xl font-bold mb-5">Hoạt động gần đây</Text>
            {recentActivities.map((activity, index) => (
              <Animated.View 
                key={activity.id}
                entering={FadeInUp.delay(500 + (index * 100)).duration(600)}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-3 flex-row items-center"
              >
                <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${activity.status === 'Passed' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                  <Ionicons 
                    name={activity.status === 'Passed' ? 'checkmark-done' : 'alert-circle'} 
                    size={24} 
                    color={activity.status === 'Passed' ? '#10B981' : '#F43F5E'} 
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 font-bold text-base" numberOfLines={1}>{activity.title}</Text>
                  <Text className="text-slate-500 text-xs mt-1">{activity.date}</Text>
                </View>
                <View className="items-end">
                  <Text className={`font-bold text-base ${activity.status === 'Passed' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {activity.score}/100
                  </Text>
                  <View className={`px-2 py-0.5 rounded-full mt-1 ${activity.status === 'Passed' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                    <Text className={`text-[10px] font-bold ${activity.status === 'Passed' ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {activity.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
