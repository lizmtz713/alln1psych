import { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { ManualSearch } from '../../src/components/ManualSearch';
import { SuggestedLessons } from '../../src/components/SuggestedLessons';
import { useEducationStore } from '../../src/stores/educationStore';
import {
  MANUAL_SECTIONS,
  type ManualSection,
  type ManualLesson,
} from '../../src/data/manualContent';
import {
  humanManualCategories,
  type HumanManualLesson,
  type HumanManualCategory,
} from '../../src/data/humanManual';
import { MANUAL_LIBRARY_GROUPS } from '../../src/data/manualLibraryGroups';
import {
  type Discovery,
  getDiscoveriesForDay,
  getMoreDiscoveries,
  getCategoryTag,
} from '../../src/data/discoveries';
import {
  GAUGES,
  GAUGE_SYSTEM_INTRO,
  SELF_INGAUGED,
} from '../../src/data/gaugeSystem';
import { HUMAN_MANUAL_PARTS, type ManualPart, type ManualTopic } from '../../src/data/humanManualToc';
import { CURRICULUM_TAGLINE } from '../../src/data/psychologyForRealLifeCurriculum';
import { ShareInsight } from '../../src/features/share-insight';
import { buildDiscoveryShareContent } from '../../src/features/share-insight';
import { useUserStore } from '../../src/stores/userStore';
import { useCockpitStore } from '../../src/stores/cockpitStore';
import type { GaugeKey } from '../../src/stores/cockpitStore';
import { 
  ACADEMIC_SOURCES, 
  SYNTHESIZED_INSIGHTS,
  getInsightsForGauge,
  type GaugeType,
} from '../../src/data/academicSources';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GAUGE_KEYS: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];

function YourSystemPatternsCard() {
  const router = useRouter();
  const body = useCockpitStore((s) => s.body);
  const state = useCockpitStore((s) => s.state);
  const emotion = useCockpitStore((s) => s.emotion);
  const connection = useCockpitStore((s) => s.connection);
  const direction = useCockpitStore((s) => s.direction);
  const alignment = useCockpitStore((s) => s.alignment);
  const crossSystemInsight = useCockpitStore((s) => s.crossSystemInsight);
  const gauges = { body, state, emotion, connection, direction, alignment };
  const entries = GAUGE_KEYS.map((key) => ({ key, value: gauges[key].value })).filter((e) => e.value >= 0);
  const hasData = entries.length > 0;
  const strongest = hasData ? entries.reduce((a, b) => (a.value >= b.value ? a : b)) : null;
  const mostSensitive = hasData ? entries.reduce((a, b) => (a.value <= b.value ? a : b)) : null;
  const gaugeName = (key: GaugeKey) => GAUGES.find((g) => g.id === key)?.name ?? key;

  return (
    <Pressable
      style={styles.systemPatternsCard}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/(modals)/cockpit-checkin');
      }}
    >
      <Text style={styles.systemPatternsTitle}>Your System Patterns</Text>
      {!hasData ? (
        <Text style={styles.systemPatternsText}>
          Complete a check-in to see your strongest gauge, your most sensitive gauge, and a short insight.
        </Text>
      ) : (
        <View style={styles.systemPatternsRows}>
          {strongest && (
            <Text style={styles.systemPatternsRow}>
              <Text style={styles.systemPatternsLabel}>Strongest: </Text>
              {gaugeName(strongest.key)}
            </Text>
          )}
          {mostSensitive && strongest?.key !== mostSensitive?.key && (
            <Text style={styles.systemPatternsRow}>
              <Text style={styles.systemPatternsLabel}>Most sensitive: </Text>
              {gaugeName(mostSensitive.key)}
            </Text>
          )}
          {crossSystemInsight ? (
            <Text style={styles.systemPatternsInsight} numberOfLines={2}>{crossSystemInsight}</Text>
          ) : (
            <Text style={styles.systemPatternsHint}>Tap to check in again and refresh your pattern.</Text>
          )}
        </View>
      )}
      <Text style={styles.systemPatternsCta}>{hasData ? 'Check in →' : 'Do a check-in →'}</Text>
    </Pressable>
  );
}

