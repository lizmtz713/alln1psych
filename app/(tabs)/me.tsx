/**
 * Me Tab — Profile & Settings
 * Five blocks: Identity, Growth, Foundations, Preferences & Data, Legal & Support.
 * Me = who I am, what I'm working on, how my app is set up. Not a second Tools/Learn tab.
 */
import { useState, useRef, useCallback } from 'react';
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
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTENT_PADDING_H = 40;
const GAUGE_GRID_GAP = 10;
const GAUGE_CARD_WIDTH = (SCREEN_WIDTH - CONTENT_PADDING_H - GAUGE_GRID_GAP) / 2;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { APP_CONFIG } from '../../src/lib/constants';
import { useAuth } from '../../src/providers/AuthProvider';
import { useUserStore } from '../../src/stores/userStore';
import { useInsightsStore } from '../../src/stores/insightsStore';
import { useCircleStore, type TemperatureVisibility } from '../../src/stores/circleStore';
import { useEducationStore } from '../../src/stores/educationStore';
import { useAchievementStore } from '../../src/stores/achievementStore';
import { GLOBAL_DISCLAIMER } from '../../src/data/legalDisclaimers';

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

const SECTION_IDS = ['identity', 'growth', 'foundations', 'preferences', 'legal'] as const;
const QUICK_JUMP_IDS = ['identity', 'growth', 'foundations', 'preferences', 'legal'] as const;
const QUICK_JUMP_LABELS: Record<string, string> = {
  identity: 'Identity',
  growth: 'Growth',
  foundations: 'Foundations',
  preferences: 'Preferences',
  legal: 'Legal',
};

const GAUGE_ROUTES: { id: string; route: string; emoji: string; title: string }[] = [
  { id: 'body', route: '/profile/gauges/body', emoji: '🏃', title: 'Body' },
  { id: 'state', route: '/profile/gauges/state', emoji: '🧘', title: 'State' },
  { id: 'emotion', route: '/profile/gauges/emotion', emoji: '❤️', title: 'Emotion' },
  { id: 'connection', route: '/profile/gauges/connection', emoji: '👥', title: 'Connection' },
  { id: 'direction', route: '/profile/gauges/direction', emoji: '🧭', title: 'Direction' },
  { id: 'alignment', route: '/profile/gauges/alignment', emoji: '⚖️', title: 'Alignment' },
];

function CollapsibleSection({
  id,
  sectionLabel,
  title,
  description,
  defaultOpen,
  open,
  onToggle,
  children,
  onLayout,
}: {
  id: string;
  sectionLabel?: string;
  title: string;
  description: string;
  defaultOpen: boolean;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  onLayout?: (e: { nativeEvent: { layout: { y: number } } }) => void;
}) {
  return (
    <View style={styles.collapseSection} onLayout={onLayout} nativeID={id}>
      {sectionLabel ? (
        <>
          <Text style={styles.sectionLabel}>{sectionLabel}</Text>
          <View style={styles.sectionLabelLine} />
        </>
      ) : null}
      <Pressable style={styles.collapseHeader} onPress={onToggle}>
        <Text style={styles.collapseTitle}>{title}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.textMuted} />
      </Pressable>
      {open && (
        <>
          {description ? <Text style={styles.collapseDesc}>{description}</Text> : null}
          <View style={styles.collapseBody}>{children}</View>
        </>
      )}
    </View>
  );
}

const TEMPERATURE_VISIBILITY_LABELS: Record<TemperatureVisibility, string> = {
  inner_circle: 'Inner circle only',
  close_friends: 'Close friends',
  private: 'Private',
};

