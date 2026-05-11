import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  Easing,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const SplashScreen = () => {
  const router = useRouter();
  
  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.3);
  const contentTranslateY = useSharedValue(20);
  const contentOpacity = useSharedValue(0);
  const footerOpacity = useSharedValue(0);

  useEffect(() => {
    // Sequence animations
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withSpring(1, { damping: 12 });
    
    contentTranslateY.value = withTiming(0, { 
      duration: 800, 
      easing: Easing.out(Easing.back(1.5)) 
    });
    contentOpacity.value = withTiming(1, { duration: 1000 });
    
    footerOpacity.value = withTiming(1, { duration: 1200 });

    // Check auth and navigate
    const timer = setTimeout(() => {
      checkAuthStatus();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const checkAuthStatus = async () => {
    // TODO: Implement actual auth check with SecureStore or Zustand
    const isLoggedIn = false; // Mocked value
    
    if (isLoggedIn) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  };

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        className="flex-1 items-center justify-between py-16"
      >
        {/* Empty view for top spacing */}
        <View />

        {/* Main Content */}
        <View className="items-center">
          <Animated.View style={logoStyle} className="mb-6">
            <View className="bg-white/20 p-6 rounded-3xl backdrop-blur-md shadow-xl border border-white/30">
              <Image 
                source={require('../assets/images/logo.png')} 
                className="w-24 h-24"
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          <Animated.View style={contentStyle} className="items-center">
            <Text className="text-white text-4xl font-bold tracking-tight mb-2">
              AI Quiz Master
            </Text>
            <Text className="text-white/80 text-lg font-medium">
              Learn Smarter with AI
            </Text>
          </Animated.View>
        </View>

        {/* Footer */}
        <Animated.View style={footerStyle} className="items-center w-full px-8">
          <ActivityIndicator size="large" color="#FFFFFF" className="mb-6" />
          <Text className="text-white/50 text-sm font-medium">
            Version 1.0.0
          </Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

export default SplashScreen;
