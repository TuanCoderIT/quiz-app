import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';

interface ButtonProps {
  onPress: () => void;
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const Button: React.FC<ButtonProps> = ({ 
  onPress, 
  title, 
  loading, 
  variant = 'primary',
  className = ''
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.96);
  };

  const onPressOut = () => {
    scale.value = withSpring(1);
  };

  if (variant === 'primary') {
    return (
      <AnimatedTouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={animatedStyle}
        className={`w-full overflow-hidden rounded-xl shadow-lg shadow-primary/30 ${className}`}
      >
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="py-4 items-center justify-center"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-bold text-lg">
              {title}
            </Text>
          )}
        </LinearGradient>
      </AnimatedTouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`w-full py-4 rounded-xl items-center justify-center ${
        variant === 'outline' ? 'border border-gray-200 bg-white' : 'bg-gray-100'
      } ${className}`}
    >
      <Text className={`font-bold text-lg ${
        variant === 'outline' ? 'text-gray-700' : 'text-gray-500'
      }`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
