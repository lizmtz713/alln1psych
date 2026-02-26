/**
 * Post-Flight Debrief Modal
 * 24-hour follow-up after tool use: "Did it help?"
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCockpitStore, type GaugeKey } from '../../src/stores/cockpitStore';
import {
  recordDebriefResponse,
  skipDebrief,
  generateDebriefPrompt,
  type ToolUsage,
} from '../../src/services/postFlightDebrief';
import * as Haptics from 'expo-haptics';

const TOOL_LABELS: Record<string, string> = {
  'quick-reset': 'Quick Reset',
  'replay': 'Replay',
  'relate': 'Relate',
  'decode': 'Decode',
  'role-play': 'Role Play',
  'journal': 'Journal',
  'help': 'Help Someone',
  'talk': 'Talk to Gauge',
};

export default function DebriefModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ 
    usageId: string;
    tool: string;
    timestamp: string;
    context?: string;
  }>();
  
  const cockpit = useCockpitStore();
  
  const [helpfulness, setHelpfulness] = useState<'yes' | 'somewhat' | 'no' | null>(null);
  const [wouldUseAgain, setWouldUseAgain] = useState<boolean | null>(null);
  const [whatHelped, setWhatHelped] = useState('');
  const [whatDidnt, setWhatDidnt] = useState('');
  const [step, setStep] = useState<'helpfulness' | 'details' | 'thanks'>('helpfulness');

  const toolLabel = TOOL_LABELS[params.tool || ''] || params.tool || 'the tool';
  const timestamp = params.timestamp ? parseInt(params.timestamp) : Date.now() - 24 * 60 * 60 * 1000;
  const timeAgo = getTimeAgo(timestamp);

  const handleHelpfulness = (value: 'yes' | 'somewhat' | 'no') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHelpfulness(value);
    setStep('details');
  };

  const handleSubmit = async () => {
    if (!params.usageId || helpfulness === null || wouldUseAgain === null) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Get current gauge values
    const currentGauges: Record<GaugeKey, number> = {
      body: cockpit.body.value,
      state: cockpit.state.value,
      emotion: cockpit.emotion.value,
      connection: cockpit.connection.value,
      direction: cockpit.direction.value,
      alignment: cockpit.alignment.value,
    };

    await recordDebriefResponse(
      params.usageId,
      currentGauges,
      helpfulness,
      wouldUseAgain,
      whatHelped || undefined,
      whatDidnt || undefined
    );

    setStep('thanks');
    
    // Close after delay
    setTimeout(() => {
      router.back();
    }, 2000);
  };

  const handleSkip = async () => {
    if (params.usageId) {
      await skipDebrief(params.usageId);
    }
    router.back();
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quick Check-in</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Step 1: Helpfulness */}
        {step === 'helpfulness' && (
          <View style={styles.stepContainer}>
            <Text style={styles.emoji}>🔄</Text>
            <Text style={styles.question}>
              You used <Text style={styles.highlight}>{toolLabel}</Text> {timeAgo}.
            </Text>
            <Text style={styles.subQuestion}>Did it help?</Text>

            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[styles.optionButton, styles.optionYes]}
                onPress={() => handleHelpfulness('yes')}
              >
                <Text style={styles.optionEmoji}>😊</Text>
                <Text style={styles.optionText}>Yes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionButton, styles.optionSomewhat]}
                onPress={() => handleHelpfulness('somewhat')}
              >
                <Text style={styles.optionEmoji}>😐</Text>
                <Text style={styles.optionText}>Somewhat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionButton, styles.optionNo]}
                onPress={() => handleHelpfulness('no')}
              >
                <Text style={styles.optionEmoji}>😕</Text>
                <Text style={styles.optionText}>Not really</Text>
              </TouchableOpacity>
            </View>

            {params.context && (
              <Text style={styles.contextNote}>
                Context: {params.context}
              </Text>
            )}
          </View>
        )}

        {/* Step 2: Details */}
        {step === 'details' && (
          <View style={styles.stepContainer}>
            <Text style={styles.emoji}>
              {helpfulness === 'yes' ? '✨' : helpfulness === 'somewhat' ? '🤔' : '📝'}
            </Text>
            <Text style={styles.question}>
              {helpfulness === 'yes' 
                ? "Great! What worked?"
                : helpfulness === 'somewhat'
                ? "What worked? What didn't?"
                : "What would have helped more?"}
            </Text>

            {(helpfulness === 'yes' || helpfulness === 'somewhat') && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>What helped:</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Optional — helps me learn what works for you"
                  placeholderTextColor="#666"
                  value={whatHelped}
                  onChangeText={setWhatHelped}
                  multiline
                />
              </View>
            )}

            {(helpfulness === 'no' || helpfulness === 'somewhat') && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>What didn't work:</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Optional — helps me improve recommendations"
                  placeholderTextColor="#666"
                  value={whatDidnt}
                  onChangeText={setWhatDidnt}
                  multiline
                />
              </View>
            )}

            <Text style={styles.subQuestion}>Would you use {toolLabel} again?</Text>
            <View style={styles.yesNoRow}>
              <TouchableOpacity
                style={[
                  styles.yesNoButton,
                  wouldUseAgain === true && styles.yesNoSelected,
                ]}
                onPress={() => setWouldUseAgain(true)}
              >
                <Text style={[
                  styles.yesNoText,
                  wouldUseAgain === true && styles.yesNoTextSelected,
                ]}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.yesNoButton,
                  wouldUseAgain === false && styles.yesNoSelected,
                ]}
                onPress={() => setWouldUseAgain(false)}
              >
                <Text style={[
                  styles.yesNoText,
                  wouldUseAgain === false && styles.yesNoTextSelected,
                ]}>No</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                wouldUseAgain === null && styles.submitDisabled,
              ]}
              onPress={handleSubmit}
              disabled={wouldUseAgain === null}
            >
              <Text style={styles.submitText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Thanks */}
        {step === 'thanks' && (
          <View style={styles.stepContainer}>
            <Text style={styles.emoji}>🙏</Text>
            <Text style={styles.question}>Thanks for the feedback!</Text>
            <Text style={styles.subQuestion}>
              This helps me learn what works best for you.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function getTimeAgo(timestamp: number): string {
  const hours = Math.round((Date.now() - timestamp) / (1000 * 60 * 60));
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours} hours ago`;
  if (hours < 48) return 'yesterday';
  return `${Math.round(hours / 24)} days ago`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFF',
  },
  skipText: {
    fontSize: 15,
    color: '#888',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  stepContainer: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  highlight: {
    color: '#7C4DFF',
  },
  subQuestion: {
    fontSize: 16,
    color: '#AAA',
    textAlign: 'center',
    marginBottom: 32,
  },
  contextNote: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 24,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    minWidth: 100,
  },
  optionYes: {
    backgroundColor: '#4CAF5022',
  },
  optionSomewhat: {
    backgroundColor: '#FF980022',
  },
  optionNo: {
    backgroundColor: '#F4433622',
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFF',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#888',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  yesNoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  yesNoButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
  },
  yesNoSelected: {
    backgroundColor: '#7C4DFF',
  },
  yesNoText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#888',
  },
  yesNoTextSelected: {
    color: '#FFF',
  },
  submitButton: {
    backgroundColor: '#7C4DFF',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  submitDisabled: {
    backgroundColor: '#333',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
