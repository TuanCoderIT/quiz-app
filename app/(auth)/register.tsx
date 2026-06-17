import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/common/Button";
import { Input } from "../../src/components/common/Input";
import { useAuthStore } from "../../src/features/auth/store";

type RegisterErrors = {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
  form?: string;
};

const getRegisterErrorMessage = (error: unknown) => {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response
  ) {
    const data = error.response.data as {
      message?: string;
      errors?: Record<string, string[]>;
    };

    const firstFieldError = data.errors
      ? Object.values(data.errors).flat()[0]
      : undefined;

    return firstFieldError || data.message || "Không thể đăng ký.";
  }

  return "Không thể kết nối tới máy chủ. Vui lòng thử lại.";
};

const RegisterScreen = () => {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<RegisterErrors>({});

  const validateForm = () => {
    const nextErrors: RegisterErrors = {};
    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim();

    if (!normalizedName) {
      nextErrors.name = "Vui lòng nhập họ và tên.";
    }

    if (!normalizedEmail) {
      nextErrors.email = "Vui lòng nhập email.";
    } else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      nextErrors.email = "Email không hợp lệ.";
    }

    if (!password) {
      nextErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (password.length < 8) {
      nextErrors.password = "Mật khẩu tối thiểu 8 ký tự.";
    }

    if (!confirmPassword) {
      nextErrors.passwordConfirmation = "Vui lòng xác nhận mật khẩu.";
    } else if (confirmPassword !== password) {
      nextErrors.passwordConfirmation = "Mật khẩu xác nhận không khớp.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async () => {
    if (isAuthLoading) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      await register(fullName.trim(), email.trim(), password);
      router.replace("/(tabs)");
    } catch (error) {
      setErrors({ form: getRegisterErrorMessage(error) });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
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
              Đăng ký tài khoản
            </Text>
            <Text className="text-text-secondary text-center text-base px-4">
              Tạo tài khoản để bắt đầu hành trình học tập của bạn.
            </Text>
          </View>

          {/* Form Card */}
          <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 mb-6">
            <Input
              label="Họ và tên"
              placeholder="Nhập họ và tên của bạn"
              value={fullName}
              onChangeText={(value) => {
                setFullName(value);
                setErrors((current) => ({ ...current, name: undefined, form: undefined }));
              }}
              icon="person-outline"
              error={errors.name}
              autoCapitalize="words"
              returnKeyType="next"
            />

            <Input
              label="Email"
              placeholder="name@example.com"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setErrors((current) => ({ ...current, email: undefined, form: undefined }));
              }}
              icon="mail-outline"
              keyboardType="email-address"
              error={errors.email}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            <Input
              label="Mật khẩu"
              placeholder="********"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setErrors((current) => ({
                  ...current,
                  password: undefined,
                  passwordConfirmation: undefined,
                  form: undefined,
                }));
              }}
              icon="lock-closed-outline"
              secureTextEntry
              error={errors.password}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            <Input
              label="Xác nhận mật khẩu"
              placeholder="********"
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                setErrors((current) => ({
                  ...current,
                  passwordConfirmation: undefined,
                  form: undefined,
                }));
              }}
              icon="shield-checkmark-outline"
              secureTextEntry
              error={errors.passwordConfirmation}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />

            {errors.form ? (
              <View className="mb-3 rounded-xl bg-red-50 px-4 py-3">
                <Text className="text-sm font-semibold leading-5 text-error">
                  {errors.form}
                </Text>
              </View>
            ) : null}

            <View className="mt-4">
              <Button
                title="Đăng ký"
                onPress={handleRegister}
                loading={isAuthLoading}
              />
            </View>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center mt-auto py-8">
            <Text className="text-text-secondary text-base">
              Bạn đã có tài khoản?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text className="text-primary font-bold text-base">Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
