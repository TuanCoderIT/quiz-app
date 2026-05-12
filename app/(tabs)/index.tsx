import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { QuizCard } from "../../src/components/QuizCard";
import { StatsCard } from "../../src/components/StatsCard";
import { useAuthStore } from "../../src/stores/auth.store";

const HomeScreen = () => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng,";
    if (hour < 18) return "Chào buổi chiều,";
    return "Chào buổi tối, bạn yêu";
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
      >
        {/* Header Greeting */}
        <View className="flex-row items-center justify-between mt-6 mb-8">
          <View>
            <Text className="text-text-secondary text-lg font-medium">
              {getGreeting()}
            </Text>
            <Text className="text-text-primary text-3xl font-bold">
              {user?.name || "Bạn"} 👋
            </Text>
            <Text className="text-text-secondary mt-1">
              Sẵn sàng để tiếp tục học chưa?
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
            className="w-14 h-14 rounded-full border-2 border-primary/20 overflow-hidden"
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} className="w-full h-full" />
            ) : (
              <View className="w-full h-full bg-primary/10 items-center justify-center">
                <Ionicons name="person" size={28} color="#4F46E5" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Continue Learning Card */}
        <LinearGradient
          colors={["#4F46E5", "#7C3AED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 20,
            marginBottom: 32,
            overflow: "hidden",
            padding: 24,
          }}
        >
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 mr-4">
              <Text className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">
                TIẾP TỤC HỌC
              </Text>
              <Text className="text-white text-xl font-bold mb-2">
                Kiến thức cơ bản về AI
              </Text>
              <Text className="text-white/90 text-sm">
                Đã hoàn thành 12/20 câu hỏi
              </Text>
            </View>
            <View className="bg-white/20 p-2 rounded-xl">
              <Ionicons name="play" size={24} color="white" />
            </View>
          </View>

          <View className="h-2 bg-white/20 rounded-full overflow-hidden mb-6">
            <View className="h-full bg-white w-[60%]" />
          </View>

          <TouchableOpacity
            className="bg-white py-3 rounded-xl items-center"
            activeOpacity={0.8}
          >
            <Text className="text-primary font-bold">Tiếp tục ngay</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* AI Quiz Generator Card */}
        <TouchableOpacity
          className="bg-accent/10 border border-accent/20 rounded-3xl p-6 mb-8 flex-row items-center"
          activeOpacity={0.8}
        >
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Ionicons
                name="sparkles"
                size={20}
                color="#06B6D4"
                className="mr-2"
              />
              <Text className="text-accent text-lg font-bold">
                Tạo Quiz với AI
              </Text>
            </View>
            <Text className="text-text-secondary text-sm">
              Tạo bộ câu hỏi thông minh chỉ trong vài giây.
            </Text>
            <TouchableOpacity className="mt-4 bg-accent px-4 py-2 rounded-lg self-start">
              <Text className="text-white font-bold text-xs uppercase">
                Tạo ngay
              </Text>
            </TouchableOpacity>
          </View>
          <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center shadow-sm">
            <Text className="text-4xl">🤖</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Stats */}
        <View className="mb-8">
          <Text className="text-text-primary text-xl font-bold mb-4">
            Thống kê nhanh
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-5 px-5"
          >
            <StatsCard
              label="Đã hoàn thành"
              value="24"
              icon="checkmark-circle"
              color="#10B981"
            />
            <StatsCard
              label="Tỉ lệ chính xác"
              value="85%"
              icon="trending-up"
              color="#4F46E5"
            />
            <StatsCard
              label="Chuỗi ngày"
              value="7"
              icon="flame"
              color="#F59E0B"
            />
            <StatsCard
              label="Điểm XP"
              value="1.2k"
              icon="star"
              color="#7C3AED"
            />
          </ScrollView>
        </View>

        {/* Featured Quizzes */}
        <View>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text-primary text-xl font-bold">
              Quiz nổi bật
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/practice")}>
              <Text className="text-primary font-bold">Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <QuizCard
            title="Lập trình React Native"
            category="Mobile App"
            difficulty="Trung bình"
            questionCount={15}
          />
          <QuizCard
            title="Machine Learning 101"
            category="AI & Data"
            difficulty="Khó"
            questionCount={20}
          />
          <QuizCard
            title="Lịch sử thế giới"
            category="Xã hội"
            difficulty="Dễ"
            questionCount={10}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
