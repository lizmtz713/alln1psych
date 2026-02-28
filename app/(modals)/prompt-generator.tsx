/**
 * Prompt Generator — Your personal context layer for ANY AI
 * 
 * InGauge knows you: your gauges, culture, age, values, struggles, communication style.
 * This tool injects that context into prompts so ANY AI can serve you better.
 * 
 * You say what you need → We generate a rich, personalized prompt → You paste it into ChatGPT/Claude/etc.
 */
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import { useCockpitStore } from '../../src/stores/cockpitStore';
import { useUserStore } from '../../src/stores/userStore';
import { useEngagementStore } from '../../src/stores/engagementStore';
import { getGaugeColor, getGaugeStatusLabel, GAUGE_CONFIG } from '../../src/utils/gaugeHelpers';

const ACCENT = COLORS.accent;

// Quick-start templates
const TEMPLATES = [
  { id: 'essay', label: 'Write an essay', emoji: '📝', placeholder: 'Topic: ' },
  { id: 'email', label: 'Draft an email', emoji: '✉️', placeholder: 'Email about: ' },
  { id: 'advice', label: 'Get advice', emoji: '💡', placeholder: 'I need advice on: ' },
  { id: 'explain', label: 'Explain something', emoji: '🎓', placeholder: 'Explain: ' },
  { id: 'create', label: 'Creative writing', emoji: '✨', placeholder: 'Create: ' },
  { id: 'plan', label: 'Make a plan', emoji: '📋', placeholder: 'Plan for: ' },
  { id: 'custom', label: 'Something else', emoji: '🔧', placeholder: 'I need help with: ' },
];

function getGaugeDescription(name: string, value: number): string {
  if (value < 0) return '';
  if (value < 30) return `very low ${name}`;
  if (value < 50) return `low ${name}`;
  if (value < 70) return `moderate ${name}`;
  if (value < 85) return `good ${name}`;
  return `high ${name}`;
}

function buildContextBlock(user: ReturnType<typeof useUserStore.getState>, cockpit: ReturnType<typeof useCockpitStore.getState>): string {
  const lines: string[] = [];
  
  // Age & life stage
  if (user.ageGroup) {
    const ageLabels: Record<string, string> = {
      'under-18': "I'm a teenager (under 18)",
      '18-25': "I'm a young adult (18-25), navigating early adulthood",
      '26-40': "I'm an adult (26-40), in my career/family building years",
      '41-60': "I'm in midlife (41-60), experienced with life transitions",
      '60+': "I'm a senior (60+), with decades of life experience",
    };
    lines.push(ageLabels[user.ageGroup] || '');
  }
  
  // Cultural background
  if (user.culturalBackground?.length) {
    lines.push(`My cultural background: ${user.culturalBackground.join(', ')}`);
  }
  if (user.environmentUpbringing) {
    lines.push(`I grew up in a ${user.environmentUpbringing} environment`);
  }
  if (user.culturalValues?.length) {
    lines.push(`Values important to me: ${user.culturalValues.join(', ')}`);
  }
  
  // Communication style
  if (user.communicationPreference) {
    const commStyles: Record<string, string> = {
      direct: 'I prefer direct, straightforward communication',
      gentle: 'I prefer gentle, supportive communication',
      analytical: 'I prefer analytical, detailed explanations',
      casual: 'I prefer casual, conversational tone',
    };
    lines.push(commStyles[user.communicationPreference] || '');
  }
  
  // Love language (how I process/receive)
  if (user.loveLanguage) {
    const loveDesc: Record<string, string> = {
      words: 'I respond well to words of affirmation and encouragement',
      acts: 'I appreciate practical help and actionable steps',
      gifts: 'I value thoughtful examples and resources',
      time: 'I appreciate thorough, unhurried explanations',
      touch: 'I connect through warmth and emotional presence in responses',
    };
    lines.push(loveDesc[user.loveLanguage] || '');
  }
  
  // Current state from gauges
  const gauges = {
    body: cockpit.body?.value ?? -1,
    state: cockpit.state?.value ?? -1,
    emotion: cockpit.emotion?.value ?? -1,
    connection: cockpit.connection?.value ?? -1,
    direction: cockpit.direction?.value ?? -1,
    alignment: cockpit.alignment?.value ?? -1,
  };
  
  const activeGauges = Object.entries(gauges).filter(([_, v]) => v >= 0);
  if (activeGauges.length > 0) {
    const stateDescriptions: string[] = [];
    
    if (gauges.body >= 0) {
      if (gauges.body < 40) stateDescriptions.push("I'm physically tired/low energy");
      else if (gauges.body >= 70) stateDescriptions.push("I'm feeling physically good");
    }
    
    if (gauges.state >= 0) {
      if (gauges.state < 40) stateDescriptions.push("I'm feeling stressed/anxious right now");
      else if (gauges.state >= 70) stateDescriptions.push("I'm in a calm, regulated state");
    }
    
    if (gauges.emotion >= 0) {
      if (gauges.emotion < 40) stateDescriptions.push("I'm emotionally struggling today");
      else if (gauges.emotion >= 70) stateDescriptions.push("I'm emotionally balanced");
    }
    
    if (gauges.direction >= 0) {
      if (gauges.direction < 40) {
        stateDescriptions.push("I'm feeling lost/uncertain about direction");
        stateDescriptions.push("(Awe experiences — looking at something vast — might help shift my perspective)");
      }
    }
    
    if (stateDescriptions.length > 0) {
      lines.push(`Current state: ${stateDescriptions.join('. ')}`);
    }
  }
  
  // Sensitive topics to be aware of
  if (user.sensitiveTopics?.length && !user.sensitiveTopics.includes('none')) {
    lines.push(`Please be thoughtful about: ${user.sensitiveTopics.join(', ')}`);
  }
  
  return lines.filter(l => l.trim()).join('. ') + '.';
}

