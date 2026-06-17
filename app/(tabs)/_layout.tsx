import { useAuthStore } from "@/src/features/auth/store";
import { useRealtimeNotifications } from "@/src/features/notification/hooks/useRealtimeNotifications";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform } from "react-native";

export default function TabLayout() {
  const user = useAuthStore((state) => state.user);

  useRealtimeNotifications(user?.id);
  
  return (
    <>
      <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,

          tabBarActiveTintColor: "#000",
          tabBarInactiveTintColor: "#D1D5DB",

          tabBarStyle: {
            marginHorizontal: 40,
            position: "absolute",
            bottom: Platform.OS === "ios" ? 24 : 16,

            height: 56,

            backgroundColor: "#fff",
            borderRadius: 30,
            borderTopWidth: 0,

            elevation: 18,

            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 10,
            },
            shadowOpacity: 0.15,
            shadowRadius: 20,
          },

          tabBarItemStyle: {
            paddingTop: 6,
            alignItems: "center",
            justifyContent: "center",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="home" size={26} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="practice"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="book" size={26} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="flashcard"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="layers" size={26} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="community"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="people" size={26} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="person" size={26} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
