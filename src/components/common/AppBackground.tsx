import { LinearGradient } from "expo-linear-gradient";
import type { PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

type AppBackgroundProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}>;

export const AppBackground = ({
  children,
  style,
  contentStyle,
}: AppBackgroundProps) => {
  return (
    <LinearGradient
      colors={["#FFFFFF", "#FBF8FF", "#F5F9FF", "#FFFDF8"]}
      locations={[0, 0.38, 0.72, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.background, style]}
    >
      <View style={[styles.content, contentStyle]}>{children}</View>
    </LinearGradient>
  );
};

export const cardShadow = {
  shadowColor: "#6366F1",

  shadowOffset: {
    width: 0,
    height: 10,
  },

  shadowOpacity: 0.08,
  shadowRadius: 24,

  elevation: 12,
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  content: {
    flex: 1,
  },
});
