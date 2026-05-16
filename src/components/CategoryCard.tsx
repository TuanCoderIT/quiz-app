import React from 'react';
import { StyleSheet, Text, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';

interface CategoryCardProps {
  label: string;
  onPress?: () => void;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  label,
  onPress,
  active,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.pill, active && styles.pillActive, style]}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    height: 42,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  pillActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  pillText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
});
