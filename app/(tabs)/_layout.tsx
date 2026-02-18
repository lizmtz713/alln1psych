import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/lib/constants';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

export default function TabLayout() {
  return (
    <ErrorBoundary>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarStyle: {
            backgroundColor: COLORS.background,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
            paddingTop: 8,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            height: Platform.OS === 'ios' ? 88 : 64,
          },
          tabBarActiveTintColor: COLORS.accent,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={size ?? 24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="talk"
          options={{
            title: 'Talk',
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
                size={size ?? 24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="learn"
          options={{
            title: 'Manual',
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? 'book' : 'book-outline'}
                size={size ?? 24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="circle"
          options={{
            title: 'Circle',
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? 'people' : 'people-outline'}
                size={size ?? 24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="me"
          options={{
            title: 'Me',
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? 'person-circle' : 'person-circle-outline'}
                size={size ?? 26}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </ErrorBoundary>
  );
}
