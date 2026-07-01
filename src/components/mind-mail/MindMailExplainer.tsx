/**
 * Mind Mail Explainer — onboarding modal for first visit to Mind Mail
 * 4 pages: Welcome, Three Ways to Send, It's Not About Being Perfect, Your Mind Inbox
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../../lib/constants';

const MIND_MAIL_ONBOARDING_KEY = 'hasSeenMindMailOnboarding';

export async function getHasSeenMindMailOnboarding(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(MIND_MAIL_ONBOARDING_KEY);
    return v === 'true';
  } catch {
    return false;
  }
}

export async function setHasSeenMindMailOnboarding(): Promise<void> {
  try {
    await AsyncStorage.setItem(MIND_MAIL_ONBOARDING_KEY, 'true');
  } catch {}
}

const PAGES = [
  {
    title: 'Welcome to Mind Mail',
    body: 'A new kind of inbox—for the things that matter most.',
  },
  {
    title: 'Three Ways to Send',
    body: null,
    bullets: [
      { label: 'Open', sub: 'They see who sent it' },
      { label: 'Anonymous', sub: 'They know it\'s from their Circle, but not who' },
      { label: 'Soft Share', sub: 'They choose when to read it; you\'re revealed when they accept' },
    ],
  },
  {
    title: 'It\'s Not About Being Perfect',
    body: "Stuck on what to say? Our AI can help you find the words—or just hold space while you get it off your chest.",
  },
  {
    title: 'Your Mind Inbox',
    body: 'Messages from your Circle land here. Read them when you\'re ready.',
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function MindMailExplainer({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) {
  const [page, setPage] = useState(0);
  const isLast = page === PAGES.length - 1;

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLast) {
      setHasSeenMindMailOnboarding();
      onDismiss();
    } else {
      setPage((p) => p + 1);
    }
  };

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHasSeenMindMailOnboarding();
    onDismiss();
  };

  if (!visible) return null;

  const p = PAGES[page];
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{p.title}</Text>
          {p.body != null && <Text style={styles.body}>{p.body}</Text>}
          {p.bullets != null && (
            <View style={styles.bulletList}>
              {p.bullets.map((b, i) => (
                <View key={i} style={styles.bullet}>
                  <Text style={styles.bulletLabel}>{b.label}</Text>
                  <Text style={styles.bulletSub}>{b.sub}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={styles.dots}>
            {PAGES.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === page && styles.dotActive]}
              />
            ))}
          </View>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>{isLast ? 'Get Started' : 'Next'}</Text>
          </Pressable>
          {page > 0 && (
            <Pressable style={styles.skip} onPress={handleDismiss}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  bulletList: { marginBottom: 24 },
  bullet: { marginBottom: 14 },
  bulletLabel: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  bulletSub: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textMuted,
  },
  dotActive: { backgroundColor: COLORS.accent },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.button ?? 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonPressed: { opacity: 0.9 },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  skip: { marginTop: 12, alignItems: 'center' },
  skipText: { fontSize: 14, color: COLORS.textMuted },
});
