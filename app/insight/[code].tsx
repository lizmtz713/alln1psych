/**
 * Shared Insight Page
 * 
 * Public-facing page for viewing shared insights.
 * Works without the app - mobile-optimized web experience.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// Fortune 500 Design System
const COLORS = {
  // Backgrounds
  bg: '#0A0A0F',
  card: '#111116',
  cardElevated: '#16161D',
  cardAccent: '#1A1A24',
  
  // Borders
  border: 'rgba(255,255,255,0.06)',
  borderAccent: 'rgba(124,77,255,0.2)',
  
  // Text hierarchy
  text: '#FAFAFA',
  textPrimary: '#F5F5F7',
  textSecondary: '#94949F',
  textMuted: '#5C5C6A',
  
  // Brand
  accent: '#7C4DFF',
  accentLight: '#9E7AFF',
  accentSoft: 'rgba(124,77,255,0.08)',
  accentGlow: 'rgba(124,77,255,0.12)',
  
  // Semantic
  success: '#34D399',
  successSoft: 'rgba(52,211,153,0.1)',
  
  // Gradients (defined as arrays for LinearGradient)
  gradientPrimary: ['#7C4DFF', '#9E7AFF'],
  gradientSubtle: ['rgba(124,77,255,0.15)', 'rgba(124,77,255,0.05)'],
};

interface SharedInsight {
  title: string;
  summary: string;
  keyPoints?: string[];
  deepContent?: string;
  science?: string;
  realWorldExamples?: string[];
  tryThis?: string;
  sourceLabel: string;
  senderName: string;
  senderContext?: string;
  recipientType?: string;
  insightType: string;
  createdAt: string;
  // New: gauge connections and academic sources
  connectedGauges?: string[];
  academicSources?: { author: string; insight: string }[];
}

// Gauge info for the CTA
const GAUGE_INFO = [
  { id: 'body', emoji: '🫀', name: 'Body', desc: 'Physical state' },
  { id: 'state', emoji: '⚡', name: 'State', desc: 'Nervous system' },
  { id: 'emotion', emoji: '💜', name: 'Emotion', desc: 'What you feel' },
  { id: 'connection', emoji: '💙', name: 'Connection', desc: 'Relationships' },
  { id: 'direction', emoji: '🧭', name: 'Direction', desc: 'Where you\'re going' },
  { id: 'alignment', emoji: '✨', name: 'Alignment', desc: 'Living your values' },
];

const QUICK_RESPONSES = [
  { type: 'relate', emoji: '💜', label: 'I relate to this' },
  { type: 'helped', emoji: '🙏', label: 'This helped me understand' },
  { type: 'different', emoji: '🤔', label: 'I see it differently' },
  { type: 'talk', emoji: '💬', label: "Let's talk about this" },
];

export default function SharedInsightPage() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insight, setInsight] = useState<SharedInsight | null>(null);
  
  const [showDeepContent, setShowDeepContent] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [showScience, setShowScience] = useState(false);
  
  const [responded, setResponded] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [writtenResponse, setWrittenResponse] = useState('');
  const [responderName, setResponderName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInsight();
  }, [code]);

  const fetchInsight = async () => {
    if (!code) {
      setError('Invalid link');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/share-insight/${code}`
      );
      
      if (response.status === 404) {
        setError('This insight was not found. The link may be invalid.');
        setLoading(false);
        return;
      }
      
      if (response.status === 410) {
        setError('This link has expired.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load insight');
      }

      const data = await response.json();
      setInsight(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickResponse = (type: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedResponse(type);
  };

  const submitResponse = async () => {
    if (!selectedResponse && !writtenResponse.trim()) return;
    
    setSubmitting(true);
    
    try {
      await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/share-insight/respond`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shortCode: code,
            responseType: writtenResponse.trim() ? 'written' : selectedResponse,
            responseText: writtenResponse.trim() || undefined,
            responderName: responderName.trim() || undefined,
          }),
        }
      );
      
      setResponded(true);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      console.error('Response error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadApp = () => {
    // TODO: Replace with actual app store links
    Linking.openURL('https://getingauge.com');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Loading insight...</Text>
      </View>
    );
  }

  if (error || !insight) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.errorEmoji}>😔</Text>
        <Text style={styles.errorTitle}>Oops</Text>
        <Text style={styles.errorText}>{error || 'Something went wrong'}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
    >
      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: WHO SHARED THIS
          Visual: Avatar + personal context, warm entry point
          ═══════════════════════════════════════════════════════════ */}
      <View style={styles.heroSection}>
        <View style={styles.heroTop}>
          <View style={styles.logoPill}>
            <LinearGradient
              colors={['#7C4DFF', '#9E7AFF']}
              style={styles.logoDot}
            />
            <Text style={styles.logoText}>InGauge</Text>
          </View>
        </View>
        
        <View style={styles.senderRow}>
          <LinearGradient
            colors={['#7C4DFF', '#9E7AFF']}
            style={styles.senderAvatar}
          >
            <Text style={styles.senderInitial}>
              {insight.senderName.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
          <View style={styles.senderMeta}>
            <Text style={styles.senderName}>{insight.senderName}</Text>
            <Text style={styles.senderAction}>shared an insight with you</Text>
          </View>
        </View>

        {insight.senderContext && (
          <View style={styles.contextCard}>
            <View style={styles.contextQuote}>
              <Text style={styles.contextQuoteMark}>"</Text>
            </View>
            <Text style={styles.contextText}>{insight.senderContext}</Text>
          </View>
        )}
      </View>

      {/* Visual divider */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <View style={styles.dividerDot} />
        <View style={styles.dividerLine} />
      </View>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: THE INSIGHT
          Visual: Large title, scannable content
          ═══════════════════════════════════════════════════════════ */}
      <View style={styles.insightSection}>
        <Text style={styles.sourceLabel}>{insight.sourceLabel}</Text>
        <Text style={styles.insightTitle}>{insight.title}</Text>
        <Text style={styles.insightSummary}>{insight.summary}</Text>
      </View>

      {/* Key Takeaways - Visual cards */}
      {insight.keyPoints && insight.keyPoints.length > 0 && (
        <View style={styles.takeawaysSection}>
          <Text style={styles.sectionLabel}>KEY TAKEAWAYS</Text>
          {insight.keyPoints.slice(0, 4).map((point, i) => (
            <View key={i} style={styles.takeawayCard}>
              <View style={styles.takeawayNumber}>
                <Text style={styles.takeawayNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.takeawayText}>{point}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Try This - Action card */}
      {insight.tryThis && (
        <View style={styles.actionCard}>
          <LinearGradient
            colors={['rgba(124,77,255,0.1)', 'rgba(124,77,255,0.02)']}
            style={styles.actionGradient}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="flash" size={20} color={COLORS.accent} />
            </View>
            <Text style={styles.actionLabel}>TRY THIS</Text>
            <Text style={styles.actionText}>{insight.tryThis}</Text>
          </LinearGradient>
        </View>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: GO DEEPER (Expandable)
          Visual: Clean accordions with icons
          ═══════════════════════════════════════════════════════════ */}
      {(insight.deepContent || insight.realWorldExamples || insight.science) && (
        <View style={styles.deeperSection}>
          <Text style={styles.sectionLabel}>EXPLORE MORE</Text>
          
          {insight.deepContent && (
            <View style={styles.accordionWrap}>
              <Pressable
                style={[styles.accordion, showDeepContent && styles.accordionOpen]}
                onPress={() => setShowDeepContent(!showDeepContent)}
              >
                <View style={styles.accordionLeft}>
                  <View style={styles.accordionIcon}>
                    <Ionicons name="layers-outline" size={18} color={COLORS.accent} />
                  </View>
                  <Text style={styles.accordionTitle}>Go Deeper</Text>
                </View>
                <Ionicons 
                  name={showDeepContent ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={COLORS.textMuted} 
                />
              </Pressable>
              {showDeepContent && (
                <View style={styles.accordionContent}>
                  <Text style={styles.accordionText}>{insight.deepContent}</Text>
                </View>
              )}
            </View>
          )}

          {insight.realWorldExamples && insight.realWorldExamples.length > 0 && (
            <View style={styles.accordionWrap}>
              <Pressable
                style={[styles.accordion, showExamples && styles.accordionOpen]}
                onPress={() => setShowExamples(!showExamples)}
              >
                <View style={styles.accordionLeft}>
                  <View style={styles.accordionIcon}>
                    <Ionicons name="people-outline" size={18} color={COLORS.accent} />
                  </View>
                  <Text style={styles.accordionTitle}>Real Stories</Text>
                </View>
                <Ionicons 
                  name={showExamples ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={COLORS.textMuted} 
                />
              </Pressable>
              {showExamples && (
                <View style={styles.accordionContent}>
                  {insight.realWorldExamples.map((example, i) => (
                    <View key={i} style={styles.storyCard}>
                      <Text style={styles.storyText}>{example}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {insight.science && (
            <View style={styles.accordionWrap}>
              <Pressable
                style={[styles.accordion, showScience && styles.accordionOpen]}
                onPress={() => setShowScience(!showScience)}
              >
                <View style={styles.accordionLeft}>
                  <View style={styles.accordionIcon}>
                    <Ionicons name="flask-outline" size={18} color={COLORS.accent} />
                  </View>
                  <Text style={styles.accordionTitle}>The Research</Text>
                </View>
                <Ionicons 
                  name={showScience ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={COLORS.textMuted} 
                />
              </Pressable>
              {showScience && (
                <View style={styles.accordionContent}>
                  <Text style={styles.accordionText}>{insight.science}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4: YOUR GAUGES
          Visual: Actual gauge meters, compelling CTA
          ═══════════════════════════════════════════════════════════ */}
      <View style={styles.gaugeSection}>
        <LinearGradient
          colors={['rgba(124,77,255,0.12)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gaugeGlow}
        />
        
        <Text style={styles.gaugeSectionTitle}>This insight connects to</Text>
        
        <View style={styles.gaugeVisual}>
          {/* Visual gauge meters */}
          <View style={styles.gaugeRow}>
            {GAUGE_INFO.slice(0, 3).map((gauge, i) => (
              <View key={gauge.id} style={styles.gaugeMeter}>
                <View style={styles.gaugeMeterRing}>
                  <LinearGradient
                    colors={['#7C4DFF', '#9E7AFF']}
                    style={styles.gaugeMeterFill}
                  />
                  <View style={styles.gaugeMeterInner}>
                    <Text style={styles.gaugeMeterEmoji}>{gauge.emoji}</Text>
                  </View>
                </View>
                <Text style={styles.gaugeMeterLabel}>{gauge.name}</Text>
              </View>
            ))}
          </View>
          <View style={styles.gaugeRow}>
            {GAUGE_INFO.slice(3, 6).map((gauge, i) => (
              <View key={gauge.id} style={styles.gaugeMeter}>
                <View style={[styles.gaugeMeterRing, styles.gaugeMeterRingDim]}>
                  <View style={styles.gaugeMeterInner}>
                    <Text style={[styles.gaugeMeterEmoji, styles.gaugeMeterEmojiDim]}>{gauge.emoji}</Text>
                  </View>
                </View>
                <Text style={[styles.gaugeMeterLabel, styles.gaugeMeterLabelDim]}>{gauge.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.gaugeHook}>
          <Text style={styles.gaugeHookTitle}>Your Human Dashboard</Text>
          <Text style={styles.gaugeHookText}>
            6 gauges. 48 lessons. One system to understand yourself and others.
          </Text>
        </View>

        <Pressable style={styles.gaugeCta} onPress={handleDownloadApp}>
          <LinearGradient
            colors={['#7C4DFF', '#9E7AFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gaugeCtaGradient}
          >
            <Text style={styles.gaugeCtaText}>Check Your Gauges</Text>
            <View style={styles.gaugeCtaArrow}>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </View>
          </LinearGradient>
        </Pressable>
      </View>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5: THE SCIENCE
          Visual: Citation cards with academic credibility
          ═══════════════════════════════════════════════════════════ */}
      {insight.academicSources && insight.academicSources.length > 0 && (
        <View style={styles.scienceSection}>
          <View style={styles.scienceHeader}>
            <View style={styles.scienceIcon}>
              <Ionicons name="school-outline" size={20} color={COLORS.accent} />
            </View>
            <View>
              <Text style={styles.scienceTitle}>Based on Research</Text>
              <Text style={styles.scienceSubtitle}>Peer-reviewed psychology</Text>
            </View>
          </View>
          
          <View style={styles.citationList}>
            {insight.academicSources.slice(0, 3).map((source, i) => (
              <View key={i} style={styles.citationCard}>
                <View style={styles.citationLine} />
                <Text style={styles.citationText}>{source.insight}</Text>
                <Text style={styles.citationAuthor}>{source.author}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION 6: YOUR RESPONSE
          Visual: Clean cards, easy interaction
          ═══════════════════════════════════════════════════════════ */}
      <View style={styles.responseSection}>
        <View style={styles.responseDivider} />
        
        {responded ? (
          <View style={styles.respondedState}>
            <View style={styles.respondedCheck}>
              <Ionicons name="checkmark" size={28} color="#fff" />
            </View>
            <Text style={styles.respondedTitle}>Response sent</Text>
            <Text style={styles.respondedText}>
              {insight.senderName} will see that you engaged.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.responseTitle}>How did this land?</Text>
            <Text style={styles.responseSubtitle}>
              Let {insight.senderName} know
            </Text>

            {/* Quick response grid */}
            <View style={styles.responseGrid}>
              {QUICK_RESPONSES.map((resp) => (
                <Pressable
                  key={resp.type}
                  style={[
                    styles.responseCard,
                    selectedResponse === resp.type && styles.responseCardSelected,
                  ]}
                  onPress={() => handleQuickResponse(resp.type)}
                >
                  <Text style={styles.responseCardEmoji}>{resp.emoji}</Text>
                  <Text style={[
                    styles.responseCardLabel,
                    selectedResponse === resp.type && styles.responseCardLabelSelected,
                  ]}>
                    {resp.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Written response */}
            <View style={styles.writeSection}>
              <Text style={styles.writeLabel}>Or share your thoughts</Text>
              <TextInput
                style={styles.writeInput}
                placeholder="What came up for you?"
                placeholderTextColor={COLORS.textMuted}
                value={writtenResponse}
                onChangeText={setWrittenResponse}
                multiline
              />
              <TextInput
                style={styles.nameInput}
                placeholder="Your name (optional)"
                placeholderTextColor={COLORS.textMuted}
                value={responderName}
                onChangeText={setResponderName}
              />
            </View>

            {/* Submit */}
            <Pressable
              style={[
                styles.submitBtn,
                (!selectedResponse && !writtenResponse.trim()) && styles.submitBtnDisabled,
              ]}
              onPress={submitResponse}
              disabled={(!selectedResponse && !writtenResponse.trim()) || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="send" size={18} color="#fff" />
                  <Text style={styles.submitBtnText}>Send to {insight.senderName}</Text>
                </>
              )}
            </Pressable>

            <Text style={styles.privacyNote}>
              No account needed • Response is private
            </Text>
          </>
        )}
      </View>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER: App promo + branding
          Visual: Clean, minimal, premium
          ═══════════════════════════════════════════════════════════ */}
      <View style={styles.footer}>
        <LinearGradient
          colors={['transparent', 'rgba(124,77,255,0.04)']}
          style={styles.footerGradient}
        >
          <View style={styles.footerContent}>
            <View style={styles.footerBrand}>
              <LinearGradient
                colors={['#7C4DFF', '#9E7AFF']}
                style={styles.footerLogo}
              />
              <Text style={styles.footerName}>InGauge</Text>
            </View>
            <Text style={styles.footerTagline}>The Human Cockpit</Text>
            <Text style={styles.footerDesc}>
              48 lessons • 6 gauges • AI-powered insights
            </Text>
            
            <Pressable style={styles.footerCta} onPress={handleDownloadApp}>
              <Text style={styles.footerCtaText}>Get the app free →</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // ═══════════════════════════════════════════════════════════
  // BASE
  // ═══════════════════════════════════════════════════════════
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: { justifyContent: 'center', alignItems: 'center' },
  content: { paddingHorizontal: 24, paddingBottom: 20 },
  
  loadingText: { color: COLORS.textSecondary, fontSize: 15, marginTop: 24 },
  errorEmoji: { fontSize: 56, marginBottom: 24, opacity: 0.7 },
  errorTitle: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '700', marginBottom: 12 },
  errorText: { color: COLORS.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 23, paddingHorizontal: 32 },
  
  // ═══════════════════════════════════════════════════════════
  // SECTION 1: HERO / SENDER
  // ═══════════════════════════════════════════════════════════
  heroSection: { marginBottom: 8 },
  heroTop: { alignItems: 'center', paddingVertical: 20 },
  logoPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.card, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  logoDot: { width: 20, height: 20, borderRadius: 6 },
  logoText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  
  senderRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  senderAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  senderInitial: { color: '#fff', fontSize: 22, fontWeight: '600' },
  senderMeta: { flex: 1 },
  senderName: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '600', marginBottom: 2 },
  senderAction: { color: COLORS.textMuted, fontSize: 14 },
  
  contextCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 20, flexDirection: 'row', gap: 8 },
  contextQuote: { },
  contextQuoteMark: { color: COLORS.accent, fontSize: 40, fontWeight: '300', lineHeight: 36, opacity: 0.6 },
  contextText: { flex: 1, color: COLORS.textPrimary, fontSize: 16, lineHeight: 25, fontStyle: 'italic' },
  
  // Visual divider
  divider: { flexDirection: 'row', alignItems: 'center', paddingVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.accent, marginHorizontal: 16 },
  
  // ═══════════════════════════════════════════════════════════
  // SECTION 2: THE INSIGHT
  // ═══════════════════════════════════════════════════════════
  insightSection: { marginBottom: 28 },
  sourceLabel: { color: COLORS.accent, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 },
  insightTitle: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '700', lineHeight: 36, letterSpacing: -0.5, marginBottom: 16 },
  insightSummary: { color: COLORS.textSecondary, fontSize: 17, lineHeight: 28 },
  
  // Takeaways
  takeawaysSection: { marginBottom: 24 },
  sectionLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 },
  takeawayCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 10 },
  takeawayNumber: { width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.accentSoft, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  takeawayNumberText: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },
  takeawayText: { flex: 1, color: COLORS.textPrimary, fontSize: 15, lineHeight: 23 },
  
  // Action card
  actionCard: { marginBottom: 24, borderRadius: 16, overflow: 'hidden' },
  actionGradient: { padding: 20 },
  actionIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  actionLabel: { color: COLORS.accent, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  actionText: { color: COLORS.textPrimary, fontSize: 16, lineHeight: 25 },
  
  // ═══════════════════════════════════════════════════════════
  // SECTION 3: GO DEEPER (Accordions)
  // ═══════════════════════════════════════════════════════════
  deeperSection: { marginBottom: 24 },
  accordionWrap: { marginBottom: 8 },
  accordion: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.card, borderRadius: 14, padding: 16 },
  accordionOpen: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  accordionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  accordionIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.accentSoft, alignItems: 'center', justifyContent: 'center' },
  accordionTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  accordionContent: { backgroundColor: COLORS.cardElevated, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, padding: 20 },
  accordionText: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 25 },
  storyCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 10 },
  storyText: { color: COLORS.textPrimary, fontSize: 14, lineHeight: 22 },
  
  // ═══════════════════════════════════════════════════════════
  // SECTION 4: GAUGE METERS
  // ═══════════════════════════════════════════════════════════
  gaugeSection: { backgroundColor: COLORS.card, borderRadius: 24, padding: 28, marginBottom: 24, overflow: 'hidden' },
  gaugeGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 160 },
  gaugeSectionTitle: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginBottom: 24 },
  
  gaugeVisual: { marginBottom: 24 },
  gaugeRow: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 16 },
  gaugeMeter: { alignItems: 'center' },
  gaugeMeterRing: { width: 64, height: 64, borderRadius: 32, padding: 3, marginBottom: 8 },
  gaugeMeterRingDim: { opacity: 0.4 },
  gaugeMeterFill: { width: '100%', height: '100%', borderRadius: 30 },
  gaugeMeterInner: { position: 'absolute', top: 3, left: 3, right: 3, bottom: 3, borderRadius: 28, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  gaugeMeterEmoji: { fontSize: 24 },
  gaugeMeterEmojiDim: { opacity: 0.5 },
  gaugeMeterLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' },
  gaugeMeterLabelDim: { opacity: 0.5 },
  
  gaugeHook: { alignItems: 'center', marginBottom: 20 },
  gaugeHookTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  gaugeHookText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center' },
  
  gaugeCta: { borderRadius: 14, overflow: 'hidden' },
  gaugeCtaGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  gaugeCtaText: { color: '#fff', fontSize: 16, fontWeight: '600', marginRight: 8 },
  gaugeCtaArrow: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  
  // ═══════════════════════════════════════════════════════════
  // SECTION 5: SCIENCE / CITATIONS
  // ═══════════════════════════════════════════════════════════
  scienceSection: { marginBottom: 24 },
  scienceHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  scienceIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.accentSoft, alignItems: 'center', justifyContent: 'center' },
  scienceTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600' },
  scienceSubtitle: { color: COLORS.textMuted, fontSize: 13 },
  
  citationList: { },
  citationCard: { backgroundColor: COLORS.card, borderRadius: 14, padding: 18, marginBottom: 10, paddingLeft: 22 },
  citationLine: { position: 'absolute', left: 0, top: 18, bottom: 18, width: 3, backgroundColor: COLORS.accent, borderRadius: 2 },
  citationText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 8 },
  citationAuthor: { color: COLORS.textMuted, fontSize: 12, fontWeight: '500' },
  
  // ═══════════════════════════════════════════════════════════
  // SECTION 6: RESPONSE
  // ═══════════════════════════════════════════════════════════
  responseSection: { paddingTop: 8 },
  responseDivider: { height: 1, backgroundColor: COLORS.border, marginBottom: 32 },
  
  respondedState: { alignItems: 'center', paddingVertical: 48 },
  respondedCheck: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.success, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  respondedTitle: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '700', marginBottom: 8 },
  respondedText: { color: COLORS.textMuted, fontSize: 15 },
  
  responseTitle: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '700', marginBottom: 6 },
  responseSubtitle: { color: COLORS.textMuted, fontSize: 15, marginBottom: 24 },
  
  responseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  responseCard: { width: '48%', backgroundColor: COLORS.card, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  responseCardSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accentSoft },
  responseCardEmoji: { fontSize: 28, marginBottom: 8 },
  responseCardLabel: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center' },
  responseCardLabelSelected: { color: COLORS.accent, fontWeight: '500' },
  
  writeSection: { marginBottom: 20 },
  writeLabel: { color: COLORS.textMuted, fontSize: 13, marginBottom: 12 },
  writeInput: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, color: COLORS.textPrimary, fontSize: 15, minHeight: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  nameInput: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, color: COLORS.textPrimary, fontSize: 15, borderWidth: 1, borderColor: COLORS.border },
  
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: COLORS.accent, borderRadius: 14, padding: 18, marginBottom: 12 },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  privacyNote: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center' },
  
  // ═══════════════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════════════
  footer: { marginTop: 32 },
  footerGradient: { borderRadius: 24, paddingVertical: 48 },
  footerContent: { alignItems: 'center' },
  footerBrand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  footerLogo: { width: 24, height: 24, borderRadius: 8 },
  footerName: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '600' },
  footerTagline: { color: COLORS.textMuted, fontSize: 14, marginBottom: 8 },
  footerDesc: { color: COLORS.textMuted, fontSize: 13, marginBottom: 20 },
  footerCta: { paddingVertical: 12, paddingHorizontal: 24 },
  footerCtaText: { color: COLORS.accent, fontSize: 15, fontWeight: '600' },
});