function TemperatureVisibilityRow() {
  const visibility = useCircleStore((s) => s.temperatureVisibility);
  const setVisibility = useCircleStore((s) => s.setTemperatureVisibility);
  const onPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const allowSharing = (v: TemperatureVisibility) => {
      setVisibility(v);
    };
    Alert.alert(
      'Who can see your temperature?',
      'Shared awareness, not monitoring. Choose who can see how you\'re doing.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: TEMPERATURE_VISIBILITY_LABELS.private, onPress: () => allowSharing('private') },
        {
          text: TEMPERATURE_VISIBILITY_LABELS.close_friends,
          onPress: () => {
            if (visibility === 'private') {
              Alert.alert(
                'Allow others to see your temperature?',
                'Your temperature reflects how you\'re doing overall. You can change this anytime in Me → Preferences & Data.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Allow sharing', onPress: () => allowSharing('close_friends') },
                ]
              );
            } else {
              allowSharing('close_friends');
            }
          },
        },
        {
          text: TEMPERATURE_VISIBILITY_LABELS.inner_circle,
          onPress: () => {
            if (visibility === 'private') {
              Alert.alert(
                'Allow others to see your temperature?',
                'Your temperature reflects how you\'re doing overall. You can change this anytime in Me → Preferences & Data.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Allow sharing', onPress: () => allowSharing('inner_circle') },
                ]
              );
            } else {
              allowSharing('inner_circle');
            }
          },
        },
      ]
    );
  };
  return (
    <Pressable
      style={[styles.menuItemRow, styles.menuItemBorder]}
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconWrap}><Ionicons name="thermometer-outline" size={20} color={COLORS.textSecondary} /></View>
        <View>
          <Text style={styles.menuItemLabel}>Temperature visibility</Text>
          <Text style={styles.menuItemSubtitle}>{TEMPERATURE_VISIBILITY_LABELS[visibility]}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </Pressable>
  );
}

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
  
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => ({
    identity: true,
    growth: true,
    foundations: true,
    preferences: false,
    legal: false,
  }));
  
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

  const navigateTo = useCallback((route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  }, [router]);

  const toggleSection = useCallback((key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const scrollToSection = useCallback((key: string) => {
    const y = sectionY.current[key];
    if (y != null && scrollRef.current) {
      scrollRef.current.scrollTo({ y: Math.max(0, y - 80), animated: true });
    }
  }, []);

  const captureSectionLayout = useCallback((key: string) => (e: { nativeEvent: { layout: { y: number } } }) => {
    sectionY.current[key] = e.nativeEvent.layout.y;
  }, []);

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
          }
        >
          {/* Header — Greeting + Profile Card */}
          <View style={styles.headerCard}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>Hi, {user.name || 'there'}!</Text>
                <View style={styles.tierBadge}>
                  <Ionicons name="sparkles" size={12} color={COLORS.accent} />
                  <Text style={styles.tierText}>Free Plan</Text>
                </View>
              </View>
              <Pressable style={[styles.avatar, { borderColor: tempColor }]} onPress={() => navigateTo('/identity-setup')}>
                <Text style={styles.avatarText}>{user.name?.charAt(0)?.toUpperCase() || '?'}</Text>
                <View style={[styles.statusDot, { backgroundColor: tempColor }]} />
              </Pressable>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}><Text style={styles.statValue}>{streak}</Text><Text style={styles.statLabel}>Day Streak</Text></View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}><Text style={styles.statValue}>{unlockedCount}</Text><Text style={styles.statLabel}>Awards</Text></View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}><Text style={styles.statValue}>{completedLessons?.length || 0}</Text><Text style={styles.statLabel}>Lessons</Text></View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}><Text style={styles.statValue}>{members?.length || 0}</Text><Text style={styles.statLabel}>Circle</Text></View>
            </View>
            <View style={styles.profileActionsRow}>
              <Pressable style={styles.editProfileBtn} onPress={() => navigateTo('/identity-setup')}>
                <Ionicons name="create-outline" size={18} color={COLORS.accent} />
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </Pressable>
            </View>
          </View>

          {/* Quick-jump row */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickJumpWrap}>
            {QUICK_JUMP_IDS.map((id) => (
              <Pressable key={id} style={styles.quickJumpPill} onPress={() => scrollToSection(id)}>
                <Text style={styles.quickJumpText}>{QUICK_JUMP_LABELS[id]}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* 1. Identity */}
          <CollapsibleSection
            id="identity"
            sectionLabel="IDENTITY"
            title="Identity"
            description="Who you are, your story, and what matters to you."
            defaultOpen={true}
            open={!!openSections.identity}
            onToggle={() => toggleSection('identity')}
            onLayout={captureSectionLayout('identity')}
          >
            <View style={styles.menuCard}>
              <MenuItem icon="person-outline" label="Human Profile" subtitle="Life blueprint from the 12 questions" onPress={() => navigateTo('/profile/human-profile')} />
              <MenuItem icon="book-outline" label="Your Story" subtitle="Origins, culture, upbringing" onPress={() => navigateTo('/your-story')} />
              <MenuItem icon="id-card-outline" label="Identity" subtitle="Body, disability, gender" onPress={() => navigateTo('/profile/identity')} />
              <MenuItem icon="options-outline" label="About you" subtitle="Values, how you connect, sensitive topics" onPress={() => navigateTo('/profile')} isLast />
            </View>
          </CollapsibleSection>

          {/* 2. Growth */}
          <CollapsibleSection
            id="growth"
            sectionLabel="GROWTH"
            title="Growth"
            description="What you're working on and how you're progressing."
            defaultOpen={true}
            open={!!openSections.growth}
            onToggle={() => toggleSection('growth')}
            onLayout={captureSectionLayout('growth')}
          >
            <View style={styles.menuCard}>
              <MenuItem icon="flag-outline" label="Goals" subtitle="What you're working toward" onPress={() => navigateTo('/profile/goals')} />
              <MenuItem icon="trophy-outline" label="Achievements" badge={unlockedCount > 0 ? String(unlockedCount) : undefined} subtitle="Awards and progress" onPress={() => navigateTo('/profile/achievements')} isLast />
            </View>
          </CollapsibleSection>

          {/* 3. Foundations — 6 gauges */}
          <CollapsibleSection
            id="foundations"
            sectionLabel="FOUNDATIONS"
            title="Foundations"
            description="Your six gauges — body, state, emotion, connection, direction, alignment."
            defaultOpen={true}
            open={!!openSections.foundations}
            onToggle={() => toggleSection('foundations')}
            onLayout={captureSectionLayout('foundations')}
          >
            <View style={[styles.gaugeGrid, { gap: GAUGE_GRID_GAP }]}>
              {GAUGE_ROUTES.map((g) => (
                <Pressable key={g.id} style={[styles.gaugeGridCard, { width: GAUGE_CARD_WIDTH }]} onPress={() => navigateTo(g.route)}>
                  <Text style={styles.gaugeGridEmoji}>{g.emoji}</Text>
                  <Text style={styles.gaugeGridTitle}>{g.title}</Text>
                </Pressable>
              ))}
            </View>
          </CollapsibleSection>

          {/* 4. Preferences & Data — two visual groups */}
          <CollapsibleSection
            id="preferences"
            sectionLabel="PREFERENCES & DATA"
            title="Preferences & Data"
            description={`How ${APP_CONFIG.name} works for you — notifications, privacy, connected services.`}
            defaultOpen={false}
            open={!!openSections.preferences}
            onToggle={() => toggleSection('preferences')}
            onLayout={captureSectionLayout('preferences')}
          >
            <View style={styles.menuCard}>
              <Text style={styles.subgroupLabel}>App Preferences</Text>
              <View style={styles.subgroupLine} />
              <View style={[styles.menuItemRow, styles.menuItemBorder]}>
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconWrap}><Ionicons name="notifications-outline" size={20} color={COLORS.textSecondary} /></View>
                  <Text style={styles.menuItemLabel}>Push Notifications</Text>
                </View>
                <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: COLORS.border, true: COLORS.accent }} thumbColor="#fff" />
              </View>
              <TemperatureVisibilityRow />
              <MenuItem icon="alarm-outline" label="Notifications & Reminders" onPress={() => navigateTo('/profile/preferences')} />
              <MenuItem icon="checkmark-circle-outline" label="Check-In Settings" onPress={() => navigateTo('/profile/preferences')} />
              <MenuItem icon="sparkles-outline" label="AI Preferences" onPress={() => navigateTo('/profile/preferences')} />
              <MenuItem icon="moon-outline" label="Appearance" subtitle="Dark mode" onPress={() => navigateTo('/(modals)/settings')} />
              <MenuItem icon="newspaper-outline" label="News My Way" subtitle="Capacity-aware news & digest" onPress={() => navigateTo('/news-my-way')} isLast />
            </View>
            <View style={[styles.menuCard, styles.subgroupCard]}>
              <Text style={styles.subgroupLabel}>Data & Integrations</Text>
              <View style={styles.subgroupLine} />
              <MenuItem icon="fitness-outline" label="Apple Health" subtitle="Sleep, activity, heart, cycle" accentColor={COLORS.success} onPress={() => navigateTo('/(modals)/health-connections')} />
              <MenuItem icon="ellipse-outline" label="Oura Ring" subtitle="Sleep score, readiness, HRV" onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(modals)/oura-connect'); }} />
              <MenuItem icon="key-outline" label="Bring Your Own Key" subtitle="Use your OpenAI API key" onPress={() => navigateTo('/(modals)/settings')} />
              <MenuItem icon="shield-checkmark-outline" label="Privacy" onPress={() => navigateTo('/(modals)/settings')} />
              <MenuItem icon="diamond-outline" label="Upgrade to Pro" subtitle="Unlimited AI, voice, more" accentColor={COLORS.warning} onPress={() => navigateTo('/(modals)/settings')} />
              <MenuItem icon="person-outline" label="Account Settings" onPress={() => navigateTo('/(modals)/settings')} isLast />
            </View>
          </CollapsibleSection>

          {/* 5. Legal & Support */}
          <CollapsibleSection
            id="legal"
            sectionLabel="LEGAL & SUPPORT"
            title="Legal & Support"
            description="Safety, data use, and how to get help."
            defaultOpen={false}
            open={!!openSections.legal}
            onToggle={() => toggleSection('legal')}
            onLayout={captureSectionLayout('legal')}
          >
            <View style={styles.menuCard}>
              <MenuItem icon="heart-outline" label="Crisis Support (988)" subtitle="24/7 free support" accentColor={COLORS.error} onPress={() => Linking.openURL('tel:988')} showCall />
              <MenuItem icon="help-circle-outline" label="Help Center" onPress={() => Linking.openURL('https://docs.getingauge.com')} />
              <MenuItem icon="chatbox-outline" label="Send Feedback" onPress={() => Linking.openURL('mailto:feedback@getingauge.com')} />
              <MenuItem icon="refresh-outline" label="Redo Onboarding" onPress={() => navigateTo('/onboarding')} />
              <MenuItem icon="document-text-outline" label="Privacy Policy" onPress={() => Linking.openURL('https://getingauge.com/privacy')} />
              <MenuItem icon="document-text-outline" label="Terms & Conditions" onPress={() => Linking.openURL('https://getingauge.com/terms')} isLast />
            </View>
          </CollapsibleSection>

          {/* Footer — Disclaimer + Sign Out + Version */}
          <Text style={styles.footerDisclaimer} numberOfLines={2}>{GLOBAL_DISCLAIMER.short}</Text>
          <Pressable style={styles.footerLearnMore} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigateTo('/(modals)/disclaimer'); }}>
            <Text style={styles.footerLink}>{GLOBAL_DISCLAIMER.learnMoreLabel}</Text>
          </Pressable>
          <Pressable style={styles.signOutBtn} onPress={async () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); await signOut(); }}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
          <Text style={styles.versionText}>{APP_CONFIG.name} v{APP_VERSION}</Text>
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

  // Edit Profile
  profileActionsRow: {
    marginTop: 12,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentSoft,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
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

  // Quick-jump
  quickJumpWrap: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  quickJumpPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickJumpText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // Collapsible section
  collapseSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    marginBottom: 6,
    marginTop: 4,
  },
  sectionLabelLine: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 8,
  },
  collapseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  collapseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  collapseDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 12,
    paddingHorizontal: 4,
    lineHeight: 19,
  },
  collapseBody: {
    marginTop: 0,
  },

  // Gauge grid (2 columns) — width set inline via GAUGE_CARD_WIDTH
  gaugeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  gaugeGridCard: {
    minWidth: 0,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gaugeGridEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  gaugeGridTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },

  // Menu Card
  menuCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  subgroupLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    marginTop: 4,
    marginBottom: 6,
    marginHorizontal: 16,
  },
  subgroupLine: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  subgroupCard: {
    marginTop: 0,
    marginBottom: 24,
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
  footerDisclaimer: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 24,
  },
  footerLearnMore: {
    marginTop: 4,
  },
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