// Design System
const COLORS = {
  bg: '#09090F',
  card: '#111118',
  cardElevated: '#18181F',
  border: 'rgba(255,255,255,0.08)',
  text: '#F0F0F5',
  textSecondary: '#A0A0B8',
  textMuted: '#6B6B80',
  accent: '#7C4DFF',
  accentSoft: 'rgba(124,77,255,0.15)',
  success: '#4ADE80',
  successSoft: 'rgba(74,222,128,0.15)',
  tabBg: '#1A1A24',
  tabActive: '#7C4DFF',
  iconBg: 'rgba(124,77,255,0.12)',
};

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [expandedGaugeId, setExpandedGaugeId] = useState<string | null>(null);
  const [expandedManualPartId, setExpandedManualPartId] = useState<string | null>(null);
  const [expandedLibraryGroupId, setExpandedLibraryGroupId] = useState<string | null>(null);
  const [expandedDiscoveryId, setExpandedDiscoveryId] = useState<string | null>(null);
  const [visibleDiscoveries, setVisibleDiscoveries] = useState(() => getDiscoveriesForDay());
  
  const isLessonCompleted = useEducationStore((s) => s.isLessonCompleted);
  const markComplete = useEducationStore((s) => s.completeLesson);

  const toggleGauge = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGaugeId((prev) => (prev === id ? null : id));
  }, []);

  const openGaugeDetail = useCallback((gaugeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/(modals)/gauge-detail?gauge=${gaugeId}`);
  }, [router]);

  const loadMoreDiscoveries = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const more = getMoreDiscoveries(new Set(visibleDiscoveries.map((d) => d.id)));
    setVisibleDiscoveries((prev) => [...prev, ...more]);
  }, [visibleDiscoveries]);

  // Get manual sections and human categories for the expanded library group
  const { sectionsForGroup, humanCategoriesForGroup } = useMemo(() => {
    if (!expandedLibraryGroupId) {
      return { sectionsForGroup: [] as ManualSection[], humanCategoriesForGroup: [] as HumanManualCategory[] };
    }
    const group = MANUAL_LIBRARY_GROUPS.find((g) => g.id === expandedLibraryGroupId);
    if (!group) {
      return { sectionsForGroup: [] as ManualSection[], humanCategoriesForGroup: [] as HumanManualCategory[] };
    }
    const sectionIds = new Set(group.manualSectionIds);
    const categoryIds = new Set(group.humanCategoryIds);
    return {
      sectionsForGroup: MANUAL_SECTIONS.filter((s) => sectionIds.has(s.id)),
      humanCategoriesForGroup: humanManualCategories.filter((c) => categoryIds.has(c.id)),
    };
  }, [expandedLibraryGroupId]);

  const toggleLibraryGroup = useCallback((groupId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedLibraryGroupId((prev) => (prev === groupId ? null : groupId));
  }, []);

  const toggleManualPart = useCallback((partId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedManualPartId((prev) => (prev === partId ? null : partId));
  }, []);

  const openManualTopic = useCallback((topic: ManualTopic) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (topic.type === 'gauge') {
      openGaugeDetail(topic.target);
    } else if (topic.type === 'route') {
      router.push(topic.target as any);
    } else {
      router.push(`/learn/manual/${topic.target}`);
    }
  }, [router, openGaugeDetail]);

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>The Human Manual</Text>
          <Text style={styles.headerSubtitle}>
            The manual nobody was given for life. Simple. Honest. Practical.
          </Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={[styles.contentInner, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* ═══ SECTION 1: INTRO / HUMAN OS FRAME ═══ */}
          <View style={styles.introBlock}>
            <Text style={styles.introTagline}>The human operating manual. Learn how your system works.</Text>
            <Text style={styles.introHeadline}>You are not broken.</Text>
            <Text style={styles.introHeadline}>You are a system.</Text>
            <Text style={styles.introSupporting}>
              Everything in life fits into six systems. This is your map.
            </Text>
            <Text style={styles.introGuiding}>
              What's happening in your system right now — and what to do next.
            </Text>
          </View>

          {/* ═══ PART 1: THE HUMAN SYSTEM (6 GAUGES) ═══ */}
          <Text style={styles.sectionBlockTitle}>Part 1 — The Human System</Text>
          <Text style={styles.sectionBlockSubtitle}>
            Body · State · Emotion · Connection · Direction · Alignment. How your biology, nervous system, and life interact.
          </Text>
          {GAUGES.map((gauge) => {
            const isExpanded = expandedGaugeId === gauge.id;
            const gaugeInsights = getInsightsForGauge(gauge.id as GaugeType);
            const relevantSources = ACADEMIC_SOURCES.filter((s) => s.primaryGauge === gauge.id);
            return (
              <Pressable
                key={gauge.id}
                style={styles.gaugeCard}
                onPress={() => toggleGauge(gauge.id)}
              >
                <View style={styles.gaugeHeader}>
                  <View style={[styles.gaugeIcon, { backgroundColor: gauge.color + '20' }]}>
                    <Text style={styles.gaugeEmoji}>{gauge.emoji}</Text>
                  </View>
                  <View style={styles.gaugeInfo}>
                    <Text style={styles.gaugeName}>{gauge.name}</Text>
                    <Text style={styles.gaugeTagline}>{gauge.tagline}</Text>
                  </View>
                  <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.textMuted} />
                </View>
                {isExpanded && (
                  <View style={styles.gaugeExpanded}>
                    <Text style={styles.gaugeCoreTruth}>"{gauge.coreTruth}"</Text>
                    <Text style={styles.gaugeDesc}>{gauge.description}</Text>
                    {relevantSources.length > 0 && (
                      <View style={styles.sourcesSection}>
                        <Text style={styles.sourcesSectionTitle}>📚 The Science Behind This</Text>
                        {relevantSources.slice(0, 3).map((source) => (
                          <View key={source.id} style={styles.sourceRow}>
                            <Text style={styles.sourceAuthor}>{source.author}</Text>
                            <Text style={styles.sourceInsight}>{source.keyInsight}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {gaugeInsights.length > 0 && (
                      <View style={styles.insightsPreview}>
                        <Text style={styles.insightsPreviewTitle}>💡 Key Insights</Text>
                        {gaugeInsights.slice(0, 2).map((insight) => (
                          <Text key={insight.id} style={styles.insightPreviewItem}>• {insight.title}</Text>
                        ))}
                      </View>
                    )}
                    <Pressable style={styles.gaugeLearnMoreBtn} onPress={() => openGaugeDetail(gauge.id)}>
                      <Text style={styles.gaugeLearnMoreText}>Go Deeper →</Text>
                    </Pressable>
                  </View>
                )}
              </Pressable>
            );
          })}

          {/* Your System Patterns — small card tied to their data */}
          <YourSystemPatternsCard />

          {/* ═══ PARTS 2–5: SIGNALS, CASCADES, REPAIRS, ROLES (Table of Contents) ═══ */}
          {HUMAN_MANUAL_PARTS.filter((p) => p.partNumber >= 2 && p.partNumber <= 5).map((part) => {
            const isExpanded = expandedManualPartId === part.id;
            return (
              <View key={part.id} style={styles.manualPartWrap}>
                <Pressable
                  style={[styles.manualPartCard, isExpanded && styles.manualPartCardExpanded]}
                  onPress={() => toggleManualPart(part.id)}
                >
                  <Text style={styles.manualPartEmoji}>{part.emoji}</Text>
                  <View style={styles.manualPartBody}>
                    <Text style={styles.manualPartTitle}>Part {part.partNumber} — {part.title}</Text>
                    <Text style={styles.manualPartSubtitle}>{part.subtitle}</Text>
                  </View>
                  <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.textMuted} />
                </Pressable>
                {isExpanded && (
                  <View style={styles.manualPartTopics}>
                    {part.topics.map((topic) => (
                      <Pressable
                        key={topic.id}
                        style={styles.manualTopicRow}
                        onPress={() => openManualTopic(topic)}
                      >
                        <Text style={styles.manualTopicEmoji}>{topic.emoji}</Text>
                        <Text style={styles.manualTopicTitle}>{topic.title}</Text>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            );
          })}

          {/* ═══ THE MANUAL — Full library (all existing lessons, unchanged) ═══ */}
          <Text style={styles.sectionBlockTitle}>The Manual — Full library</Text>
          <Text style={styles.sectionBlockSubtitle}>
            All lessons by topic. Read Your System · Know Yourself · Know Your People · Know Your Path · Navigate Challenges. Explore below.
          </Text>
          <Text style={styles.curriculumTagline}>{CURRICULUM_TAGLINE}</Text>
          <Text style={[styles.sectionBlockTitle, { marginTop: 8 }]}>Self-Discovery</Text>
          <Text style={styles.sectionBlockSubtitle}>
            Short, research-backed quizzes. Not labels — insight into how you operate. 2–3 min each.
          </Text>
          <Pressable
            style={styles.selfDiscoveryCard}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/learn/self-discovery'); }}
          >
            <Text style={styles.selfDiscoveryEmoji}>🔬</Text>
            <View style={styles.selfDiscoveryBody}>
              <Text style={styles.selfDiscoveryTitle}>Self-Discovery</Text>
              <Text style={styles.selfDiscoverySub}>Big Five, Stress Response, Decision Style, Motivation, Social Energy, Thinking Bias, Conflict Style, Attachment</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </Pressable>
          <View style={styles.alsoExploreRow}>
            <Pressable
              style={styles.alsoExploreCard}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/learn/skills'); }}
            >
              <Text style={styles.alsoExploreEmoji}>🛠️</Text>
              <Text style={styles.alsoExploreTitle}>16 Human Skills</Text>
              <Text style={styles.alsoExploreSub}>Core life skills — learn by doing</Text>
            </Pressable>
            <Pressable
              style={styles.alsoExploreCard}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/learn/questions'); }}
            >
              <Text style={styles.alsoExploreEmoji}>❓</Text>
              <Text style={styles.alsoExploreTitle}>12 Questions</Text>
              <Text style={styles.alsoExploreSub}>Life blueprint — who you are</Text>
            </Pressable>
            <Pressable
              style={styles.alsoExploreCard}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/tools/human-roles'); }}
            >
              <Text style={styles.alsoExploreEmoji}>👥</Text>
              <Text style={styles.alsoExploreTitle}>Human Roles</Text>
              <Text style={styles.alsoExploreSub}>How to show up in relationships — by role</Text>
            </Pressable>
            <Pressable
              style={styles.alsoExploreCard}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/learn/life-literacy'); }}
            >
              <Text style={styles.alsoExploreEmoji}>📚</Text>
              <Text style={styles.alsoExploreTitle}>Life Literacy</Text>
              <Text style={styles.alsoExploreSub}>What to know to navigate life well</Text>
            </Pressable>
            <Pressable
              style={styles.alsoExploreCard}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/learn/relationship-repair'); }}
            >
              <Text style={styles.alsoExploreEmoji}>🔧</Text>
              <Text style={styles.alsoExploreTitle}>Relationship repair</Text>
              <Text style={styles.alsoExploreSub}>Short lessons — fix arguments, repair after a fight</Text>
            </Pressable>
            <Pressable
              style={styles.alsoExploreCard}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/learn/modern-manners'); }}
            >
              <Text style={styles.alsoExploreEmoji}>🤝</Text>
              <Text style={styles.alsoExploreTitle}>Modern Manners</Text>
              <Text style={styles.alsoExploreSub}>10 skills that make relationships and societies work</Text>
            </Pressable>
          </View>
          <ManualSearch />
          <SuggestedLessons />
          {MANUAL_LIBRARY_GROUPS.map((group) => {
            const isExpanded = expandedLibraryGroupId === group.id;
            return (
              <View key={group.id} style={styles.libraryGroupWrap}>
                <Pressable
                  style={[styles.libraryGroupCard, isExpanded && styles.libraryGroupCardExpanded]}
                  onPress={() => toggleLibraryGroup(group.id)}
                >
                  <Text style={styles.libraryGroupEmoji}>{group.emoji}</Text>
                  <View style={styles.libraryGroupBody}>
                    <Text style={styles.libraryGroupTitle}>{group.title}</Text>
                    <Text style={styles.libraryGroupSubtitle}>{group.subtitle}</Text>
                  </View>
                  <Text style={styles.libraryGroupCta}>{isExpanded ? 'Collapse' : 'Explore'}</Text>
                  <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-forward'} size={18} color={COLORS.accent} />
                </Pressable>
                {isExpanded && (
                  <View style={styles.libraryGroupContent}>
                    {sectionsForGroup.map((section) => (
                      <View key={section.id} style={styles.manualSection}>
                        <View style={styles.manualSectionHeader}>
                          <Text style={styles.manualSectionEmoji}>{section.emoji}</Text>
                          <Text style={styles.manualSectionTitle}>{section.title}</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.lessonCarousel}>
                          {section.modules.map((module) =>
                            module.lessons.map((lesson) => {
                              const completed = isLessonCompleted(lesson.id);
                              return (
                                <Pressable
                                  key={lesson.id}
                                  style={[styles.lessonCard, completed && styles.lessonCardDone]}
                                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/lesson/${lesson.id}`); }}
                                >
                                  {completed && <View style={styles.lessonCheck}><Ionicons name="checkmark" size={12} color="#fff" /></View>}
                                  <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>
                                  <Text style={styles.lessonTitle} numberOfLines={2}>{lesson.title}</Text>
                                </Pressable>
                              );
                            })
                          )}
                        </ScrollView>
                      </View>
                    ))}
                    {humanCategoriesForGroup.map((category) => (
                      <View key={category.id} style={styles.manualSection}>
                        <View style={styles.manualSectionHeader}>
                          <Text style={styles.manualSectionEmoji}>{category.emoji}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.manualSectionTitle}>{category.title}</Text>
                            <Text style={styles.manualSectionDesc}>{category.description}</Text>
                          </View>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.lessonCarousel}>
                          {category.lessons.map((lesson) => {
                            const completed = isLessonCompleted(lesson.id);
                            return (
                              <Pressable
                                key={lesson.id}
                                style={[styles.lessonCard, completed && styles.lessonCardDone]}
                                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/lesson/${lesson.id}`); }}
                              >
                                {completed && <View style={styles.lessonCheck}><Ionicons name="checkmark" size={12} color="#fff" /></View>}
                                <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>
                                <Text style={styles.lessonTitle} numberOfLines={2}>{lesson.title}</Text>
                              </Pressable>
                            );
                          })}
                        </ScrollView>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}

          {/* ═══ PARTS 6–7: LONG GAME, BIG QUESTIONS ═══ */}
          {HUMAN_MANUAL_PARTS.filter((p) => p.partNumber >= 6).map((part) => {
            const isExpanded = expandedManualPartId === part.id;
            return (
              <View key={part.id} style={styles.manualPartWrap}>
                <Pressable
                  style={[styles.manualPartCard, isExpanded && styles.manualPartCardExpanded]}
                  onPress={() => toggleManualPart(part.id)}
                >
                  <Text style={styles.manualPartEmoji}>{part.emoji}</Text>
                  <View style={styles.manualPartBody}>
                    <Text style={styles.manualPartTitle}>Part {part.partNumber} — {part.title}</Text>
                    <Text style={styles.manualPartSubtitle}>{part.subtitle}</Text>
                  </View>
                  <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.textMuted} />
                </Pressable>
                {isExpanded && (
                  <View style={styles.manualPartTopics}>
                    {part.topics.map((topic) => (
                      <Pressable
                        key={topic.id}
                        style={styles.manualTopicRow}
                        onPress={() => openManualTopic(topic)}
                      >
                        <Text style={styles.manualTopicEmoji}>{topic.emoji}</Text>
                        <Text style={styles.manualTopicTitle}>{topic.title}</Text>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            );
          })}

          {/* ═══ DISCOVERIES (unchanged) ═══ */}
          <Text style={styles.sectionBlockTitle}>Discoveries</Text>
          <Text style={styles.sectionBlockSubtitle}>
            Small insights about how humans work.
          </Text>
          {visibleDiscoveries.map((discovery) => {
            const isExpanded = expandedDiscoveryId === discovery.id;
            return (
              <Pressable
                key={discovery.id}
                style={styles.discoveryCard}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setExpandedDiscoveryId(isExpanded ? null : discovery.id);
                }}
              >
                <View style={styles.discoveryHeader}>
                  <Text style={styles.discoveryEmoji}>{discovery.emoji}</Text>
                  <View style={styles.discoveryTag}>
                    <Text style={styles.discoveryTagText}>{getCategoryTag(discovery.category)}</Text>
                  </View>
                </View>
                <Text style={styles.discoveryTitle}>{discovery.title}</Text>
                <Text style={styles.discoveryContent}>{isExpanded ? discovery.expanded : discovery.content}</Text>
                {!isExpanded && <Text style={styles.discoveryTap}>Tap to learn more</Text>}
                {isExpanded && (
                  <ShareInsight
                    content={buildDiscoveryShareContent(discovery)}
                    trigger={(onPress) => (
                      <Pressable style={styles.discoveryShareBtn} onPress={(e) => { e.stopPropagation(); onPress(); }}>
                        <Ionicons name="share-outline" size={16} color={COLORS.accent} />
                        <Text style={styles.discoveryShareText}>Share this</Text>
                      </Pressable>
                    )}
                  />
                )}
              </Pressable>
            );
          })}
          <Pressable style={styles.loadMoreBtn} onPress={loadMoreDiscoveries}>
            <Text style={styles.loadMoreText}>Load More</Text>
            <Ionicons name="add-circle-outline" size={20} color={COLORS.accent} />
          </Pressable>

          <View style={{ height: 80 }} />
        </ScrollView>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginTop: 4,
    maxWidth: 320,
  },

  // Content
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
  },

  // Section 1: Intro / Human OS frame
  introBlock: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  introTagline: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.accent,
    marginBottom: 12,
  },
  introHeadline: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  introSupporting: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginTop: 12,
  },
  introGuiding: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    lineHeight: 20,
    marginTop: 10,
  },
  manualPartWrap: {
    marginBottom: 12,
  },
  manualPartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  manualPartCardExpanded: {
    borderColor: COLORS.accent + '50',
    backgroundColor: COLORS.accentSoft,
  },
  manualPartEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  manualPartBody: { flex: 1, minWidth: 0 },
  manualPartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  manualPartSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  manualPartTopics: {
    marginTop: 4,
    paddingLeft: 8,
    paddingRight: 8,
    paddingBottom: 8,
  },
  manualTopicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  manualTopicEmoji: { fontSize: 18, marginRight: 10 },
  manualTopicTitle: { flex: 1, fontSize: 14, fontWeight: '500', color: COLORS.text },
  sectionBlockTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
    marginTop: 8,
  },
  sectionBlockSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 16,
    lineHeight: 20,
  },
  curriculumTagline: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: -8,
    marginBottom: 16,
  },

  // Also explore: 16 Skills + 12 Questions
  alsoExploreRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  selfDiscoveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  selfDiscoveryEmoji: { fontSize: 32, marginRight: 14 },
  selfDiscoveryBody: { flex: 1, minWidth: 0 },
  selfDiscoveryTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  selfDiscoverySub: { fontSize: 13, color: COLORS.textMuted, lineHeight: 18 },
  alsoExploreCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  alsoExploreEmoji: { fontSize: 24, marginBottom: 6 },
  alsoExploreTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  alsoExploreSub: { fontSize: 12, color: COLORS.textMuted },

  // Library group cards (Section 3)
  libraryGroupWrap: {
    marginBottom: 12,
  },
  libraryGroupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  libraryGroupCardExpanded: {
    borderColor: COLORS.accent + '50',
    backgroundColor: COLORS.accentSoft,
  },
  libraryGroupEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  libraryGroupBody: { flex: 1, minWidth: 0 },
  libraryGroupTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  libraryGroupSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  libraryGroupCta: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
    marginRight: 4,
  },
  libraryGroupContent: {
    marginTop: 12,
    paddingLeft: 4,
  },

  // Your System Patterns card (under The System)
  systemPatternsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  systemPatternsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  systemPatternsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginBottom: 10,
  },
  systemPatternsRows: { gap: 4 },
  systemPatternsRow: { fontSize: 13, color: COLORS.textSecondary },
  systemPatternsLabel: { fontWeight: '600', color: COLORS.textMuted },
  systemPatternsInsight: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 6,
    lineHeight: 19,
  },
  systemPatternsHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  systemPatternsCta: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
    marginTop: 10,
  },

  // Intro Card (legacy)
  introCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  introEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  introText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Hero Card (Gauges Tab)
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 17,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  disciplinesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  disciplineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  disciplineEmoji: {
    fontSize: 14,
  },
  disciplineName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  heroDepthText: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  
  // Sources Section (in expanded gauge)
  sourcesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sourcesSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  sourceRow: {
    marginBottom: 12,
  },
  sourceAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
    marginBottom: 2,
  },
  sourceInsight: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  
  // Insights Preview
  insightsPreview: {
    marginTop: 16,
    backgroundColor: COLORS.accentSoft,
    borderRadius: 12,
    padding: 14,
  },
  insightsPreviewTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
    marginBottom: 8,
  },
  insightPreviewItem: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  
  // Self InGauged Card
  selfIngaugedCard: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: 20,
    padding: 24,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
  },
  selfIngaugedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  selfIngaugedText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  selfIngaugedDivider: {
    height: 1,
    backgroundColor: COLORS.accent + '30',
    marginVertical: 16,
  },
  selfIngaugedTagline: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.accent,
    textAlign: 'center',
  },
  
  // Manual Intro Card
  manualIntroCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  manualIntroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  manualIntroText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  manualSourcesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  manualSourcesText: {
    fontSize: 13,
    color: COLORS.textMuted,
    flex: 1,
  },

  // Section Intro
  sectionIntro: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },

  // Gauge Cards
  gaugeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  gaugeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gaugeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  gaugeEmoji: {
    fontSize: 24,
  },
  gaugeInfo: {
    flex: 1,
  },
  gaugeName: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  gaugeTagline: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  gaugeExpanded: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  gaugeCoreTruth: {
    fontSize: 15,
    fontWeight: '600',
    fontStyle: 'italic',
    color: COLORS.accent,
    marginBottom: 12,
    lineHeight: 22,
  },
  gaugeDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
    marginBottom: 16,
  },
  gaugeLearnMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentSoft,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  gaugeLearnMoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.accent,
  },

  // Manual Section
  manualSection: {
    marginBottom: 24,
  },
  manualSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  manualSectionEmoji: {
    fontSize: 22,
  },
  manualSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  manualSectionDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  manualDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  manualDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  manualDividerText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  lessonCarousel: {
    paddingRight: 20,
    gap: 12,
  },
  lessonCard: {
    width: 140,
    minHeight: 140,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  lessonCardDone: {
    borderWidth: 1,
    borderColor: COLORS.success + '40',
  },
  lessonCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  lessonTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: '100%',
  },

  // Tool Categories
  toolCategory: {
    marginBottom: 28,
  },
  toolCategoryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
  },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolItem: {
    width: (SCREEN_WIDTH - 40 - 24) / 3,
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: 16,
  },
  toolIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  toolTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },

  // Discovery Cards
  discoveryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
  },
  discoveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  discoveryEmoji: {
    fontSize: 32,
  },
  discoveryTag: {
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discoveryTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.accent,
    textTransform: 'uppercase',
  },
  discoveryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  discoveryContent: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  discoveryTap: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '500',
    marginTop: 12,
  },
  discoveryShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  discoveryShareText: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '500',
  },

  // Load More
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadMoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.accent,
  },
});
