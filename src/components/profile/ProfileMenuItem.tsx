import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileMenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
  isLast?: boolean;
  color?: string;
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ 
  icon, 
  label, 
  onPress, 
  showChevron = true,
  isLast = false,
  color = '#4F46E5'
}) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={onPress}
      className={`flex-row items-center justify-between py-4 ${isLast ? '' : 'border-b border-gray-100'}`}
    >
      <View className="flex-row items-center">
        <View 
          className="w-10 h-10 rounded-xl items-center justify-center mr-4"
          style={{ backgroundColor: `${color}10` }}
        >
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <Text className="text-text-primary text-base font-medium">
          {label}
        </Text>
      </View>
      
      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
      )}
    </TouchableOpacity>
  );
};

export default ProfileMenuItem;
