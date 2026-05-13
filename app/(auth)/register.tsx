import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';

const RegisterScreen = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    // Simulate registration
    setTimeout(() => {
      setLoading(false);
      router.replace('/flashcards');
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
          <View className="items-center mt-8 mb-8">
            <View className="bg-secondary/10 p-5 rounded-3xl mb-6">
              <Text className="text-4xl">🎓</Text>
            </View>
            <Text className="text-text-primary text-3xl font-bold mb-2">
              Create Account
            </Text>
            <Text className="text-text-secondary text-center text-base px-4">
              Start your smart learning journey today with AI-powered quizzes
            </Text>
          </View>

          {/* Form Card */}
          <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 mb-6">
            <Input
              label="Full Name"
              placeholder="Enter your name"
              value={fullName}
              onChangeText={setFullName}
              icon="person-outline"
            />

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
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              icon="lock-closed-outline"
              secureTextEntry
            />

            <Input
              label="Confirm Password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              icon="shield-checkmark-outline"
              secureTextEntry
            />

            <View className="mt-4">
              <Button 
                title="Create Account" 
                onPress={handleRegister} 
                loading={loading}
              />
            </View>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center mt-auto py-8">
            <Text className="text-text-secondary text-base">
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text className="text-primary font-bold text-base">
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
