/**
 * Awe Activities — Full catalog of perspective-shifting experiences
 * 
 * Categories: Nature, Space, Music, Art, Stories
 * Each with brief description and "Do This Now" option.
 * Timer for walks. Links to external content.
 */
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Linking,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import {
  AWE_ACTIVITIES,
  AWE_CATEGORY_INFO,
  type AweActivity,
  type AweCategory,
  getAweActivitiesByCategory,
  recordAweCompleted,
  generateAwePrompt,
  getCompletedActivities,
} from '../../src/services/aweNudge';

// Soft, wonder-inducing palette
const AWE_ACCENT = '#7B68EE';
const AWE_BG = 'rgba(123, 104, 238, 0.08)';
const AWE_BORDER = 'rgba(123, 104, 238, 0.20)';

type ScreenMode = 'browse' | 'activity' | 'timer';

function TimerView({ 
  activity, 
  onComplete, 
  onBack 
}: { 
  activity: AweActivity; 
  onComplete: () => void; 
  onBack: () => void;
}) {
  const minutes = activity.timerMinutes || 5;
  const totalSeconds = minutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Breathing pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 4000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 4000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    if (isPaused || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, secondsLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = 1 - (secondsLeft / totalSeconds);
  const isComplete = secondsLeft <= 0;

  const handlePauseResume = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPaused(!isPaused);
  };

  const handleDone = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await recordAweCompleted(activity.id);
    onComplete();
  };

  return (
    <View style={styles.timerContainer}>
      {/* Activity info */}
      <View style={styles.timerHeader}>
        <Text style={styles.timerEmoji}>{activity.emoji}</Text>
        <Text style={styles.timerTitle}>{activity.title}</Text>
      </View>

      {/* Prompt */}
      <Text style={styles.timerPrompt}>{generateAwePrompt(activity)}</Text>

      {/* Timer circle */}
      <View style={styles.timerCircleContainer}>
        <Animated.View 
          style={[
            styles.timerCircle, 
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <View style={[styles.timerCircleProgress, { opacity: 0.3 + progress * 0.5 }]} />
          <Text style={styles.timerText}>
            {isComplete ? '✨' : formatTime(secondsLeft)}
          </Text>
        </Animated.View>
      </View>

      {/* Instructions reminder */}
      <Text style={styles.timerInstruction}>
        {isComplete 
          ? "Take a moment to notice how you feel."
          : activity.description
        }
      </Text>

      {/* Controls */}
      <View style={styles.timerControls}>
        {!isComplete && (
          <Pressable style={styles.timerControlButton} onPress={handlePauseResume}>
            <Ionicons 
              name={isPaused ? 'play' : 'pause'} 
              size={24} 
              color={COLORS.text} 
            />
          </Pressable>
        )}
        
        <Pressable 
          style={[styles.timerDoneButton, isComplete && styles.timerDoneButtonComplete]} 
          onPress={handleDone}
        >
          <Text style={styles.timerDoneText}>
            {isComplete ? 'Done' : 'End Early'}
          </Text>
        </Pressable>
      </View>

      <Pressable style={styles.backLink} onPress={onBack}>
        <Ionicons name="arrow-back" size={16} color={COLORS.textMuted} />
        <Text style={styles.backLinkText}>Back to activities</Text>
      </Pressable>
    </View>
  );
}

function ActivityDetail({ 
  activity, 
  onStartTimer, 
  onBack 
}: { 
  activity: AweActivity; 
  onStartTimer: () => void; 
  onBack: () => void;
}) {
  const router = useRouter();

  const handleDoThis = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (activity.hasTimer) {
      onStartTimer();
    } else if (activity.externalLink) {
      await recordAweCompleted(activity.id);
      Linking.openURL(activity.externalLink);
    } else {
      await recordAweCompleted(activity.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleAskCoPilot = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await recordAweCompleted(activity.id);
    
    // Build an awe-themed prompt for CoPilot
    const awePrompts: Record<string, string> = {
      'human-triumph': "Tell me an inspiring true story of someone who overcame impossible odds. Something that reminds me what humans are capable of.",
      'deep-time': "Help me feel the scale of deep time. Put my life and problems in cosmic perspective — the universe is 13.8 billion years old, and I'm here for a blink.",
      'stargazing': "I'm looking at the stars tonight. Tell me something beautiful and mind-expanding about what I'm seeing up there.",
    };
    
    const prompt = awePrompts[activity.id] || `Help me experience awe through ${activity.title.toLowerCase()}. ${activity.description}`;
    
    // Navigate to CoPilot with the prompt
    router.push({
      pathname: '/(modals)/copilot',
      params: { initialMessage: prompt, context: 'awe' },
    });
  };

  const showBothOptions = activity.hasAiOption && activity.externalLink;

  return (
    <ScrollView 
      style={styles.detailContainer} 
      contentContainerStyle={styles.detailContent}
      showsVerticalScrollIndicator={false}
    >
      <Pressable style={styles.backLink} onPress={onBack}>
        <Ionicons name="arrow-back" size={16} color={COLORS.textMuted} />
        <Text style={styles.backLinkText}>All activities</Text>
      </Pressable>

      <View style={styles.detailHeader}>
        <Text style={styles.detailEmoji}>{activity.emoji}</Text>
        <Text style={styles.detailTitle}>{activity.title}</Text>
        {activity.duration && (
          <View style={styles.durationBadge}>
            <Ionicons name="time-outline" size={14} color={AWE_ACCENT} />
            <Text style={styles.durationText}>{activity.duration}</Text>
          </View>
        )}
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.detailDescription}>{activity.description}</Text>
      </View>

      <View style={styles.whyCard}>
        <Text style={styles.whyLabel}>✨ Why it works</Text>
        <Text style={styles.whyText}>{activity.whyItWorks}</Text>
      </View>

      {/* CTAs - show both if hasAiOption */}
      {showBothOptions ? (
        <View style={styles.dualButtonContainer}>
          <Pressable style={styles.doThisButton} onPress={handleDoThis}>
            <Text style={styles.doThisText}>
              {activity.linkText || 'Open Link'}
            </Text>
            <Ionicons name="open-outline" size={20} color="#fff" />
          </Pressable>
          
          <Pressable style={styles.aiButton} onPress={handleAskCoPilot}>
            <Ionicons name="sparkles" size={18} color={AWE_ACCENT} />
            <Text style={styles.aiButtonText}>Ask CoPilot</Text>
          </Pressable>
        </View>
      ) : activity.hasAiOption && !activity.externalLink ? (
        // Only AI option (no link)
        <View style={styles.dualButtonContainer}>
          <Pressable style={styles.doThisButton} onPress={handleAskCoPilot}>
            <Text style={styles.doThisText}>Ask CoPilot</Text>
            <Ionicons name="sparkles" size={20} color="#fff" />
          </Pressable>
        </View>
      ) : (
        // Standard single button
        <Pressable style={styles.doThisButton} onPress={handleDoThis}>
          <Text style={styles.doThisText}>
            {activity.hasTimer ? 'Start Timer' : activity.externalLink ? 'Do This Now' : 'Mark Complete'}
          </Text>
          <Ionicons 
            name={activity.hasTimer ? 'timer-outline' : activity.externalLink ? 'open-outline' : 'checkmark-circle-outline'} 
            size={20} 
            color="#fff" 
          />
        </Pressable>
      )}

      {activity.externalLink && !showBothOptions && (
        <Text style={styles.linkHint}>Opens in browser</Text>
      )}
    </ScrollView>
  );
}

function ActivityCard({ 
  activity, 
  onSelect, 
  isCompleted 
}: { 
  activity: AweActivity; 
  onSelect: () => void;
  isCompleted: boolean;
}) {
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.activityCard,
        pressed && styles.activityCardPressed,
        isCompleted && styles.activityCardCompleted,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect();
      }}
    >
      <View style={styles.activityCardHeader}>
        <Text style={styles.activityEmoji}>{activity.emoji}</Text>
        <View style={styles.activityInfo}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          {activity.duration && (
            <Text style={styles.activityDuration}>{activity.duration}</Text>
          )}
        </View>
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark" size={14} color={COLORS.success} />
          </View>
        )}
        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
      </View>
    </Pressable>
  );
}

