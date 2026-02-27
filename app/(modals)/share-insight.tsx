/**
 * Share Insight Modal
 * 
 * "I learned something important. I want you to understand me better."
 * 
 * Share gauge readings, lessons, discoveries, or personology with loved ones.
 */
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Share,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../src/lib/constants';
import { useCockpitStore } from '../../src/stores/cockpitStore';
import { useUserStore } from '../../src/stores/userStore';
import { useCircleStore } from '../../src/stores/circleStore';
import {
  generateShareableInsight,
  createShareLink,
  sendToCircleMember,
  getInsightShareText,
  getShareMessageTemplate,
  type InsightType,
  type ShareableInsight,
} from '../../src/services/shareInsight';
import { DISCOVERIES, type Discovery } from '../../src/data/discoveries';
import ShareInsightCard from '../../src/components/ShareInsightCard';

// ============================================
// Types & Constants
// ============================================

type Step = 'select-type' | 'select-item' | 'add-note' | 'preview' | 'share-method' | 'success';

interface InsightOption {
  type: InsightType;
  emoji: string;
  title: string;
  description: string;
  available: boolean;
  unavailableReason?: string;
}

const SHARE_METHODS = [
  { id: 'text', icon: 'chatbubble-outline' as const, label: 'Text Message' },
  { id: 'email', icon: 'mail-outline' as const, label: 'Email' },
  { id: 'circle', icon: 'people-outline' as const, label: 'Circle Member' },
  { id: 'copy', icon: 'link-outline' as const, label: 'Copy Link' },
];

// ============================================
// Component
// ============================================

