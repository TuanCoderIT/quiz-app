import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: string;
  color: string;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ label, value, color }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 110,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.65)',
    padding: 14,
    marginRight: 10,
  },
  label: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
  },
});