export default function AweActivitiesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ startActivity?: string }>();
  
  const [mode, setMode] = useState<ScreenMode>('browse');
  const [selectedActivity, setSelectedActivity] = useState<AweActivity | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AweCategory | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const activitiesByCategory = getAweActivitiesByCategory();
  const categories: AweCategory[] = ['nature', 'space', 'music', 'art', 'stories'];

  useEffect(() => {
    // Load completed activities
    getCompletedActivities().then(completed => {
      setCompletedIds(new Set(completed.map(c => c.activityId)));
    });

    // Check if we should start a specific activity
    if (params.startActivity) {
      const activity = AWE_ACTIVITIES.find(a => a.id === params.startActivity);
      if (activity) {
        setSelectedActivity(activity);
        if (activity.hasTimer) {
          setMode('timer');
        } else {
          setMode('activity');
        }
      }
    }
  }, [params.startActivity]);

  const handleSelectActivity = (activity: AweActivity) => {
    setSelectedActivity(activity);
    setMode('activity');
  };

  const handleStartTimer = () => {
    setMode('timer');
  };

  const handleBackToBrowse = () => {
    setSelectedActivity(null);
    setMode('browse');
  };

  const handleTimerComplete = () => {
    setCompletedIds(prev => new Set([...prev, selectedActivity?.id || '']));
    handleBackToBrowse();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      {mode === 'browse' && (
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Awe Activities</Text>
            <Text style={styles.headerSubtitle}>Shift your perspective</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      )}

      {/* Timer mode */}
      {mode === 'timer' && selectedActivity && (
        <TimerView 
          activity={selectedActivity}
          onComplete={handleTimerComplete}
          onBack={handleBackToBrowse}
        />
      )}

      {/* Activity detail mode */}
      {mode === 'activity' && selectedActivity && (
        <ActivityDetail 
          activity={selectedActivity}
          onStartTimer={handleStartTimer}
          onBack={handleBackToBrowse}
        />
      )}

      {/* Browse mode */}
      {mode === 'browse' && (
        <ScrollView 
          style={styles.scroll} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Intro */}
          <View style={styles.introCard}>
            <Text style={styles.introEmoji}>✨</Text>
            <Text style={styles.introText}>
              Awe is the feeling of encountering something vast. It shrinks the ego and expands perspective. 
              Even a few minutes can help shift a stuck mind.
            </Text>
          </View>

          {/* Categories */}
          {categories.map(category => {
            const info = AWE_CATEGORY_INFO[category];
            const activities = activitiesByCategory[category];
            
            return (
              <View key={category} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryEmoji}>{info.emoji}</Text>
                  <View>
                    <Text style={styles.categoryTitle}>{info.label}</Text>
                    <Text style={styles.categoryDescription}>{info.description}</Text>
                  </View>
                </View>
                
                {activities.map(activity => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onSelect={() => handleSelectActivity(activity)}
                    isCompleted={completedIds.has(activity.id)}
                  />
                ))}
              </View>
            );
          })}

          {/* Footer note */}
          <View style={styles.footerNote}>
            <Text style={styles.footerNoteText}>
              💡 Awe isn't about feeling better immediately. It's about feeling bigger — 
              remembering you're part of something vast. That shift often helps.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: AWE_ACCENT,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  
  // Intro
  introCard: {
    backgroundColor: AWE_BG,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  introEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  introText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },

  // Categories
  categorySection: {
    marginBottom: SPACING.xl,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoryDescription: {
    fontSize: 13,
    color: COLORS.textMuted,
  },

  // Activity cards
  activityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activityCardPressed: {
    opacity: 0.8,
  },
  activityCardCompleted: {
    borderColor: COLORS.success + '40',
    backgroundColor: COLORS.success + '08',
  },
  activityCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityEmoji: {
    fontSize: 22,
    marginRight: SPACING.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  activityDuration: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  completedBadge: {
    backgroundColor: COLORS.success + '20',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },

  // Footer
  footerNote: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderLeftWidth: 3,
    borderLeftColor: AWE_ACCENT,
  },
  footerNoteText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
  },

  // Detail view
  detailContainer: {
    flex: 1,
  },
  detailContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  backLinkText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  detailHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  detailEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AWE_BG,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  durationText: {
    fontSize: 13,
    color: AWE_ACCENT,
    fontWeight: '500',
  },
  detailCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailDescription: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  whyCard: {
    backgroundColor: AWE_BG,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  whyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: AWE_ACCENT,
    marginBottom: SPACING.sm,
  },
  whyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
  },
  dualButtonContainer: {
    gap: SPACING.md,
  },
  doThisButton: {
    backgroundColor: AWE_ACCENT,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  doThisText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  aiButton: {
    backgroundColor: AWE_BG,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: AWE_BORDER,
  },
  aiButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: AWE_ACCENT,
  },
  linkHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },

  // Timer view
  timerContainer: {
    flex: 1,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timerEmoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  timerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  timerPrompt: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  timerCircleContainer: {
    marginVertical: SPACING.xxl,
  },
  timerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: AWE_BG,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: AWE_ACCENT,
  },
  timerCircleProgress: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 90,
    backgroundColor: AWE_ACCENT,
  },
  timerText: {
    fontSize: 42,
    fontWeight: '200',
    color: COLORS.text,
    zIndex: 1,
  },
  timerInstruction: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  timerControlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timerDoneButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timerDoneButtonComplete: {
    backgroundColor: AWE_ACCENT,
    borderColor: AWE_ACCENT,
  },
  timerDoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});
