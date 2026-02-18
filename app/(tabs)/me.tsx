import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
  Linking,
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

const ACCENT = '#7C4DFF';
const BG = '#09090F';
const CARD_BG = '#111118';
const TEXT = '#F0F0F5';
const TEXT_MUTED = '#8888A0';
const TEXT_DIM = '#55556A';

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
    green: '#4ADE80',
    yellow: '#FACC15',
    orange: '#FB923C',
    red: '#F87171',
  }[myTemperature] || TEXT_MUTED;

  const menuItems = [
    { icon: 'journal-outline', label: 'Journal', route: '/(modals)/new-journal' },
    { icon: 'refresh-outline', label: 'Replay', route: '/(modals)/replay' },
    { icon: 'search-outline', label: 'Decode', route: '/(modals)/decode' },
    { icon: 'heart-circle-outline', label: 'Relate', route: '/(modals)/relate' },
    { icon: 'heart-half-outline', label: 'Love', route: '/(modals)/love' },
    { icon: 'people-outline', label: 'Help', route: '/(modals)/help-someone' },
    { icon: 'settings-outline', label: 'Settings', route: '/(modals)/settings' },
  ];

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />
          }
        >
          {/* Profile Header */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
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
              style={styles.editProfileButton}
              onPress={() => router.push('/(modals)/identity-setup')}
            >
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </Pressable>
          </View>

          {/* Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{unlockedCount}</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.tempIndicator, { backgroundColor: tempColor + '20' }]}>
                <View style={[styles.tempDot, { backgroundColor: tempColor }]} />
              </View>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <Pressable
                style={styles.actionCard}
                onPress={() => router.push('/(modals)/mood-checkin')}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#7C4DFF20' }]}>
                  <Ionicons name="pulse-outline" size={24} color={ACCENT} />
                </View>
                <Text style={styles.actionLabel}>Check In</Text>
              </Pressable>
              
              <Pressable
                style={styles.actionCard}
                onPress={() => router.push('/(modals)/new-journal')}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#4ADE8020' }]}>
                  <Ionicons name="create-outline" size={24} color="#4ADE80" />
                </View>
                <Text style={styles.actionLabel}>New Entry</Text>
              </Pressable>
              
              <Pressable
                style={styles.actionCard}
                onPress={() => router.push('/(modals)/activity')}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#FACC1520' }]}>
                  <Ionicons name="flash-outline" size={24} color="#FACC15" />
                </View>
                <Text style={styles.actionLabel}>Activity</Text>
              </Pressable>
            </View>
          </View>

          {/* Menu */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Data</Text>
            <View style={styles.menuCard}>
              {menuItems.map((item, index) => (
                <Pressable
                  key={item.label}
                  style={[
                    styles.menuItem,
                    index < menuItems.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => router.push(item.route as any)}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name={item.icon as any} size={22} color={TEXT_MUTED} />
                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={TEXT_DIM} />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Support */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.menuCard}>
              <Pressable
                style={[styles.menuItem, styles.menuItemBorder]}
                onPress={() => Linking.openURL('tel:988')}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="heart-outline" size={22} color="#F87171" />
                  <Text style={styles.menuItemLabel}>Crisis Line (988)</Text>
                </View>
                <Ionicons name="call-outline" size={20} color={TEXT_DIM} />
              </Pressable>
              
              <Pressable
                style={styles.menuItem}
                onPress={() => router.push('/(modals)/onboarding')}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="refresh-outline" size={22} color={TEXT_MUTED} />
                  <Text style={styles.menuItemLabel}>Redo Onboarding</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={TEXT_DIM} />
              </Pressable>
            </View>
          </View>

          {/* Sign Out */}
          <Pressable style={styles.signOutButton} onPress={signOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>

          <Text style={styles.version}>AllN1 Psych v1.0.0</Text>
          
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    paddingHorizontal: 20,
  },
  
  // Header
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: CARD_BG,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: TEXT,
  },
  statusDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: BG,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 4,
  },
  pronouns: {
    fontSize: 15,
    color: TEXT_MUTED,
    marginBottom: 16,
  },
  editProfileButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: ACCENT,
  },
  
  // Stats
  statsCard: {
    flexDirection: 'row',
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
  },
  tempIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tempDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_DIM,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  
  // Actions Grid
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: TEXT,
  },
  
  // Menu
  menuCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuItemLabel: {
    fontSize: 16,
    color: TEXT,
  },
  
  // Sign Out
  signOutButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F87171',
  },
  
  // Version
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: TEXT_DIM,
    marginTop: 8,
  },
});
