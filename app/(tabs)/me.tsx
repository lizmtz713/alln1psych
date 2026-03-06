/**
 * Me Tab — Profile & Settings (Kohl's/Best Buy style)
 * Clean grouped sections with list rows
 */
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
  Linking,
  Switch,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useAuth } from '../../src/providers/AuthProvider';
import { useUserStore } from '../../src/stores/userStore';
import { useInsightsStore } from '../../src/stores/insightsStore';
import { useCircleStore } from '../../src/stores/circleStore';
import { useEducationStore } from '../../src/stores/educationStore';
import { useAchievementStore } from '../../src/stores/achievementStore';

// Design System
const COLORS = {
  bg: '#09090F',
  card: '#111118',
  cardElevated: '#18181F',
  border: 'rgba(255,255,255,0.08)',
  text: '#F0F0F5',
  textSecondary: '#A0A0B8',
  textMuted: '#6B6B80',
  accent: '#7C4DFF',
  accentSoft: 'rgba(124,77,255,0.15)',
  success: '#4ADE80',
  warning: '#FBBF24',
  error: '#EF4444',
  green: '#4ADE80',
  yellow: '#FBBF24',
  orange: '#FB923C',
  red: '#EF4444',
};

const APP_VERSION = '1.0.0';

export default function MeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();
  const user = useUserStore();
  const myTemperature = useCircleStore((s) => s.myTemperature);
  const members = useCircleStore((s) => s.members);
  const getCheckInStreak = useInsightsStore((s) => s.getCheckInStreak);
  const getAchievements = useInsightsStore((s) => s.getAchievements);
  const achievementUnlockedAt = useAchievementStore((s) => s.unlockedAt);
  const completedLessons = useEducationStore((s) => s.completedLessons);
  
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const streak = getCheckInStreak();
  const achievements = getAchievements();
  const unlockedCount = Object.keys(achievementUnlockedAt).length;
  
  const tempColor = {
    green: COLORS.green,
    yellow: COLORS.yellow,
    orange: COLORS.orange,
    red: COLORS.red,
  }[myTemperature] || COLORS.textMuted;

  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 500));
    setRefreshing(false);
  };

  const navigateTo = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
          }
        >
          {/* ═══════════════════════════════════════════════════════════
              HEADER - Greeting + Profile Card
              ═══════════════════════════════════════════════════════════ */}
          <View style={styles.headerCard}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>Hi, {user.name || 'there'}!</Text>
                <View style={styles.tierBadge}>
                  <Ionicons name="sparkles" size={12} color={COLORS.accent} />
                  <Text style={styles.tierText}>Free Plan</Text>
                </View>
              </View>
              <Pressable 
                style={[styles.avatar, { borderColor: tempColor }]}
                onPress={() => navigateTo('/(modals)/identity-setup')}
              >
                <Text style={styles.avatarText}>
                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                </Text>
                <View style={[styles.statusDot, { backgroundColor: tempColor }]} />
              </Pressable>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{unlockedCount}</Text>
                <Text style={styles.statLabel}>Awards</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{completedLessons?.length || 0}</Text>
                <Text style={styles.statLabel}>Lessons</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{members?.length || 0}</Text>
                <Text style={styles.statLabel}>Circle</Text>
              </View>
            </View>

            {/* Edit Profile + Human Control Panel */}
            <View style={styles.profileActionsRow}>
              <Pressable 
                style={styles.editProfileBtn}
                onPress={() => navigateTo('/(modals)/identity-setup')}
              >
                <Ionicons name="create-outline" size={18} color={COLORS.accent} />
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </Pressable>
              <Pressable 
                style={[styles.editProfileBtn, styles.controlPanelBtn]}
                onPress={() => navigateTo('/profile')}
              >
                <Ionicons name="options-outline" size={18} color={COLORS.accent} />
                <Text style={styles.editProfileText}>Human Control Panel</Text>
              </Pressable>
            </View>
          </View>

          {/* ═══════════════════════════════════════════════════════════
              MY PROGRESS
              ═══════════════════════════════════════════════════════════ */}
          <Text style={styles.sectionHeader}>My Progress</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="trophy-outline"
              label="Awards & Achievements"
              badge={unlockedCount > 0 ? String(unlockedCount) : undefined}
              onPress={() => navigateTo('/profile/achievements')}
            />
            <MenuItem
              icon="analytics-outline"
              label="Patterns & Insights"
              onPress={() => navigateTo('/(modals)/patterns')}
            />
            <MenuItem
              icon="time-outline"
              label="Check-In History"
              onPress={() => navigateTo('/(modals)/history')}
            />
            <MenuItem
              icon="airplane-outline"
              label="Flight Log"
              subtitle="Pre-Flight & Post-Flight timeline"
              onPress={() => navigateTo('/flight-log')}
            />
            <MenuItem
              icon="moon-outline"
              label="Cycle Intelligence"
              subtitle="Understand your cycle"
              onPress={() => navigateTo('/(modals)/cycle')}
              isLast
            />
          </View>

          {/* ═══════════════════════════════════════════════════════════
              SHARING & REPORTS
              ═══════════════════════════════════════════════════════════ */}
          <Text style={styles.sectionHeader}>Sharing & Reports</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="document-text-outline"
              label="Therapist Share"
              subtitle="Generate wellness reports"
              accentColor={COLORS.success}
              onPress={() => navigateTo('/(modals)/therapist-share')}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              label="Sovereignty Report"
              subtitle="Your full system overview"
              onPress={() => navigateTo('/(modals)/sovereignty-report')}
            />
            <MenuItem
              icon="share-outline"
              label="Share Snapshot"
              subtitle="Share your current state"
              onPress={() => navigateTo('/(modals)/share-snapshot')}
            />
            <MenuItem
              icon="star-outline"
              label="Personology Profile"
              subtitle="Your personality insights"
              onPress={() => navigateTo('/(modals)/relate')}
              isLast
            />
          </View>

          {/* ═══════════════════════════════════════════════════════════
              INTEGRATIONS
              ═══════════════════════════════════════════════════════════ */}
          <Text style={styles.sectionHeader}>Integrations</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="fitness-outline"
              label="Apple Health"
              subtitle="Sleep, activity, heart, cycle"
              accentColor={COLORS.success}
              onPress={() => navigateTo('/(modals)/health-connections')}
            />
            <MenuItem
              icon="watch-outline"
              label="Apple Watch"
              subtitle="Real-time heart rate & HRV"
              onPress={() => navigateTo('/(modals)/health-connections')}
            />
            <MenuItem
              icon="ellipse-outline"
              label="Oura Ring"
              subtitle="Sleep score, readiness, HRV"
              badge="Soon"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Coming Soon', "Oura integration is in development. We'll notify you when it's ready!");
              }}
            />
            <MenuItem
              icon="pulse-outline"
              label="Whoop"
              subtitle="Strain, recovery, sleep"
              badge="Soon"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Coming Soon', "Whoop integration is in development. We'll notify you when it's ready!");
              }}
            />
            <MenuItem
              icon="footsteps-outline"
              label="Fitbit"
              subtitle="Activity, sleep, stress"
              badge="Soon"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Coming Soon', "Fitbit integration is in development. We'll notify you when it's ready!");
              }}
            />
            <MenuItem
              icon="navigate-outline"
              label="Garmin"
              subtitle="Training, body battery"
              badge="Soon"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Coming Soon', "Garmin integration is in development. We'll notify you when it's ready!");
              }}
            />
            <MenuItem
              icon="calendar-outline"
              label="Calendar"
              subtitle="Context from your schedule"
              badge="Soon"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Coming Soon', 'Calendar integration will help InGauge understand your day better. Coming soon!');
              }}
            />
            <MenuItem
              icon="location-outline"
              label="Location & Weather"
              subtitle="Environmental context"
              badge="Soon"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Coming Soon', 'Weather and location can affect your system. This integration is coming soon!');
              }}
              isLast
            />
          </View>

          {/* ═══════════════════════════════════════════════════════════
              MY ACCOUNT
              ═══════════════════════════════════════════════════════════ */}
          <Text style={styles.sectionHeader}>My Account</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="diamond-outline"
              label="Upgrade to Pro"
              subtitle="Unlimited AI, voice, more"
              accentColor={COLORS.warning}
              onPress={() => navigateTo('/(modals)/settings')}
            />
            <MenuItem
              icon="key-outline"
              label="Bring Your Own Key"
              subtitle="Use your OpenAI API key"
              onPress={() => navigateTo('/(modals)/settings')}
            />
            <MenuItem
              icon="person-outline"
              label="Account Settings"
              onPress={() => navigateTo('/(modals)/settings')}
              isLast
            />
          </View>

          {/* ═══════════════════════════════════════════════════════════
              APP SETTINGS
              ═══════════════════════════════════════════════════════════ */}
          <Text style={styles.sectionHeader}>App Settings</Text>
          <View style={styles.menuCard}>
            <View style={styles.menuItemRow}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconWrap}>
                  <Ionicons name="notifications-outline" size={20} color={COLORS.textSecondary} />
                </View>
                <Text style={styles.menuItemLabel}>Push Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: COLORS.border, true: COLORS.accent }}
                thumbColor="#fff"
              />
            </View>
            <MenuItem
              icon="moon-outline"
              label="Appearance"
              subtitle="Dark mode"
              onPress={() => navigateTo('/(modals)/settings')}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              label="Privacy"
              onPress={() => navigateTo('/(modals)/settings')}
              isLast
            />
          </View>

          {/* ═══════════════════════════════════════════════════════════
              HELP & SUPPORT
              ═══════════════════════════════════════════════════════════ */}
          <Text style={styles.sectionHeader}>Help & Support</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="heart-outline"
              label="Crisis Support (988)"
              subtitle="24/7 free support"
              accentColor={COLORS.error}
              onPress={() => Linking.openURL('tel:988')}
              showCall
            />
            <MenuItem
              icon="help-circle-outline"
              label="Help Center"
              onPress={() => Linking.openURL('https://docs.getingauge.com')}
            />
            <MenuItem
              icon="chatbox-outline"
              label="Send Feedback"
              onPress={() => Linking.openURL('mailto:feedback@getingauge.com')}
            />
            <MenuItem
              icon="refresh-outline"
              label="Redo Onboarding"
              onPress={() => navigateTo('/(modals)/onboarding')}
              isLast
            />
          </View>

          {/* ═══════════════════════════════════════════════════════════
              FOOTER
              ═══════════════════════════════════════════════════════════ */}
          <Pressable
            style={styles.signOutBtn}
            onPress={async () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await signOut();
            }}
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerLink}>Terms & Conditions</Text>
            <Text style={styles.footerDot}>•</Text>
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </View>
          <Text style={styles.versionText}>InGauge v{APP_VERSION}</Text>
        </ScrollView>
      </View>
    </ErrorBoundary>
  );
}

