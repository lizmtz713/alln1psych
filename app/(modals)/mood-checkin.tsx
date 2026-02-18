/**
 * Mood Check-in — Quick temperature update
 * Premium UI
 */
import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Linking,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../src/lib/constants';
import { useCircleStore, type Temperature } from '../../src/stores/circleStore';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SIZE = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md) / 2;

const OPTIONS: { temp: Temperature; emoji: string; label: string; subtext: string }[] = [
  { temp: 'green', emoji: '😊', label: "I'm good", subtext: 'Feeling positive' },
  { temp: 'yellow', emoji: '😐', label: 'Meh', subtext: 'Could be better' },
  { temp: 'orange', emoji: '😟', label: 'Rough', subtext: 'Having a hard time' },
  { temp: 'red', emoji: '😢', label: 'Struggling', subtext: 'Really need support' },
];

const AFFIRMATIONS: Record<Temperature, { text: string; emoji: string }> = {
  green: { text: "Glad to hear it! Keep riding that wave.", emoji: '💚' },
  yellow: { text: "Thanks for checking in. I'm here if you need me.", emoji: '💛' },
  orange: { text: "I hear you. You don't have to go through this alone.", emoji: '🧡' },
  red: { text: "Thank you for being honest. You are not alone.", emoji: '❤️' },
};

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, delay, useNativeDriver: true, damping: 15 }),
    ]).start();
  }, []);
  
  return (
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      {children}
    </Animated.View>
  );
}

