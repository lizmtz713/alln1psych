/**
 * Friend Survey Card
 * 
 * Allows users to send a survey to a friend to learn their preferences.
 * Shown on the Light profile when friend hasn't filled out survey yet.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../lib/constants';
import {
  createFriendSurvey,
  getSurveyResponseForLight,
  generateShareMessage,
  type SurveyResponse,
} from '../../services/friendSurvey';
import { useUserStore } from '../../stores/userStore';

interface FriendSurveyCardProps {
  lightId: string;
  friendName: string;
  onResponseReceived?: (response: SurveyResponse) => void;
}

type CardState = 'idle' | 'loading' | 'ready' | 'completed';

export function FriendSurveyCard({
  lightId,
  friendName,
  onResponseReceived,
}: FriendSurveyCardProps) {
  const [state, setState] = useState<CardState>('idle');
  const [surveyUrl, setSurveyUrl] = useState<string | null>(null);
  const [response, setResponse] = useState<SurveyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const userName = useUserStore((s) => s.name) || 'Your friend';

  // Check if survey already completed
  useEffect(() => {
    checkExistingResponse();
  }, [lightId]);

  const checkExistingResponse = async () => {
    const existing = await getSurveyResponseForLight(lightId);
    if (existing) {
      setResponse(existing);
      setState('completed');
      onResponseReceived?.(existing);
    }
  };

  const handleCreateSurvey = async () => {
    setState('loading');
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = await createFriendSurvey({
      lightId,
      friendName,
      senderName: userName,
    });

    if (result.success && result.url) {
      setSurveyUrl(result.url);
      setState('ready');
    } else {
      setError(result.error || 'Failed to create survey');
      setState('idle');
    }
  };

  const handleShare = async () => {
    if (!surveyUrl) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const message = generateShareMessage(friendName, surveyUrl);

    try {
      await Share.share({
        message,
        title: `Help me be a better friend, ${friendName}!`,
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const handleCopyLink = async () => {
    if (!surveyUrl) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(surveyUrl);
    Alert.alert('Copied!', 'Survey link copied to clipboard');
  };

  // ── Already completed ──
  if (state === 'completed' && response) {
    return (
      <View style={[styles.card, styles.cardCompleted]}>
        <View style={styles.headerRow}>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
          <Text style={styles.title}>{friendName} shared their preferences!</Text>
        </View>
        <View style={styles.responsePreview}>
          {response.loveLanguage && (
            <Text style={styles.responseItem}>
              💜 Love language: {mapLoveLanguage(response.loveLanguage)}
            </Text>
          )}
          {response.commPreference && (
            <Text style={styles.responseItem}>
              💬 Prefers: {mapCommPreference(response.commPreference)}
            </Text>
          )}
          {response.supportStyle && (
            <Text style={styles.responseItem}>
              🤝 When struggling: {mapSupportStyle(response.supportStyle)}
            </Text>
          )}
        </View>
        <Text style={styles.hint}>
          These preferences are now saved to {friendName}'s profile
        </Text>
      </View>
    );
  }

  // ── Survey ready to share ──
  if (state === 'ready' && surveyUrl) {
    return (
      <View style={[styles.card, styles.cardReady]}>
        <View style={styles.headerRow}>
          <Ionicons name="link" size={24} color={COLORS.accent} />
          <Text style={styles.title}>Survey link ready!</Text>
        </View>
        <Text style={styles.subtitle}>
          Send this to {friendName} so they can share their preferences with you.
        </Text>
        <View style={styles.urlBox}>
          <Text style={styles.urlText} numberOfLines={1}>
            {surveyUrl}
          </Text>
        </View>
        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={20} color="#FFF" />
            <Text style={styles.buttonPrimaryText}>Share</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleCopyLink}
          >
            <Ionicons name="copy-outline" size={20} color={COLORS.accent} />
            <Text style={styles.buttonSecondaryText}>Copy</Text>
          </Pressable>
        </View>
        <Text style={styles.hint}>
          They don't need the app — it's a simple web form
        </Text>
      </View>
    );
  }

  // ── Loading ──
  if (state === 'loading') {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="small" color={COLORS.accent} />
        <Text style={styles.loadingText}>Creating survey link...</Text>
      </View>
    );
  }

  // ── Idle - prompt to create survey ──
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.emoji}>📋</Text>
        <Text style={styles.title}>Get to know {friendName} better</Text>
      </View>
      <Text style={styles.subtitle}>
        Send a quick survey to learn their love language, communication style,
        and how they like to be supported. They don't need to download anything!
      </Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable
        style={[styles.button, styles.buttonPrimary, styles.buttonFull]}
        onPress={handleCreateSurvey}
      >
        <Ionicons name="paper-plane-outline" size={20} color="#FFF" />
        <Text style={styles.buttonPrimaryText}>
          Create survey for {friendName}
        </Text>
      </Pressable>
      <Text style={styles.hint}>Takes 2 min for them to fill out</Text>
    </View>
  );
}

// ── Helpers ──

function mapLoveLanguage(value: string): string {
  const map: Record<string, string> = {
    words: 'Words of Affirmation',
    time: 'Quality Time',
    help: 'Acts of Service',
    gifts: 'Receiving Gifts',
    touch: 'Physical Touch',
  };
  return map[value] || value;
}

function mapCommPreference(value: string): string {
  const map: Record<string, string> = {
    texts: 'Texts',
    calls: 'Calls',
    in_person: 'In person',
    group: 'Group settings',
    mix: 'Mix of everything',
  };
  return map[value] || value;
}

function mapSupportStyle(value: string): string {
  const map: Record<string, string> = {
    listen: 'Just listen',
    distract: 'Distract me',
    problem_solve: 'Problem solve with me',
    check_in: 'Check in regularly',
    give_space: 'Give me space',
  };
  return map[value] || value;
}

// ── Styles ──

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardReady: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentBg,
  },
  cardCompleted: {
    borderColor: COLORS.success,
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: SPACING.sm,
  },
  emoji: {
    fontSize: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  urlBox: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.input,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  urlText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: BORDER_RADIUS.button,
    flex: 1,
  },
  buttonFull: {
    marginTop: SPACING.sm,
  },
  buttonPrimary: {
    backgroundColor: COLORS.accent,
  },
  buttonPrimaryText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  buttonSecondaryText: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  error: {
    fontSize: 13,
    color: COLORS.error,
    marginBottom: SPACING.sm,
  },
  responsePreview: {
    marginBottom: SPACING.md,
  },
  responseItem: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 6,
  },
});
