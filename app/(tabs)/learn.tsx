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
import { useEducationStore } from '../../src/stores/educationStore';
import {
  MANUAL_SECTIONS,
  type ManualSection,
  type ManualLesson,
} from '../../src/data/manualContent';
import {
  type Discovery,
  getDiscoveriesForDay,
  getMoreDiscoveries,
  getCategoryTag,
} from '../../src/data/discoveries';
import {
  GAUGES,
  GAUGE_SYSTEM_INTRO,
} from '../../src/data/gaugeSystem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

// Tab configuration
const TABS = [
  { id: 'gauges', label: 'Gauges', icon: 'speedometer-outline' },
  { id: 'manual', label: 'Manual', icon: 'book-outline' },
  { id: 'tools', label: 'Tools', icon: 'apps-outline' },
  { id: 'discover', label: 'Discover', icon: 'bulb-outline' },
] as const;

type TabId = typeof TABS[number]['id'];

// Tools organized by category
const TOOL_CATEGORIES = [
  {
    id: 'ai',
    title: 'AI-Powered',
    tools: [
      { id: 'talk', icon: 'chatbubbles', title: 'Talk', color: '#7C4DFF' },
      { id: 'referee', icon: 'scale', title: 'Referee', color: '#F59E0B' },
      { id: 'journal', icon: 'journal', title: 'Journal', color: '#EC4899' },
    ],
  },
  {
    id: 'regulate',
    title: 'Regulate',
    tools: [
      { id: 'breathing', icon: 'fitness', title: 'Breathe', color: '#14B8A6' },
      { id: 'body-scan', icon: 'body', title: 'Body Scan', color: '#8B5CF6' },
      { id: 'stress-thermo', icon: 'thermometer', title: 'Stress', color: '#EF4444' },
    ],
  },
  {
    id: 'understand',
    title: 'Understand',
    tools: [
      { id: 'emotion-wheel', icon: 'color-palette', title: 'Emotions', color: '#F59E0B' },
      { id: 'thought-challenger', icon: 'bulb', title: 'Thoughts', color: '#3B82F6' },
      { id: 'trigger-map', icon: 'map', title: 'Triggers', color: '#10B981' },
    ],
  },
  {
    id: 'grow',
    title: 'Grow',
    tools: [
      { id: 'gratitude-jar', icon: 'sparkles', title: 'Gratitude', color: '#FBBF24' },
      { id: 'mood-patterns', icon: 'analytics', title: 'Patterns', color: '#6366F1' },
      { id: 'comm-builder', icon: 'people', title: 'Comm Lab', color: '#EC4899' },
    ],
  },
];

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('gauges');
  const [expandedGaugeId, setExpandedGaugeId] = useState<string | null>(null);
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);
  const [expandedDiscoveryId, setExpandedDiscoveryId] = useState<string | null>(null);
  const [visibleDiscoveries, setVisibleDiscoveries] = useState(() => getDiscoveriesForDay());
  
  const isLessonCompleted = useEducationStore((s) => s.isLessonCompleted);
  const markLessonComplete = useEducationStore((s) => s.markLessonComplete);

  const switchTab = useCallback((tabId: TabId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tabId);
  }, []);

  const openTool = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (id === 'talk') return router.push('/(tabs)/talk');
    if (id === 'journal') return router.push('/(modals)/new-journal');
    if (id === 'referee') return router.push('/(modals)/referee');
    router.push(`/(modals)/activity?id=${id}`);
  }, [router]);

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
    const more = getMoreDiscoveries(visibleDiscoveries.map((d) => d.id), 3);
    setVisibleDiscoveries((prev) => [...prev, ...more]);
  }, [visibleDiscoveries]);

  // Get all lessons flat
  const allLessons = useMemo(() => {
    const result: { lesson: ManualLesson; section: ManualSection; moduleTitle: string }[] = [];
    MANUAL_SECTIONS.forEach((section) => {
      section.modules.forEach((module) => {
        module.lessons.forEach((lesson) => {
          result.push({ lesson, section, moduleTitle: module.title });
        });
      });
    });
    return result;
  }, []);

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Learn</Text>
        </View>

        {/* Top Tabs */}
        <View style={styles.tabContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScroll}
          >
            {TABS.map((tab) => (
              <Pressable
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                onPress={() => switchTab(tab.id)}
              >
                <Ionicons 
                  name={tab.icon as any} 
                  size={18} 
                  color={activeTab === tab.id ? '#fff' : COLORS.textMuted} 
                />
                <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentInner}
          showsVerticalScrollIndicator={false}
        >
          {/* ═══════════════════════════════════════════════════════════
              GAUGES TAB
              ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'gauges' && (
            <View>
              {/* Intro Card */}
              <View style={styles.introCard}>
                <Text style={styles.introEmoji}>🎛️</Text>
                <Text style={styles.introTitle}>{GAUGE_SYSTEM_INTRO.headline}</Text>
                <Text style={styles.introText}>{GAUGE_SYSTEM_INTRO.subhead}</Text>
              </View>

              {/* Gauge Cards */}
              {GAUGES.map((gauge) => {
                const isExpanded = expandedGaugeId === gauge.id;
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
                      <Ionicons 
                        name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                        size={20} 
                        color={COLORS.textMuted} 
                      />
                    </View>
                    {isExpanded && (
                      <View style={styles.gaugeExpanded}>
                        <Text style={styles.gaugeCoreTruth}>"{gauge.coreTruth}"</Text>
                        <Text style={styles.gaugeDesc}>{gauge.description}</Text>
                        
                        {/* Learn More Button */}
                        <Pressable 
                          style={styles.gaugeLearnMoreBtn}
                          onPress={() => openGaugeDetail(gauge.id)}
                        >
                          <Text style={styles.gaugeLearnMoreText}>Learn Everything About {gauge.name}</Text>
                          <Ionicons name="arrow-forward" size={18} color={COLORS.accent} />
                        </Pressable>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* ═══════════════════════════════════════════════════════════
              MANUAL TAB
              ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'manual' && (
            <View>
              <Text style={styles.sectionIntro}>
                48 lessons to understand yourself better. Tap to explore.
              </Text>

              {MANUAL_SECTIONS.map((section) => (
                <View key={section.id} style={styles.manualSection}>
                  <View style={styles.manualSectionHeader}>
                    <Text style={styles.manualSectionEmoji}>{section.emoji}</Text>
                    <Text style={styles.manualSectionTitle}>{section.title}</Text>
                  </View>
                  
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.lessonCarousel}
                  >
                    {section.modules.map((module) =>
                      module.lessons.map((lesson) => {
                        const completed = isLessonCompleted(lesson.id);
                        return (
                          <Pressable
                            key={lesson.id}
                            style={[styles.lessonCard, completed && styles.lessonCardDone]}
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              router.push(`/(modals)/activity?lesson=${lesson.id}`);
                            }}
                          >
                            {completed && (
                              <View style={styles.lessonCheck}>
                                <Ionicons name="checkmark" size={12} color="#fff" />
                              </View>
                            )}
                            <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>
                            <Text style={styles.lessonTitle} numberOfLines={2}>{lesson.title}</Text>
                          </Pressable>
                        );
                      })
                    )}
                  </ScrollView>
                </View>
              ))}
            </View>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TOOLS TAB - Sam's Club Style Grid
              ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'tools' && (
            <View>
              {TOOL_CATEGORIES.map((category) => (
                <View key={category.id} style={styles.toolCategory}>
                  <Text style={styles.toolCategoryTitle}>{category.title}</Text>
                  <View style={styles.toolGrid}>
                    {category.tools.map((tool) => (
                      <Pressable
                        key={tool.id}
                        style={styles.toolItem}
                        onPress={() => openTool(tool.id)}
                      >
                        <View style={[styles.toolIconWrap, { backgroundColor: tool.color + '15' }]}>
                          <Ionicons name={tool.icon as any} size={28} color={tool.color} />
                        </View>
                        <Text style={styles.toolTitle}>{tool.title}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ═══════════════════════════════════════════════════════════
              DISCOVER TAB
              ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'discover' && (
            <View>
              <Text style={styles.sectionIntro}>
                Daily insights backed by psychology. Swipe to explore.
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
                    <Text style={styles.discoveryContent}>
                      {isExpanded ? discovery.expanded : discovery.content}
                    </Text>
                    {!isExpanded && (
                      <Text style={styles.discoveryTap}>Tap to learn more</Text>
                    )}
                  </Pressable>
                );
              })}

              <Pressable style={styles.loadMoreBtn} onPress={loadMoreDiscoveries}>
                <Text style={styles.loadMoreText}>Load More</Text>
                <Ionicons name="add-circle-outline" size={20} color={COLORS.accent} />
              </Pressable>
            </View>
          )}

          <View style={{ height: 100 }} />
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
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },

  // Top Tabs
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabScroll: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.tabBg,
    gap: 6,
  },
  tabActive: {
    backgroundColor: COLORS.tabActive,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: '#fff',
  },

  // Content
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
  },

  // Intro Card
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
  lessonCarousel: {
    paddingRight: 20,
    gap: 12,
  },
  lessonCard: {
    width: 120,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
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
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 17,
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
