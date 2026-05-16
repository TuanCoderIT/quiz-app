import type { PropsWithChildren } from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle
} from 'react-native';

type GlassCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}>;

export const GlassCard = ({
  children,
  style,
  contentStyle,
}: GlassCardProps) => {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.84)',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.72)',

    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.07,
    shadowRadius: 30,
    elevation: 2,
  },

  content: {
    padding: 24,
  },
});
