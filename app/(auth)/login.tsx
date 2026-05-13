import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { useAuthStore } from '../../src/stores/auth.store';

const getLoginErrorMessage = (error: unknown) => {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response
  ) {
    const data = error.response.data as {
      message?: string;
      errors?: Record<string, string[]>;
    };

    const firstFieldError = data.errors
      ? Object.values(data.errors).flat()[0]
      : undefined;

    return firstFieldError || data.message || 'Không thể đăng nhập.';
  }

  return 'Không thể kết nối tới máy chủ. Vui lòng thử lại.';
};

const LoginScreen = () => {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  const validateForm = () => {
    const normalizedEmail = email.trim();
    let isValid = true;

    setEmailError('');
    setPasswordError('');
    setFormError('');

    if (!normalizedEmail) {
      setEmailError('Vui lòng nhập email.');
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setEmailError('Email không hợp lệ.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu.');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Mật khẩu tối thiểu 8 ký tự.');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (isAuthLoading) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      await login(email.trim(), password);
      router.replace('/(tabs)/practice');
    } catch (error) {
      setFormError(getLoginErrorMessage(error));
    }
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
              onChangeText={(value) => {
                setEmail(value);
                setEmailError('');
                setFormError('');
              }}
              icon="mail-outline"
              keyboardType="email-address"
              error={emailError}
            />
            
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setPasswordError('');
                setFormError('');
              }}
              icon="lock-closed-outline"
              secureTextEntry
              error={passwordError}
            />

            {formError ? (
              <View className="bg-error/10 border border-error/20 rounded-2xl px-4 py-3 mb-5">
                <Text className="text-error text-sm font-semibold">
                  {formError}
                </Text>
              </View>
            ) : null}

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
              loading={isAuthLoading}
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
