import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Animated, { 
  FadeIn, 
  FadeInUp, 
} from 'react-native-reanimated';
import { useAuthStore } from '../../src/stores/auth.store';
import ProfileMenuItem from '../../src/components/profile/ProfileMenuItem';
import AchievementCard from '../../src/components/profile/AchievementCard';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất không?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Đăng xuất", 
          style: "destructive", 
          onPress: async () => {
            await logout();
          } 
        }
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert("Thông báo", "Tính năng Chỉnh sửa hồ sơ đang được phát triển.");
  };

  // Mock stats
  const achievements = [
    { label: "Quizzes", value: "24", icon: "checkmark-circle", color: "#4F46E5" },
    { label: "Accuracy", value: "85%", icon: "trending-up", color: "#10B981" },
    { label: "Streak", value: "12", icon: "flame", color: "#F59E0B" },
    { label: "Flashcards", value: "156", icon: "copy", color: "#7C3AED" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* 1. Profile Header Card */}
        <Animated.View 
          entering={FadeIn.duration(800)}
          className="mx-5 mt-4 shadow-xl shadow-primary/30"
        >
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20, padding: 24 }}
          >
            <View className="flex-row items-center justify-between mb-6 px-3">
              <View className="flex-row items-center">
                <View className="relative">
                  <Image
                    source={user?.avatar || require('../../assets/images/default_avatar.png')}
                    className="w-20 h-20 rounded-full border-4 border-white/30"
                    contentFit="cover"
                    transition={500}
                  />
                  <TouchableOpacity 
                    onPress={handleEditProfile}
                    className="absolute bottom-0 right-0 bg-white w-7 h-7 rounded-full items-center justify-center shadow-sm"
                  >
                    <Ionicons name="camera" size={14} color="#4F46E5" />
                  </TouchableOpacity>
                </View>
                <View className="ml-4">
                  <Text className="text-white text-xl font-bold">
                    {user?.name || "Người dùng"}
                  </Text>
                  <Text className="text-white/80 text-sm">
                    {user?.email || "user@example.com"}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row justify-between bg-white/10 rounded-[20px] p-4">
              <View className="items-center flex-1 border-r border-white/20">
                <Text className="text-white/70 text-xs font-medium mb-1">Level</Text>
                <Text className="text-white text-lg font-bold">12</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-white/70 text-xs font-medium mb-1">Tổng XP</Text>
                <Text className="text-white text-lg font-bold">2,450</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* 2. Achievement Summary */}
        <View className="mx-5 mt-8">
          <Text className="text-text-primary text-lg font-bold mb-4">Thành tích học tập</Text>
          <View className="flex-row flex-wrap -m-2">
            {achievements.map((item, index) => (
              <View key={index} className="w-1/2 p-2">
                <AchievementCard 
                  index={index}
                  {...item}
                  icon={item.icon as any}
                  className="m-0"
                />
              </View>
            ))}
          </View>
        </View>

        {/* 3. Menu Section */}
        <Animated.View 
          entering={FadeInUp.delay(400).duration(600)}
          className="mx-5 mt-8 bg-white rounded-[20px] p-2 shadow-sm border border-gray-50"
        >
          <ProfileMenuItem 
            icon="person-outline" 
            label="Chỉnh sửa hồ sơ" 
            onPress={handleEditProfile} 
          />
          <ProfileMenuItem 
            icon="trophy-outline" 
            label="Thành tích của tôi" 
            onPress={() => {}} 
          />
          <ProfileMenuItem 
            icon="settings-outline" 
            label="Cài đặt học tập" 
            onPress={() => {}} 
          />
          <ProfileMenuItem 
            icon="notifications-outline" 
            label="Thông báo" 
            onPress={() => {}} 
          />
          <ProfileMenuItem 
            icon="help-circle-outline" 
            label="Hỗ trợ & Góp ý" 
            onPress={() => {}} 
          />
          <ProfileMenuItem 
            icon="information-circle-outline" 
            label="Về ứng dụng" 
            onPress={() => {}} 
            isLast={true}
          />
        </Animated.View>

        {/* 4. Logout Button */}
        <Animated.View 
          entering={FadeInUp.delay(600).duration(600)}
          className="mx-5 mt-8"
        >
          <TouchableOpacity 
            onPress={handleLogout}
            className="flex-row items-center justify-center bg-red-50 py-4 rounded-xl border border-red-100"
          >
            <Ionicons name="log-out-outline" size={22} color="#EF4444" className="mr-2" />
            <Text className="text-red-500 font-bold text-lg ml-2">Đăng xuất</Text>
          </TouchableOpacity>
          <Text className="text-center text-text-secondary text-xs mt-6">
            Phiên bản 1.0.0 (Build 20260512)
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
