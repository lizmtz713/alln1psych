import { Tabs } from 'expo-router';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

// Design tokens matching Apple Health inspiration
const COLORS = {
  background: '#09090F',
  surface: '#111118',
  border: 'rgba(255,255,255,0.06)',
  text: '#F0F0F5',
  textMuted: '#6B6B80',
  accent: '#7C4DFF',
  accentSoft: 'rgba(124,77,255,0.12)',
  // Tab-specific colors
  home: '#4ADE80',      // Green - growth/health
  ingauge: '#7C4DFF',   // Purple - AI/intelligence  
  circle: '#EC4899',    // Pink - connection/love
  explore: '#3B82F6',   // Blue - discovery/learning
  me: '#F59E0B',        // Amber - self/personal
};

interface TabIconProps {
  focused: boolean;
  color: string;
  size: number;
  name: keyof typeof Ionicons.glyphMap;
  focusedName: keyof typeof Ionicons.glyphMap;
  accentColor: string;
}

function TabIcon({ focused, color, size, name, focusedName, accentColor }: TabIconProps) {
  return (
    <View style={[
      styles.iconContainer,
      focused && { backgroundColor: accentColor + '20' }
    ]}>
      <Ionicons
        name={focused ? focusedName : name}
        size={size}
        color={focused ? accentColor : color}
      />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
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
            paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
            height: Platform.OS === 'ios' ? 88 : 68,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarActiveTintColor: COLORS.accent,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
            letterSpacing: 0.2,
          },
        }}
      >
        {/* Tab 1: Home - Status & Check-in */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                focused={focused}
                color={color}
                size={size ?? 24}
                name="home-outline"
                focusedName="home"
                accentColor={COLORS.home}
              />
            ),
            tabBarActiveTintColor: COLORS.home,
          }}
        />
        
        {/* Tab 2: InGauge - AI Companion */}
        <Tabs.Screen
          name="talk"
          options={{
            title: 'InGauge',
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                focused={focused}
                color={color}
                size={size ?? 24}
                name="chatbubble-ellipses-outline"
                focusedName="chatbubble-ellipses"
                accentColor={COLORS.ingauge}
              />
            ),
            tabBarActiveTintColor: COLORS.ingauge,
          }}
        />
        
        {/* Tab 3: Circle - Relationships */}
        <Tabs.Screen
          name="circle"
          options={{
            title: 'Circle',
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                focused={focused}
                color={color}
                size={size ?? 24}
                name="heart-outline"
                focusedName="heart"
                accentColor={COLORS.circle}
              />
            ),
            tabBarActiveTintColor: COLORS.circle,
          }}
        />
        
        {/* Tab 4: Explore - Tools & Learning */}
        <Tabs.Screen
          name="learn"
          options={{
            title: 'Explore',
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                focused={focused}
                color={color}
                size={size ?? 24}
                name="compass-outline"
                focusedName="compass"
                accentColor={COLORS.explore}
              />
            ),
            tabBarActiveTintColor: COLORS.explore,
          }}
        />
        
        {/* Tab 5: Me - Personal Data & Settings */}
        <Tabs.Screen
          name="me"
          options={{
            title: 'Me',
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                focused={focused}
                color={color}
                size={size ?? 26}
                name="person-outline"
                focusedName="person"
                accentColor={COLORS.me}
              />
            ),
            tabBarActiveTintColor: COLORS.me,
          }}
        />
      </Tabs>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