export default function ShareInsightScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Stores
  const cockpit = useCockpitStore();
  const userName = useUserStore((s) => s.name);
  const birthday = useUserStore((s) => s.birthday);
  const circleMembers = useCircleStore((s) => s.members);
  
  // State
  const [step, setStep] = useState<Step>('select-type');
  const [selectedType, setSelectedType] = useState<InsightType | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [context, setContext] = useState('');
  const [whySharing, setWhySharing] = useState('');
  const [personalNote, setPersonalNote] = useState('');
  const [insight, setInsight] = useState<ShareableInsight | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [selectedCircleMember, setSelectedCircleMember] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Pre-select from params if provided
  useEffect(() => {
    if (params.type && params.id) {
      setSelectedType(params.type as InsightType);
      setSelectedItemId(params.id as string);
      setStep('add-note');
    }
  }, [params.type, params.id]);
  
  // Check gauge availability
  const activeGauges = (['body', 'state', 'emotion', 'connection', 'direction', 'alignment'] as const)
    .filter(k => cockpit[k].value >= 0);
  const hasGauges = activeGauges.length > 0;
  
  // Build insight options
  const insightOptions: InsightOption[] = [
    {
      type: 'gauge-status',
      emoji: '🎛️',
      title: 'How I\'m Feeling',
      description: 'Share your current gauge readings with context',
      available: hasGauges,
      unavailableReason: 'Do a check-in first to share how you\'re feeling',
    },
    {
      type: 'lesson',
      emoji: '📖',
      title: 'A Lesson That Helped',
      description: 'Share something from the Human Manual',
      available: true,
    },
    {
      type: 'discovery',
      emoji: '💡',
      title: 'A Discovery',
      description: 'Share an interesting insight from 101 Discoveries',
      available: true,
    },
    {
      type: 'personology',
      emoji: '🧬',
      title: 'My Personality Profile',
      description: 'Share how you\'re wired so they understand you better',
      available: !!birthday,
      unavailableReason: 'Add your birthday in settings to unlock this',
    },
  ];
  
  // Sample discoveries for selection
  const discoveries = DISCOVERIES.slice(0, 20);
  
  // Sample lessons (simplified - in real app would come from manualContent)
  const sampleLessons = [
    { id: 'manual-1-1-1', title: 'What Are Emotions, Really?', emoji: '💡' },
    { id: 'manual-1-1-2', title: 'The Anger Iceberg', emoji: '🧊' },
    { id: 'manual-1-1-3', title: 'Anxiety vs Excitement', emoji: '⚡' },
    { id: 'manual-2-1-1', title: 'Your Inner Compass', emoji: '🧭' },
    { id: 'manual-2-2-1', title: 'The Body Keeps the Score', emoji: '🫀' },
    { id: 'manual-3-1-1', title: 'Connection as Medicine', emoji: '💞' },
    { id: 'manual-3-2-1', title: 'Setting Boundaries', emoji: '🚧' },
  ];
  
  // ============================================
  // Handlers
  // ============================================
  
  const handleSelectType = (type: InsightType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedType(type);
    
    if (type === 'gauge-status' || type === 'personology') {
      // These don't need item selection
      setStep('add-note');
    } else {
      setStep('select-item');
    }
  };
  
  const handleSelectItem = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedItemId(id);
    setStep('add-note');
  };
  
  const handleGenerateInsight = () => {
    if (!selectedType) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    let data: any = { personalNote: personalNote.trim() || undefined };
    
    if (selectedType === 'gauge-status') {
      data.context = context.trim() || undefined;
    } else if (selectedType === 'lesson') {
      const lesson = sampleLessons.find(l => l.id === selectedItemId);
      if (lesson) {
        data.lesson = lesson;
        data.lessonContent = {
          introduction: 'Understanding this concept can help transform how you experience and process emotions.',
          keyConcepts: [{ explanation: 'The key insight here is that emotions are information, not commands.' }],
        };
        data.whySharing = whySharing.trim() || undefined;
      }
    } else if (selectedType === 'discovery') {
      const discovery = discoveries.find(d => d.id === selectedItemId);
      if (discovery) {
        data.discovery = discovery;
        data.whySharing = whySharing.trim() || undefined;
      }
    }
    
    const generated = generateShareableInsight(selectedType, data);
    if (generated) {
      setInsight(generated);
      setStep('preview');
    } else {
      Alert.alert('Error', 'Could not generate insight. Please try again.');
    }
  };
  
  const handleConfirmPreview = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep('share-method');
  };
  
  const handleShareMethod = async (method: string) => {
    if (!insight) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    
    try {
      // Create share link first
      const linkResult = await createShareLink(insight);
      
      if (!linkResult.success || !linkResult.shareUrl) {
        // Fallback: share text directly without link
        const shareText = getInsightShareText(insight);
        
        if (method === 'text' || method === 'email') {
          await Share.share({
            message: shareText,
            title: `${userName || 'Someone'} shared something with you`,
          });
          setStep('success');
        } else if (method === 'copy') {
          await Clipboard.setStringAsync(shareText);
          Alert.alert('Copied!', 'Share text copied to clipboard');
          setStep('success');
        } else if (method === 'circle') {
          if (circleMembers.length === 0) {
            Alert.alert('No Circle Members', 'Add someone to your Circle first to share with them.');
          } else {
            // Show circle member selection (handled in UI)
          }
        }
        
        setLoading(false);
        return;
      }
      
      setShareUrl(linkResult.shareUrl);
      const shareText = `${getShareMessageTemplate(insight)}\n\n${linkResult.shareUrl}`;
      
      switch (method) {
        case 'text':
          await Share.share({ message: shareText });
          setStep('success');
          break;
          
        case 'email':
          const subject = encodeURIComponent(`${userName || 'Someone'} shared something with you`);
          const body = encodeURIComponent(shareText);
          const mailUrl = `mailto:?subject=${subject}&body=${body}`;
          const canOpenMail = await Linking.canOpenURL(mailUrl);
          if (canOpenMail) {
            await Linking.openURL(mailUrl);
          } else {
            await Share.share({ message: shareText });
          }
          setStep('success');
          break;
          
        case 'circle':
          if (circleMembers.length === 0) {
            Alert.alert('No Circle Members', 'Add someone to your Circle first to share with them.');
          }
          // Selection handled in UI below
          break;
          
        case 'copy':
          await Clipboard.setStringAsync(linkResult.shareUrl);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('Copied!', 'Link copied to clipboard');
          setStep('success');
          break;
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share. Please try again.');
    }
    
    setLoading(false);
  };
  
  const handleSendToCircle = async (memberId: string) => {
    if (!insight) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    
    const result = await sendToCircleMember(memberId, insight);
    
    setLoading(false);
    
    if (result.success) {
      const member = circleMembers.find(m => m.id === memberId);
      Alert.alert('Sent!', `Shared with ${member?.name || 'circle member'}`);
      setStep('success');
    } else {
      Alert.alert('Error', result.error || 'Failed to send. Please try again.');
    }
  };
  
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    switch (step) {
      case 'select-item':
        setStep('select-type');
        setSelectedType(null);
        break;
      case 'add-note':
        if (selectedType === 'gauge-status' || selectedType === 'personology') {
          setStep('select-type');
          setSelectedType(null);
        } else {
          setStep('select-item');
          setSelectedItemId(null);
        }
        break;
      case 'preview':
        setStep('add-note');
        setInsight(null);
        break;
      case 'share-method':
        setStep('preview');
        break;
      case 'success':
        router.back();
        break;
      default:
        router.back();
    }
  };
  
  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };
  
  // ============================================
  // Render Helpers
  // ============================================
  
  const renderHeader = () => (
    <View style={styles.header}>
      <Pressable
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
        onPress={step === 'select-type' ? () => router.back() : handleBack}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.accent} />
      </Pressable>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>Share Insight</Text>
        <Text style={styles.headerSubtitle}>
          {step === 'select-type' && 'What would you like to share?'}
          {step === 'select-item' && 'Choose one to share'}
          {step === 'add-note' && 'Add your personal touch'}
          {step === 'preview' && 'Preview your share'}
          {step === 'share-method' && 'How would you like to share?'}
          {step === 'success' && 'Shared!'}
        </Text>
      </View>
      <View style={{ width: 40 }} />
    </View>
  );
  
  const renderTypeSelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionIntro}>
        Help your loved ones understand you better by sharing what you've learned or how you're feeling.
      </Text>
      
      {insightOptions.map((option) => (
        <Pressable
          key={option.type}
          style={({ pressed }) => [
            styles.typeCard,
            !option.available && styles.typeCardDisabled,
            pressed && option.available && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
          onPress={() => option.available && handleSelectType(option.type)}
          disabled={!option.available}
        >
          <Text style={styles.typeEmoji}>{option.emoji}</Text>
          <View style={styles.typeContent}>
            <Text style={[styles.typeTitle, !option.available && styles.typeTitleDisabled]}>
              {option.title}
            </Text>
            <Text style={styles.typeDescription}>
              {option.available ? option.description : option.unavailableReason}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={option.available ? COLORS.textMuted : COLORS.textDim}
          />
        </Pressable>
      ))}
    </View>
  );
  
  const renderItemSelection = () => {
    const items = selectedType === 'lesson' ? sampleLessons : discoveries.slice(0, 12);
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          {selectedType === 'lesson' ? 'Select a lesson' : 'Select a discovery'}
        </Text>
        
        <View style={styles.itemGrid}>
          {items.map((item: any) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.itemCard,
                selectedItemId === item.id && styles.itemCardSelected,
                pressed && { opacity: 0.9 },
              ]}
              onPress={() => handleSelectItem(item.id)}
            >
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {selectedItemId === item.id && (
                <View style={styles.selectedCheck}>
                  <Ionicons name="checkmark" size={14} color={COLORS.text} />
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </View>
    );
  };
  
  const renderNoteInput = () => (
    <View style={styles.section}>
      {selectedType === 'gauge-status' && (
        <>
          <Text style={styles.inputLabel}>What's going on? (optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="I'm feeling this way because..."
            placeholderTextColor={COLORS.textMuted}
            value={context}
            onChangeText={setContext}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </>
      )}
      
      {(selectedType === 'lesson' || selectedType === 'discovery') && (
        <>
          <Text style={styles.inputLabel}>Why are you sharing this?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="This helped me understand..."
            placeholderTextColor={COLORS.textMuted}
            value={whySharing}
            onChangeText={setWhySharing}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </>
      )}
      
      <Text style={[styles.inputLabel, { marginTop: SPACING.lg }]}>
        Add a personal note (optional)
      </Text>
      <TextInput
        style={styles.textInput}
        placeholder="Something you want them to know..."
        placeholderTextColor={COLORS.textMuted}
        value={personalNote}
        onChangeText={setPersonalNote}
        multiline
        numberOfLines={2}
        textAlignVertical="top"
      />
      
      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.9 }]}
        onPress={handleGenerateInsight}
      >
        <Text style={styles.primaryButtonText}>Preview Share</Text>
        <Ionicons name="arrow-forward" size={18} color={COLORS.text} />
      </Pressable>
    </View>
  );
  
  const renderPreview = () => (
    <View style={styles.section}>
      {insight && <ShareInsightCard insight={insight} />}
      
      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.9 }]}
        onPress={handleConfirmPreview}
      >
        <Text style={styles.primaryButtonText}>Looks Good</Text>
        <Ionicons name="checkmark" size={18} color={COLORS.text} />
      </Pressable>
      
      <Pressable
        style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.8 }]}
        onPress={handleBack}
      >
        <Text style={styles.secondaryButtonText}>Edit</Text>
      </Pressable>
    </View>
  );
  
  const renderShareMethods = () => (
    <View style={styles.section}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Creating your share...</Text>
        </View>
      ) : (
        <>
          {SHARE_METHODS.map((method) => (
            <Pressable
              key={method.id}
              style={({ pressed }) => [
                styles.shareMethodCard,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
              onPress={() => handleShareMethod(method.id)}
            >
              <View style={styles.shareMethodIcon}>
                <Ionicons name={method.icon} size={24} color={COLORS.accent} />
              </View>
              <Text style={styles.shareMethodLabel}>{method.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </Pressable>
          ))}
          
          {/* Circle member selection */}
          {circleMembers.length > 0 && (
            <View style={styles.circleMembersSection}>
              <Text style={styles.circleMembersTitle}>Send to Circle Member</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {circleMembers.map((member) => (
                  <Pressable
                    key={member.id}
                    style={({ pressed }) => [
                      styles.circleMemberChip,
                      selectedCircleMember === member.id && styles.circleMemberChipSelected,
                      pressed && { opacity: 0.8 },
                    ]}
                    onPress={() => handleSendToCircle(member.id)}
                  >
                    <Text style={styles.circleMemberName}>{member.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </>
      )}
    </View>
  );
  
  const renderSuccess = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
      </View>
      <Text style={styles.successTitle}>Shared!</Text>
      <Text style={styles.successMessage}>
        Your insight is on its way. Sharing what you've learned helps the people you love understand you better.
      </Text>
      
      {shareUrl && (
        <Pressable
          style={({ pressed }) => [styles.copyLinkButton, pressed && { opacity: 0.8 }]}
          onPress={async () => {
            await Clipboard.setStringAsync(shareUrl);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Copied!', 'Link copied to clipboard');
          }}
        >
          <Ionicons name="link-outline" size={18} color={COLORS.accent} />
          <Text style={styles.copyLinkText}>Copy Link Again</Text>
        </Pressable>
      )}
      
      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.9 }]}
        onPress={handleDone}
      >
        <Text style={styles.primaryButtonText}>Done</Text>
      </Pressable>
    </View>
  );
  
  // ============================================
  // Main Render
  // ============================================
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 'select-type' && renderTypeSelection()}
        {step === 'select-item' && renderItemSelection()}
        {step === 'add-note' && renderNoteInput()}
        {step === 'preview' && renderPreview()}
        {step === 'share-method' && renderShareMethods()}
        {step === 'success' && renderSuccess()}
      </ScrollView>
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionIntro: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  sectionLabel: {
    ...TYPOGRAPHY.labelLg,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  
  // Type Selection
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  typeCardDisabled: {
    opacity: 0.5,
  },
  typeEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  typeContent: {
    flex: 1,
  },
  typeTitle: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.text,
    marginBottom: 4,
  },
  typeTitleDisabled: {
    color: COLORS.textMuted,
  },
  typeDescription: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.textMuted,
  },
  
  // Item Selection
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  itemCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
    position: 'relative',
  },
  itemCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentBg,
  },
  itemEmoji: {
    fontSize: 28,
    marginBottom: SPACING.sm,
  },
  itemTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.text,
    textAlign: 'center',
  },
  selectedCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Input
  inputLabel: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    color: COLORS.text,
    ...TYPOGRAPHY.bodyMd,
    minHeight: 80,
  },
  
  // Buttons
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.button,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.labelLg,
    color: COLORS.text,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.labelLg,
    color: COLORS.accent,
  },
  
  // Share Methods
  shareMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  shareMethodIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accentBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  shareMethodLabel: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.text,
    flex: 1,
  },
  
  // Circle Members
  circleMembersSection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  circleMembersTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  circleMemberChip: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginRight: SPACING.sm,
  },
  circleMemberChipSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentBg,
  },
  circleMemberName: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.text,
  },
  
  // Loading
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted,
    marginTop: SPACING.lg,
  },
  
  // Success
  successContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  successIcon: {
    marginBottom: SPACING.xl,
  },
  successTitle: {
    ...TYPOGRAPHY.displayMd,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  successMessage: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  copyLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  copyLinkText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.accent,
  },
});
