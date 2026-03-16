/**
 * Reach-Out Scaffold Modal
 * 
 * Appears when Connection gauge is low (<40) for 2+ days.
 * Offers reconnection options with a warm, supportive tone.
 */
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Share,
  Clipboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import {
  getReconnectionSuggestions,
  generateCheckInMessages,
  generateRepairScript,
  suggestSharedActivities,
  getPreReachOutRegulation,
  type ReconnectionSuggestion,
  type CheckInMessage,
  type RepairStep,
  type SharedActivity,
} from '../../src/services/reachOutScaffold';

const BG = COLORS.background;
const SURFACE = COLORS.surface;
const TEXT = COLORS.text;
const TEXT_SECONDARY = COLORS.textSecondary;
const TEXT_MUTED = COLORS.textMuted;
const ACCENT = COLORS.accent;
const BORDER = COLORS.border;

// Warm connection color
const CONNECTION_ACCENT = '#EC4899'; // Pink/love color

type ViewMode = 'options' | 'check-in' | 'repair' | 'shared-time';

export default function ReachOutScaffoldScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ days?: string; level?: string }>();
  
  const daysBelowThreshold = parseInt(params.days || '2', 10);
  const connectionLevel = parseInt(params.level || '30', 10);
  
  const [viewMode, setViewMode] = useState<ViewMode>('options');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [expandedRepairStep, setExpandedRepairStep] = useState<number>(0);

  const suggestions = getReconnectionSuggestions(connectionLevel, daysBelowThreshold);
  const checkInMessages = generateCheckInMessages();
  const repairScript = generateRepairScript();
  const activities = suggestSharedActivities();
  const regulation = getPreReachOutRegulation();

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleOptionSelect = (type: ReconnectionSuggestion['type']) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setViewMode(type);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewMode('options');
  };

  const handleQuickReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(modals)/quick-reset');
  };

  const handleCopyMessage = (message: CheckInMessage) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Clipboard.setString(message.message);
    setCopiedMessageId(message.id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleShareMessage = async (message: CheckInMessage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({ message: message.message });
    } catch (e) {
      // User cancelled or error
    }
  };

  // Options view
  const renderOptions = () => (
    <>
      {/* Header */}
      <View style={styles.headerSection}>
        <View style={[styles.headerIcon, { backgroundColor: CONNECTION_ACCENT + '20' }]}>
          <Ionicons name="heart-half" size={32} color={CONNECTION_ACCENT} />
        </View>
        <Text style={styles.headerTitle}>
          Connection has been low for {daysBelowThreshold} days
        </Text>
        <Text style={styles.headerSubtitle}>
          Would you like to...
        </Text>
      </View>

      {/* Regulate first option */}
      <Pressable
        style={({ pressed }) => [styles.regulateCard, pressed && styles.cardPressed]}
        onPress={handleQuickReset}
      >
        <View style={styles.regulateIconWrap}>
          <Ionicons name="pulse" size={24} color={ACCENT} />
        </View>
        <View style={styles.regulateContent}>
          <Text style={styles.regulateTitle}>{regulation.suggestion}</Text>
          <Text style={styles.regulateDescription}>{regulation.reason}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
      </Pressable>

      {/* Main options */}
      <View style={styles.optionsSection}>
        {suggestions.map((suggestion) => (
          <Pressable
            key={suggestion.type}
            style={({ pressed }) => [styles.optionCard, pressed && styles.cardPressed]}
            onPress={() => handleOptionSelect(suggestion.type)}
          >
            <Text style={styles.optionEmoji}>{suggestion.emoji}</Text>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{suggestion.title}</Text>
              <Text style={styles.optionDescription}>{suggestion.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
          </Pressable>
        ))}
        <Pressable
          style={({ pressed }) => [styles.optionCard, pressed && styles.cardPressed]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/tools/tone-check');
          }}
        >
          <Text style={styles.optionEmoji}>🎯</Text>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Check tone before you send</Text>
            <Text style={styles.optionDescription}>See how your message might sound — then send a better one</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
        </Pressable>
      </View>

      {/* Reassurance footer */}
      <View style={styles.footerNote}>
        <Text style={styles.footerText}>
          💜 Connection ebbs and flows. Reaching out is always an option, not an obligation.
        </Text>
      </View>
    </>
  );

  // Check-in messages view
  const renderCheckIn = () => (
    <>
      <View style={styles.viewHeader}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.viewTitle}>Check-In Messages</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.viewSubtitle}>
        Tap any message to copy it. These are starting points — make them yours.
      </Text>

      {/* Grouped by tone */}
      {(['warm', 'light', 'curious'] as const).map((tone) => {
        const toneMessages = checkInMessages.filter(m => m.tone === tone);
        const toneLabels = { warm: '💜 Warm', light: '☀️ Light', curious: '🤔 Curious' };
        
        return (
          <View key={tone} style={styles.toneGroup}>
            <Text style={styles.toneLabel}>{toneLabels[tone]}</Text>
            {toneMessages.map((message) => (
              <Pressable
                key={message.id}
                style={({ pressed }) => [
                  styles.messageCard,
                  pressed && styles.cardPressed,
                  copiedMessageId === message.id && styles.messageCopied,
                ]}
                onPress={() => handleCopyMessage(message)}
                onLongPress={() => handleShareMessage(message)}
              >
                <Text style={styles.messageText}>{message.message}</Text>
                <View style={styles.messageActions}>
                  {copiedMessageId === message.id ? (
                    <Text style={styles.copiedText}>Copied! ✓</Text>
                  ) : (
                    <Ionicons name="copy-outline" size={18} color={TEXT_MUTED} />
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        );
      })}

      <View style={styles.viewFooter}>
        <Text style={styles.viewFooterText}>
          Long press to share directly to a messaging app
        </Text>
      </View>
    </>
  );

  // Repair script view
  const renderRepair = () => (
    <>
      <View style={styles.viewHeader}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.viewTitle}>Repair Script</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.viewSubtitle}>
        A scaffold for hard conversations. These are prompts, not scripts — fill in your own words.
      </Text>

      <View style={styles.repairSteps}>
        {repairScript.map((step, index) => (
          <Pressable
            key={step.phase}
            style={[
              styles.repairStep,
              expandedRepairStep === index && styles.repairStepExpanded,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setExpandedRepairStep(expandedRepairStep === index ? -1 : index);
            }}
          >
            <View style={styles.repairStepHeader}>
              <View style={styles.repairStepNumber}>
                <Text style={styles.repairStepNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.repairStepMeta}>
                <Text style={styles.repairPhase}>
                  {step.phase.charAt(0).toUpperCase() + step.phase.slice(1)}
                </Text>
                <Text style={styles.repairPrompt}>{step.prompt}</Text>
              </View>
              <Ionicons
                name={expandedRepairStep === index ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={TEXT_MUTED}
              />
            </View>

            {expandedRepairStep === index && (
              <View style={styles.repairStepContent}>
                {step.example && (
                  <View style={styles.exampleBlock}>
                    <Text style={styles.exampleLabel}>Example:</Text>
                    <Text style={styles.exampleText}>"{step.example}"</Text>
                  </View>
                )}
                {step.tip && (
                  <View style={styles.tipBlock}>
                    <Ionicons name="bulb-outline" size={14} color={ACCENT} />
                    <Text style={styles.tipText}>{step.tip}</Text>
                  </View>
                )}
              </View>
            )}
          </Pressable>
        ))}
      </View>

      <View style={styles.viewFooter}>
        <Text style={styles.viewFooterText}>
          The goal isn't to solve everything. It's to reopen the channel.
        </Text>
      </View>
    </>
  );

  // Shared time view
  const renderSharedTime = () => (
    <>
      <View style={styles.viewHeader}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.viewTitle}>Shared Time Ideas</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.viewSubtitle}>
        Low-pressure activities to reconnect. Parallel time often opens conversation naturally.
      </Text>

      <View style={styles.activitiesGrid}>
        {activities.map((activity) => (
          <View key={activity.id} style={styles.activityCard}>
            <Text style={styles.activityEmoji}>{activity.emoji}</Text>
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <Text style={styles.activityDescription}>{activity.description}</Text>
            <View style={styles.activityMeta}>
              <View style={[
                styles.energyBadge,
                activity.energy === 'low' && styles.energyLow,
                activity.energy === 'medium' && styles.energyMedium,
                activity.energy === 'high' && styles.energyHigh,
              ]}>
                <Text style={styles.energyText}>
                  {activity.energy === 'low' ? '🌿 Low energy' : 
                   activity.energy === 'medium' ? '⚡ Medium' : '🔥 High energy'}
                </Text>
              </View>
              <Text style={styles.timeText}>{activity.time}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.viewFooter}>
        <Text style={styles.viewFooterText}>
          Pick something you'd both enjoy. The activity is just a container for connection.
        </Text>
      </View>
    </>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={TEXT_MUTED} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === 'options' && renderOptions()}
        {viewMode === 'check-in' && renderCheckIn()}
        {viewMode === 'repair' && renderRepair()}
        {viewMode === 'shared-time' && renderSharedTime()}
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
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Header section
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    textAlign: 'center',
  },

  // Regulate first card
  regulateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: ACCENT + '30',
  },
  regulateIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ACCENT + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  regulateContent: {
    flex: 1,
  },
  regulateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 4,
  },
  regulateDescription: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    lineHeight: 18,
  },

  // Options section
  optionsSection: {
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
  },
  cardPressed: {
    opacity: 0.8,
  },
  optionEmoji: {
    fontSize: 32,
    marginRight: 14,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },

  // Footer note
  footerNote: {
    backgroundColor: SURFACE,
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
  },
  footerText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },

  // View header
  viewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  viewTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: TEXT,
    textAlign: 'center',
  },
  viewSubtitle: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    lineHeight: 22,
    marginBottom: 20,
  },

  // Check-in messages
  toneGroup: {
    marginBottom: 20,
  },
  toneLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messageCard: {
    backgroundColor: SURFACE,
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  messageCopied: {
    backgroundColor: ACCENT + '20',
    borderColor: ACCENT,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    color: TEXT,
    lineHeight: 24,
    flex: 1,
    marginRight: 12,
  },
  messageActions: {
    paddingTop: 2,
  },
  copiedText: {
    fontSize: 12,
    color: ACCENT,
    fontWeight: '600',
  },

  // Repair script
  repairSteps: {
    gap: 12,
    marginBottom: 20,
  },
  repairStep: {
    backgroundColor: SURFACE,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  repairStepExpanded: {
    borderColor: ACCENT + '40',
    borderWidth: 1,
  },
  repairStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  repairStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ACCENT + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  repairStepNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: ACCENT,
  },
  repairStepMeta: {
    flex: 1,
  },
  repairPhase: {
    fontSize: 12,
    fontWeight: '600',
    color: ACCENT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  repairPrompt: {
    fontSize: 15,
    color: TEXT,
    lineHeight: 20,
  },
  repairStepContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  exampleBlock: {
    backgroundColor: BG,
    borderRadius: BORDER_RADIUS.sm,
    padding: 12,
    marginTop: 12,
  },
  exampleLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exampleText: {
    fontSize: 15,
    color: TEXT,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  tipBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    gap: 8,
  },
  tipText: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    lineHeight: 18,
    flex: 1,
  },

  // Activities
  activitiesGrid: {
    gap: 12,
    marginBottom: 20,
  },
  activityCard: {
    backgroundColor: SURFACE,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
  },
  activityEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 6,
  },
  activityDescription: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 12,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  energyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.textMuted + '20',
  },
  energyLow: {
    backgroundColor: '#4ADE80' + '20',
  },
  energyMedium: {
    backgroundColor: '#FACC15' + '20',
  },
  energyHigh: {
    backgroundColor: '#FB923C' + '20',
  },
  energyText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  timeText: {
    fontSize: 12,
    color: TEXT_MUTED,
  },

  // View footer
  viewFooter: {
    paddingTop: 8,
  },
  viewFooterText: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
