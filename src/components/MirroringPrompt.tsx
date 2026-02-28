/**
 * MirroringPrompt — Active Constructive Responding suggestions
 * 
 * When viewing a Circle member's shared temperature or message,
 * suggests scientifically-backed responses to build connection.
 */

import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { COLORS, BORDER_RADIUS, SPACING } from '../lib/constants';
import {
  generateMirroringSuggestions,
  getResponseStyleExplanation,
  type MirroringContext,
  type ResponseSuggestion,
  type MessageType,
} from '../services/mirroringAssistant';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

interface Props {
  memberName: string;
  relationship?: string;
  temperature?: 'green' | 'yellow' | 'orange' | 'red';
  temperatureLabel?: string;
  sharedMessage?: string;
  onCopyResponse?: (text: string) => void;
  onDismiss?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export default function MirroringPrompt({
  memberName,
  relationship,
  temperature,
  temperatureLabel,
  sharedMessage,
  onCopyResponse,
  onDismiss,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScience, setShowScience] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Generate suggestions
  const context: MirroringContext = {
    memberName,
    relationship,
    temperature,
    temperatureLabel,
  };

  const result = generateMirroringSuggestions(sharedMessage, context);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(!isExpanded);
  };

  const handleCopy = async (suggestion: ResponseSuggestion) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await Clipboard.setStringAsync(suggestion.text);
    setCopiedId(suggestion.id);
    onCopyResponse?.(suggestion.text);
    
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleScience = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowScience(!showScience);
  };

  const getMessageTypeLabel = (type: MessageType): string => {
    switch (type) {
      case 'good-news':
        return 'They shared good news';
      case 'struggle':
        return 'They\'re going through something';
      case 'request':
        return 'They have a request';
      case 'neutral':
      default:
        return 'Want to connect?';
    }
  };

  const getMessageTypeEmoji = (type: MessageType): string => {
    switch (type) {
      case 'good-news':
        return '🎉';
      case 'struggle':
        return '💜';
      case 'request':
        return '💬';
      case 'neutral':
      default:
        return '🤝';
    }
  };

  const getAccentColor = (type: MessageType): string => {
    switch (type) {
      case 'good-news':
        return '#4ADE80'; // Green
      case 'struggle':
        return '#EC4899'; // Pink
      case 'request':
        return '#60A5FA'; // Blue
      case 'neutral':
      default:
        return COLORS.accent;
    }
  };

  const accentColor = getAccentColor(result.messageType);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header - always visible */}
      <Pressable
        style={[styles.header, { borderLeftColor: accentColor }]}
        onPress={handleExpand}
      >
        <View style={styles.headerContent}>
          <View style={[styles.iconWrap, { backgroundColor: accentColor + '20' }]}>
            <Text style={styles.emoji}>{getMessageTypeEmoji(result.messageType)}</Text>
          </View>
          
          <View style={styles.headerText}>
            <Text style={styles.title}>
              {getMessageTypeLabel(result.messageType)}
            </Text>
            <Text style={styles.subtitle}>
              {isExpanded ? 'Tap to hide suggestions' : 'Tap for response ideas'}
            </Text>
          </View>

          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.textMuted}
          />
        </View>
      </Pressable>

      {/* Expanded content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Suggestions */}
          <View style={styles.suggestionsSection}>
            <Text style={styles.sectionLabel}>
              {result.messageType === 'good-news' 
                ? '✨ Active Constructive Responses' 
                : result.messageType === 'struggle'
                ? '💜 Supportive Responses'
                : '💬 Check-in Ideas'}
            </Text>
            
            {result.suggestions.map((suggestion) => (
              <Pressable
                key={suggestion.id}
                style={({ pressed }) => [
                  styles.suggestionCard,
                  pressed && styles.suggestionPressed,
                  copiedId === suggestion.id && styles.suggestionCopied,
                ]}
                onPress={() => handleCopy(suggestion)}
              >
                <View style={styles.suggestionContent}>
                  {suggestion.emoji && (
                    <Text style={styles.suggestionEmoji}>{suggestion.emoji}</Text>
                  )}
                  <Text style={styles.suggestionText}>
                    {suggestion.text}
                  </Text>
                </View>
                
                <View style={styles.copyAction}>
                  {copiedId === suggestion.id ? (
                    <Ionicons name="checkmark" size={18} color={COLORS.success} />
                  ) : (
                    <Ionicons name="copy-outline" size={16} color={COLORS.textMuted} />
                  )}
                </View>
              </Pressable>
            ))}

            {/* Style explanation */}
            <Text style={styles.styleHint}>
              {getResponseStyleExplanation(result.suggestions[0]?.style)}
            </Text>
          </View>

          {/* Science toggle */}
          <Pressable
            style={styles.scienceToggle}
            onPress={handleToggleScience}
          >
            <Ionicons
              name="bulb-outline"
              size={16}
              color={COLORS.accent}
            />
            <Text style={styles.scienceToggleText}>
              {showScience ? 'Hide the science' : 'Why this works'}
            </Text>
          </Pressable>

          {showScience && (
            <View style={styles.scienceCard}>
              <Text style={styles.scienceText}>
                {result.scienceNote}
              </Text>
              <Text style={styles.scienceSource}>
                — Research by Shelly Gable (UCLA)
              </Text>
            </View>
          )}

          {/* Dismiss */}
          {onDismiss && (
            <Pressable
              style={styles.dismissButton}
              onPress={onDismiss}
            >
              <Text style={styles.dismissText}>Dismiss</Text>
            </Pressable>
          )}
        </View>
      )}
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderLeftWidth: 3,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  expandedContent: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
    paddingHorizontal: 14,
    paddingBottom: 14,
    marginTop: -BORDER_RADIUS.lg,
    paddingTop: BORDER_RADIUS.lg + 8,
  },
  suggestionsSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputSurface,
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
    marginBottom: 8,
  },
  suggestionPressed: {
    opacity: 0.8,
    backgroundColor: COLORS.accentBg,
  },
  suggestionCopied: {
    backgroundColor: COLORS.accentBg,
    borderWidth: 1,
    borderColor: COLORS.accentMuted,
  },
  suggestionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  suggestionEmoji: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 1,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  copyAction: {
    marginLeft: 12,
    width: 24,
    alignItems: 'center',
  },
  styleHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
    marginLeft: 2,
  },
  scienceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  scienceToggleText: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '500',
  },
  scienceCard: {
    backgroundColor: COLORS.accentBg,
    borderRadius: BORDER_RADIUS.md,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  scienceText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 21,
  },
  scienceSource: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },
  dismissButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  dismissText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});
