import { useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

import { useAuthStore } from "@/src/features/auth/store";
import EditProfileForm from "@/src/features/profile/components/EditProfileForm";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuthStore();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <EditProfileForm
          user={user}
          onCancel={() => router.back()}
          onSuccess={async () => {
            await refreshUser?.();
            router.back();
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
