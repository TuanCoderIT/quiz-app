import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackground, GlassCard, PrimaryButton } from '../../src/components';
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
    <AppBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>AI PRACTICE</Text>
              </View>

              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>
                Continue your learning flow with focused quizzes and clear
                progress.
              </Text>
            </View>

            <GlassCard>
              <Text style={styles.cardTitle}>Sign in</Text>
              <Text style={styles.cardSubtitle}>
                Use your account to pick up right where you left off.
              </Text>

              <Input
                variant="liquid"
                label="Email address"
                placeholder="name@example.com"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setEmailError('');
                  setFormError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                error={emailError}
              />

              <Input
                variant="liquid"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setPasswordError('');
                  setFormError('');
                }}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                error={passwordError}
              />

              {formError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{formError}</Text>
                </View>
              ) : null}

              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/forgot-password')}
                style={styles.forgot}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>

              <PrimaryButton
                title="Sign In"
                onPress={handleLogin}
                loading={isAuthLoading}
              />
            </GlassCard>

            <View style={styles.signup}>
              <Text style={styles.signupText}>New to Quiz App?</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/register')}
                hitSlop={8}
              >
                <Text style={styles.signupLink}>Create Account</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 42,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badge: {
    borderRadius: 999,
    backgroundColor: 'rgba(6,182,212,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 18,
  },
  badgeText: {
    color: '#0891B2',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0,
  },
  title: {
    color: '#0F172A',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 37,
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 300,
    color: '#64748B',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    textAlign: 'center',
  },
  cardTitle: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  cardSubtitle: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 22,
  },
  errorBox: {
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 2,
    marginBottom: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  forgot: {
    minHeight: 34,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 14,
  },
  forgotText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '700',
  },
  signup: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  signupText: {
    color: '#64748B',
    fontSize: 14,
    marginBottom: 6,
  },
  signupLink: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default LoginScreen;
