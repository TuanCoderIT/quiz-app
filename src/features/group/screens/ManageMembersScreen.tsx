import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  approveRequest,
  demoteMember,
  getJoinRequests,
  getMembers,
  kickMember,
  promoteMember,
  rejectRequest,
} from "../group.api";
import { GroupJoinRequest, GroupMember } from "../group.types";
import MemberItem from "../components/Memberitem";
import EmptyState from "../components/Emptystate";
import LoadingState from "../components/Loadingstate";

// Note: replace with your actual auth hook
const useCurrentUser = () => ({ id: undefined as number | undefined });

export default function ManageMembersScreen() {
  const { groupId, isOwner } = useLocalSearchParams<{
    groupId: string;
    isOwner?: string;
  }>();

  const { id: currentUserId } = useCurrentUser();
  const numGroupId = Number(groupId);
  const canManage = true; // must be owner/admin to reach this screen
  const userIsOwner = isOwner === "true";

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [requests, setRequests] = useState<GroupJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"members" | "requests">("members");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mem, reqs] = await Promise.all([
        getMembers(numGroupId),
        getJoinRequests(numGroupId),
      ]);
      setMembers(mem);
      setRequests(reqs);
    } catch {
      Alert.alert("Lỗi", "Không thể tải danh sách.");
    } finally {
      setLoading(false);
    }
  }, [numGroupId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleKick = async (userId: number) => {
    try {
      await kickMember(numGroupId, userId);
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
    } catch {
      Alert.alert("Lỗi", "Không thể xóa thành viên.");
    }
  };

  const handlePromote = async (userId: number) => {
    try {
      await promoteMember(numGroupId, userId);
      setMembers((prev) =>
        prev.map((m) => (m.user_id === userId ? { ...m, role: "admin" } : m))
      );
    } catch {
      Alert.alert("Lỗi", "Không thể thăng cấp thành viên.");
    }
  };

  const handleDemote = async (userId: number) => {
    try {
      await demoteMember(numGroupId, userId);
      setMembers((prev) =>
        prev.map((m) => (m.user_id === userId ? { ...m, role: "member" } : m))
      );
    } catch {
      Alert.alert("Lỗi", "Không thể hạ cấp thành viên.");
    }
  };

  const handleApprove = async (req: GroupJoinRequest) => {
    try {
      await approveRequest(req.id);
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
    } catch {
      Alert.alert("Lỗi", "Không thể duyệt yêu cầu.");
    }
  };

  const handleReject = async (req: GroupJoinRequest) => {
    try {
      await rejectRequest(req.id);
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
    } catch {
      Alert.alert("Lỗi", "Không thể từ chối yêu cầu.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center gap-3 border-b border-border px-5 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color="#4F46E5" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-text-primary">Quản lý nhóm</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-border">
        {[
          { key: "members", label: `Thành viên (${members.length})` },
          { key: "requests", label: `Yêu cầu tham gia (${requests.length})` },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setTab(t.key as "members" | "requests")}
            className={`flex-1 items-center py-3 ${
              tab === t.key ? "border-b-2 border-primary" : ""
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                tab === t.key ? "text-primary" : "text-text-secondary"
              }`}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <LoadingState />
      ) : tab === "members" ? (
        <FlatList
          data={members}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View className="px-5">
              <MemberItem
                member={item}
                canManage={canManage}
                currentUserId={currentUserId}
                onKick={handleKick}
                onPromote={userIsOwner ? handlePromote : undefined}
                onDemote={userIsOwner ? handleDemote : undefined}
              />
            </View>
          )}
          ItemSeparatorComponent={() => (
            <View className="mx-5 border-b border-border/50" />
          )}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="Chưa có thành viên"
              description="Nhóm chưa có thành viên nào."
            />
          }
        />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View className="flex-row items-center justify-between px-5 py-3">
              <View className="flex-row items-center gap-3">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/15">
                  <Text className="text-base font-bold text-primary">
                    {item.user.name?.[0]?.toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text className="text-sm font-semibold text-text-primary">
                    {item.user.name}
                  </Text>
                  <Text className="text-xs text-text-secondary">
                    {new Date(item.created_at).toLocaleDateString("vi-VN")}
                  </Text>
                </View>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => handleApprove(item)}
                  className="rounded-full bg-primary px-3 py-1.5"
                >
                  <Text className="text-xs font-semibold text-white">Duyệt</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleReject(item)}
                  className="rounded-full border border-border bg-surface px-3 py-1.5"
                >
                  <Text className="text-xs font-medium text-text-secondary">
                    Từ chối
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => (
            <View className="mx-5 border-b border-border/50" />
          )}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="person-add-outline"
              title="Không có yêu cầu nào"
              description="Hiện chưa có yêu cầu tham gia nhóm."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}