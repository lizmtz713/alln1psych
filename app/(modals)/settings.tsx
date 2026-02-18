import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../../src/stores/userStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useJournalStore } from '../../src/stores/journalStore';
import { useConversationStore } from '../../src/stores/conversationStore';
import { useConversationSummaryStore } from '../../src/stores/conversationSummaryStore';
import { useCircleStore } from '../../src/stores/circleStore';
import { useEducationStore } from '../../src/stores/educationStore';
import { registerForPushNotifications } from '../../src/services/notifications';
import {
  buildExportData,
  shareExportFile,
  buildTherapistSummary,
} from '../../src/services/exportData';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const ACCENT = '#7C4DFF';
const BG = '#09090F';
const CARD_BG = '#111118';
const TEXT = '#F0F0F5';
const TEXT_MUTED = '#8888A0';
const TEXT_DIM = '#55556A';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const settings = useSettingsStore();
  const user = useUserStore();

  const handleExportData = async () => {
    try {
      const data = buildExportData('all');
      await shareExportFile(data, `alln1-psych-export.json`);
    } catch (e) {
      Alert.alert('Export failed', 'Could not export. Try again.');
    }
  };

  const handleShareWithTherapist = async () => {
    try {
      const data = buildExportData('all');
      const text = buildTherapistSummary(data);
      const path = `${FileSystem.documentDirectory}therapist-summary.txt`;
      await FileSystem.writeAsStringAsync(path, text);
      await Sharing.shareAsync(path, { mimeType: 'text/plain' });
    } catch (e) {
      Alert.alert('Share failed', 'Could not create summary.');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear all data?',
      'This will delete your journal, conversations, and progress. Cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            useJournalStore.setState({ entries: [] });
            useConversationStore.getState().clearMessages();
            useConversationSummaryStore.getState().clearSummaries();
            useCircleStore.setState({ moodHistory: [] });
            useEducationStore.setState({ completedLessons: [], streakDays: 0 });
            Alert.alert('Done', 'All data cleared.');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Daily check-in reminders</Text>
            <Switch
              value={settings.notificationsCheckIn}
              onValueChange={async (v) => {
                if (v) await registerForPushNotifications();
                settings.setNotificationsCheckIn(v);
              }}
              trackColor={{ false: '#2A2A3A', true: ACCENT + '60' }}
              thumbColor={settings.notificationsCheckIn ? ACCENT : TEXT_MUTED}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Circle nudges</Text>
            <Switch
              value={settings.notificationsCircleNudges}
              onValueChange={settings.setNotificationsCircleNudges}
              trackColor={{ false: '#2A2A3A', true: ACCENT + '60' }}
              thumbColor={settings.notificationsCircleNudges ? ACCENT : TEXT_MUTED}
            />
          </View>
        </View>

        {/* Voice & AI */}
        <Text style={styles.sectionTitle}>Voice & AI</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.rowLabel}>AI Voice Responses</Text>
              <Text style={styles.rowHint}>Psych speaks back with voice</Text>
            </View>
            <Switch
              value={settings.aiVoiceEnabled}
              onValueChange={settings.setAiVoiceEnabled}
              trackColor={{ false: '#2A2A3A', true: ACCENT + '60' }}
              thumbColor={settings.aiVoiceEnabled ? ACCENT : TEXT_MUTED}
            />
          </View>
        </View>

        {/* Privacy */}
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.card}>
          <Pressable
            style={styles.row}
            onPress={() => router.push('/(modals)/onboarding')}
          >
            <Text style={styles.rowLabel}>Sensitive topics</Text>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>
                {user.sensitiveTopics?.length || 0} selected
              </Text>
              <Ionicons name="chevron-forward" size={20} color={TEXT_DIM} />
            </View>
          </Pressable>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View>
              <Text style={styles.rowLabel}>Pause circle sharing</Text>
              <Text style={styles.rowHint}>Hide your status from others</Text>
            </View>
            <Switch
              value={settings.circleSharingPaused}
              onValueChange={settings.setCircleSharingPaused}
              trackColor={{ false: '#2A2A3A', true: ACCENT + '60' }}
              thumbColor={settings.circleSharingPaused ? ACCENT : TEXT_MUTED}
            />
          </View>
        </View>

        {/* Specialized Modes */}
        <Text style={styles.sectionTitle}>Specialized Modes</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>🏆 Athlete Mode</Text>
              <Text style={styles.rowHint}>Recovery tracking, pre-competition prep, performance debriefs</Text>
            </View>
            <Switch
              value={user.athleteMode}
              onValueChange={(v) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                useUserStore.getState().setAthleteMode(v);
              }}
              trackColor={{ false: '#2A2A3A', true: ACCENT + '60' }}
              thumbColor={user.athleteMode ? ACCENT : TEXT_MUTED}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>🌈 Spectrum Mode</Text>
              <Text style={styles.rowHint}>Sensory tools, stim toolkit, social scripts, visual supports</Text>
            </View>
            <Switch
              value={user.spectrumMode}
              onValueChange={(v) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                useUserStore.getState().setSpectrumMode(v);
              }}
              trackColor={{ false: '#2A2A3A', true: ACCENT + '60' }}
              thumbColor={user.spectrumMode ? ACCENT : TEXT_MUTED}
            />
          </View>
        </View>

        {/* Data */}
        <Text style={styles.sectionTitle}>Your Data</Text>
        <View style={styles.card}>
          <Pressable style={styles.row} onPress={handleExportData}>
            <Text style={styles.rowLabel}>Export all data</Text>
            <Ionicons name="download-outline" size={22} color={TEXT_MUTED} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.row} onPress={handleShareWithTherapist}>
            <Text style={styles.rowLabel}>Share with therapist</Text>
            <Ionicons name="share-outline" size={22} color={TEXT_MUTED} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.row} onPress={handleClearData}>
            <Text style={[styles.rowLabel, { color: '#F87171' }]}>Clear all data</Text>
            <Ionicons name="trash-outline" size={22} color="#F87171" />
          </Pressable>
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <Pressable
            style={styles.row}
            onPress={() => Linking.openURL('https://alln1network.com/privacy')}
          >
            <Text style={styles.rowLabel}>Privacy Policy</Text>
            <Ionicons name="open-outline" size={20} color={TEXT_DIM} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={styles.row}
            onPress={() => Linking.openURL('https://alln1network.com/terms')}
          >
            <Text style={styles.rowLabel}>Terms of Service</Text>
            <Ionicons name="open-outline" size={20} color={TEXT_DIM} />
          </Pressable>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_DIM,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 24,
    marginLeft: 4,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowLabel: {
    fontSize: 16,
    color: TEXT,
  },
  rowHint: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowValue: {
    fontSize: 15,
    color: TEXT_MUTED,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginLeft: 16,
  },
});
