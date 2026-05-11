import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    // Simulate login
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)');
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          className="px-6"
        >
          {/* Header */}
          <View className="items-center mt-12 mb-10">
            <View className="bg-primary/10 p-5 rounded-3xl mb-6">
              <Ionicons name="log-in-outline" size={48} color="#4F46E5" />
            </View>
            <Text className="text-text-primary text-3xl font-bold mb-2">
              Welcome Back
            </Text>
            <Text className="text-text-secondary text-center text-base">
              Sign in to continue your learning journey
            </Text>
          </View>

          {/* Form Card */}
          <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
            <Input
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              icon="mail-outline"
              keyboardType="email-address"
            />
            
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              icon="lock-closed-outline"
              secureTextEntry
            />

            <TouchableOpacity 
              onPress={() => router.push('/forgot-password')}
              className="items-end mb-8"
            >
              <Text className="text-primary font-medium">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <Button 
              title="Sign In" 
              onPress={handleLogin} 
              loading={loading}
            />
          </View>

          {/* Footer */}
          <View className="flex-row justify-center mt-auto py-8">
            <Text className="text-text-secondary text-base">
              Don&apos;t have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text className="text-primary font-bold text-base">
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
