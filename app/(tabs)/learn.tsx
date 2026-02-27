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
import { ShareInsight } from '../../src/features/share-insight';
import { buildDiscoveryShareContent } from '../../src/features/share-insight';
import { useUserStore } from '../../src/stores/userStore';
import { 
  ACADEMIC_SOURCES, 
  SYNTHESIZED_INSIGHTS,
  getInsightsForGauge,
  type GaugeType,
} from '../../src/data/academicSources';

// Academic disciplines that inform InGauge
const DISCIPLINES = [
  { id: 'psych', emoji: '🧠', name: 'Psychology', desc: 'How your mind works' },
  { id: 'neuro', emoji: '⚡', name: 'Neuroscience', desc: 'How your brain works' },
  { id: 'bio', emoji: '🧬', name: 'Biology', desc: 'How your body works' },
  { id: 'soc', emoji: '👥', name: 'Sociology', desc: 'How groups shape you' },
  { id: 'anthro', emoji: '🌍', name: 'Anthropology', desc: 'How culture shapes you' },
  { id: 'polisci', emoji: '⚖️', name: 'Political Science', desc: 'How power shapes you' },
];

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

// Tools organized by category - ALL app tools
const TOOL_CATEGORIES = [
  {
    id: 'ai',
    title: 'AI-Powered',
    tools: [
      { id: 'talk', icon: 'chatbubbles', title: 'Talk', color: '#7C4DFF' },
      { id: 'referee', icon: 'scale', title: 'Referee', color: '#F59E0B' },
      { id: 'prompt-generator', icon: 'sparkles', title: 'Prompts', color: '#EC4899' },
      { id: 'replay', icon: 'refresh', title: 'Replay', color: '#14B8A6' },
      { id: 'decode', icon: 'search', title: 'Decode', color: '#3B82F6' },
    ],
  },
  {
    id: 'connect',
    title: 'Connect',
    tools: [
      { id: 'relate', icon: 'heart-circle', title: 'Relate', color: '#EC4899' },
      { id: 'relational-bridge', icon: 'git-merge', title: 'Bridge', color: '#FF9800' },
      { id: 'love', icon: 'heart-half', title: 'Love', color: '#F43F5E' },
      { id: 'help-someone', icon: 'hand-left', title: 'Help', color: '#8B5CF6' },
      { id: 'role-play', icon: 'people-circle', title: 'Role Play', color: '#F59E0B' },
      { id: 'comm-builder', icon: 'chatbox', title: 'Comm Lab', color: '#10B981' },
    ],
  },
  {
    id: 'checkin',
    title: 'Check In',
    tools: [
      { id: 'mood-checkin', icon: 'pulse', title: 'Quick Check', color: '#7C4DFF' },
      { id: 'cockpit-checkin', icon: 'speedometer', title: 'Full Cockpit', color: '#14B8A6' },
    ],
  },
  {
    id: 'regulate',
    title: 'Regulate',
    tools: [
      { id: 'quick-reset', icon: 'flash', title: 'Quick Reset', color: '#14B8A6' },
      { id: 'breathing', icon: 'fitness', title: 'Breathe', color: '#14B8A6' },
      { id: 'body-scan', icon: 'body', title: 'Body Scan', color: '#8B5CF6' },
      { id: 'stress-thermo', icon: 'thermometer', title: 'Stress', color: '#EF4444' },
      { id: 'crisis-resources', icon: 'heart', title: 'Crisis Help', color: '#EF4444' },
    ],
  },
  {
    id: 'understand',
    title: 'Understand',
    tools: [
      { id: 'learning-style-quiz', icon: 'school', title: 'Learning Style', color: '#7C4DFF' },
      { id: 'emotion-wheel', icon: 'color-palette', title: 'Emotions', color: '#F59E0B' },
      { id: 'emotion-match', icon: 'extension-puzzle', title: 'Match', color: '#EC4899' },
      { id: 'thought-challenger', icon: 'bulb', title: 'Thoughts', color: '#3B82F6' },
      { id: 'trigger-map', icon: 'map', title: 'Triggers', color: '#10B981' },
    ],
  },
  {
    id: 'grow',
    title: 'Grow',
    tools: [
      { id: 'journal', icon: 'journal', title: 'Journal', color: '#EC4899' },
      { id: 'gratitude-jar', icon: 'sparkles', title: 'Gratitude', color: '#FBBF24' },
      { id: 'mood-patterns', icon: 'analytics', title: 'Patterns', color: '#6366F1' },
    ],
  },
  {
    id: 'athlete',
    title: 'Athlete Mode',
    tools: [
      { id: 'recovery-check', icon: 'battery-charging', title: 'Recovery', color: '#10B981' },
      { id: 'pre-competition', icon: 'trophy', title: 'Pre-Comp', color: '#FBBF24' },
      { id: 'performance-debrief', icon: 'clipboard', title: 'Debrief', color: '#3B82F6' },
      { id: 'athlete-identity', icon: 'star', title: 'Identity', color: '#8B5CF6' },
    ],
  },
  {
    id: 'spectrum',
    title: 'Spectrum Mode',
    tools: [
      { id: 'sensory-check', icon: 'eye', title: 'Sensory', color: '#14B8A6' },
      { id: 'stim-toolkit', icon: 'infinite', title: 'Stim', color: '#F59E0B' },
      { id: 'social-script', icon: 'document-text', title: 'Scripts', color: '#3B82F6' },
      { id: 'body-double', icon: 'people', title: 'Body Double', color: '#8B5CF6' },
      { id: 'routine-builder', icon: 'calendar', title: 'Routines', color: '#EC4899' },
      { id: 'emotion-cards', icon: 'images', title: 'Cards', color: '#FBBF24' },
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
    // Tab-based tools
    if (id === 'talk') return router.push('/(tabs)/talk');
    // Modal-based tools with direct routes
    const modalRoutes: Record<string, string> = {
      'journal': '/(modals)/new-journal',
      'referee': '/(modals)/referee',
      'replay': '/(modals)/replay',
      'decode': '/(modals)/decode',
      'relate': '/(modals)/relate',
      'love': '/(modals)/love',
      'help-someone': '/(modals)/help-someone',
      'role-play': '/(modals)/role-play',
      'prompt-generator': '/(modals)/prompt-generator',
      'mood-checkin': '/(modals)/mood-checkin',
      'cockpit-checkin': '/(modals)/cockpit-checkin',
      'mood-patterns': '/(modals)/patterns',
      'learning-style-quiz': '/(modals)/learning-style-quiz',
    };
    if (modalRoutes[id]) {
      return router.push(modalRoutes[id] as any);
    }
    // Activity-based tools (breathing, body-scan, emotion-wheel, etc.)
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
              {/* Hero Intro */}
              <View style={styles.heroCard}>
                <Text style={styles.heroTitle}>{GAUGE_SYSTEM_INTRO.headline}</Text>
                <Text style={styles.heroSubtitle}>{GAUGE_SYSTEM_INTRO.subhead}</Text>
                
                {/* Disciplines Row */}
                <View style={styles.disciplinesRow}>
                  {DISCIPLINES.map((d) => (
                    <View key={d.id} style={styles.disciplineChip}>
                      <Text style={styles.disciplineEmoji}>{d.emoji}</Text>
                      <Text style={styles.disciplineName}>{d.name}</Text>
                    </View>
                  ))}
                </View>
                
                <Text style={styles.heroDepthText}>
                  Everything here comes from real research — psychology, neuroscience, sociology, and more. 
                  Tap any gauge to go deeper. It's all here when you're ready.
                </Text>
              </View>

              {/* Gauge Cards */}
              {GAUGES.map((gauge) => {
                const isExpanded = expandedGaugeId === gauge.id;
                const gaugeInsights = getInsightsForGauge(gauge.id as GaugeType);
                const relevantSources = ACADEMIC_SOURCES.filter(s => s.primaryGauge === gauge.id);
                
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
                        
                        {/* Academic Sources */}
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
                        
                        {/* Key Insights Preview */}
                        {gaugeInsights.length > 0 && (
                          <View style={styles.insightsPreview}>
                            <Text style={styles.insightsPreviewTitle}>💡 Key Insights</Text>
                            {gaugeInsights.slice(0, 2).map((insight) => (
                              <Text key={insight.id} style={styles.insightPreviewItem}>• {insight.title}</Text>
                            ))}
                          </View>
                        )}
                        
                        {/* Learn More Button */}
                        <Pressable 
                          style={styles.gaugeLearnMoreBtn}
                          onPress={() => openGaugeDetail(gauge.id)}
                        >
                          <Text style={styles.gaugeLearnMoreText}>Go Deeper →</Text>
                        </Pressable>
                      </View>
                    )}
                  </Pressable>
                );
              })}
              
              {/* Self InGauged Card */}
              <View style={styles.selfIngaugedCard}>
                <Text style={styles.selfIngaugedTitle}>🎯 {SELF_INGAUGED.title}</Text>
                <Text style={styles.selfIngaugedText}>{SELF_INGAUGED.meaning}</Text>
                <View style={styles.selfIngaugedDivider} />
                <Text style={styles.selfIngaugedTagline}>{SELF_INGAUGED.theMovement.tagline}</Text>
              </View>
            </View>
          )}

          {/* ═══════════════════════════════════════════════════════════
              MANUAL TAB
              ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'manual' && (
            <View>
              {/* Search Bar */}
              <ManualSearch />
              
              {/* Manual Intro */}
              <View style={styles.manualIntroCard}>
                <Text style={styles.manualIntroTitle}>The Human Manual</Text>
                <Text style={styles.manualIntroText}>
                  This isn't self-help fluff. These 48 lessons distill real research into knowledge you can actually use.
                </Text>
                <View style={styles.manualSourcesRow}>
                  <Ionicons name="library-outline" size={16} color={COLORS.textMuted} />
                  <Text style={styles.manualSourcesText}>
                    Grounded in psychology, neuroscience, sociology, and more
                  </Text>
                </View>
              </View>

              {/* Contextual Suggestions based on gauge state */}
              <SuggestedLessons />

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
                              router.push(`/lesson/${lesson.id}`);
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
                    {isExpanded && (
                      <ShareInsight
                        content={buildDiscoveryShareContent(discovery)}
                        trigger={(onPress) => (
                          <Pressable
                            style={styles.discoveryShareBtn}
                            onPress={(e) => {
                              e.stopPropagation();
                              onPress();
                            }}
                          >
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
