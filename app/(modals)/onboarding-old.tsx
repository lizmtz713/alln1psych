import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated,
  Linking,
  Switch,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../src/lib/constants';
import * as Haptics from 'expo-haptics';
import {
  useUserStore,
  type Pronouns,
  type AgeGroup,
  type LoveLanguage,
  type CircleInvite,
  type LearningStyle,
} from '../../src/stores/userStore';
import { useAuth } from '../../src/providers/AuthProvider';
import { completeOnboarding as completeOnboardingDb } from '../../src/services/database';
import { useSettingsStore } from '../../src/stores/settingsStore';
import {
  registerForPushNotifications,
  scheduleDailyCheckin,
  scheduleEveningReflection,
} from '../../src/services/notifications';
import { SENSITIVE_TOPIC_OPTIONS } from '../../src/lib/sensitiveTopics';
import {
  CULTURAL_BACKGROUND_OPTIONS,
} from '../../src/lib/culturalOptions';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TOTAL_STEPS = 3;

const LEARNING_STYLE_OPTIONS: { value: LearningStyle; label: string; emoji: string }[] = [
  { value: 'reading', label: 'Reading', emoji: '📖' },
  { value: 'listening', label: 'Listening', emoji: '🎧' },
  { value: 'doing', label: 'Doing', emoji: '🎮' },
  { value: 'talking', label: 'Talking', emoji: '💬' },
  { value: 'unknown', label: 'Not sure yet', emoji: '🤔' },
];

const PRONOUN_OPTIONS: { value: Pronouns; label: string }[] = [
  { value: 'she/her', label: 'she/her' },
  { value: 'he/him', label: 'he/him' },
  { value: 'they/them', label: 'they/them' },
  { value: 'he/they', label: 'he/they' },
  { value: 'she/they', label: 'she/they' },
  { value: 'any', label: 'any' },
  { value: 'other', label: 'other' },
];

const AGE_OPTIONS: { value: AgeGroup; label: string }[] = [
  { value: 'under13', label: 'Under 13' },
  { value: '13-17', label: '13–17' },
  { value: '18-25', label: '18–25' },
  { value: '26-40', label: '26–40' },
  { value: '41-60', label: '41–60' },
  { value: '60+', label: '60+' },
];

const LOVE_LANGUAGE_OPTIONS: { value: LoveLanguage; label: string }[] = [
  { value: 'words', label: 'Words of Affirmation' },
  { value: 'quality-time', label: 'Quality Time' },
  { value: 'acts-of-service', label: 'Acts of Service' },
  { value: 'physical-touch', label: 'Physical Touch' },
  { value: 'gifts', label: 'Gifts' },
  { value: 'unknown', label: 'Not sure yet' },
];

const THERAPY_OPTIONS = [
  { value: 'never', label: 'Never been' },
  { value: 'past', label: 'In the past' },
  { value: 'current', label: 'Currently in therapy' },
  { value: 'prefer-not', label: 'Prefer not to say' },
];

