import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

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
      colors={['#FFFFFF', '#F3F6FF', '#E8EEFF']}
      locations={[0, 0.48, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.background, style]}
    >
      <LinearGradient
        pointerEvents="none"
        colors={[
          'rgba(238,242,255,0.78)',
          'rgba(236,254,255,0.52)',
          'rgba(255,255,255,0.08)',
        ]}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.softWashTop}
      />

      <LinearGradient
        pointerEvents="none"
        colors={[
          'rgba(255,255,255,0.00)',
          'rgba(238,242,255,0.45)',
          'rgba(236,254,255,0.34)',
        ]}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.softWashBottom}
      />

      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  softWashTop: {
    position: 'absolute',
    top: 120,
    left: 24,
    right: 24,
    height: 210,
    borderRadius: 32,
    opacity: 0.9,
  },

  softWashBottom: {
    position: 'absolute',
    bottom: 110,
    left: 28,
    right: 28,
    height: 260,
    borderRadius: 36,
    opacity: 0.85,
  },

  content: {
    flex: 1,
  },
});