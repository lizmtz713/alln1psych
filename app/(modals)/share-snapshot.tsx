/**
 * Share Operating Snapshot — Ethical sharing
 * 
 * Plain-language summaries, no raw numbers, time-bound, revocable.
 * User controls what they share and for how long.
 */
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import { useCockpitStore } from '../../src/stores/cockpitStore';
import { useUserStore } from '../../src/stores/userStore';
import {
  createShare,
  getMyShares,
  revokeShare,
  HELPS_SUGGESTIONS,
  DOESNT_HELP_SUGGESTIONS,
  type MyShare,
} from '../../src/services/sharing';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textMuted;
const TEXT_DIM = COLORS.textMuted;
const ACCENT = COLORS.accent;
const AMBER = '#F59E0B';
const GREEN = '#4ADE80';

type Tab = 'create' | 'active';

const EXPIRY_OPTIONS = [
  { label: '1 hour', hours: 1 },
  { label: '24 hours', hours: 24 },
  { label: '3 days', hours: 72 },
  { label: '7 days', hours: 168 },
];

export default function ShareSnapshotScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const systemMode = useCockpitStore((s) => s.systemMode);
  const userName = useUserStore((s) => s.name);
  
  const [tab, setTab] = useState<Tab>('create');
  const [loading, setLoading] = useState(false);
  const [myShares, setMyShares] = useState<MyShare[]>([]);
  const [loadingShares, setLoadingShares] = useState(true);
  
  // Create form state
  const [displayName, setDisplayName] = useState(userName || '');
  const [selectedHelps, setSelectedHelps] = useState<string[]>([]);
  const [selectedDoesntHelp, setSelectedDoesntHelp] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [expiryHours, setExpiryHours] = useState(24);
  
  // Result state
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    loadMyShares();
  }, []);

  const loadMyShares = async () => {
    setLoadingShares(true);
    const shares = await getMyShares();
    setMyShares(shares);
    setLoadingShares(false);
  };

  const toggleHelps = (item: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedHelps((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleDoesntHelp = (item: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDoesntHelp((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleCreate = async () => {
    if (loading) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    const result = await createShare({
      displayName: displayName.trim() || undefined,
      currentMode: systemMode,
      modeMessage: systemMode === 'capacity'
        ? 'System running steady'
        : 'Foundation needs attention right now',
      helpsText: selectedHelps,
      doesntHelpText: selectedDoesntHelp,
      customMessage: customMessage.trim() || undefined,
      expiresInHours: expiryHours,
    });

    setLoading(false);

    if (result.success && result.shareUrl) {
      setShareUrl(result.shareUrl);
      await loadMyShares();
    } else {
      Alert.alert('Error', result.error || 'Failed to create share');
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(shareUrl);
    Alert.alert('Copied!', 'Link copied to clipboard');
  };

  const handleShareLink = async () => {
    if (!shareUrl) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      await Share.share({
        message: `${displayName ? displayName + "'s " : 'My '}Operating Snapshot\n\n${shareUrl}`,
        url: shareUrl,
      });
    } catch (e) {
      console.error('Share error:', e);
    }
  };

  const handleRevoke = async (token: string) => {
    Alert.alert(
      'Revoke Share',
      'This will make the link stop working. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const success = await revokeShare(token);
            if (success) {
              await loadMyShares();
            } else {
              Alert.alert('Error', 'Failed to revoke share');
            }
          },
        },
      ]
    );
  };

  const handleNewShare = () => {
    setShareUrl(null);
    setSelectedHelps([]);
    setSelectedDoesntHelp([]);
    setCustomMessage('');
  };

  const modeColor = systemMode === 'capacity' ? GREEN : AMBER;
  const modeLabel = systemMode === 'capacity' ? 'Capacity' : 'Stabilization';

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Operating Snapshot</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, tab === 'create' && styles.tabActive]}
          onPress={() => setTab('create')}
        >
          <Text style={[styles.tabText, tab === 'create' && styles.tabTextActive]}>Create</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === 'active' && styles.tabActive]}
          onPress={() => setTab('active')}
        >
          <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>
            Active ({myShares.length})
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {tab === 'create' && !shareUrl && (
          <>
            {/* Intro */}
            <Text style={styles.intro}>
              Share a summary of your current state with someone who cares. 
              No numbers, no comparisons — just what might help them support you.
            </Text>

            {/* Current Mode (auto-filled) */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Current Mode</Text>
              <View style={[styles.modeBadge, { backgroundColor: modeColor + '20' }]}>
                <View style={[styles.modeDot, { backgroundColor: modeColor }]} />
                <Text style={[styles.modeText, { color: modeColor }]}>{modeLabel}</Text>
              </View>
            </View>

            {/* Display Name */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Display Name (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="How should they see you?"
                placeholderTextColor={TEXT_DIM}
                value={displayName}
                onChangeText={setDisplayName}
              />
            </View>

            {/* What Helps */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>What helps me right now</Text>
              <Text style={styles.cardHint}>Tap to select</Text>
              <View style={styles.chipContainer}>
                {HELPS_SUGGESTIONS.map((item) => (
                  <Pressable
                    key={item}
                    style={[
                      styles.chip,
                      selectedHelps.includes(item) && styles.chipSelected,
                    ]}
                    onPress={() => toggleHelps(item)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedHelps.includes(item) && styles.chipTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* What Doesn't Help */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>What doesn't help right now</Text>
              <Text style={styles.cardHint}>Tap to select</Text>
              <View style={styles.chipContainer}>
                {DOESNT_HELP_SUGGESTIONS.map((item) => (
                  <Pressable
                    key={item}
                    style={[
                      styles.chip,
                      selectedDoesntHelp.includes(item) && styles.chipSelectedRed,
                    ]}
                    onPress={() => toggleDoesntHelp(item)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedDoesntHelp.includes(item) && styles.chipTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Custom Message */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Personal note (optional)</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Anything else they should know?"
                placeholderTextColor={TEXT_DIM}
                value={customMessage}
                onChangeText={setCustomMessage}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Expiry */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Link expires in</Text>
              <View style={styles.expiryOptions}>
                {EXPIRY_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.hours}
                    style={[
                      styles.expiryOption,
                      expiryHours === opt.hours && styles.expiryOptionSelected,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setExpiryHours(opt.hours);
                    }}
                  >
                    <Text
                      style={[
                        styles.expiryText,
                        expiryHours === opt.hours && styles.expiryTextSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Disclaimer */}
            <Text style={styles.disclaimer}>
              This snapshot contains no gauge numbers or health data — only what you choose to share. 
              You can revoke this link anytime.
            </Text>

            {/* Create Button */}
            <Pressable
              style={[styles.createButton, loading && styles.createButtonDisabled]}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.createButtonText}>Create Shareable Link</Text>
              )}
            </Pressable>
          </>
        )}

        {tab === 'create' && shareUrl && (
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color={GREEN} />
            </View>
            <Text style={styles.successTitle}>Snapshot Created!</Text>
            <Text style={styles.successSubtitle}>
              Share this link with someone you trust
            </Text>

            <View style={styles.linkBox}>
              <Text style={styles.linkText} numberOfLines={1}>{shareUrl}</Text>
            </View>

            <View style={styles.linkActions}>
              <Pressable style={styles.linkButton} onPress={handleCopyLink}>
                <Ionicons name="copy-outline" size={20} color={ACCENT} />
                <Text style={styles.linkButtonText}>Copy</Text>
              </Pressable>
              <Pressable style={[styles.linkButton, styles.linkButtonPrimary]} onPress={handleShareLink}>
                <Ionicons name="share-outline" size={20} color="#fff" />
                <Text style={styles.linkButtonTextPrimary}>Share</Text>
              </Pressable>
            </View>

            <Pressable style={styles.newShareButton} onPress={handleNewShare}>
              <Text style={styles.newShareText}>Create Another</Text>
            </Pressable>
          </View>
        )}

        {tab === 'active' && (
          <>
            {loadingShares ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={ACCENT} />
              </View>
            ) : myShares.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>📤</Text>
                <Text style={styles.emptyText}>No active shares</Text>
                <Text style={styles.emptyHint}>
                  Create a snapshot to share with someone
                </Text>
              </View>
            ) : (
              myShares.map((share) => (
                <View key={share.id} style={styles.shareCard}>
                  <View style={styles.shareHeader}>
                    <View style={[styles.modeBadgeSmall, { backgroundColor: (share.currentMode === 'capacity' ? GREEN : AMBER) + '20' }]}>
                      <Text style={[styles.modeTextSmall, { color: share.currentMode === 'capacity' ? GREEN : AMBER }]}>
                        {share.currentMode === 'capacity' ? 'Capacity' : 'Stabilization'}
                      </Text>
                    </View>
                    <Text style={styles.shareViews}>{share.viewCount} views</Text>
                  </View>
                  <Text style={styles.shareExpiry}>
                    Expires {new Date(share.expiresAt).toLocaleDateString()}
                  </Text>
                  <View style={styles.shareActions}>
                    <Pressable
                      style={styles.shareAction}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        Clipboard.setStringAsync(`https://ingauge.app/share/${share.token}`);
                        Alert.alert('Copied!', 'Link copied to clipboard');
                      }}
                    >
                      <Ionicons name="copy-outline" size={18} color={ACCENT} />
                      <Text style={styles.shareActionText}>Copy Link</Text>
                    </Pressable>
                    <Pressable
                      style={styles.shareAction}
                      onPress={() => handleRevoke(share.token)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#F87171" />
                      <Text style={[styles.shareActionText, { color: '#F87171' }]}>Revoke</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tabActive: {
    backgroundColor: ACCENT + '20',
  },
  tabText: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  tabTextActive: {
    color: ACCENT,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  intro: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 20,
    marginBottom: 20,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 8,
  },
  cardHint: {
    fontSize: 12,
    color: TEXT_DIM,
    marginBottom: 12,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
  },
  modeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
    fontSize: 15,
    color: TEXT,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: ACCENT + '20',
    borderColor: ACCENT,
  },
  chipSelectedRed: {
    backgroundColor: '#F8717120',
    borderColor: '#F87171',
  },
  chipText: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  chipTextSelected: {
    color: TEXT,
  },
  expiryOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  expiryOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  expiryOptionSelected: {
    backgroundColor: ACCENT + '20',
  },
  expiryText: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  expiryTextSelected: {
    color: ACCENT,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: TEXT_DIM,
    textAlign: 'center',
    marginVertical: 16,
    lineHeight: 18,
  },
  createButton: {
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Success state
  successContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    color: TEXT_MUTED,
    marginBottom: 24,
  },
  linkBox: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  linkText: {
    fontSize: 14,
    color: ACCENT,
    textAlign: 'center',
  },
  linkActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  linkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  linkButtonPrimary: {
    backgroundColor: ACCENT,
  },
  linkButtonText: {
    color: ACCENT,
    fontSize: 15,
    fontWeight: '600',
  },
  linkButtonTextPrimary: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  newShareButton: {
    marginTop: 24,
    padding: 12,
  },
  newShareText: {
    color: TEXT_MUTED,
    fontSize: 14,
  },

  // Active shares
  loadingContainer: {
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  shareCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    marginBottom: 12,
  },
  shareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modeBadgeSmall: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modeTextSmall: {
    fontSize: 12,
    fontWeight: '600',
  },
  shareViews: {
    fontSize: 12,
    color: TEXT_DIM,
  },
  shareExpiry: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginBottom: 12,
  },
  shareActions: {
    flexDirection: 'row',
    gap: 16,
  },
  shareAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shareActionText: {
    fontSize: 13,
    color: ACCENT,
  },
});
