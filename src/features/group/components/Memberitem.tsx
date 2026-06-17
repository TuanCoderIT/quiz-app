import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { getImageUrl } from "@/src/utils/image";
import { GroupMember } from "../group.types";

const ROLE_LABELS: Record<GroupMember["role"], string> = {
  owner: "Chủ nhóm",
  admin: "Quản trị",
  member: "Thành viên",
};

const ROLE_COLORS: Record<GroupMember["role"], string> = {
  owner: "bg-primary/15 text-primary",
  admin: "bg-amber-100 text-amber-700",
  member: "bg-muted text-text-secondary",
};

interface MemberItemProps {
  member: GroupMember;
  canManage?: boolean;
  currentUserId?: number;
  onKick?: (userId: number) => void;
  onPromote?: (userId: number) => void;
  onDemote?: (userId: number) => void;
}

export default function MemberItem({
  member,
  canManage,
  currentUserId,
  onKick,
  onPromote,
  onDemote,
}: MemberItemProps) {
  const isSelf = member.user_id === currentUserId;
  const isOwner = member.role === "owner";
  const avatarUrl = getImageUrl(member.user.avatar);
  const avatarLetter = member.user.name?.[0]?.toUpperCase() ?? "?";

  const confirmKick = () => {
    Alert.alert(
      "Xóa thành viên",
      `Xóa ${member.user.name} khỏi nhóm?`,
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: () => onKick?.(member.user_id) },
      ]
    );
  };

  return (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-row items-center gap-3">
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            className="h-11 w-11 rounded-full"
          />
        ) : (
          <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/15">
            <Text className="text-base font-bold text-primary">
              {avatarLetter}
            </Text>
          </View>
        )}
        <View>
          <Text className="text-sm font-semibold text-text-primary">
            {member.user.name}
            {isSelf && (
              <Text className="font-normal text-text-secondary"> (Bạn)</Text>
            )}
          </Text>
          <View
            className={`mt-1 self-start rounded-full px-2 py-0.5 ${ROLE_COLORS[member.role].split(" ")[0]}`}
          >
            <Text
              className={`text-xs font-medium ${ROLE_COLORS[member.role].split(" ")[1]}`}
            >
              {ROLE_LABELS[member.role]}
            </Text>
          </View>
        </View>
      </View>

      {canManage && !isSelf && !isOwner && (
        <View className="flex-row gap-1">
          {member.role === "member" && onPromote && (
            <TouchableOpacity
              onPress={() => onPromote(member.user_id)}
              className="rounded-full p-2"
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="arrow-up-circle-outline" size={20} color="#4F46E5" />
            </TouchableOpacity>
          )}
          {member.role === "admin" && onDemote && (
            <TouchableOpacity
              onPress={() => onDemote(member.user_id)}
              className="rounded-full p-2"
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="arrow-down-circle-outline" size={20} color="#F59E0B" />
            </TouchableOpacity>
          )}
          {onKick && (
            <TouchableOpacity
              onPress={confirmKick}
              className="rounded-full p-2"
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="remove-circle-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
