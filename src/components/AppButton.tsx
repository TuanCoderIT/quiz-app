import { LinearGradient } from 'expo-linear-gradient';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    type PressableProps,
    type StyleProp,
    type TextStyle,
    type ViewStyle,
} from 'react-native';

import { Colors, Gradients } from '../theme';

type AppButtonProps = {
  title: string;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
} & Pick<PressableProps, 'onPress' | 'accessibilityLabel'>;

export const PrimaryButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
}: AppButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles.primaryShadow,
        (pressed || isDisabled) && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={Gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientFill}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={[styles.primaryText, textStyle]}>{title}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
};

export const SecondaryButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
}: AppButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles.secondary,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.primary.DEFAULT} />
      ) : (
        <Text style={[styles.secondaryText, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    width: '100%',
    overflow: 'hidden',
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryShadow: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 3,
  },
  gradientFill: {
    height: 52,
    width: '100%',
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    minHeight: 48,
    backgroundColor: Colors.secondaryButton,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryText: {
    color: Colors.primary.DEFAULT,
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.64,
  },
});
