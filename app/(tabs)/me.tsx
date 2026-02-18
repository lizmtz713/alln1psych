/**
 * Me Tab — Profile, stats, and quick access to tools
 * Premium UI
 */
import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
  Linking,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useAuth } from '../../src/providers/AuthProvider';
import { useUserStore } from '../../src/stores/userStore';
import { useInsightsStore } from '../../src/stores/insightsStore';
import { useCircleStore } from '../../src/stores/circleStore';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../src/lib/constants';

function AnimatedSection({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  
  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

export default function MeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();
  const user = useUserStore();
  const myTemperature = useCircleStore((s) => s.myTemperature);
  const getCheckInStreak = useInsightsStore((s) => s.getCheckInStreak);
  const getAchievements = useInsightsStore((s) => s.getAchievements);
  
  const [refreshing, setRefreshing] = useState(false);
  
  const streak = getCheckInStreak();
  const achievements = getAchievements();
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  
  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 500));
    setRefreshing(false);
  };

  const tempColor = {
    green: COLORS.temperature.green,
    yellow: COLORS.temperature.yellow,
    orange: COLORS.temperature.orange,
    red: COLORS.temperature.red,
  }[myTemperature] || COLORS.textMuted;

  const quickActions = [
    { icon: 'pulse-outline', label: 'Check In', route: '/(modals)/mood-checkin', color: COLORS.accent },
    { icon: 'create-outline', label: 'Journal', route: '/(modals)/new-journal', color: COLORS.success },
    { icon: 'flash-outline', label: 'Activity', route: '/(modals)/activity', color: COLORS.warning },
  ];

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
          }
        >
          {/* Profile Header */}
          <AnimatedSection delay={0}>
            <View style={styles.header}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={[tempColor + '40', tempColor + '10']}
                  style={styles.avatarGlow}
                />
                <View style={[styles.avatar, { borderColor: tempColor }]}>
                  <Text style={styles.avatarText}>
                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                  </Text>
                </View>
                <View style={[styles.statusDot, { backgroundColor: tempColor }]} />
              </View>
              
              <Text style={styles.name}>{user.name || 'You'}</Text>
              {user.pronouns && <Text style={styles.pronouns}>{user.pronouns}</Text>}
              
              <Pressable
                style={({ pressed }) => [styles.editProfileButton, pressed && styles.pressed]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(modals)/identity-setup');
                }}
              >
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </Pressable>
            </View>
          </AnimatedSection>

          {/* Stats Card */}
          <AnimatedSection delay={100}>
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statDivider} />
              <Pressable 
                style={styles.statItem}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(modals)/awards');
                }}
              >
                <Text style={styles.statValue}>{unlockedCount}</Text>
                <Text style={[styles.statLabel, { color: COLORS.accent }]}>Awards →</Text>
              </Pressable>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.tempIndicator, { backgroundColor: tempColor + '20' }]}>
                  <View style={[styles.tempDot, { backgroundColor: tempColor }]} />
                </View>
                <Text style={styles.statLabel}>Status</Text>
              </View>
            </View>
          </AnimatedSection>

          {/* Quick Actions */}
          <AnimatedSection delay={200}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsRow}>
              {quickActions.map((action) => (
                <Pressable
                  key={action.label}
                  style={({ pressed }) => [styles.quickActionCard, pressed && styles.pressed]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(action.route as any);
                  }}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                    <Ionicons name={action.icon as any} size={24} color={action.color} />
                  </View>
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </Pressable>
              ))}
            </View>
          </AnimatedSection>

          {/* Settings */}
          <AnimatedSection delay={300}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.menuCard}>
              <Pressable
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(modals)/settings');
                }}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuItemIconWrap}>
                    <Ionicons name="settings-outline" size={20} color={COLORS.textSecondary} />
                  </View>
                  <Text style={styles.menuItemLabel}>Settings</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </Pressable>
            </View>
          </AnimatedSection>

          {/* Support */}
          <AnimatedSection delay={500}>
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.menuCard}>
              <Pressable
                style={({ pressed }) => [styles.menuItem, styles.menuItemBorder, pressed && styles.menuItemPressed]}
                onPress={() => Linking.openURL('tel:988')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuItemIconWrap, { backgroundColor: COLORS.error + '20' }]}>
                    <Ionicons name="heart-outline" size={20} color={COLORS.error} />
                  </View>
                  <View>
                    <Text style={styles.menuItemLabel}>Crisis Line (988)</Text>
                    <Text style={styles.menuItemDesc}>24/7 support</Text>
                  </View>
                </View>
                <Ionicons name="call-outline" size={18} color={COLORS.textMuted} />
              </Pressable>
              
              <Pressable
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(modals)/onboarding');
                }}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuItemIconWrap}>
                    <Ionicons name="refresh-outline" size={20} color={COLORS.textSecondary} />
                  </View>
                  <Text style={styles.menuItemLabel}>Redo Onboarding</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </Pressable>
            </View>
          </AnimatedSection>

          {/* Sign Out */}
          <AnimatedSection delay={600}>
            <Pressable
              style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                await signOut();
              }}
            >
              <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
          </AnimatedSection>
        </ScrollView>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatarGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -10,
    left: -10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  name: {
    ...TYPOGRAPHY.displaySm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  pronouns: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  editProfileButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editProfileText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.accent,
  },
  pressed: {
    opacity: 0.8,
  },
  
  // Stats
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.displaySm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  tempIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  tempDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  
  // Section
  sectionTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
    marginLeft: SPACING.xs,
  },
  
  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionLabel: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.text,
  },
  
  // Menu
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemPressed: {
    backgroundColor: COLORS.surfaceElevated,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  menuItemIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.accentBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemLabel: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
  },
  menuItemDesc: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  
  // Sign Out
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
  },
  signOutText: {
    ...TYPOGRAPHY.labelLg,
    color: COLORS.error,
  },
});
