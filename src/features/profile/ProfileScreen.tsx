import { useState } from "react";
import { ScrollView } from "react-native";

import ProfileHeaderCard from "./components/ProfileHeaderCard";
import PersonalInfoCard from "./components/PersonalInfoCard";
import EditProfileForm from "./components/EditProfileForm";
import SecurityCard from "./components/SecurityCard";
import ChangePasswordForm from "./components/ChangePasswordForm";

import { useAuthStore } from "@/src/features/auth/store";

export default function ProfileScreen() {
  const { user, refreshUser } = useAuthStore();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
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
      <ProfileHeaderCard user={user} />

      {isEditingProfile ? (
        <EditProfileForm
          user={user}
          onCancel={() => setIsEditingProfile(false)}
          onSuccess={async () => {
            await refreshUser?.();
            setIsEditingProfile(false);
          }}
        />
      ) : (
        <PersonalInfoCard
          user={user}
          onEdit={() => setIsEditingProfile(true)}
        />
      )}

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