function generateEnhancedPrompt(task: string, context: string, template: string): string {
  // Build the enhanced prompt
  let prompt = '';
  
  // Start with the task
  prompt += task.trim();
  
  // Add context block
  prompt += '\n\n---\nABOUT ME (for better, personalized responses):\n';
  prompt += context;
  
  // Add guidance based on template type
  prompt += '\n\n---\nGUIDANCE:\n';
  
  switch (template) {
    case 'essay':
      prompt += '- Break this into clear sections I can tackle one at a time\n';
      prompt += '- Match the tone to my background and communication style\n';
      prompt += '- If I seem stressed, keep explanations simple and encouraging';
      break;
    case 'email':
      prompt += '- Match my communication style (see above)\n';
      prompt += '- Keep it professional but authentic to who I am\n';
      prompt += '- If I seem stressed, help me be clear without being terse';
      break;
    case 'advice':
      prompt += '- Consider my cultural background and values\n';
      prompt += '- Account for my current emotional state\n';
      prompt += '- Give advice that fits WHO I am, not generic advice';
      break;
    case 'explain':
      prompt += '- Adjust complexity to my current mental state\n';
      prompt += '- Use examples that resonate with my background\n';
      prompt += '- If I\'m stressed, break into smaller chunks';
      break;
    case 'create':
      prompt += '- Let my background and values inspire the creative direction\n';
      prompt += '- Match the emotional tone to where I am right now\n';
      prompt += '- Make it feel authentic to who I am';
      break;
    case 'plan':
      prompt += '- Account for my energy level when suggesting timelines\n';
      prompt += '- Make steps manageable given my current state\n';
      prompt += '- Align the plan with my values and communication style';
      break;
    default:
      prompt += '- Tailor your response to my background and current state\n';
      prompt += '- Be mindful of my values and communication preferences\n';
      prompt += '- Adjust complexity based on my energy/stress level';
  }
  
  return prompt;
}

