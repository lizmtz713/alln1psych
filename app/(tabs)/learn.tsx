import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, PanResponder } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useUserStore } from '../../src/stores/userStore';
import {
  useEducationStore,
  userAgeToContentAge,
} from '../../src/stores/educationStore';
import { MODULES, getModuleByLessonId } from '../../src/data/educationContent';
import {
  type Discovery,
  getDiscoveriesForDay,
  getMoreDiscoveries,
  getCategoryTag,
} from '../../src/data/discoveries';

function firstLine(content: string, maxLen: number = 100): string {
  const trimmed = content.trim();
  if (trimmed.length <= maxLen) return trimmed;
  const slice = trimmed.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(' ');
  return (lastSpace > maxLen * 0.6 ? slice.slice(0, lastSpace) : slice) + '…';
}

function DiscoveryCard({
  discovery,
  expanded,
  onToggleExpand,
  onDismiss,
}: {
  discovery: Discovery;
  expanded: boolean;
  onToggleExpand: () => void;
  onDismiss: () => void;
}) {
  const translateX = useState(() => new Animated.Value(0))[0];
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
        onPanResponderMove: (_, g) => {
          if (g.dx < 0) translateX.setValue(g.dx);
        },
        onPanResponderRelease: (_, g) => {
          if (g.dx < -80 || g.vx < -0.3) {
            Animated.timing(translateX, {
              toValue: -400,
              duration: 200,
              useNativeDriver: true,
            }).start(() => onDismiss());
          } else {
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true, damping: 20 }).start();
          }
        },
      }),
    [translateX, onDismiss]
  );

  return (
    <Animated.View
      style={[styles.discoveryCardWrap, { transform: [{ translateX }] }]}
      {...panResponder.panHandlers}
    >
      <Pressable style={styles.discoveryCard} onPress={onToggleExpand}>
        <Text style={styles.discoveryCategoryTag}>{getCategoryTag(discovery.category)}</Text>
        <Text style={styles.discoveryEmoji}>{discovery.emoji}</Text>
        <Text style={styles.discoveryTitle}>{discovery.title}</Text>
        <Text style={styles.discoveryContent} numberOfLines={expanded ? undefined : 2}>
          {expanded ? discovery.content : firstLine(discovery.content)}
        </Text>
        {!expanded && (
          <Text style={styles.discoveryTapHint}>Tap to read more</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const ageGroup = useUserStore((s) => s.ageGroup);
  const contentAge = userAgeToContentAge(ageGroup);
  const { getNextLesson, getModuleProgress, isLessonCompleted } = useEducationStore();

  const nextLesson = getNextLesson(contentAge);
  const nextModule = nextLesson ? getModuleByLessonId(nextLesson.id) : null;
  const recommendedModules = MODULES.filter((m) => m.recommendedFor.includes(contentAge));
  const progressAnims = useRef<Record<string, Animated.Value>>({}).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const initialDiscoveries = useMemo(() => getDiscoveriesForDay(), []);
  const [visibleDiscoveries, setVisibleDiscoveries] = useState<Discovery[]>(initialDiscoveries);
  const [expandedDiscoveryId, setExpandedDiscoveryId] = useState<string | null>(null);
  const shownDiscoveryIds = useMemo(() => new Set(visibleDiscoveries.map((d) => d.id)), [visibleDiscoveries]);

  const handleShowMoreDiscoveries = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const more = getMoreDiscoveries(shownDiscoveryIds);
    if (more.length > 0) setVisibleDiscoveries((prev) => [...prev, ...more]);
  }, [shownDiscoveryIds]);

  const handleDismissDiscovery = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVisibleDiscoveries((prev) => prev.filter((d) => d.id !== id));
    setExpandedDiscoveryId((cur) => (cur === id ? null : cur));
  }, []);

  useEffect(() => {
    const s = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    );
    s.start();
    return () => s.stop();
  }, []);

  useEffect(() => {
    const all = [...recommendedModules, ...MODULES];
    all.forEach((mod) => {
      const progress = getModuleProgress(mod.id);
      const total = mod.lessons.length;
      if (progress > 0 && total > 0) {
        const anim = getProgressAnim(mod.id);
        anim.setValue(0);
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }).start();
      }
    });
  }, []);

  const getProgressAnim = (id: string) => {
    if (!progressAnims[id]) progressAnims[id] = new Animated.Value(0);
    return progressAnims[id];
  };

  const handleOpenLesson = (lessonId: string) => {
    router.push(`/lesson/${lessonId}` as const);
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Daily lesson */}
      <Text style={styles.sectionLabel}>Today's Lesson</Text>
      {nextLesson && nextModule ? (
        <Animated.View
          style={[
            styles.dailyCard,
            {
              opacity: shimmerAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 0.92, 1],
              }),
            },
          ]}
        >
          <Text style={styles.dailyTitle}>{nextLesson.title}</Text>
          <Text style={styles.dailyPreview} numberOfLines={2}>
            {nextModule.description}
          </Text>
          <Text style={styles.dailyTime}>{nextLesson.duration} min read</Text>
          <Pressable
            style={({ pressed }) => [styles.startButton, pressed && styles.startButtonPressed]}
            onPress={() => handleOpenLesson(nextLesson.id)}
          >
            <Text style={styles.startButtonText}>Start</Text>
          </Pressable>
        </Animated.View>
      ) : (
        <View style={styles.dailyCard}>
          <Text style={styles.dailyTitle}>You're all caught up</Text>
          <Text style={styles.dailyPreview}>
            You've completed the recommended lessons. Explore more below or check back later.
          </Text>
        </View>
      )}

      {/* Discovery — bite-sized cards */}
      <Text style={styles.sectionLabel}>Discovery 🔮</Text>
      <Text style={styles.discoverySubtitle}>The things nobody taught you in school</Text>
      <View style={styles.discoveryCardList}>
        {visibleDiscoveries.map((d) => (
          <DiscoveryCard
            key={d.id}
            discovery={d}
            expanded={expandedDiscoveryId === d.id}
            onToggleExpand={() => setExpandedDiscoveryId((cur) => (cur === d.id ? null : d.id))}
            onDismiss={() => handleDismissDiscovery(d.id)}
          />
        ))}
      </View>
      <Pressable
        style={({ pressed }) => [styles.showMoreBtn, pressed && styles.pressed]}
        onPress={handleShowMoreDiscoveries}
      >
        <Text style={styles.showMoreBtnText}>Show me more</Text>
      </Pressable>

      {/* Recommended for you */}
      <Text style={styles.sectionLabel}>Recommended for You</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
        style={styles.horizontalScrollView}
      >
        {recommendedModules.map((mod) => {
          const progress = getModuleProgress(mod.id);
          const total = mod.lessons.length;
          return (
            <Pressable
              key={mod.id}
              style={styles.moduleCardSmall}
              onPress={() => {
                const first = mod.lessons[0];
                if (first) handleOpenLesson(first.id);
              }}
            >
              <Text style={styles.moduleEmoji}>{mod.emoji}</Text>
              <Text style={styles.moduleTitleSmall} numberOfLines={2}>
                {mod.title}
              </Text>
              <Text style={styles.moduleMeta}>{total} lessons</Text>
              {progress > 0 && (
                <View style={styles.progressBarBg}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: getProgressAnim(mod.id).interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${(progress / total) * 100}%`],
                        }) as unknown as string,
                      },
                    ]}
                  />
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Explore all */}
      <Text style={styles.sectionLabel}>Explore</Text>
      <View style={styles.moduleList}>
        {MODULES.map((mod) => {
          const progress = getModuleProgress(mod.id);
          const total = mod.lessons.length;
          const firstLesson = mod.lessons[0];
          return (
            <Pressable
              key={mod.id}
              style={styles.moduleCard}
              onPress={() => firstLesson && handleOpenLesson(firstLesson.id)}
            >
              <Text style={styles.moduleEmojiLarge}>{mod.emoji}</Text>
              <View style={styles.moduleCardBody}>
                <Text style={styles.moduleTitle}>{mod.title}</Text>
                <Text style={styles.moduleDesc} numberOfLines={2}>
                  {mod.description}
                </Text>
                <View style={styles.moduleFooter}>
                  <Text style={styles.moduleCount}>{total} lessons</Text>
                  {progress > 0 && (
                    <View style={styles.progressBarBg}>
                      <Animated.View
                        style={[
                          styles.progressBarFill,
                          {
                            width: getProgressAnim(mod.id).interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0%', `${(progress / total) * 100}%`],
                            }) as unknown as string,
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 12,
  },
  discoverySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: -8,
    marginBottom: 12,
  },
  discoveryCardList: { marginBottom: 8 },
  discoveryCardWrap: { marginBottom: 12 },
  discoveryCard: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surface,
    overflow: 'hidden',
  },
  discoveryCategoryTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  discoveryEmoji: { fontSize: 28, marginBottom: 8 },
  discoveryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    paddingRight: 80,
  },
  discoveryContent: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  discoveryTapHint: {
    fontSize: 13,
    color: COLORS.accent,
    marginTop: 8,
  },
  showMoreBtn: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  showMoreBtnText: {
    fontSize: 15,
    color: COLORS.accent,
    fontWeight: '600',
  },
  pressed: { opacity: 0.9 },
  dailyCard: {
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  dailyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  dailyPreview: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  dailyTime: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.input,
    alignItems: 'center',
  },
  startButtonPressed: { opacity: 0.9 },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  horizontalScrollView: { marginHorizontal: -24 },
  horizontalScroll: {
    paddingHorizontal: 24,
    gap: 12,
    paddingVertical: 8,
  },
  moduleCardSmall: {
    width: 140,
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  moduleEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  moduleTitleSmall: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  moduleMeta: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  moduleList: { gap: 12, marginTop: 8 },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  moduleEmojiLarge: {
    fontSize: 32,
    marginRight: 16,
  },
  moduleCardBody: { flex: 1 },
  moduleTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  moduleDesc: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: 8,
  },
  moduleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moduleCount: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});
