import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleResetPassword = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View className="px-6 py-4">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm">
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          className="px-6"
        >
          {/* Header */}
          <View className="items-center mt-8 mb-10">
            <View className="bg-primary/10 p-5 rounded-3xl mb-6">
              <Ionicons name="key-outline" size={48} color="#4F46E5" />
            </View>
            <Text className="text-text-primary text-3xl font-bold mb-2">
              Forgot Password?
            </Text>
            <Text className="text-text-secondary text-center text-base">
              {isSent 
                ? "We've sent password reset instructions to your email."
                : "Enter your email address and we'll send you instructions to reset your password."
              }
            </Text>
          </View>

          {/* Content */}
          <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
            {!isSent ? (
              <>
                <Input
                  label="Email Address"
                  placeholder="name@example.com"
                  value={email}
                  onChangeText={setEmail}
                  icon="mail-outline"
                  keyboardType="email-address"
                />
                
                <View className="mt-4">
                  <Button 
                    title="Send Instructions" 
                    onPress={handleResetPassword} 
                    loading={loading}
                  />
                </View>
              </>
            ) : (
              <Button 
                title="Back to Login" 
                onPress={() => router.replace('/login')}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
