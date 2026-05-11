import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric';
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  secureTextEntry,
  error,
  keyboardType = 'default'
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-text-secondary font-medium mb-2 ml-1">
          {label}
        </Text>
      )}
      
      <View 
        className={`flex-row items-center bg-white border-2 rounded-xl px-4 py-3 ${
          isFocused ? 'border-primary' : 'border-gray-100'
        } ${error ? 'border-error' : ''}`}
      >
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={isFocused ? '#4F46E5' : '#94A3B8'} 
            style={{ marginRight: 12 }}
          />
        )}
        
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType={keyboardType}
          className="flex-1 text-text-primary text-base"
        />

        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons 
              name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color="#94A3B8" 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text className="text-error text-xs mt-1 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
};
