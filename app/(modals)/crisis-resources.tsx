/**
 * Crisis Resources — Always Free, Always Available
 * Direct access to crisis hotlines and support
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { APP_CONFIG } from '../../src/lib/constants';

interface Resource {
  emoji: string;
  title: string;
  subtitle: string;
  phone?: string;
  sms?: string;
  style?: 'primary' | 'trans' | 'rainbow';
}

const CRISIS_RESOURCES: Resource[] = [
  {
    emoji: '💜',
    title: '988 Suicide & Crisis Lifeline',
    subtitle: 'Call or text 988 — Free, 24/7',
    phone: '988',
    sms: '988',
    style: 'primary',
  },
  {
    emoji: '💬',
    title: 'Crisis Text Line',
    subtitle: 'Text HOME to 741741',
    sms: '741741',
  },
  {
    emoji: '🏳️‍⚧️',
    title: 'Trans Lifeline',
    subtitle: 'By and for trans people — 877-565-8860',
    phone: '8775658860',
    style: 'trans',
  },
  {
    emoji: '🏳️‍🌈',
    title: 'Trevor Project',
    subtitle: 'LGBTQ+ youth crisis support — 866-488-7386',
    phone: '8664887386',
    style: 'rainbow',
  },
  {
    emoji: '💬',
    title: 'Trevor Text',
    subtitle: 'Text START to 678-678',
    sms: '678678',
    style: 'rainbow',
  },
  {
    emoji: '🆘',
    title: 'Emergency Services',
    subtitle: 'Call 911 for immediate danger',
    phone: '911',
  },
];

export default function CrisisResourcesScreen() {
  const router = useRouter();

  const handleCall = (phone: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`tel:${phone}`);
  };

  const handleText = (number: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`sms:${number}`);
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crisis Resources</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introBox}>
          <Text style={styles.introEmoji}>💜</Text>
          <Text style={styles.introTitle}>You're Not Alone</Text>
          <Text style={styles.introText}>
            These resources are free, confidential, and available 24/7.
            If you or someone you know is in crisis, please reach out.
          </Text>
        </View>

        {/* Resources */}
        <View style={styles.resourceList}>
          {CRISIS_RESOURCES.map((resource, i) => (
            <View 
              key={i} 
              style={[
                styles.resourceCard,
                resource.style === 'primary' && styles.resourcePrimary,
                resource.style === 'trans' && styles.resourceTrans,
                resource.style === 'rainbow' && styles.resourceRainbow,
              ]}
            >
              <Text style={styles.resourceEmoji}>{resource.emoji}</Text>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle}>{resource.title}</Text>
                <Text style={styles.resourceSubtitle}>{resource.subtitle}</Text>
              </View>
              <View style={styles.resourceActions}>
                {resource.phone && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleCall(resource.phone!)}
                  >
                    <Ionicons name="call" size={20} color="#FFF" />
                  </TouchableOpacity>
                )}
                {resource.sms && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonSecondary]}
                    onPress={() => handleText(resource.sms!)}
                  >
                    <Ionicons name="chatbubble" size={20} color="#7C4DFF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Important Note */}
        <View style={styles.noteBox}>
          <Ionicons name="information-circle" size={20} color="#888" />
          <Text style={styles.noteText}>
            {APP_CONFIG.name} is not a substitute for professional help. If you're in immediate danger, please call 911 or go to your nearest emergency room.
          </Text>
        </View>

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
    fontSize: 22,
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
  resourceList: {
    padding: 16,
    gap: 12,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  resourcePrimary: {
    backgroundColor: '#7C4DFF22',
    borderWidth: 1,
    borderColor: '#7C4DFF',
  },
  resourceTrans: {
    backgroundColor: '#F5A9B822',
    borderWidth: 1,
    borderColor: '#F5A9B8',
  },
  resourceRainbow: {
    backgroundColor: '#FF980022',
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  resourceEmoji: {
    fontSize: 28,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  resourceSubtitle: {
    fontSize: 13,
    color: '#AAA',
  },
  resourceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C4DFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: '#7C4DFF22',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
});
