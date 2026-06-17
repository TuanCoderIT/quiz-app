// app/notifications/index.tsx

import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

import { NotificationItem } from "@/src/features/notification/components/NotificationItem";
import { AppNotification } from "@/src/features/notification/types";
import { useNotifications } from "@/src/features/notification/hooks/useNotifications";

export default function NotificationsScreen() {
  const {
    notifications,
    unreadCount,

    isLoading,
    isRefreshing,
    isLoadingMore,
    error,

    refreshNotifications,
    loadMore,

    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearRead,
  } = useNotifications();

  const handlePressNotification = async (notification: AppNotification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    handleNavigateByNotification(notification);
  };

  const handleNavigateByNotification = (notification: AppNotification) => {
    const actionUrl =
      notification.action_url || notification.data?.action_url;

    if (!actionUrl) return;

    /**
     * Backend của bạn đang trả action_url kiểu:
     * /chat/threads/{id}
     * /groups/{slug}
     * /courses/{slug}
     * /exams/{id}
     * /exams/{id}/results
     * /wallet
     *
     * Nhưng app hiện tại của bạn có thể đang dùng:
     * /quiz/[id]
     * /flashcard/[id]
     * /group/[id]
     * /wallet
     *
     * Vì vậy nên map lại cho đúng Expo Router.
     */

    if (actionUrl.startsWith("/wallet")) {
      router.push("/wallet" as any);
      return;
    }

    if (actionUrl.startsWith("/exams/")) {
      const parts = actionUrl.split("/");
      const quizId = parts[2];

      if (quizId) {
        router.push(`/quiz/${quizId}` as any);
      }

      return;
    }

    if (actionUrl.startsWith("/groups/")) {
      const parts = actionUrl.split("/");
      const groupSlug = parts[2];

      if (groupSlug) {
        router.push(`/group/${groupSlug}` as any);
      }

      return;
    }

    if (actionUrl.startsWith("/courses/")) {
      const extraData = notification.data?.extra_data;
      const courseId = extraData?.course_id;

      if (courseId) {
        router.push(`/course/${courseId}` as any);
      }

      return;
    }
  };

  const handleDelete = (notification: AppNotification) => {
    Alert.alert(
      "Xóa thông báo",
      "Bạn có chắc chắn muốn xóa thông báo này không?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => deleteNotification(notification.id),
        },
      ]
    );
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount <= 0) return;

    Alert.alert(
      "Đánh dấu tất cả đã đọc",
      `Bạn có muốn đánh dấu ${unreadCount} thông báo là đã đọc không?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đồng ý",
          onPress: markAllAsRead,
        },
      ]
    );
  };

  const handleClearRead = () => {
    Alert.alert(
      "Xóa thông báo đã đọc",
      "Bạn có chắc chắn muốn xóa tất cả thông báo đã đọc không?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: clearRead,
        },
      ]
    );
  };

  if (isLoading && notifications.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator />
        <Text className="mt-3 text-gray-500">
          Đang tải thông báo...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 pb-4 pt-12">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-base text-blue-600">Quay lại</Text>
          </TouchableOpacity>

          <Text className="text-xl font-bold text-gray-900">
            Thông báo
          </Text>

          <View className="w-16" />
        </View>

        <View className="mt-4 flex-row items-center justify-between">
          <Text className="text-sm text-gray-500">
            {unreadCount > 0
              ? `${unreadCount} thông báo chưa đọc`
              : "Không có thông báo chưa đọc"}
          </Text>

          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead}>
              <Text className="text-sm font-semibold text-blue-600">
                Đọc tất cả
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {notifications.some((item) => item.is_read) && (
          <TouchableOpacity
            onPress={handleClearRead}
            className="mt-3 self-start"
          >
            <Text className="text-sm text-red-500">
              Xóa thông báo đã đọc
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View className="mx-4 mt-3 rounded-xl bg-red-50 p-3">
          <Text className="text-sm text-red-600">{error}</Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 32,
          flexGrow: 1,
        }}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={handlePressNotification}
            onDelete={handleDelete}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshNotifications}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isLoadingMore ? (
            <View className="py-4">
              <ActivityIndicator />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-6 py-24">
            <Text className="text-5xl">🔔</Text>
            <Text className="mt-4 text-lg font-bold text-gray-800">
              Chưa có thông báo
            </Text>
            <Text className="mt-2 text-center text-sm text-gray-500">
              Các cập nhật về quiz, token, nhóm học tập và hệ thống sẽ hiển thị tại đây.
            </Text>
          </View>
        }
      />
    </View>
  );
}