export default function MoodCheckinScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addMoodCheckin = useCircleStore((s) => s.addMoodCheckin);
  const [selected, setSelected] = useState<Temperature | null>(null);
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [saved, setSaved] = useState(false);
  const affirmationOpacity = useRef(new Animated.Value(0)).current;
  const affirmationScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (saved) {
      Animated.parallel([
        Animated.timing(affirmationOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(affirmationScale, { toValue: 1, useNativeDriver: true, damping: 12 }),
      ]).start();
    }
  }, [saved]);

  const handleSave = () => {
    if (!selected) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addMoodCheckin(selected, note.trim() || undefined);
    setSaved(true);
  };

  const handleCardPress = (temp: Temperature) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected(temp);
  };

  // Success/Confirmation Screen
  if (saved && selected) {
    const affirmation = AFFIRMATIONS[selected];
    return (
      <ErrorBoundary>
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.successContent}>
            <Animated.View style={[styles.successCard, { opacity: affirmationOpacity, transform: [{ scale: affirmationScale }] }]}>
              <Text style={styles.successEmoji}>{affirmation.emoji}</Text>
              <Text style={styles.successText}>{affirmation.text}</Text>
            </Animated.View>
            
            {selected === 'red' && (
              <Animated.View style={[styles.crisisCard, { opacity: affirmationOpacity }]}>
                <View style={styles.crisisHeader}>
                  <Ionicons name="heart" size={20} color={COLORS.error} />
                  <Text style={styles.crisisTitle}>If you need to talk to someone:</Text>
                </View>
                <Pressable 
                  style={({ pressed }) => [styles.crisisLink, pressed && styles.pressed]}
                  onPress={() => Linking.openURL('tel:988')}
                >
                  <Ionicons name="call" size={18} color={COLORS.text} />
                  <View>
                    <Text style={styles.crisisLinkTitle}>988 Suicide & Crisis Lifeline</Text>
                    <Text style={styles.crisisLinkSub}>Call or text, 24/7</Text>
                  </View>
                </Pressable>
                <Pressable 
                  style={({ pressed }) => [styles.crisisLink, pressed && styles.pressed]}
                  onPress={() => Linking.openURL('sms:741741?body=HOME')}
                >
                  <Ionicons name="chatbubble" size={18} color={COLORS.text} />
                  <View>
                    <Text style={styles.crisisLinkTitle}>Crisis Text Line</Text>
                    <Text style={styles.crisisLinkSub}>Text HOME to 741741</Text>
                  </View>
                </Pressable>
              </Animated.View>
            )}
          </View>
          
          <Pressable 
            style={({ pressed }) => [styles.doneButton, pressed && styles.doneButtonPressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </View>
      </ErrorBoundary>
    );
  }

  // Selection Screen
  return (
    <ErrorBoundary>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACING.xl, paddingBottom: insets.bottom + SPACING.xxl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <AnimatedSection delay={0}>
          <View style={styles.header}>
            <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
          <Text style={styles.title}>How are you feeling?</Text>
          <Text style={styles.subtitle}>Be honest. This is just for you.</Text>
        </AnimatedSection>

        {/* Mood Grid */}
        <AnimatedSection delay={100}>
          <View style={styles.grid}>
            {OPTIONS.map((opt, index) => {
              const isSelected = selected === opt.temp;
              const tempColor = COLORS.temperature[opt.temp];
              return (
                <Pressable
                  key={opt.temp}
                  style={({ pressed }) => [
                    styles.card,
                    { borderColor: isSelected ? tempColor : COLORS.border },
                    isSelected && { backgroundColor: tempColor + '15', borderWidth: 2 },
                    pressed && styles.cardPressed,
                  ]}
                  onPress={() => handleCardPress(opt.temp)}
                >
                  <Text style={styles.emoji}>{opt.emoji}</Text>
                  <Text style={[styles.cardLabel, isSelected && { color: tempColor }]}>{opt.label}</Text>
                  <Text style={styles.cardSubtext}>{opt.subtext}</Text>
                  {isSelected && (
                    <View style={[styles.checkmark, { backgroundColor: tempColor }]}>
                      <Ionicons name="checkmark" size={14} color="#FFF" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </AnimatedSection>

        {/* Note Toggle */}
        <AnimatedSection delay={200}>
          <Pressable 
            style={({ pressed }) => [styles.noteToggle, pressed && styles.pressed]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowNote(!showNote);
            }}
          >
            <Ionicons name={showNote ? 'chevron-up' : 'add-circle-outline'} size={20} color={COLORS.accent} />
            <Text style={styles.noteToggleText}>{showNote ? 'Hide note' : 'Add a note'}</Text>
          </Pressable>
          
          {showNote && (
            <TextInput
              style={styles.input}
              placeholder="What's on your mind?"
              placeholderTextColor={COLORS.textMuted}
              value={note}
              onChangeText={setNote}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
          )}
        </AnimatedSection>

        {/* Save Button */}
        <AnimatedSection delay={300}>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              !selected && styles.saveButtonDisabled,
              pressed && selected && styles.saveButtonPressed,
            ]}
            onPress={handleSave}
            disabled={!selected}
          >
            <Text style={[styles.saveButtonText, !selected && styles.saveButtonTextDisabled]}>
              Save
            </Text>
          </Pressable>
        </AnimatedSection>
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: SPACING.lg,
  },
  cancelBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  cancelText: {
    ...TYPOGRAPHY.labelLg,
    color: COLORS.accent,
  },
  title: {
    ...TYPOGRAPHY.displayMd,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  
  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  card: {
    width: CARD_SIZE,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    position: 'relative',
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
  },
  emoji: {
    fontSize: 36,
    marginBottom: SPACING.sm,
  },
  cardLabel: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.text,
    marginBottom: 2,
  },
  cardSubtext: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
  },
  checkmark: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Note
  noteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  noteToggleText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.accent,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  pressed: {
    opacity: 0.8,
  },
  
  // Save Button
  saveButton: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveButtonPressed: {
    opacity: 0.9,
  },
  saveButtonText: {
    ...TYPOGRAPHY.labelLg,
    color: '#FFF',
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: COLORS.textMuted,
  },
  
  // Success Screen
  successContent: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  successCard: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  successText: {
    ...TYPOGRAPHY.headlineLg,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 28,
  },
  
  // Crisis Card
  crisisCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.error + '40',
  },
  crisisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  crisisTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.text,
  },
  crisisLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  crisisLinkTitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
  },
  crisisLinkSub: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
  },
  
  // Done Button
  doneButton: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    margin: SPACING.lg,
    alignItems: 'center',
  },
  doneButtonPressed: {
    opacity: 0.9,
  },
  doneButtonText: {
    ...TYPOGRAPHY.labelLg,
    color: '#FFF',
    fontWeight: '600',
  },
});
