/**
 * Prompt Generator — AI prompts personalized to your full context
 * The killer feature: gives you exactly what to ask based on your gauges, history, and situation.
 */
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useCockpitStore } from '../../src/stores/cockpitStore';
import { useUserStore } from '../../src/stores/userStore';
import { useCircleStore } from '../../src/stores/circleStore';
import { useEngagementStore } from '../../src/stores/engagementStore';
import { sendMessageWithSystemPrompt, hasOpenAIKey } from '../../src/services/ai';

const ACCENT = COLORS.accent;

// Categories for prompt generation
const CATEGORIES = [
  { id: 'self', label: 'Understand myself', emoji: '🪞', desc: 'Based on your current gauges' },
  { id: 'relationship', label: 'Navigate a relationship', emoji: '💫', desc: 'Based on your Circle' },
  { id: 'decision', label: 'Make a decision', emoji: '🧭', desc: 'When you're stuck' },
  { id: 'emotion', label: 'Process an emotion', emoji: '💜', desc: 'Based on what you're feeling' },
  { id: 'growth', label: 'Personal growth', emoji: '🌱', desc: 'Based on your patterns' },
  { id: 'surprise', label: 'Surprise me', emoji: '✨', desc: 'Something unexpected' },
];

function buildContextSummary(
  user: ReturnType<typeof useUserStore.getState>,
  cockpit: ReturnType<typeof useCockpitStore.getState>,
  circle: ReturnType<typeof useCircleStore.getState>,
  engagement: ReturnType<typeof useEngagementStore.getState>
): string {
  const gaugeValues = {
    body: cockpit.body?.value ?? -1,
    state: cockpit.state?.value ?? -1,
    emotion: cockpit.emotion?.value ?? -1,
    connection: cockpit.connection?.value ?? -1,
    direction: cockpit.direction?.value ?? -1,
    alignment: cockpit.alignment?.value ?? -1,
  };
  
  const activeGauges = Object.entries(gaugeValues)
    .filter(([_, v]) => v >= 0)
    .map(([k, v]) => `${k}: ${v}/100`);
  
  const lowGauges = Object.entries(gaugeValues)
    .filter(([_, v]) => v >= 0 && v < 40)
    .map(([k]) => k);
  
  const circleNames = circle.members.map(m => `${m.name} (${m.relationship}, ${m.temperature})`);
  const strugglingContacts = circle.members.filter(m => m.temperature === 'red' || m.temperature === 'orange');
  
  return `USER CONTEXT:
- Name: ${user.name || 'Unknown'}
- Age group: ${user.ageGroup || 'Unknown'}
- Love language: ${user.loveLanguage || 'Unknown'}
- Current streak: ${engagement.streak} days

CURRENT GAUGES:
${activeGauges.length ? activeGauges.join('\n') : 'No check-ins yet'}
${lowGauges.length ? `\nLOW AREAS: ${lowGauges.join(', ')}` : ''}

CIRCLE:
${circleNames.length ? circleNames.join('\n') : 'No circle members'}
${strugglingContacts.length ? `\nNEEDING ATTENTION: ${strugglingContacts.map(m => m.name).join(', ')}` : ''}

SENSITIVE TOPICS: ${user.sensitiveTopics?.join(', ') || 'None specified'}`;
}

async function generatePrompts(
  category: string,
  context: string
): Promise<string[]> {
  const systemPrompt = `You are an expert at crafting introspective prompts that help people understand themselves.

Based on the user's current context, generate 5 powerful prompts they could explore with an AI companion or in their journal.

RULES:
- Make prompts SPECIFIC to their actual situation (reference their gauges, relationships, patterns)
- Don't be generic — use the context
- Each prompt should lead to genuine insight
- Vary the depth: some quick, some deep
- If they have low gauges, address those
- If they have struggling relationships, incorporate that
- Format: Return ONLY the 5 prompts, one per line, no numbers or bullets
- Keep each prompt under 100 characters

CATEGORY: ${category}

${context}`;

  const response = await sendMessageWithSystemPrompt(
    [{ role: 'user', content: `Generate 5 ${category} prompts for me based on my context.` }],
    systemPrompt
  );
  
  return response
    .split('\n')
    .map(p => p.trim())
    .filter(p => p.length > 10 && p.length < 150)
    .slice(0, 5);
}

export default function PromptGeneratorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const user = useUserStore();
  const cockpit = useCockpitStore();
  const circle = useCircleStore();
  const engagement = useEngagementStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  useEffect(() => {
    hasOpenAIKey().then(setHasKey);
  }, []);
  
  const handleSelectCategory = async (catId: string) => {
    if (!hasKey) {
      setError('Add your OpenAI API key in Settings to generate prompts.');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(catId);
    setPrompts([]);
    setError(null);
    setLoading(true);
    
    try {
      const context = buildContextSummary(user, cockpit, circle, engagement);
      const cat = CATEGORIES.find(c => c.id === catId);
      const generated = await generatePrompts(cat?.label || catId, context);
      setPrompts(generated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate prompts');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopyPrompt = async (prompt: string, index: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(prompt);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };
  
  const handleUsePrompt = (prompt: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to Talk with the prompt pre-filled
    router.push({
      pathname: '/(tabs)/talk',
      params: { initialMessage: prompt },
    });
  };
  
  const handleRefresh = () => {
    if (selectedCategory) {
      handleSelectCategory(selectedCategory);
    }
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Prompt Generator</Text>
        <View style={styles.headerRight}>
          {prompts.length > 0 && (
            <Pressable style={styles.refreshBtn} onPress={handleRefresh}>
              <Ionicons name="refresh" size={22} color={COLORS.text} />
            </Pressable>
          )}
        </View>
      </View>
      
      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!selectedCategory ? (
          <>
            <Text style={styles.intro}>
              Get AI prompts personalized to your gauges, relationships, and current situation.
            </Text>
            <Text style={styles.subtitle}>What do you want to explore?</Text>
            
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={({ pressed }) => [
                    styles.categoryCard,
                    pressed && styles.categoryCardPressed,
                  ]}
                  onPress={() => handleSelectCategory(cat.id)}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                  <Text style={styles.categoryDesc}>{cat.desc}</Text>
                </Pressable>
              ))}
            </View>
            
            {error && <Text style={styles.error}>{error}</Text>}
          </>
        ) : (
          <>
            <Pressable 
              style={styles.backToCategories} 
              onPress={() => {
                setSelectedCategory(null);
                setPrompts([]);
                setError(null);
              }}
            >
              <Ionicons name="arrow-back" size={18} color={COLORS.accent} />
              <Text style={styles.backToCategoriesText}>Choose different category</Text>
            </Pressable>
            
            <Text style={styles.selectedCategory}>
              {CATEGORIES.find(c => c.id === selectedCategory)?.emoji}{' '}
              {CATEGORIES.find(c => c.id === selectedCategory)?.label}
            </Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={ACCENT} />
                <Text style={styles.loadingText}>Generating prompts based on your context...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.error}>{error}</Text>
                <Pressable style={styles.retryBtn} onPress={handleRefresh}>
                  <Text style={styles.retryBtnText}>Try Again</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.promptList}>
                {prompts.map((prompt, i) => (
                  <View key={i} style={styles.promptCard}>
                    <Text style={styles.promptText}>{prompt}</Text>
                    <View style={styles.promptActions}>
                      <Pressable 
                        style={styles.promptAction}
                        onPress={() => handleCopyPrompt(prompt, i)}
                      >
                        <Ionicons 
                          name={copiedIndex === i ? 'checkmark' : 'copy-outline'} 
                          size={18} 
                          color={copiedIndex === i ? COLORS.success : COLORS.textSecondary} 
                        />
                        <Text style={[
                          styles.promptActionText,
                          copiedIndex === i && { color: COLORS.success }
                        ]}>
                          {copiedIndex === i ? 'Copied' : 'Copy'}
                        </Text>
                      </Pressable>
                      <Pressable 
                        style={[styles.promptAction, styles.promptActionPrimary]}
                        onPress={() => handleUsePrompt(prompt)}
                      >
                        <Ionicons name="chatbubble" size={18} color="#fff" />
                        <Text style={styles.promptActionTextPrimary}>Ask Psych</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  headerRight: { width: 40, alignItems: 'flex-end' },
  refreshBtn: { padding: 8 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  intro: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  categoryGrid: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  categoryEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  categoryDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  backToCategories: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  backToCategoriesText: {
    fontSize: 15,
    color: COLORS.accent,
  },
  selectedCategory: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  error: {
    fontSize: 15,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: BORDER_RADIUS.button,
  },
  retryBtnText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '600',
  },
  promptList: {
    gap: 16,
  },
  promptCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  promptText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: 12,
  },
  promptActions: {
    flexDirection: 'row',
    gap: 12,
  },
  promptAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.button,
    backgroundColor: COLORS.inputSurface,
  },
  promptActionPrimary: {
    backgroundColor: ACCENT,
    flex: 1,
    justifyContent: 'center',
  },
  promptActionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  promptActionTextPrimary: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});
