import React from 'react';
import { View, Text } from 'react-native';

export default function TabPlaceholder({ name }: { name: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-text-primary">{name} Screen</Text>
      <Text className="text-text-secondary mt-2">Coming Soon!</Text>
    </View>
  );
}
