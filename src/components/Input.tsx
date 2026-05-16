import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { Colors, Spacing } from '../theme';

interface InputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  variant?: 'default' | 'liquid';
  containerStyle?: StyleProp<ViewStyle>;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: TextInputProps['autoCorrect'];
  returnKeyType?: TextInputProps['returnKeyType'];
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  secureTextEntry,
  error,
  keyboardType = 'default',
  variant = 'default',
  containerStyle,
  autoCapitalize,
  autoCorrect,
  returnKeyType,
}) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (variant === 'liquid') {
    return (
      <View style={[styles.liquidWrapper, containerStyle]}>
        {label ? (
          <Text style={styles.liquidLabel}>{label}</Text>
        ) : null}

        <Pressable
          onPress={() => inputRef.current?.focus()}
          style={[
            styles.liquidField,
            isFocused && styles.liquidFieldFocused,
            !!error && styles.liquidFieldError,
          ]}
        >
          {icon ? (
            <Ionicons
              name={icon}
              size={19}
              color={isFocused ? Colors.primary.DEFAULT : Colors.textMuted}
              style={styles.liquidIcon}
            />
          ) : null}

          <TextInput
            ref={inputRef}
            placeholder={placeholder}
            placeholderTextColor={Colors.textMuted}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry && !showPassword}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            returnKeyType={returnKeyType}
            blurOnSubmit={false}
            underlineColorAndroid="transparent"
            style={styles.liquidInput}
          />

          {secureTextEntry ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              onPress={() => setShowPassword((current) => !current)}
              style={styles.passwordToggle}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          ) : null}
        </Pressable>

        {error ? (
          <Text style={styles.liquidError}>{error}</Text>
        ) : null}
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  liquidWrapper: {
    marginBottom: 14,
  },

  liquidLabel: {
    marginBottom: Spacing[2],
    marginLeft: Spacing[1],
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },

  liquidField: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 17,
    borderColor: 'rgba(203,213,225,0.65)',
    backgroundColor: 'rgba(255,255,255,0.82)',
    paddingHorizontal: 16,
  },

  liquidFieldFocused: {
    borderColor: '#4F46E5',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },

  liquidFieldError: {
    borderColor: 'rgba(239,68,68,0.48)',
  },

  liquidIcon: {
    marginRight: Spacing[3],
  },

  liquidInput: {
    flex: 1,
    height: 50,
    paddingVertical: 0,
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },

  passwordToggle: {
    width: 40,
    height: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  liquidError: {
    marginTop: Spacing[1.5],
    marginLeft: Spacing[1],
    color: Colors.error,
    fontSize: 12,
    fontWeight: '600',
  },
});