export default function PromptGeneratorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const user = useUserStore();
  const cockpit = useCockpitStore();
  
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [taskInput, setTaskInput] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showContext, setShowContext] = useState(false);
  
  const contextBlock = buildContextBlock(user, cockpit);
  
  const handleSelectTemplate = (templateId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTemplate(templateId);
    setGeneratedPrompt(null);
    setCopied(false);
    const template = TEMPLATES.find(t => t.id === templateId);
    if (template && template.id !== 'custom') {
      setTaskInput(template.placeholder);
    } else {
      setTaskInput('');
    }
  };
  
  const handleGenerate = () => {
    if (!taskInput.trim() || !selectedTemplate) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const prompt = generateEnhancedPrompt(taskInput, contextBlock, selectedTemplate);
    setGeneratedPrompt(prompt);
    setCopied(false);
  };
  
  const handleCopy = async () => {
    if (!generatedPrompt) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };
  
  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTemplate(null);
    setTaskInput('');
    setGeneratedPrompt(null);
    setCopied(false);
  };
  
  // Check if we have enough context
  const hasMinimalContext = user.name || user.ageGroup || (cockpit.body?.value ?? -1) >= 0;
  
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Prompt Generator</Text>
        <View style={styles.headerRight}>
          {generatedPrompt && (
            <Pressable style={styles.resetBtn} onPress={handleReset}>
              <Ionicons name="refresh" size={22} color={COLORS.text} />
            </Pressable>
          )}
        </View>
      </View>
      
      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!generatedPrompt ? (
          <>
            <Text style={styles.intro}>
              Generate prompts for ChatGPT, Claude, or any AI — enhanced with who you are.
            </Text>
            
            {/* Context preview */}
            <Pressable 
              style={styles.contextPreview}
              onPress={() => setShowContext(!showContext)}
            >
              <View style={styles.contextPreviewHeader}>
                <Text style={styles.contextPreviewTitle}>🧠 Your context</Text>
                <Ionicons 
                  name={showContext ? 'chevron-up' : 'chevron-down'} 
                  size={18} 
                  color={COLORS.textSecondary} 
                />
              </View>
              {showContext && (
                <Text style={styles.contextPreviewText}>{contextBlock || 'Complete your profile and check-ins to build your context.'}</Text>
              )}
              {!showContext && (
                <Text style={styles.contextPreviewHint}>
                  {hasMinimalContext 
                    ? 'Tap to see what AI will know about you' 
                    : 'Complete profile & check-ins for better results'}
                </Text>
              )}
            </Pressable>
            
            {!selectedTemplate ? (
              <>
                <Text style={styles.subtitle}>What do you need?</Text>
                <View style={styles.templateGrid}>
                  {TEMPLATES.map((t) => (
                    <Pressable
                      key={t.id}
                      style={({ pressed }) => [
                        styles.templateCard,
                        pressed && styles.templateCardPressed,
                      ]}
                      onPress={() => handleSelectTemplate(t.id)}
                    >
                      <Text style={styles.templateEmoji}>{t.emoji}</Text>
                      <Text style={styles.templateLabel}>{t.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : (
              <>
                <Pressable style={styles.backLink} onPress={handleReset}>
                  <Ionicons name="arrow-back" size={16} color={COLORS.accent} />
                  <Text style={styles.backLinkText}>Choose different type</Text>
                </Pressable>
                
                <Text style={styles.inputLabel}>
                  {TEMPLATES.find(t => t.id === selectedTemplate)?.emoji}{' '}
                  {TEMPLATES.find(t => t.id === selectedTemplate)?.label}
                </Text>
                
                <TextInput
                  style={styles.taskInput}
                  placeholder="Describe what you need..."
                  placeholderTextColor={COLORS.textMuted}
                  value={taskInput}
                  onChangeText={setTaskInput}
                  multiline
                  textAlignVertical="top"
                  autoFocus
                />
                
                <Pressable
                  style={[styles.generateBtn, !taskInput.trim() && styles.generateBtnDisabled]}
                  onPress={handleGenerate}
                  disabled={!taskInput.trim()}
                >
                  <Ionicons name="sparkles" size={20} color="#fff" />
                  <Text style={styles.generateBtnText}>Generate Enhanced Prompt</Text>
                </Pressable>
              </>
            )}
          </>
        ) : (
          <>
            <Text style={styles.resultTitle}>✨ Your Enhanced Prompt</Text>
            <Text style={styles.resultHint}>Copy this and paste it into ChatGPT, Claude, or any AI:</Text>
            
            <View style={styles.promptBox}>
              <ScrollView style={styles.promptScroll} nestedScrollEnabled>
                <Text style={styles.promptText}>{generatedPrompt}</Text>
              </ScrollView>
            </View>
            
            <Pressable
              style={[styles.copyBtn, copied && styles.copyBtnSuccess]}
              onPress={handleCopy}
            >
              <Ionicons 
                name={copied ? 'checkmark' : 'copy-outline'} 
                size={22} 
                color="#fff" 
              />
              <Text style={styles.copyBtnText}>
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </Text>
            </Pressable>
            
            <Pressable style={styles.newPromptBtn} onPress={handleReset}>
              <Text style={styles.newPromptBtnText}>Generate Another Prompt</Text>
            </Pressable>
            
            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>💡 Tip</Text>
              <Text style={styles.tipText}>
                The more you use InGauge (check-ins, profile info), the smarter your prompts become. Your context travels with you to any AI.
              </Text>
            </View>
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
  resetBtn: { padding: 8 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  intro: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 20,
  },
  contextPreview: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contextPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contextPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  contextPreviewHint: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  contextPreviewText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  templateCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  templateCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  templateEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  templateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  backLinkText: {
    fontSize: 14,
    color: COLORS.accent,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  taskInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 120,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  generateBtn: {
    backgroundColor: ACCENT,
    borderRadius: BORDER_RADIUS.button,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  generateBtnDisabled: {
    opacity: 0.5,
  },
  generateBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  resultHint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  promptBox: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.accent,
    marginBottom: 20,
    maxHeight: 300,
  },
  promptScroll: {
    maxHeight: 268,
  },
  promptText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  copyBtn: {
    backgroundColor: ACCENT,
    borderRadius: BORDER_RADIUS.button,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  copyBtnSuccess: {
    backgroundColor: COLORS.success,
  },
  copyBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  newPromptBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  newPromptBtnText: {
    fontSize: 15,
    color: COLORS.accent,
    fontWeight: '500',
  },
  tipBox: {
    backgroundColor: COLORS.accentBg,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  tipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
