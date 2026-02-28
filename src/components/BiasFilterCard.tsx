/**
 * BiasFilterCard — Shows when cognitive bias detected in user's draft.
 * 
 * Helpful, not condescending. "Your brain is trying to protect you, but..."
 * Offers reframe and System 2 prompts to engage slow thinking.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  type BiasFilterResult,
  type DetectedBias,
  suggestReframe,
  getSystem2Prompt,
  getAllSystem2Prompts,
  getFilterExplanation,
  formatBiasForDisplay,
} from '../services/biasFilter';

interface Props {
  result: BiasFilterResult;
  currentState?: number;
  onRevise: () => void;
  onSendAnyway: () => void;
  onDismiss?: () => void;
}

export default function BiasFilterCard({
  result,
  currentState,
  onRevise,
  onSendAnyway,
  onDismiss,
}: Props) {
  const [showAllPrompts, setShowAllPrompts] = useState(false);
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);

  if (!result.detected || !result.primaryBias) {
    return null;
  }

  const primaryBias = result.primaryBias;
  const { title, subtitle, emoji } = formatBiasForDisplay(primaryBias);
  const reframe = suggestReframe(primaryBias.type);
  const singlePrompt = getSystem2Prompt(primaryBias.type);
  const allPrompts = getAllSystem2Prompts(primaryBias.type);
  const explanation = getFilterExplanation(currentState);

  // Determine urgency color based on state
  const getUrgencyColor = () => {
    if (currentState !== undefined && currentState < 30) return '#EF4444'; // Red - critical
    if (currentState !== undefined && currentState < 50) return '#F59E0B'; // Amber - moderate
    return '#7C4DFF'; // Purple - notice
  };

  const urgencyColor = getUrgencyColor();

  const handleRevise = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRevise();
  };

  const handleSendAnyway = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSendAnyway();
  };

  const handleTogglePrompts = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowAllPrompts(!showAllPrompts);
  };

  const handleSelectPrompt = (index: number) => {
    Haptics.selectionAsync();
    setSelectedPromptIndex(index);
  };

  return (
    <View style={[styles.container, { borderLeftColor: urgencyColor }]}>
      {/* Header with dismiss */}
      <View style={styles.header}>
        <View style={styles.alertRow}>
          <Ionicons name="pause-circle" size={20} color={urgencyColor} />
          <Text style={[styles.alertText, { color: urgencyColor }]}>
            {result.system1Alert || 'Pause. Your System 1 might be driving.'}
          </Text>
        </View>
        {onDismiss && (
          <Pressable onPress={onDismiss} hitSlop={12}>
            <Ionicons name="close" size={20} color="#666" />
          </Pressable>
        )}
      </View>

      {/* Bias identification */}
      <View style={styles.biasBox}>
        <View style={styles.biasHeader}>
          <Text style={styles.biasEmoji}>{emoji}</Text>
          <View style={styles.biasTitleContainer}>
            <Text style={styles.biasTitle}>This looks like {title}</Text>
            {result.biases.length > 1 && (
              <Text style={styles.otherBiases}>
                (+{result.biases.length - 1} other pattern{result.biases.length > 2 ? 's' : ''})
              </Text>
            )}
          </View>
        </View>
        <Text style={styles.biasExplanation}>{subtitle}</Text>
      </View>

      {/* Context about why this is showing */}
      <View style={styles.contextBox}>
        <Ionicons name="information-circle-outline" size={16} color="#8888A0" />
        <Text style={styles.contextText}>{explanation}</Text>
      </View>

      {/* Reframe suggestion */}
      <View style={styles.reframeBox}>
        <Text style={styles.sectionLabel}>💡 Reframe</Text>
        <Text style={styles.reframeText}>{reframe}</Text>
      </View>

      {/* System 2 prompts */}
      <View style={styles.promptsBox}>
        <Pressable style={styles.promptsHeader} onPress={handleTogglePrompts}>
          <Text style={styles.sectionLabel}>🧠 Slow Down Questions</Text>
          <Ionicons 
            name={showAllPrompts ? 'chevron-up' : 'chevron-down'} 
            size={16} 
            color="#8888A0" 
          />
        </Pressable>
        
        {showAllPrompts ? (
          <View style={styles.allPrompts}>
            {allPrompts.map((prompt, index) => (
              <Pressable
                key={index}
                style={[
                  styles.promptOption,
                  selectedPromptIndex === index && styles.promptOptionSelected,
                ]}
                onPress={() => handleSelectPrompt(index)}
              >
                <Text style={styles.promptText}>{prompt}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Text style={styles.promptTextSingle}>{singlePrompt}</Text>
        )}
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <Pressable 
          style={[styles.reviseButton, { backgroundColor: urgencyColor }]} 
          onPress={handleRevise}
        >
          <Ionicons name="pencil" size={16} color="#FFF" />
          <Text style={styles.reviseButtonText}>Revise</Text>
        </Pressable>
        
        <Pressable style={styles.sendAnywayButton} onPress={handleSendAnyway}>
          <Text style={styles.sendAnywayText}>Send Anyway</Text>
        </Pressable>
      </View>

      {/* Additional biases if multiple detected */}
      {result.biases.length > 1 && (
        <View style={styles.additionalBiases}>
          <Text style={styles.additionalLabel}>Also detected:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {result.biases.slice(1).map((bias, index) => {
              const { emoji: biasEmoji } = formatBiasForDisplay(bias);
              return (
                <View key={index} style={styles.additionalBiasBadge}>
                  <Text style={styles.additionalBiasEmoji}>{biasEmoji}</Text>
                  <Text style={styles.additionalBiasText}>{bias.label}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

/**
 * Compact version for inline use in message composition.
 */
export function BiasFilterBanner({
  result,
  currentState,
  onTap,
}: {
  result: BiasFilterResult;
  currentState?: number;
  onTap: () => void;
}) {
  if (!result.detected || !result.primaryBias) {
    return null;
  }

  const { emoji } = formatBiasForDisplay(result.primaryBias);
  
  const getColor = () => {
    if (currentState !== undefined && currentState < 30) return '#EF4444';
    if (currentState !== undefined && currentState < 50) return '#F59E0B';
    return '#7C4DFF';
  };

  return (
    <Pressable style={[styles.banner, { borderColor: getColor() }]} onPress={onTap}>
      <View style={styles.bannerContent}>
        <Text style={styles.bannerEmoji}>{emoji}</Text>
        <View style={styles.bannerTextContainer}>
          <Text style={[styles.bannerTitle, { color: getColor() }]}>
            Bias detected: {result.primaryBias.label}
          </Text>
          <Text style={styles.bannerSubtitle}>Tap to review before sending</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#8888A0" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A22',
    borderRadius: 16,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  alertText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  biasBox: {
    backgroundColor: '#111118',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  biasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  biasEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  biasTitleContainer: {
    flex: 1,
  },
  biasTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F0F0F5',
  },
  otherBiases: {
    fontSize: 12,
    color: '#8888A0',
    marginTop: 2,
  },
  biasExplanation: {
    fontSize: 13,
    color: '#AAAABC',
    lineHeight: 19,
  },
  contextBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(124, 77, 255, 0.08)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  contextText: {
    fontSize: 12,
    color: '#8888A0',
    flex: 1,
    lineHeight: 17,
  },
  reframeBox: {
    backgroundColor: '#111118',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8888A0',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reframeText: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  promptsBox: {
    backgroundColor: '#111118',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  promptsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promptTextSingle: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
    marginTop: 6,
  },
  allPrompts: {
    marginTop: 8,
    gap: 8,
  },
  promptOption: {
    backgroundColor: 'rgba(124, 77, 255, 0.08)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  promptOptionSelected: {
    borderColor: '#7C4DFF',
    backgroundColor: 'rgba(124, 77, 255, 0.15)',
  },
  promptText: {
    fontSize: 13,
    color: '#E0E0E0',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  reviseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  reviseButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  sendAnywayButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendAnywayText: {
    color: '#8888A0',
    fontSize: 15,
    fontWeight: '500',
  },
  additionalBiases: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  additionalLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  additionalBiasBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 8,
    gap: 6,
  },
  additionalBiasEmoji: {
    fontSize: 14,
  },
  additionalBiasText: {
    fontSize: 12,
    color: '#AAAABC',
  },

  // Banner styles
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A22',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  bannerEmoji: {
    fontSize: 20,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#8888A0',
    marginTop: 2,
  },
});
