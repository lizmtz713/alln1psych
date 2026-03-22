/**
 * What's New - In-app changelog component
 * Shows recent updates and new features to users
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  bg: '#09090F',
  card: '#111118',
  border: 'rgba(255,255,255,0.08)',
  text: '#F0F0F5',
  textSecondary: '#A0A0B8',
  textMuted: '#6B6B80',
  accent: '#7C4DFF',
  pink: '#EC4899',
  green: '#4ADE80',
  blue: '#3B82F6',
};

interface Update {
  version: string;
  date: string;
  title: string;
  highlights: Array<{
    emoji: string;
    text: string;
    isNew?: boolean;
  }>;
}

// Changelog data - add new updates at the top
const UPDATES: Update[] = [
  {
    version: '1.2.0',
    date: 'March 2, 2026',
    title: 'Navigation Refresh + Heart Mail',
    highlights: [
      { emoji: '💌', text: 'Heart Mail: Send love notes to your Circle', isNew: true },
      { emoji: '🧭', text: 'New navigation: Home, InGauge, Circle, Explore, Me', isNew: true },
      { emoji: '📱', text: 'Home screen widget support', isNew: true },
      { emoji: '🏥', text: 'Enhanced Apple Health integration', isNew: true },
      { emoji: '🔗', text: 'New Integrations section with Oura, Whoop, Fitbit (coming soon)' },
      { emoji: '📊', text: 'Better organized features - nothing hidden anymore' },
    ],
  },
  {
    version: '1.1.0',
    date: 'February 28, 2026',
    title: 'Age-Adaptive + Cycle Intelligence',
    highlights: [
      { emoji: '🎂', text: 'Age-adaptive content: App speaks your language', isNew: true },
      { emoji: '🌙', text: 'Cycle Intelligence: Your cycle affects all 6 gauges' },
      { emoji: '💕', text: 'Expanded LOVE tool with 8 topic categories' },
      { emoji: '📋', text: 'Therapist Share: Generate professional reports' },
      { emoji: '🛡️', text: 'Privacy & Terms pages for the website' },
    ],
  },
  {
    version: '1.0.0',
    date: 'February 2026',
    title: 'Launch',
    highlights: [
      { emoji: '🚀', text: 'InGauge is born! The Human Cockpit launches.' },
      { emoji: '📊', text: '6 gauges: Body, State, Emotion, Connection, Direction, Alignment' },
      { emoji: '💬', text: 'Talk to InGauge: Your AI companion' },
      { emoji: '📚', text: 'Human Manual with 100+ lessons' },
      { emoji: '💜', text: 'Circle: Share your temperature with loved ones' },
      { emoji: '🧰', text: '7 AI-powered tools' },
    ],
  },
];

const STORAGE_KEY = '@ingauge_last_seen_version';

interface WhatsNewProps {
  currentVersion?: string;
}

export function WhatsNew({ currentVersion = '1.2.0" }: WhatsNewProps) {
  const [visible, setVisible] = useState(false);
  const [lastSeenVersion, setLastSeenVersion] = useState<string | null>(null);
  
  useEffect(() => {
    checkForNewUpdates();
  }, []);
  
  const checkForNewUpdates = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      setLastSeenVersion(stored);
      
      // Show if there's a new version
      if (stored !== currentVersion) {
        setVisible(true);
      }
    } catch (e) {
      // Ignore storage errors
    }
  };
  
  const handleDismiss = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVisible(false);
    
    try {
      await AsyncStorage.setItem(STORAGE_KEY, currentVersion);
      setLastSeenVersion(currentVersion);
    } catch (e) {
      // Ignore storage errors
    }
  };
  
  const hasNewUpdates = lastSeenVersion !== currentVersion;
  
  return (
    <>
      {/* Trigger button - show dot if new updates */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setVisible(true);
        }}
        style={styles.trigger}
      >
        <Ionicons name=\"sparkles\" size={20} color={COLORS.accent} />
        {hasNewUpdates && <View style={styles.dot} />}
      </Pressable>
      
      {/* Modal */}
      <Modal
        visible={visible}
        animationType=\"slide\"
        presentationStyle=\"pageSheet\"
        onRequestClose={handleDismiss}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>What"s New</Text>
              <Text style={styles.subtitle}>in InGauge</Text>
            </View>
            <Pressable onPress={handleDismiss} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </Pressable>
          </View>
          
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {UPDATES.map((update, idx) => (
              <View key={update.version} style={styles.updateCard}>
                {/* Version header */}
                <View style={styles.versionHeader}>
                  <View style={styles.versionBadge}>
                    <Text style={styles.versionText}>v{update.version}</Text>
                  </View>
                  <Text style={styles.dateText}>{update.date}</Text>
                </View>
                
                <Text style={styles.updateTitle}>{update.title}</Text>
                
                {/* Highlights */}
                <View style={styles.highlights}>
                  {update.highlights.map((highlight, hIdx) => (
                    <View key={hIdx} style={styles.highlightRow}>
                      <Text style={styles.highlightEmoji}>{highlight.emoji}</Text>
                      <Text style={styles.highlightText}>
                        {highlight.text}
                        {highlight.isNew && idx === 0 && (
                          <Text style={styles.newBadge}> NEW</Text>
                        )}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
            
            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Thanks for being part of the InGauge journey 💜
              </Text>
            </View>
          </ScrollView>
          
          {/* Got it button */}
          <View style={styles.buttonContainer}>
            <Pressable style={styles.gotItButton} onPress={handleDismiss}>
              <Text style={styles.gotItText}>Got it!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

// Standalone modal version (for settings)
export function WhatsNewModal({ 
  visible, 
  onClose 
}: { 
  visible: boolean; 
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>What's New</Text>
            <Text style={styles.subtitle}>in InGauge</Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </Pressable>
        </View>
        
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {UPDATES.map((update, idx) => (
            <View key={update.version} style={styles.updateCard}>
              <View style={styles.versionHeader}>
                <View style={styles.versionBadge}>
                  <Text style={styles.versionText}>v{update.version}</Text>
                </View>
                <Text style={styles.dateText}>{update.date}</Text>
              </View>
              
              <Text style={styles.updateTitle}>{update.title}</Text>
              
              <View style={styles.highlights}>
                {update.highlights.map((highlight, hIdx) => (
                  <View key={hIdx} style={styles.highlightRow}>
                    <Text style={styles.highlightEmoji}>{highlight.emoji}</Text>
                    <Text style={styles.highlightText}>
                      {highlight.text}
                      {highlight.isNew && idx === 0 && (
                        <Text style={styles.newBadge}> NEW</Text>
                      )}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Thanks for being part of the InGauge journey 💜
            </Text>
          </View>
        </ScrollView>
        
        <View style={styles.buttonContainer}>
          <Pressable style={styles.gotItButton} onPress={onClose}>
            <Text style={styles.gotItText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.pink,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  updateCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  versionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  versionBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  updateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  highlights: {
    gap: 10,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  highlightEmoji: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 1,
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  newBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.pink,
    backgroundColor: 'rgba(236,72,153,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  gotItButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  gotItText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default WhatsNew;
