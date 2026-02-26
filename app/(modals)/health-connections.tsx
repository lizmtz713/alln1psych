/**
 * Health Connections Settings
 * Connect Oura Ring, Apple Health, and other health data sources
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Linking,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

// Health integrations
import {
  isOuraConnected,
  syncOuraData,
  disconnectOura,
  getCachedOuraData,
  calculateBodyGaugeFromOura,
  calculateStateHintFromOura,
  type OuraSnapshot,
} from '../../src/services/ouraIntegration';

import {
  isHealthKitAvailable,
  requestHealthKitPermissions,
  getHealthSnapshot,
  calculateBodyScore,
  type HealthSnapshot,
} from '../../src/services/healthKit';

interface ConnectionStatus {
  connected: boolean;
  lastSync?: Date;
  error?: string;
}

export default function HealthConnectionsModal() {
  const router = useRouter();
  
  // Connection states
  const [ouraStatus, setOuraStatus] = useState<ConnectionStatus>({ connected: false });
  const [appleHealthStatus, setAppleHealthStatus] = useState<ConnectionStatus>({ connected: false });
  const [ouraData, setOuraData] = useState<OuraSnapshot | null>(null);
  const [healthData, setHealthData] = useState<HealthSnapshot | null>(null);
  const [loading, setLoading] = useState<'oura' | 'apple' | null>(null);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    // Check Oura
    const ouraConnected = await isOuraConnected();
    if (ouraConnected) {
      const cached = await getCachedOuraData();
      setOuraStatus({ 
        connected: true, 
        lastSync: cached?.lastSynced ? new Date(cached.lastSynced) : undefined 
      });
      setOuraData(cached);
    }

    // Check Apple Health
    if (Platform.OS === 'ios') {
      const available = await isHealthKitAvailable();
      if (available) {
        try {
          const snapshot = await getHealthSnapshot();
          setAppleHealthStatus({ 
            connected: true, 
            lastSync: snapshot?.lastSynced ? new Date(snapshot.lastSynced) : undefined 
          });
          setHealthData(snapshot);
        } catch {
          setAppleHealthStatus({ connected: false });
        }
      }
    }
  };

  // ============ Oura Handlers ============

  const handleConnectOura = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // In production, this would open OAuth flow
    // For now, show instructions
    Alert.alert(
      'Connect Oura Ring',
      'To connect your Oura Ring:\n\n1. You\'ll be redirected to Oura\'s website\n2. Log in with your Oura account\n3. Authorize InGauge to read your data\n\nYour data stays private and is only used to help calculate your Body gauge.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: () => {
            // TODO: Replace with actual OAuth URL from env/config
            Linking.openURL('https://cloud.ouraring.com/oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=ingauge://oauth/oura&scope=daily+personal+heartrate');
          }
        },
      ]
    );
  };

  const handleSyncOura = async () => {
    setLoading('oura');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      const data = await syncOuraData();
      setOuraData(data);
      setOuraStatus({ 
        connected: data.connected, 
        lastSync: data.lastSynced ? new Date(data.lastSynced) : undefined,
        error: data.error,
      });
      
      if (data.connected && !data.error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      setOuraStatus(prev => ({ ...prev, error: 'Failed to sync' }));
    }
    
    setLoading(null);
  };

  const handleDisconnectOura = () => {
    Alert.alert(
      'Disconnect Oura',
      'This will remove your Oura connection. Your Body gauge will no longer auto-update from Oura data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disconnect', 
          style: 'destructive',
          onPress: async () => {
            await disconnectOura();
            setOuraStatus({ connected: false });
            setOuraData(null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        },
      ]
    );
  };

  // ============ Apple Health Handlers ============

  const handleConnectAppleHealth = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'Apple Health is only available on iOS devices.');
      return;
    }
    
    setLoading('apple');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const granted = await requestHealthKitPermissions();
      if (granted) {
        const snapshot = await getHealthSnapshot();
        setHealthData(snapshot);
        setAppleHealthStatus({ 
          connected: true, 
          lastSync: snapshot?.lastSynced ? new Date(snapshot.lastSynced) : undefined 
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert(
          'Permission Required',
          'Please enable Health access in Settings > Privacy > Health > InGauge'
        );
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to connect to Apple Health');
    }
    
    setLoading(null);
  };

  const handleSyncAppleHealth = async () => {
    setLoading('apple');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      const snapshot = await getHealthSnapshot();
      setHealthData(snapshot);
      setAppleHealthStatus({ 
        connected: true, 
        lastSync: snapshot?.lastSynced ? new Date(snapshot.lastSynced) : undefined 
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      setAppleHealthStatus(prev => ({ ...prev, error: 'Failed to sync' }));
    }
    
    setLoading(null);
  };

  // ============ Render Helpers ============

  const formatLastSync = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.round(diffMins / 60)}h ago`;
    return `${Math.round(diffMins / 1440)}d ago`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Connections</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introBox}>
          <Text style={styles.introEmoji}>🫀</Text>
          <Text style={styles.introTitle}>Connect Your Body Data</Text>
          <Text style={styles.introText}>
            Link your health devices to auto-populate your Body gauge with real biometrics like sleep, HRV, and activity.
          </Text>
        </View>

        {/* Oura Ring */}
        <View style={styles.section}>
          <View style={styles.connectionCard}>
            <View style={styles.connectionHeader}>
              <View style={styles.connectionIcon}>
                <Text style={styles.connectionEmoji}>💍</Text>
              </View>
              <View style={styles.connectionInfo}>
                <Text style={styles.connectionName}>Oura Ring</Text>
                <Text style={styles.connectionDesc}>Sleep, Readiness, HRV, Activity</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: ouraStatus.connected ? '#4CAF5022' : '#66666622' }
              ]}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: ouraStatus.connected ? '#4CAF50' : '#666' }
                ]} />
                <Text style={[
                  styles.statusText,
                  { color: ouraStatus.connected ? '#4CAF50' : '#666' }
                ]}>
                  {ouraStatus.connected ? 'Connected' : 'Not Connected'}
                </Text>
              </View>
            </View>

            {ouraStatus.connected && ouraData && (
              <View style={styles.dataPreview}>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Sleep Score</Text>
                  <Text style={styles.dataValue}>{ouraData.sleep?.score ?? '—'}</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Readiness</Text>
                  <Text style={styles.dataValue}>{ouraData.readiness?.score ?? '—'}</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Body Gauge</Text>
                  <Text style={[styles.dataValue, { color: '#7C4DFF' }]}>
                    {calculateBodyGaugeFromOura(ouraData) ?? '—'}%
                  </Text>
                </View>
                <Text style={styles.lastSync}>
                  Last sync: {formatLastSync(ouraStatus.lastSync)}
                </Text>
              </View>
            )}

            <View style={styles.connectionActions}>
              {!ouraStatus.connected ? (
                <TouchableOpacity 
                  style={styles.connectButton}
                  onPress={handleConnectOura}
                >
                  <Ionicons name="link" size={18} color="#FFF" />
                  <Text style={styles.connectButtonText}>Connect Oura</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity 
                    style={styles.syncButton}
                    onPress={handleSyncOura}
                    disabled={loading === 'oura'}
                  >
                    {loading === 'oura' ? (
                      <ActivityIndicator size="small" color="#7C4DFF" />
                    ) : (
                      <>
                        <Ionicons name="refresh" size={18} color="#7C4DFF" />
                        <Text style={styles.syncButtonText}>Sync</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.disconnectButton}
                    onPress={handleDisconnectOura}
                  >
                    <Text style={styles.disconnectButtonText}>Disconnect</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Apple Health */}
        {Platform.OS === 'ios' && (
          <View style={styles.section}>
            <View style={styles.connectionCard}>
              <View style={styles.connectionHeader}>
                <View style={[styles.connectionIcon, { backgroundColor: '#FF375522' }]}>
                  <Ionicons name="heart" size={24} color="#FF3755" />
                </View>
                <View style={styles.connectionInfo}>
                  <Text style={styles.connectionName}>Apple Health</Text>
                  <Text style={styles.connectionDesc}>Sleep, Steps, Heart Rate, Cycle</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: appleHealthStatus.connected ? '#4CAF5022' : '#66666622' }
                ]}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: appleHealthStatus.connected ? '#4CAF50' : '#666' }
                  ]} />
                  <Text style={[
                    styles.statusText,
                    { color: appleHealthStatus.connected ? '#4CAF50' : '#666' }
                  ]}>
                    {appleHealthStatus.connected ? 'Connected' : 'Not Connected'}
                  </Text>
                </View>
              </View>

              {appleHealthStatus.connected && healthData && (
                <View style={styles.dataPreview}>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>Sleep</Text>
                    <Text style={styles.dataValue}>
                      {healthData.sleep?.lastNight?.duration?.toFixed(1) ?? '—'}h
                    </Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>Steps</Text>
                    <Text style={styles.dataValue}>
                      {healthData.activity?.steps?.toLocaleString() ?? '—'}
                    </Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>Body Gauge</Text>
                    <Text style={[styles.dataValue, { color: '#7C4DFF' }]}>
                      {calculateBodyScore(healthData) ?? '—'}%
                    </Text>
                  </View>
                  <Text style={styles.lastSync}>
                    Last sync: {formatLastSync(appleHealthStatus.lastSync)}
                  </Text>
                </View>
              )}

              <View style={styles.connectionActions}>
                {!appleHealthStatus.connected ? (
                  <TouchableOpacity 
                    style={[styles.connectButton, { backgroundColor: '#FF3755' }]}
                    onPress={handleConnectAppleHealth}
                    disabled={loading === 'apple'}
                  >
                    {loading === 'apple' ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Ionicons name="heart" size={18} color="#FFF" />
                        <Text style={styles.connectButtonText}>Connect Apple Health</Text>
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.syncButton}
                    onPress={handleSyncAppleHealth}
                    disabled={loading === 'apple'}
                  >
                    {loading === 'apple' ? (
                      <ActivityIndicator size="small" color="#7C4DFF" />
                    ) : (
                      <>
                        <Ionicons name="refresh" size={18} color="#7C4DFF" />
                        <Text style={styles.syncButtonText}>Sync</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
          <Text style={styles.privacyText}>
            Your health data stays on your device and is only used to calculate your gauges. We never sell or share your biometrics.
          </Text>
        </View>

        {/* How it works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.howItWorks}>
            <View style={styles.howStep}>
              <View style={styles.howNumber}><Text style={styles.howNumberText}>1</Text></View>
              <Text style={styles.howText}>Connect your device</Text>
            </View>
            <View style={styles.howStep}>
              <View style={styles.howNumber}><Text style={styles.howNumberText}>2</Text></View>
              <Text style={styles.howText}>We read sleep, HRV, activity</Text>
            </View>
            <View style={styles.howStep}>
              <View style={styles.howNumber}><Text style={styles.howNumberText}>3</Text></View>
              <Text style={styles.howText}>Body gauge auto-updates daily</Text>
            </View>
          </View>
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
  connectionCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#7C4DFF22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionEmoji: {
    fontSize: 24,
  },
  connectionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  connectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  connectionDesc: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dataPreview: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dataLabel: {
    fontSize: 14,
    color: '#888',
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  lastSync: {
    fontSize: 11,
    color: '#666',
    marginTop: 8,
    textAlign: 'right',
  },
  connectionActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  connectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C4DFF',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  connectButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  syncButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C4DFF22',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  syncButtonText: {
    color: '#7C4DFF',
    fontWeight: '600',
    fontSize: 14,
  },
  disconnectButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#333',
  },
  disconnectButtonText: {
    color: '#F44336',
    fontWeight: '500',
    fontSize: 14,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#4CAF5011',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  privacyText: {
    flex: 1,
    fontSize: 13,
    color: '#4CAF50',
    lineHeight: 18,
  },
  howItWorks: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
  },
  howStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  howNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#7C4DFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  howNumberText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  howText: {
    fontSize: 14,
    color: '#CCC',
  },
});
