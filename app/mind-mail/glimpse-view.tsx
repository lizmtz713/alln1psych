/**
 * GlimpseViewScreen — View a disappearing Mind Mail
 * Timer → Message → Dissolve → Done
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMindMailStore } from '../../src/stores/mindMailStore';
import { VoicePlayer } from '../../src/components/voice';
import { COLORS } from '../../src/lib/constants';

const GLIMPSE_ACCENT = '#E07C7C'; // Warm coral for Glimpse (view-once)

type Phase = 'ready' | 'viewing' | 'dissolved';

export default function GlimpseViewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mailId } = useLocalSearchParams<{ mailId: string }>();

  const { inbox, markGlimpseViewed } = useMindMailStore();
  const mail = inbox.find((m) => m.id === mailId);

  const [phase, setPhase] = useState<Phase>('ready');
  const [timeRemaining, setTimeRemaining] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const blurAnim = useRef(new Animated.Value(0)).current;
  const timerProgress = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const duration = mail?.glimpseViewSeconds ?? 15;

  // Redirect if mail not found or already viewed
  useEffect(() => {
    if (!mail) {
      router.back();
      return;
    }
    if (mail.glimpseViewedAt) {
      setPhase('dissolved');
    } else {
      setTimeRemaining(duration);
    }
  }, [mail, duration]);

  // Screenshot deterrent: dim when app goes to background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appStateRef.current === 'active' && nextState.match(/inactive|background/)) {
        if (phase === 'viewing') {
          Animated.timing(blurAnim, { toValue: 1, duration: 100, useNativeDriver: true }).start();
        }
      } else if (nextState === 'active') {
        Animated.timing(blurAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      }
      appStateRef.current = nextState;
    });
    return () => sub?.remove();
  }, [phase, blurAnim]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleDissolve = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPhase('dissolved');
    Animated.timing(fadeAnim, { toValue: 0, duration: 800, useNativeDriver: true }).start();
    if (mail) {
      markGlimpseViewed(mail.id);
    }
  }, [mail, fadeAnim, markGlimpseViewed]);

  const handleReveal = useCallback(() => {
    if (!mail) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase('viewing');
    if (mail.hasVoice) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      return;
    }
    setTimeRemaining(duration);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.timing(timerProgress, {
      toValue: 0,
      duration: duration * 1000,
      useNativeDriver: false,
    }).start();
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleDissolve();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [mail, duration, fadeAnim, timerProgress, handleDissolve]);

  const handleClose = () => {
    if (phase === 'viewing') {
      handleDissolve();
    }
    router.back();
  };

  if (!mail) return null;

  const senderLabel = mail.isAnonymous ? 'Someone' : (mail.senderName || 'Someone');

  // READY PHASE
  if (phase === 'ready') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable style={styles.closeBtn} onPress={handleClose}>
          <Ionicons name="close" size={28} color={COLORS.text} />
        </Pressable>
        <View style={styles.center}>
          <Text style={styles.emoji}>✨</Text>
          <Text style={styles.title}>{senderLabel} sent you a Glimpse</Text>
          <Text style={styles.subtitle}>
            {mail.hasVoice
              ? 'This voice message will play once, then disappear.\nYou can\'t replay or screenshot it.'
              : `This message will disappear after ${duration} seconds.\nYou can only view it once.`}
          </Text>
          <Pressable style={styles.revealBtn} onPress={handleReveal}>
            <Text style={styles.revealBtnText}>
              {mail.hasVoice ? 'Play voice message' : 'Reveal Message'}
            </Text>
          </Pressable>
          <Text style={styles.hint}>Screenshots are discouraged.</Text>
        </View>
      </View>
    );
  }

  // VIEWING PHASE — Voice Glimpse (play once, then dissolve)
  if (phase === 'viewing' && mail.hasVoice && mail.voiceUri) {
    const dimOpacity = blurAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.1],
    });
    return (
      <Animated.View style={[styles.container, { paddingTop: insets.top, opacity: dimOpacity }]}>
        <Pressable style={styles.closeBtn} onPress={handleClose}>
          <Ionicons name="close" size={28} color={COLORS.text} />
        </Pressable>
        <Animated.View style={[styles.center, { opacity: fadeAnim }]}>
          <Text style={styles.senderLabel}>
            {mail.isAnonymous ? 'Someone wants you to hear...' : `From ${senderLabel}`}
          </Text>
          <Text style={styles.dissolveHint}>This voice message will play once, then dissolve.</Text>
          <View style={styles.voiceGlimpsePlayer}>
            <VoicePlayer
              uri={mail.voiceUri}
              durationSec={mail.voiceDurationSec ?? 0}
              isGlimpse
              onGlimpsePlayed={() => {
                markGlimpseViewed(mail.id);
                setPhase('dissolved');
              }}
            />
          </View>
        </Animated.View>
      </Animated.View>
    );
  }

  // VIEWING PHASE — Text Glimpse (timer)
  if (phase === 'viewing') {
    const progressWidth = timerProgress.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });
    const dimOpacity = blurAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.1],
    });
    return (
      <Animated.View style={[styles.container, { paddingTop: insets.top, opacity: dimOpacity }]}>
        <Pressable style={styles.closeBtn} onPress={handleClose}>
          <Ionicons name="close" size={28} color={COLORS.text} />
        </Pressable>

        <View style={styles.timerBar}>
          <Animated.View style={[styles.timerFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.timerText}>{timeRemaining}s</Text>

        <Animated.View style={[styles.center, { opacity: fadeAnim }]}>
          <Text style={styles.senderLabel}>
            {mail.isAnonymous ? 'Someone wants you to know...' : `From ${senderLabel}`}
          </Text>
          <Text style={styles.messageText} selectable={false}>
            {mail.content}
          </Text>
        </Animated.View>

        <Text style={styles.dissolveHint}>Message will dissolve when timer ends.</Text>
      </Animated.View>
    );
  }

  // DISSOLVED PHASE
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.center}>
        <Text style={styles.emoji}>💨</Text>
        <Text style={styles.title}>This Glimpse has dissolved</Text>
        <Text style={styles.subtitle}>
          The message is gone.{'\n'}Take a moment to sit with whatever you felt.
        </Text>
        <Pressable style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
        {!mail.isAnonymous && (
          <Pressable
            style={styles.replyBtn}
            onPress={() =>
              router.push({
                pathname: '/mind-mail/compose',
                params: {
                  recipientId: mail.senderId,
                  recipientName: mail.senderName || 'Someone',
                },
              })
            }
          >
            <Text style={styles.replyBtnText}>Reply</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  closeBtn: { position: 'absolute', top: 60, right: 20, zIndex: 10, padding: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emoji: { fontSize: 64, marginBottom: 24 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  revealBtn: {
    backgroundColor: GLIMPSE_ACCENT,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    marginBottom: 24,
  },
  revealBtnText: { fontSize: 18, fontWeight: '600', color: '#FFF' },
  hint: { fontSize: 13, color: COLORS.textMuted, fontStyle: 'italic' },
  timerBar: {
    height: 4,
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  timerFill: { height: '100%', backgroundColor: GLIMPSE_ACCENT },
  timerText: { textAlign: 'center', fontSize: 14, color: COLORS.textMuted, marginTop: 8 },
  senderLabel: { fontSize: 14, color: COLORS.textMuted, marginBottom: 16 },
  messageText: {
    fontSize: 22,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 32,
  },
  dissolveHint: {
    textAlign: 'center',
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 40,
    fontStyle: 'italic',
  },
  voiceGlimpsePlayer: {
    width: '100%',
    maxWidth: 320,
    marginTop: 24,
  },
  doneBtn: {
    backgroundColor: GLIMPSE_ACCENT,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 24,
    marginBottom: 16,
  },
  doneBtnText: { fontSize: 18, fontWeight: '600', color: '#FFF' },
  replyBtn: { paddingHorizontal: 48, paddingVertical: 16 },
  replyBtnText: { fontSize: 16, color: COLORS.textMuted },
});