// Reusable Menu Item Component
function MenuItem({
  icon,
  label,
  subtitle,
  badge,
  accentColor,
  onPress,
  isLast,
  showCall,
}: {
  icon: string;
  label: string;
  subtitle?: string;
  badge?: string;
  accentColor?: string;
  onPress: () => void;
  isLast?: boolean;
  showCall?: boolean;
}) {
  return (
    <Pressable
      style={[styles.menuItemRow, !isLast && styles.menuItemBorder]}
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIconWrap, accentColor && { backgroundColor: accentColor + '15' }]}>
          <Ionicons name={icon as any} size={20} color={accentColor || COLORS.textSecondary} />
        </View>
        <View>
          <Text style={styles.menuItemLabel}>{label}</Text>
          {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.menuItemRight}>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <Ionicons 
          name={showCall ? 'call-outline' : 'chevron-forward'} 
          size={18} 
          color={COLORS.textMuted} 
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 20,
  },

  // Header Card
  headerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    alignSelf: 'flex-start',
  },
  tierText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.cardElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.card,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },

  // Edit Profile + Human Control Panel
  profileActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  editProfileBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentSoft,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  controlPanelBtn: {},
  editProfileText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.accent,
  },

  // Section Header
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },

  // Menu Card
  menuCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 22,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  // Sign Out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.error,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  footerLink: {
    fontSize: 13,
    color: COLORS.accent,
  },
  footerDot: {
    color: COLORS.textMuted,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
});