const UPBRINGING_OPTIONS = [
  { value: 'both-parents', label: 'Both parents' },
  { value: 'single-mom', label: 'Single mom' },
  { value: 'single-dad', label: 'Single dad' },
  { value: 'grandparents', label: 'Grandparents' },
  { value: 'other-family', label: 'Other family' },
  { value: 'foster', label: 'Foster care' },
  { value: 'mixed', label: 'Mixed/complicated' },
  { value: 'prefer-not', label: 'Prefer not to say' },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const { user } = useAuth();

  const {
    name, setName,
    pronouns, setPronouns,
    customPronouns, setCustomPronouns,
    ageGroup, setAgeGroup,
    loveLanguage, setLoveLanguage,
    sensitiveTopics, setSensitiveTopics,
    learningStyle, setLearningStyle,
    culturalBackground, setCulturalBackground,
    birthday, setBirthday,
    completeOnboarding,
  } = useUserStore();

  // Additional profile fields (stored locally for now)
  const [therapyExp, setTherapyExp] = useState<string | null>(null);
  const [upbringing, setUpbringing] = useState<string | null>(null);
  const [thinkingLanguage, setThinkingLanguage] = useState('');

  // Expanded sections
  const [expandedSection, setExpandedSection] = useState<string | null>('basic');
  
  // Active gauge tab for Step 2
  const [activeGaugeTab, setActiveGaugeTab] = useState<string>('body');

  const [birthdayInput, setBirthdayInput] = useState('');
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const setNotificationsCheckIn = useSettingsStore((s) => s.setNotificationsCheckIn);
  const stepOpacity = useRef(new Animated.Value(1)).current;

  const toggleSection = (section: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSection(expandedSection === section ? null : section);
  };

  const finishOnboarding = async () => {
    if (user?.id) {
      await completeOnboardingDb(user.id, {
        name: name.trim(),
        pronouns: pronouns ?? undefined,
        age_group: ageGroup,
        love_language: loveLanguage,
        communication_preference: null,
        birthday,
      });
    }
    completeOnboarding();
    router.replace('/(tabs)');
  };

  const runFadeThen = (next: () => void) => {
    Animated.timing(stepOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      next();
      stepOpacity.setValue(0);
      Animated.timing(stepOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  };

  const getAgeGroupFromBirthday = (bday: string): typeof ageGroup => {
    const d = new Date(bday + 'T12:00:00');
    if (isNaN(d.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    if (age < 13) return 'under13';
    if (age <= 17) return '13-17';
    if (age <= 25) return '18-25';
    if (age <= 40) return '26-40';
    if (age <= 60) return '41-60';
    return '60+';
  };

  const goNext = () => {
    if (step >= TOTAL_STEPS) {
      setShowNotificationPrompt(true);
      return;
    }
    runFadeThen(() => setStep((s) => s + 1));
  };

  const goBack = () => {
    if (step <= 1) return;
    runFadeThen(() => setStep((s) => s - 1));
  };

  const handleNotificationPromptYes = async () => {
    setShowNotificationPrompt(false);
    await registerForPushNotifications();
    setNotificationsCheckIn(true);
    await scheduleDailyCheckin(9, 0).catch(() => {});
    await scheduleEveningReflection(21, 0).catch(() => {});
    await finishOnboarding();
  };

  const handleNotificationPromptLater = async () => {
    setShowNotificationPrompt(false);
    await finishOnboarding();
  };

  const canProceed = () => {
    if (step === 2) return name.trim().length > 0;
    return true;
  };

  // Profile Section Component
  const ProfileSection = ({ 
    id, 
    title, 
    emoji, 
    children,
    optional = true,
  }: { 
    id: string; 
    title: string; 
    emoji: string; 
    children: React.ReactNode;
    optional?: boolean;
  }) => {
    const isExpanded = expandedSection === id;
    return (
      <View style={styles.sectionCard}>
        <Pressable style={styles.sectionHeader} onPress={() => toggleSection(id)}>
          <View style={styles.sectionHeaderLeft}>
            <Text style={styles.sectionEmoji}>{emoji}</Text>
            <Text style={styles.sectionTitle}>{title}</Text>
            {optional && <Text style={styles.optionalBadge}>optional</Text>}
          </View>
          <Ionicons 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color={COLORS.textMuted} 
          />
        </Pressable>
        {isExpanded && (
          <View style={styles.sectionContent}>
            {children}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Notification Prompt Modal */}
      <Modal
        visible={showNotificationPrompt}
        transparent
        animationType="fade"
        onRequestClose={handleNotificationPromptLater}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>🔔</Text>
            <Text style={styles.modalTitle}>Daily check-in reminder?</Text>
            <Text style={styles.modalSub}>
              A gentle nudge to check in with yourself. You can change this anytime in settings.
            </Text>
            <Pressable style={styles.modalPrimaryBtn} onPress={handleNotificationPromptYes}>
              <Text style={styles.modalPrimaryBtnText}>Yes, remind me</Text>
            </Pressable>
            <Pressable style={styles.modalSecondaryBtn} onPress={handleNotificationPromptLater}>
              <Text style={styles.modalSecondaryBtnText}>Maybe later</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        {step > 1 ? (
          <Pressable onPress={goBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.accent} />
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <View style={styles.progressRow}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
            const stepNum = i + 1;
            const isCompleted = stepNum < step;
            const isCurrent = stepNum === step;
            return (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View 
                  style={[
                    styles.progressStep,
                    isCompleted && styles.progressStepCompleted,
                    isCurrent && styles.progressStepCurrent,
                    !isCompleted && !isCurrent && styles.progressStepUpcoming,
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={18} color="#fff" />
                  ) : (
                    <Text 
                      style={[
                        styles.progressStepText,
                        isCurrent && styles.progressStepTextCurrent,
                        !isCurrent && styles.progressStepTextUpcoming,
                      ]}
                    >
                      {stepNum}
                    </Text>
                  )}
                </View>
                {i < TOTAL_STEPS - 1 && (
                  <View 
                    style={[
                      styles.progressLine,
                      stepNum < step ? styles.progressLineCompleted : styles.progressLineUpcoming,
                    ]} 
                  />
                )}
              </View>
            );
          })}
        </View>
        <Pressable onPress={() => setShowNotificationPrompt(true)} style={styles.skipBtn}>
          <Text style={styles.skipBtnText}>Skip</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={20}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: stepOpacity }}>
            
            {/* ═══════════════════════════════════════════════════════════
                STEP 1: Welcome + What Gauge Is (Combined, Informative)
            ═══════════════════════════════════════════════════════════ */}
            {step === 1 && (
              <View style={styles.step}>
                <Text style={styles.heroTitle}>Welcome to InGauge</Text>
                <Text style={styles.heroTagline}>Your personal cockpit for emotional intelligence.</Text>

                {/* What it is */}
                <View style={styles.introCard}>
                  <Text style={styles.introCardTitle}>You're not a mood. You're a system.</Text>
                  <Text style={styles.introCardText}>
                    6 gauges track the parts of you that matter: Body, State, Emotion, Connection, Direction, and Alignment.
                  </Text>
                </View>

                {/* 6 Gauges Visual */}
                <View style={styles.gaugesGrid}>
                  {[
                    { emoji: '🫀', label: 'Body', color: '#EF4444' },
                    { emoji: '⚡', label: 'State', color: '#F59E0B' },
                    { emoji: '💜', label: 'Emotion', color: '#8B5CF6' },
                    { emoji: '💙', label: 'Connection', color: '#3B82F6' },
                    { emoji: '🧭', label: 'Direction', color: '#10B981' },
                    { emoji: '✨', label: 'Alignment', color: '#EC4899' },
                  ].map((g) => (
                    <View key={g.label} style={styles.gaugeItem}>
                      <View style={[styles.gaugeIcon, { backgroundColor: g.color + '20' }]}>
                        <Text style={styles.gaugeEmoji}>{g.emoji}</Text>
                      </View>
                      <Text style={[styles.gaugeLabel, { color: g.color }]}>{g.label}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.introText}>
                  When one drops, others follow.{'\n'}
                  When you lift one, others rise.{'\n'}
                  <Text style={styles.introTextBold}>Everything is connected.</Text>
                </Text>

                {/* What you get */}
                <View style={styles.featuresList}>
                  <View style={styles.featureItem}>
                    <Ionicons name="chatbubbles" size={20} color={COLORS.accent} />
                    <Text style={styles.featureText}>Talk to Gauge — AI that actually gets you</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="book" size={20} color={COLORS.accent} />
                    <Text style={styles.featureText}>Human Manual — 48 lessons on how you work</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="people" size={20} color={COLORS.accent} />
                    <Text style={styles.featureText}>Circle — share your temperature with people who care</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="construct" size={20} color={COLORS.accent} />
                    <Text style={styles.featureText}>32 tools for processing life's moments</Text>
                  </View>
                </View>

                <Pressable style={styles.primaryBtn} onPress={goNext}>
                  <Text style={styles.primaryBtnText}>Let's set up your profile</Text>
                </Pressable>
              </View>
            )}

            {/* ═══════════════════════════════════════════════════════════
                STEP 2: Customize Your Profile (Fortune 500 Tabbed Style)
            ═══════════════════════════════════════════════════════════ */}
            {step === 2 && (
              <View style={styles.step}>
                <Text style={styles.pageTitle}>Customize</Text>
                <Text style={styles.pageSubtitle}>
                  Tap a gauge to add details. Share as much or little as you want.
                </Text>

                {/* ══════════════════════════════════════════════════════════
                    BASIC INFO CARD (Always visible)
                ══════════════════════════════════════════════════════════ */}
                <View style={styles.basicInfoCard}>
                  <View style={styles.basicInfoRow}>
                    <View style={styles.basicInfoAvatar}>
                      <Text style={styles.basicInfoInitial}>
                        {name ? name.charAt(0).toUpperCase() : '?'}
                      </Text>
                    </View>
                    <View style={styles.basicInfoFields}>
                      <TextInput
                        style={styles.basicNameInput}
                        placeholder="Your name"
                        placeholderTextColor={COLORS.textMuted}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                      />
                      <View style={styles.basicInfoMeta}>
                        <Pressable 
                          style={styles.metaPill}
                          onPress={() => setExpandedSection(expandedSection === 'pronouns' ? null : 'pronouns')}
                        >
                          <Text style={styles.metaPillText}>{pronouns || 'Pronouns'}</Text>
                          <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
                        </Pressable>
                        <Pressable 
                          style={styles.metaPill}
                          onPress={() => setExpandedSection(expandedSection === 'birthday' ? null : 'birthday')}
                        >
                          <Text style={styles.metaPillText}>{birthdayInput || 'Birthday'}</Text>
                          <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
                        </Pressable>
                      </View>
                    </View>
                  </View>

                  {/* Pronouns Dropdown */}
                  {expandedSection === 'pronouns' && (
                    <View style={styles.dropdownContent}>
                      <View style={styles.chipRow}>
                        {PRONOUN_OPTIONS.map((opt) => (
                          <Pressable
                            key={opt.value}
                            style={[styles.chip, pronouns === opt.value && styles.chipSelected]}
                            onPress={() => { setPronouns(opt.value); setExpandedSection(null); }}
                          >
                            <Text style={[styles.chipText, pronouns === opt.value && styles.chipTextSelected]}>
                              {opt.label}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Birthday Dropdown */}
                  {expandedSection === 'birthday' && (
                    <View style={styles.dropdownContent}>
                      <TextInput
                        style={styles.input}
                        placeholder="MM/DD/YYYY"
                        placeholderTextColor={COLORS.textMuted}
                        value={birthdayInput}
                        onChangeText={(text) => {
                          const cleaned = text.replace(/\D/g, '');
                          if (cleaned.length <= 2) setBirthdayInput(cleaned);
                          else if (cleaned.length <= 4) setBirthdayInput(cleaned.slice(0, 2) + '/' + cleaned.slice(2));
                          else setBirthdayInput(cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8));
                          if (cleaned.length === 8) {
                            const mm = cleaned.slice(0, 2), dd = cleaned.slice(2, 4), yyyy = cleaned.slice(4, 8);
                            setBirthday(`${yyyy}-${mm}-${dd}`);
                            const calcAge = getAgeGroupFromBirthday(`${yyyy}-${mm}-${dd}`);
                            if (calcAge) setAgeGroup(calcAge);
                          }
                        }}
                        keyboardType="number-pad"
                        maxLength={10}
                      />
                      <Text style={styles.fieldHint}>For Personology insights</Text>
                    </View>
                  )}
                </View>

                {/* ══════════════════════════════════════════════════════════
                    GAUGE TABS
                ══════════════════════════════════════════════════════════ */}
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.gaugeTabsScroll}
                  contentContainerStyle={styles.gaugeTabsContainer}
                >
                  {[
                    { id: 'body', emoji: '🫀', label: 'Body', color: '#EF4444' },
                    { id: 'state', emoji: '⚡', label: 'State', color: '#F59E0B' },
                    { id: 'emotion', emoji: '💜', label: 'Emotion', color: '#8B5CF6' },
                    { id: 'connection', emoji: '💙', label: 'Connection', color: '#3B82F6' },
                    { id: 'direction', emoji: '🧭', label: 'Direction', color: '#10B981' },
                    { id: 'alignment', emoji: '✨', label: 'Alignment', color: '#EC4899' },
                  ].map((tab) => (
                    <Pressable
                      key={tab.id}
                      style={[
                        styles.gaugeTab,
                        activeGaugeTab === tab.id && styles.gaugeTabActive,
                        activeGaugeTab === tab.id && { borderColor: tab.color },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        setActiveGaugeTab(tab.id);
                      }}
                    >
                      <Text style={styles.gaugeTabEmoji}>{tab.emoji}</Text>
                      <Text style={[
                        styles.gaugeTabLabel,
                        activeGaugeTab === tab.id && { color: tab.color },
                      ]}>{tab.label}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {/* ══════════════════════════════════════════════════════════
                    GAUGE CONTENT (based on active tab)
                ══════════════════════════════════════════════════════════ */}
                <View style={styles.gaugeContent}>
                  {/* 🫀 BODY */}
                  {activeGaugeTab === 'body' && (
                    <View style={styles.gaugePane}>
                      <Text style={styles.gaugePaneTitle}>🫀 Body</Text>
                      <Text style={styles.gaugePaneDesc}>How you care for your physical self</Text>
                      
                      <Text style={styles.fieldLabel}>Therapy Experience</Text>
                      <Text style={styles.fieldHint}>Helps calibrate how I talk about mental health</Text>
                      <View style={styles.chipRow}>
                        {THERAPY_OPTIONS.map((opt) => (
                          <Pressable
                            key={opt.value}
                            style={[styles.chip, therapyExp === opt.value && styles.chipSelected]}
                            onPress={() => setTherapyExp(opt.value)}
                          >
                            <Text style={[styles.chipText, therapyExp === opt.value && styles.chipTextSelected]}>
                              {opt.label}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* ⚡ STATE */}
                  {activeGaugeTab === 'state' && (
                    <View style={styles.gaugePane}>
                      <Text style={styles.gaugePaneTitle}>⚡ State</Text>
                      <Text style={styles.gaugePaneDesc}>Your nervous system & triggers</Text>
                      
                      <Text style={styles.fieldLabel}>Sensitive Topics</Text>
                      <Text style={styles.fieldHint}>What should I be gentle about?</Text>
                      <View style={styles.chipRow}>
                        {SENSITIVE_TOPIC_OPTIONS.map((opt) => {
                          const isSelected = sensitiveTopics.includes(opt.value);
                          return (
                            <Pressable
                              key={opt.value}
                              style={[styles.chip, isSelected && styles.chipSelected]}
                              onPress={() => {
                                if (isSelected) setSensitiveTopics(sensitiveTopics.filter((t) => t !== opt.value));
                                else setSensitiveTopics([...sensitiveTopics, opt.value]);
                              }}
                            >
                              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{opt.label}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {/* 💜 EMOTION */}
                  {activeGaugeTab === 'emotion' && (
                    <View style={styles.gaugePane}>
                      <Text style={styles.gaugePaneTitle}>💜 Emotion</Text>
                      <Text style={styles.gaugePaneDesc}>How you feel & process</Text>
                      
                      <Text style={styles.fieldLabel}>Love Language</Text>
                      <Text style={styles.fieldHint}>How do you feel most cared for?</Text>
                      <View style={styles.chipRow}>
                        {LOVE_LANGUAGE_OPTIONS.map((opt) => (
                          <Pressable
                            key={opt.value}
                            style={[styles.chip, loveLanguage === opt.value && styles.chipSelected]}
                            onPress={() => setLoveLanguage(opt.value)}
                          >
                            <Text style={[styles.chipText, loveLanguage === opt.value && styles.chipTextSelected]}>
                              {opt.label}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                      <Pressable onPress={() => Linking.openURL('https://5lovelanguages.com/quizzes/love-language')}>
                        <Text style={styles.quizLink}>Not sure? Take a 2-min quiz →</Text>
                      </Pressable>

                      <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Learning Style</Text>
                      <Text style={styles.fieldHint}>How do you process information?</Text>
                      <View style={styles.chipRow}>
                        {LEARNING_STYLE_OPTIONS.map((opt) => (
                          <Pressable
                            key={opt.value}
                            style={[styles.chip, learningStyle === opt.value && styles.chipSelected]}
                            onPress={() => setLearningStyle(opt.value)}
                          >
                            <Text style={[styles.chipText, learningStyle === opt.value && styles.chipTextSelected]}>
                              {opt.emoji} {opt.label}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                      <Pressable onPress={() => router.push('/(modals)/learning-style-quiz')}>
                        <Text style={styles.quizLink}>Not sure? Take the quick quiz →</Text>
                      </Pressable>
                    </View>
                  )}

                  {/* 💙 CONNECTION */}
                  {activeGaugeTab === 'connection' && (
                    <View style={styles.gaugePane}>
                      <Text style={styles.gaugePaneTitle}>💙 Connection</Text>
                      <Text style={styles.gaugePaneDesc}>Your relationships & roots</Text>
                      
                      <Text style={styles.fieldLabel}>Who Raised You</Text>
                      <Text style={styles.fieldHint}>Family dynamics shape how we relate</Text>
                      <View style={styles.chipRow}>
                        {UPBRINGING_OPTIONS.map((opt) => (
                          <Pressable
                            key={opt.value}
                            style={[styles.chip, upbringing === opt.value && styles.chipSelected]}
                            onPress={() => setUpbringing(opt.value)}
                          >
                            <Text style={[styles.chipText, upbringing === opt.value && styles.chipTextSelected]}>
                              {opt.label}
                            </Text>
                          </Pressable>
                        ))}
                      </View>

                      <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Cultural Background</Text>
                      <Text style={styles.fieldHint}>Culture shapes how you see the world</Text>
                      <View style={styles.chipRow}>
                        {CULTURAL_BACKGROUND_OPTIONS.slice(0, 8).map((opt) => {
                          const isSelected = culturalBackground.includes(opt);
                          return (
                            <Pressable
                              key={opt}
                              style={[styles.chip, isSelected && styles.chipSelected]}
                              onPress={() => {
                                if (isSelected) setCulturalBackground(culturalBackground.filter((c) => c !== opt));
                                else setCulturalBackground([...culturalBackground, opt]);
                              }}
                            >
                              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{opt}</Text>
                            </Pressable>
                          );
                        })}
                      </View>

                      <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Language You Think In</Text>
                      <Text style={styles.fieldHint}>The voice in your head — it shapes how you process emotions</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g., English, Spanish, Spanglish..."
                        placeholderTextColor={COLORS.textMuted}
                        value={thinkingLanguage}
                        onChangeText={setThinkingLanguage}
                      />
                    </View>
                  )}

                  {/* 🧭 DIRECTION */}
                  {activeGaugeTab === 'direction' && (
                    <View style={styles.gaugePane}>
                      <Text style={styles.gaugePaneTitle}>🧭 Direction</Text>
                      <Text style={styles.gaugePaneDesc}>Where you're headed in life</Text>
                      
                      <Text style={styles.fieldLabel}>Life Stage</Text>
                      <Text style={styles.fieldHint}>Helps me speak your language</Text>
                      <View style={styles.chipRow}>
                        {AGE_OPTIONS.map((opt) => (
                          <Pressable
                            key={opt.value}
                            style={[styles.chip, ageGroup === opt.value && styles.chipSelected]}
                            onPress={() => setAgeGroup(opt.value)}
                          >
                            <Text style={[styles.chipText, ageGroup === opt.value && styles.chipTextSelected]}>
                              {opt.label}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* ✨ ALIGNMENT */}
                  {activeGaugeTab === 'alignment' && (
                    <View style={styles.gaugePane}>
                      <Text style={styles.gaugePaneTitle}>✨ Alignment</Text>
                      <Text style={styles.gaugePaneDesc}>What matters to you</Text>
                      
                      <View style={styles.comingSoonCard}>
                        <Text style={styles.comingSoonEmoji}>🔮</Text>
                        <Text style={styles.comingSoonText}>Coming soon</Text>
                        <Text style={styles.comingSoonHint}>Gauge will learn your values as you talk</Text>
                      </View>
                    </View>
                  )}
                </View>

                <Text style={styles.settingsNote}>
                  Change anytime in Settings
                </Text>

                {/* Spacer for fixed footer */}
                <View style={{ height: 100 }} />
              </View>
            )}

            {/* ═══════════════════════════════════════════════════════════
                STEP 3: Our Promise + I'm Ready
            ═══════════════════════════════════════════════════════════ */}
            {step === 3 && (
              <View style={styles.step}>
                <Text style={styles.pageTitle}>Our Promise to You</Text>

                <View style={styles.promiseCard}>
                  <Text style={styles.promiseLine}>🔒 I'll never share what you tell me.</Text>
                  <Text style={styles.promiseLine}>💜 I'll never judge you.</Text>
                  <Text style={styles.promiseLine}>🤝 I'll always be here when you need me.</Text>
                  <Text style={[styles.promiseLine, styles.promiseHighlight]}>You are not alone.</Text>
                </View>

                <View style={styles.legalSection}>
                  <Text style={styles.legalText}>
                    InGauge is an emotional wellness tool, not a medical device. It does not diagnose, treat, or cure any mental health condition.
                  </Text>
                  <Text style={styles.legalText}>
                    If you are in crisis, please contact <Text style={styles.legalBold}>988</Text> (Suicide & Crisis Lifeline), text HOME to <Text style={styles.legalBold}>741741</Text>, or call <Text style={styles.legalBold}>911</Text>.
                  </Text>
                  <Text style={styles.legalText}>
                    By using this app, you agree to our{' '}
                    <Text style={styles.legalLink} onPress={() => Linking.openURL('https://alln1network.com/terms')}>Terms of Service</Text>
                    {' '}and{' '}
                    <Text style={styles.legalLink} onPress={() => Linking.openURL('https://alln1network.com/privacy')}>Privacy Policy</Text>.
                  </Text>
                  <Text style={styles.legalText}>
                    Your data is encrypted and only you can access it. We never sell individual data. Export or delete anytime from Settings.
                  </Text>
                </View>

                <Pressable style={styles.primaryBtn} onPress={goNext}>
                  <Text style={styles.primaryBtnText}>I'm Ready</Text>
                </Pressable>
              </View>
            )}

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Footer - Continue Button (visible on step 2) */}
      {step === 2 && (
        <View style={[styles.fixedFooter, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable 
            style={[styles.fixedBtn, !canProceed() && styles.fixedBtnDisabled]} 
            onPress={goNext}
            disabled={!canProceed()}
          >
            <Text style={styles.fixedBtnText}>Continue</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { minWidth: 50, paddingVertical: 8, paddingHorizontal: 4 },
  skipBtn: { minWidth: 50, alignItems: 'flex-end', paddingVertical: 8, paddingHorizontal: 4 },
  skipBtnText: { fontSize: 15, color: COLORS.accent, fontWeight: '600' },
  // Progress indicator (Mobilize style)
  progressRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  progressStepCompleted: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  progressStepCurrent: {
    backgroundColor: 'transparent',
    borderColor: COLORS.accent,
  },
  progressStepUpcoming: {
    backgroundColor: 'transparent',
    borderColor: COLORS.textMuted + '40',
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressStepTextCurrent: {
    color: COLORS.accent,
  },
  progressStepTextUpcoming: {
    color: COLORS.textMuted,
  },
  progressLine: {
    width: 32,
    height: 2,
    marginHorizontal: 4,
  },
  progressLineCompleted: {
    backgroundColor: COLORS.accent,
  },
  progressLineUpcoming: {
    backgroundColor: COLORS.textMuted + '40',
  },
  
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  step: { paddingTop: 8 },

  // Step 1 - Hero
  heroTitle: { fontSize: 32, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  heroTagline: { fontSize: 17, color: COLORS.textSecondary, marginBottom: 24, lineHeight: 24 },
  
  introCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  introCardTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  introCardText: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },
  
  gaugesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  gaugeItem: { alignItems: 'center', width: 80 },
  gaugeIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  gaugeEmoji: { fontSize: 24 },
  gaugeLabel: { fontSize: 12, fontWeight: '600' },
  
  introText: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 26, marginBottom: 24 },
  introTextBold: { color: COLORS.text, fontWeight: '600' },
  
  featuresList: { gap: 12, marginBottom: 32 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureText: { fontSize: 15, color: COLORS.text, flex: 1 },

  // Step 2 - Profile
  pageTitle: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  pageSubtitle: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 24 },
  
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionEmoji: { fontSize: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  optionalBadge: { fontSize: 11, color: COLORS.textMuted, backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  sectionContent: { paddingHorizontal: 16, paddingBottom: 16 },
  
  fieldLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8, marginTop: 8 },
  fieldHint: { fontSize: 13, color: COLORS.textMuted, marginBottom: 12 },
  
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
  },
  
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  chipSelected: { backgroundColor: COLORS.accent },
  chipText: { fontSize: 14, color: COLORS.textMuted },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
  
  quizLink: { fontSize: 14, color: COLORS.accent, marginTop: 8 },
  settingsNote: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginTop: 24, marginBottom: 8 },

  // Basic Info Card
  basicInfoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  basicInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  basicInfoAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  basicInfoInitial: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  basicInfoFields: {
    flex: 1,
  },
  basicNameInput: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  basicInfoMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  metaPillText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  dropdownContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  // Gauge Tabs
  gaugeTabsScroll: {
    marginBottom: 16,
    marginHorizontal: -20,
  },
  gaugeTabsContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  gaugeTab: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  gaugeTabActive: {
    backgroundColor: COLORS.background,
  },
  gaugeTabEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  gaugeTabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  // Gauge Content
  gaugeContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    minHeight: 280,
  },
  gaugePane: {},
  gaugePaneTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  gaugePaneDesc: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 20,
  },

  // Coming Soon
  comingSoonCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  comingSoonEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  comingSoonHint: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Gauge Categories
  gaugeDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  gaugeDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  gaugeDividerText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gaugeCategory: {
    marginBottom: 8,
  },
  gaugeCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    marginLeft: 4,
  },
  gaugeCategoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeCategoryEmoji: {
    fontSize: 16,
  },
  gaugeCategoryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Step 3 - Promise
  promiseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  promiseLine: { fontSize: 17, color: COLORS.text, lineHeight: 32 },
  promiseHighlight: { fontSize: 20, fontWeight: '700', color: COLORS.accent, marginTop: 12 },
  
  legalSection: { marginBottom: 24 },
  legalText: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20, marginBottom: 12 },
  legalBold: { fontWeight: '600', color: COLORS.text },
  legalLink: { color: COLORS.accent, textDecorationLine: 'underline' },

  // Buttons
  primaryBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalEmoji: { fontSize: 48, marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: 8 },
  modalSub: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  modalPrimaryBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalPrimaryBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  modalSecondaryBtn: { paddingVertical: 12 },
  modalSecondaryBtnText: { fontSize: 15, color: COLORS.textMuted },

  // Fixed Footer
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  fixedBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  fixedBtnDisabled: { opacity: 0.5 },
  fixedBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
