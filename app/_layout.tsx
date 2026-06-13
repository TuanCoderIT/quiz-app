import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "../global.css";
import { AchievementUnlockPopup } from "../src/features/gamification/components/AchievementUnlockPopup";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide the native splash screen once the app is ready
    SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="achievements" />
        <Stack.Screen name="leaderboard" />
      </Stack>

      <AchievementUnlockPopup />
    </>
  );
}
