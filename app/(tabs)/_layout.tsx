import { Tabs } from 'expo-router';
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
          backgroundColor: COLORS?.surface ?? '#1a1a2e',
          borderTopColor: COLORS?.surface ?? '#1a1a2e',
        },
        tabBarActiveTintColor: COLORS?.accent ?? '#a78bfa',
        tabBarInactiveTintColor: COLORS?.textMuted ?? '#888',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused === true ? 'home' : 'home-outline'}
              size={typeof size === 'number' ? size : 24}
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
              name={focused === true ? 'mic' : 'mic-outline'}
              size={typeof size === 'number' ? size : 24}
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
              name={focused === true ? 'book' : 'book-outline'}
              size={typeof size === 'number' ? size : 24}
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
              name={focused === true ? 'heart' : 'heart-outline'}
              size={typeof size === 'number' ? size : 24}
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
              name={focused === true ? 'person' : 'person-outline'}
              size={typeof size === 'number' ? size : 24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
    </ErrorBoundary>
  );
}
