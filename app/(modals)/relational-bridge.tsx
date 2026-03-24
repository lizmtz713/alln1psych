/**
 * Relational Bridge Modal
 * Helps users communicate better during conflicts with Circle members
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCircleStore, type CircleMember } from '../../src/stores/circleStore';
import { useUserStore } from '../../src/stores/userStore';
import {
  generateBridge,
  getRelationshipSpecificAdvice,
  augmentBridgeWithShowUpPreferences,
  getShowUpBridgeCardLines,
  type CommunicationBridge,
  type RelationalBridgeResult,
} from '../../src/services/relationalBridge';
import { useAuth } from '../../src/providers/AuthProvider';
import { fetchLatestSummaryForPerson, buildShowUpToneHint } from '../../src/services/showUpService';
import type { ShowUpSummaryRow } from '../../src/types/showUp';
import * as Haptics from 'expo-haptics';

export default function RelationalBridgeModal() {
  const router = useRouter();
  const { memberId } = useLocalSearchParams<{ memberId?: string }>();
  const { members } = useCircleStore();
  const { birthday: myBirthday } = useUserStore();
  const { user } = useAuth();

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(memberId || null);
  const [bridgeResult, setBridgeResult] = useState<RelationalBridgeResult | null>(null);
  const [showUpSummary, setShowUpSummary] = useState<ShowUpSummaryRow | null>(null);

  const selectedMember = useMemo(() => 
    members.find(m => m.id === selectedMemberId),
    [members, selectedMemberId]
  );

  useEffect(() => {
    if (selectedMember?.birthday && myBirthday) {
      const result = generateBridge(myBirthday, selectedMember.birthday);
      setBridgeResult(result);
    } else if (selectedMember && !selectedMember.birthday) {
      setBridgeResult({
        hasData: false,
        generalTips: [
          `Add ${selectedMember.name}'s birthday in Circle for personalized insights.`,
          "Without birthday info, here are universal tips:",
          "• Start with 'I feel...' not 'You always...'",
          "• Ask 'Help me understand' before assuming",
          "• Take a break if either person is flooded",
        ],
      });
    }
  }, [selectedMember, myBirthday]);

  useEffect(() => {
    if (!selectedMember?.id || !user?.id) {
      setShowUpSummary(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const pair = await fetchLatestSummaryForPerson(user.id, selectedMember.id);
      if (!cancelled) setShowUpSummary(pair?.summary ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedMember?.id, user?.id]);

  const displayBridge: CommunicationBridge | null = useMemo(() => {
    if (!bridgeResult?.bridge) return null;
    return augmentBridgeWithShowUpPreferences(bridgeResult.bridge, showUpSummary);
  }, [bridgeResult?.bridge, showUpSummary]);

  const relationshipAdvice = useMemo(() => {
    if (selectedMember && displayBridge) {
      return getRelationshipSpecificAdvice(selectedMember.relationship, displayBridge);
    }
    return [];
  }, [selectedMember, displayBridge]);

  const showUpCardLines = useMemo(
    () => (showUpSummary ? getShowUpBridgeCardLines(showUpSummary) : []),
    [showUpSummary]
  );

  const handleSelectMember = (member: CircleMember) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMemberId(member.id);
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
        <Text style={styles.headerTitle}>Relational Bridge</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introBox}>
          <Text style={styles.introEmoji}>🌉</Text>
          <Text style={styles.introTitle}>Build a Bridge</Text>
          <Text style={styles.introText}>
            Select someone from your Circle to get personalized communication strategies for navigating conflict.
          </Text>
        </View>

        {/* Check tone entry */}
        <TouchableOpacity
          style={styles.toneCheckRow}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/tools/tone-check');
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.toneCheckEmoji}>🎯</Text>
          <Text style={styles.toneCheckLabel}>Check tone before you send</Text>
          <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
        </TouchableOpacity>
        <Text style={styles.toneCheckHint}>
          After you pick someone, if they&apos;ve filled out &quot;How to show up,&quot; Tone Check can use their preferences.
        </Text>

        {/* Member Selection */}
        {!selectedMember && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Who are you navigating conflict with?</Text>
            <View style={styles.memberGrid}>
              {members.map(member => (
                <TouchableOpacity
                  key={member.id}
                  style={styles.memberCard}
                  onPress={() => handleSelectMember(member)}
                >
                  <Text style={styles.memberEmoji}>
                    {member.relationship === 'partner' ? '💕' :
                     member.relationship === 'parent' ? '👨‍👩‍👧' :
                     member.relationship === 'child' ? '👶' :
                     member.relationship === 'sibling' ? '👫' :
                     member.relationship === 'friend' ? '🤝' :
                     member.relationship === 'mentor' ? '🎓' : '👤'}
                  </Text>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRelation}>{member.relationship}</Text>
                  {!member.birthday && (
                    <Text style={styles.noBirthday}>No birthday</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            {members.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Add people to your Circle first</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => router.push('/(tabs)/circle')}
                >
                  <Text style={styles.addButtonText}>Go to Circle</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Bridge Results */}
        {selectedMember && bridgeResult && (
          <View style={styles.results}>
            {/* Selected person header */}
            <View style={styles.selectedHeader}>
              <View style={styles.selectedInfo}>
                <Text style={styles.selectedName}>
                  Communicating with {selectedMember.name}
                </Text>
                <Text style={styles.selectedRelation}>{selectedMember.relationship}</Text>
              </View>
              <TouchableOpacity 
                style={styles.changeButton}
                onPress={() => setSelectedMemberId(null)}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            </View>

            {showUpCardLines.length > 0 && (
              <View style={styles.showUpCard}>
                <Text style={styles.showUpCardTitle}>What they shared (How to show up)</Text>
                <Text style={styles.showUpCardSub}>
                  Repair and communication preferences below are blended into your bridge.
                </Text>
                {showUpCardLines.map((line, i) => (
                  <Text key={i} style={styles.showUpCardLine}>
                    • {line}
                  </Text>
                ))}
                <TouchableOpacity
                  style={styles.showUpToneRow}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const ctx = showUpSummary ? buildShowUpToneHint(showUpSummary)?.trim() : '';
                    router.push({
                      pathname: '/tools/tone-check',
                      params: ctx ? { showUpContext: encodeURIComponent(ctx) } : {},
                    } as any);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.showUpToneLabel}>Tone Check with their preferences →</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* No birthday data */}
            {!bridgeResult.hasData && bridgeResult.generalTips && (
              <View style={styles.tipsBox}>
                {bridgeResult.generalTips.map((tip, i) => (
                  <Text key={i} style={styles.tipText}>{tip}</Text>
                ))}
              </View>
            )}

            {/* Full bridge data */}
            {bridgeResult.hasData && displayBridge && (
              <>
                {/* Style mismatch alert */}
                {displayBridge.styleMismatch && (
                  <View style={styles.alertBox}>
                    <Ionicons name="swap-horizontal" size={20} color="#FF9800" />
                    <Text style={styles.alertText}>{displayBridge.styleMismatch}</Text>
                  </View>
                )}

                {/* De-escalation warning */}
                {displayBridge.deescalationNote && (
                  <View style={[styles.alertBox, { borderColor: '#F44336', backgroundColor: '#F4433611' }]}>
                    <Ionicons name="alert-circle" size={20} color="#F44336" />
                    <Text style={[styles.alertText, { color: '#F44336' }]}>
                      {displayBridge.deescalationNote}
                    </Text>
                  </View>
                )}

                {/* Opening strategies */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🎯 How to Open</Text>
                  {displayBridge.openingStrategies.map((strategy, i) => (
                    <View key={i} style={styles.bulletItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.bulletText}>{strategy}</Text>
                    </View>
                  ))}
                </View>

                {/* Phrases to try */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>💬 Phrases to Try</Text>
                  {displayBridge.phrasesToTry.map((phrase, i) => (
                    <View key={i} style={styles.phraseCard}>
                      <Text style={styles.phraseText}>{phrase}</Text>
                    </View>
                  ))}
                </View>

                {/* What they need to hear */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>❤️ What They Need to Hear</Text>
                  <View style={styles.needsGrid}>
                    {displayBridge.whatTheyNeedToHear.map((need, i) => (
                      <View key={i} style={styles.needChip}>
                        <Text style={styles.needText}>&ldquo;{need}&rdquo;</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Phrases to avoid */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🚫 Avoid These</Text>
                  {displayBridge.phrasesToAvoid.map((phrase, i) => (
                    <View key={i} style={styles.avoidItem}>
                      <Ionicons name="close-circle" size={16} color="#F44336" />
                      <Text style={styles.avoidText}>{phrase}</Text>
                    </View>
                  ))}
                </View>

                {/* Conflict pattern */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🔄 Your Conflict Pattern</Text>
                  <View style={styles.patternBox}>
                    <Text style={styles.patternText}>{displayBridge.conflictTip}</Text>
                  </View>
                </View>

                {/* Repair strategy */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🩹 After the Conflict</Text>
                  <View style={styles.repairBox}>
                    <Text style={styles.repairText}>{displayBridge.repairStrategy}</Text>
                  </View>
                </View>

                {/* Relationship-specific advice */}
                {relationshipAdvice.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      💡 {selectedMember.relationship.charAt(0).toUpperCase() + selectedMember.relationship.slice(1)}-Specific
                    </Text>
                    {relationshipAdvice.map((advice, i) => (
                      <View key={i} style={styles.bulletItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{advice}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}

            {/* Action buttons */}
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push('/(modals)/role-play')}
              >
                <Ionicons name="people" size={20} color="#FFF" />
                <Text style={styles.actionButtonText}>Practice the Conversation</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
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
  content: {
    flex: 1,
  },
  introBox: {
    alignItems: 'center',
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
  },
  introEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: '#AAA',
    textAlign: 'center',
    lineHeight: 20,
  },
  toneCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  toneCheckEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  toneCheckLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  toneCheckHint: {
    fontSize: 12,
    color: '#888',
    marginHorizontal: 20,
    marginTop: 6,
    marginBottom: 4,
    lineHeight: 17,
  },
  showUpCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#0D948822',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#0D948855',
  },
  showUpCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2DD4BF',
    marginBottom: 6,
  },
  showUpCardSub: {
    fontSize: 12,
    color: '#AAA',
    marginBottom: 10,
    lineHeight: 17,
  },
  showUpCardLine: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 21,
    marginBottom: 6,
  },
  showUpToneRow: {
    marginTop: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  showUpToneLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2DD4BF',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  memberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  memberCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '47%',
  },
  memberEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  memberRelation: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  noBirthday: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#7C4DFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  results: {
    marginTop: 16,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1E1E1E',
    marginHorizontal: 16,
    borderRadius: 12,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  selectedRelation: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#333',
    borderRadius: 6,
  },
  changeButtonText: {
    color: '#7C4DFF',
    fontSize: 13,
    fontWeight: '500',
  },
  tipsBox: {
    backgroundColor: '#1E1E1E',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 22,
    marginBottom: 4,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FF980011',
    borderColor: '#FF9800',
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    color: '#FF9800',
    lineHeight: 18,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    color: '#7C4DFF',
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
  },
  phraseCard: {
    backgroundColor: '#2A2A2A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  phraseText: {
    fontSize: 14,
    color: '#FFF',
    fontStyle: 'italic',
  },
  needsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  needChip: {
    backgroundColor: '#7C4DFF22',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  needText: {
    fontSize: 13,
    color: '#7C4DFF',
    fontStyle: 'italic',
  },
  avoidItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  avoidText: {
    flex: 1,
    fontSize: 14,
    color: '#AAA',
  },
  patternBox: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
  },
  patternText: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
  },
  repairBox: {
    backgroundColor: '#4CAF5011',
    borderColor: '#4CAF50',
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
  },
  repairText: {
    fontSize: 14,
    color: '#4CAF50',
    lineHeight: 20,
  },
  actions: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C4DFF',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
