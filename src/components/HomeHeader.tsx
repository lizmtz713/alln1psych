/**
 * HomeHeader.tsx
 * Layout: [Greeting + Date]    [☀️/🌙]    [🚨]
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

interface HomeHeaderProps {
  userName: string;
}

const getDayIcon = () => {
  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 18;
  return { icon: isDay ? '☀️' : '🌙', isDay };
};

const formatDate = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric'
  });
};

export function HomeHeader({ userName }: HomeHeaderProps) {
  const router = useRouter();
  const { icon, isDay } = getDayIcon();

  return (
    <View style={styles.container}>
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>Hey, {userName}</Text>
        <Text style={styles.date}>{formatDate()}</Text>
      </View>
      <TouchableOpacity onPress={() => router.push(isDay ? '/rituals/pre-flight' : '/rituals/post-flight')} style={styles.iconButton}>
        <Text style={styles.dayIcon}>{icon}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/emergency')} style={styles.iconButton}>
        <Text style={styles.emergencyIcon}>🚨</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  greetingContainer: { flex: 1 },
  greeting: { fontSize: 28, fontWeight: '600', color: '#FFFFFF' },
  date: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
  iconButton: { padding: 8, marginLeft: 12 },
  dayIcon: { fontSize: 28 },
  emergencyIcon: { fontSize: 24 },
});
