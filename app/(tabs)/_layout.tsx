import { Tabs, usePathname, useRouter } from 'expo-router';
import { Platform, View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

// Human OS — six tabs: Cockpit, Signals (insights), People (relationships), Tools, Manual, Me
const COLORS = {
  background: '#09090F',
  surface: '#111118',
  border: 'rgba(255,255,255,0.06)',
  text: '#F0F0F5',
  textMuted: '#6B6B80',
  accent: '#7C4DFF',
  accentSoft: 'rgba(124,77,255,0.12)',
  cockpit: '#4ADE80',   // Green - life overview
  signals: '#9B8AA6',   // Violet - insights & predictions
  people: '#A78BFA',    // Purple - relationship system
  tools: '#3B82F6',     // Blue - action layer
  manual: '#8B5CF6',    // Purple - knowledge
  me: '#F59E0B',       // Amber - identity/config
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

const CONTEXT_LABELS: Record<string, string> = {
  index: 'Cockpit',
  signals: 'Signals',
  people: 'People',
  tools: 'Tools',
  learn: 'Manual',
  me: 'Me',
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const segment = pathname?.replace('/(tabs)/', '')?.split('/')[0] ?? '';
  const contextScreen = CONTEXT_LABELS[segment] || segment || 'App';

  const openAskGauge = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(modals)/ask-gauge?contextScreen=${encodeURIComponent(contextScreen)}`);
  };

  return (
    <ErrorBoundary>
      <View style={styles.tabsWrap}>
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
        {/* Tab 1: Cockpit — system awareness. "How am I doing?" */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Cockpit',
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                focused={focused}
                color={color}
                size={size ?? 24}
                name="speedometer-outline"
                focusedName="speedometer"
                accentColor={COLORS.cockpit}
              />
            ),
            tabBarActiveTintColor: COLORS.cockpit,
          }}
        />
        
        {/* Tab 2: Signals — insights & predictions. Awareness layer. */}
        <Tabs.Screen
          name="signals"
          options={{
            title: 'Signals',
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                focused={focused}
                color={color}
                size={size ?? 24}
                name="pulse-outline"
                focusedName="pulse"
                accentColor={COLORS.signals}
              />
            ),
            tabBarActiveTintColor: COLORS.signals,
          }}
        />

        {/* Tab 3: People — relationship subsystem. */}
        <Tabs.Screen
          name="people"
          options={{
            title: 'People',
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                focused={focused}
                color={color}
                size={size ?? 24}
                name="people-outline"
                focusedName="people"
                accentColor={COLORS.people}
              />
            ),
            tabBarActiveTintColor: COLORS.people,
          }}
        />
        
        {/* Tab 4: Tools — life problem solving. "How do I handle this situation?" */}
        <Tabs.Screen
          name="tools"
          options={{
            title: 'Tools',
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                focused={focused}
                color={color}
                size={size ?? 24}
                name="construct-outline"
                focusedName="construct"
                accentColor={COLORS.tools}
              />
            ),
            tabBarActiveTintColor: COLORS.tools,
          }}
        />
        
        {/* Tab 5: Manual — understanding the human system. "How do humans actually work?" */}
        <Tabs.Screen
          name="learn"
          options={{
            title: 'Manual',
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                focused={focused}
                color={color}
                size={size ?? 24}
                name="book-outline"
                focusedName="book"
                accentColor={COLORS.manual}
              />
            ),
            tabBarActiveTintColor: COLORS.manual,
          }}
        />

        {/* Tab 6: Me — identity + configuration. "How is my system configured?" */}
        <Tabs.Screen
          name="me"
          options={{
            title: 'Me',
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                focused={focused}
                color={color}
                size={size ?? 26}
                name="person-circle-outline"
                focusedName="person-circle"
                accentColor={COLORS.me}
              />
            ),
            tabBarActiveTintColor: COLORS.me,
          }}
        />
        
        {/* Hidden: talk, circle, lights — deep links / internal routes only */}
        <Tabs.Screen name="talk" options={{ href: null }} />
        <Tabs.Screen name="circle" options={{ href: null }} />
        <Tabs.Screen name="lights" options={{ href: null }} />
      </Tabs>
      <Pressable style={[styles.fab, { bottom: (Platform.OS === 'ios' ? insets.bottom : 8) + 80 }]} onPress={openAskGauge} accessibilityLabel="Ask Gauge">
        <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
      </Pressable>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  tabsWrap: { flex: 1 },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 40,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
