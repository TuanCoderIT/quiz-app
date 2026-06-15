import type { PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

type AppCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}>;

export const AppCard = ({ children, style, contentStyle }: AppCardProps) => {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,

    backgroundColor: "#FFFFFF",

    shadowColor: "#6366F1",

    shadowOffset: {
      width: 0,
      height: 12,
    },

    shadowOpacity: 0.08,
    shadowRadius: 24,

    elevation: 12,
  },

  content: {
    padding: 20,
  },
});
