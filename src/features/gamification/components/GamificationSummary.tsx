import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { User } from "../../auth/types";

const formatNumber = (value?: number) =>
  new Intl.NumberFormat("vi-VN").format(Number(value || 0));

const isToday = (value?: string | null) => {
  if (!value) {
    return false;
  }

  const activityDate = new Date(value);

  if (Number.isNaN(activityDate.getTime())) {
    return false;
  }

  const today = new Date();

  return (
    activityDate.getFullYear() === today.getFullYear() &&
    activityDate.getMonth() === today.getMonth() &&
    activityDate.getDate() === today.getDate()
  );
};

type SummaryItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colorClassName: string;
};

const SummaryItem = ({
  icon,
  label,
  value,
  colorClassName,
}: SummaryItemProps) => (
  <View className="w-1/2 p-1.5">
    <View className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
      <View className="flex-row items-center mb-2">
        <View
          className={`w-8 h-8 rounded-full items-center justify-center ${colorClassName}`}
        >
          <Ionicons name={icon} size={17} color="#FFFFFF" />
        </View>
        <Text
          className="text-slate-500 text-xs font-semibold ml-2 flex-1"
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
      <Text className="text-slate-900 text-xl font-extrabold">{value}</Text>
    </View>
  </View>
);

export const getLearningStatusLabel = (lastActivityAt?: string | null) =>
  isToday(lastActivityAt) ? "Đã học hôm nay" : "Chưa học hôm nay";

export const GamificationSummary = ({ user }: { user: User | null }) => (
  <View className="bg-white rounded-3xl border border-slate-100 p-4">
    <View className="flex-row items-center justify-between mb-2">
      <Text className="text-slate-900 text-lg font-extrabold">
        Tiến độ học tập
      </Text>
      <View
        className={`px-3 py-1.5 rounded-full ${
          isToday(user?.last_activity_at) ? "bg-emerald-50" : "bg-amber-50"
        }`}
      >
        <Text
          className={`text-xs font-bold ${
            isToday(user?.last_activity_at)
              ? "text-emerald-700"
              : "text-amber-700"
          }`}
        >
          {getLearningStatusLabel(user?.last_activity_at)}
        </Text>
      </View>
    </View>

    <View className="flex-row flex-wrap -m-1.5">
      <SummaryItem
        icon="sparkles"
        label="XP hiện tại"
        value={formatNumber(user?.xp)}
        colorClassName="bg-violet-600"
      />
      <SummaryItem
        icon="flame"
        label="Streak hiện tại"
        value={`${formatNumber(user?.current_streak)} ngày`}
        colorClassName="bg-orange-500"
      />
      <SummaryItem
        icon="trophy"
        label="Streak dài nhất"
        value={`${formatNumber(user?.longest_streak)} ngày`}
        colorClassName="bg-emerald-600"
      />
      <SummaryItem
        icon="snow"
        label="Freeze còn lại"
        value={formatNumber(user?.streak_freezes)}
        colorClassName="bg-sky-600"
      />
    </View>
  </View>
);
