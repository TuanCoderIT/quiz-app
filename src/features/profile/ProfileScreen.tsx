import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView } from "react-native";

import ChangePasswordForm from "./components/ChangePasswordForm";
import PersonalInfoCard from "./components/PersonalInfoCard";
import ProfileHeaderCard from "./components/ProfileHeaderCard";
import SecurityCard from "./components/SecurityCard";

import { useAuthStore } from "@/src/features/auth/store";

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [showFullInfo, setShowFullInfo] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 120,
      }}
      showsVerticalScrollIndicator={false}
    >
      <ProfileHeaderCard
        user={user}
        showFullInfo={showFullInfo}
        onToggleFullInfo={() => setShowFullInfo((prev) => !prev)}
        onEdit={() => router.push("/profile/edit")}
      />

      {showFullInfo ? <PersonalInfoCard user={user} /> : null}

      {isChangingPassword ? (
        <ChangePasswordForm
          onCancel={() => setIsChangingPassword(false)}
          onSuccess={() => setIsChangingPassword(false)}
        />
      ) : (
        <SecurityCard onPress={() => setIsChangingPassword(true)} />
      )}
    </ScrollView>
  );
}
