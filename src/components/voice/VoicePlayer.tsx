/**
 * VoicePlayer — Play a voice note. Optional Glimpse mode (play once, then dissolve).
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../../lib/constants';

export interface VoicePlayerProps {
  uri: string;
  durationSec: number;
  transcript?: string;
  showTranscript?: boolean;

  /** Glimpse mode: plays once, then done */
  isGlimpse?: boolean;
  onGlimpsePlayed?: () => void;

  compact?: boolean;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VoicePlayer({
  uri,
  durationSec,
  transcript,
  showTranscript = false,
  isGlimpse = false,
  onGlimpsePlayed,
  compact = false,
}: VoicePlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Notify parent when glimpse has been played (once)
  useEffect(() => {
    if (isGlimpse && hasPlayed) {
      onGlimpsePlayed?.();
    }
  }, [isGlimpse, hasPlayed, onGlimpsePlayed]);

  // Load sound from uri
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const { sound: s } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: false },
          (status) => {
            if (!mounted || !status.isLoaded) return;
            setPosition(status.positionMillis / 1000);
            setIsPlaying(status.isPlaying ?? false);
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPosition(0);
              if (isGlimpse) setHasPlayed(true);
            }
          }
        );
        if (mounted) {
          soundRef.current = s;
          setSound(s);
        } else {
          s.unloadAsync().catch(() => {});
        }
      } catch (_) {
        if (mounted) setSound(null);
      }
    };

    load();

    return () => {
      mounted = false;
      const current = soundRef.current;
      soundRef.current = null;
      setSound(null);
      current?.unloadAsync().catch(() => {});
    };
  }, [uri, isGlimpse]);

  const togglePlay = useCallback(async () => {
    const s = soundRef.current ?? sound;
    if (!s) return;
    if (isGlimpse && hasPlayed) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isPlaying) {
      await s.pauseAsync();
    } else {
      const status = await s.getStatusAsync();
      if (status.isLoaded && status.durationMillis != null && status.positionMillis >= status.durationMillis - 200) {
        await s.setPositionAsync(0);
      }
      await s.playAsync();
    }
  }, [sound, isPlaying, isGlimpse, hasPlayed]);

  const progress = durationSec > 0 ? Math.min(1, position / durationSec) : 0;

  if (isGlimpse && hasPlayed) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <Text style={styles.dissolvedText}>💨 Voice note dissolved</Text>
      </View>
    );
  }

  const playButton = (
    <Pressable
      onPress={togglePlay}
      style={({ pressed }) => [styles.playButton, pressed && styles.playButtonPressed]}
    >
      <Ionicons
        name={isPlaying ? 'pause' : 'play'}
        size={compact ? 20 : 28}
        color="#fff"
      />
    </Pressable>
  );

  const progressBlock = (
    <View style={[styles.progressContainer, compact && styles.progressContainerCompact]}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.timeText}>
        {formatTime(position)} / {formatTime(durationSec)}
      </Text>
      {isGlimpse && !hasPlayed && (
        <Text style={styles.glimpseWarning}>Plays once</Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {compact ? (
        <>
          {playButton}
          {progressBlock}
        </>
      ) : (
        <>
          {playButton}
          {progressBlock}
        </>
      )}
      {showTranscript && transcript ? (
        <Text style={styles.transcript}>{transcript}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  containerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonPressed: { opacity: 0.9 },
  progressContainer: {
    marginTop: SPACING.sm,
  },
  progressContainerCompact: {
    flex: 1,
    marginLeft: SPACING.md,
    marginTop: 0,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  glimpseWarning: {
    fontSize: 11,
    color: COLORS.accent,
    fontStyle: 'italic',
    marginTop: 4,
  },
  dissolvedText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    padding: SPACING.md,
  },
  transcript: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    lineHeight: 20,
  },
});
