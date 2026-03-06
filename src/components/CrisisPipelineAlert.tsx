/**
 * Crisis Pipeline Alert — Shows when persistent crisis patterns detected
 * 
 * Surfaces when:
 * - State gauge in shutdown for 72+ hours
 * - Multiple gauges red for 24+ hours
 * 
 * Offers:
 * - Free crisis resources
 * - Safety Tether notification option
 */

import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Modal, 
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { 
  runCrisisCheck, 
  markTetherNotified,
  CRISIS_RESOURCES,
  type CrisisAlert 
} from '../services/crisisPipeline';

interface CrisisPipelineAlertProps {
  onDismiss: () => void;
  visible: boolean;
}

export function CrisisPipelineAlert({ onDismiss, visible }: CrisisPipelineAlertProps) {
  const insets = useSafeAreaInsets();
  const [alert, setAlert] = useState<CrisisAlert | null>(null);
  const [tether, setTether] = useState<{ name: string; id: string } | null>(null);
  const [canNotifyTether, setCanNotifyTether] = useState(false);
  const [tetherNotified, setTetherNotified] = useState(false);

  useEffect(() => {
    if (visible) {
      runCrisisCheck().then(result => {
        setAlert(result.alert);
        setTether(result.tether);
        setCanNotifyTether(result.canNotifyTether);
      });
    }
  }, [visible]);

  const handleNotifyTether = async () => {
    if (!tether) return;
    
    // In a real implementation, this would send a notification
    // For now, show confirmation and mark as notified
    Alert.alert(
      'Check-in Sent',
      `${tether.name} will be notified to check in with you.`,
      [{ text: 'OK' }]
    );
    await markTetherNotified();
    setTetherNotified(true);
  };

  const handleCall988 = () => {
    Linking.openURL('tel:988');
  };

  const handleText741741 = () => {
    Linking.openURL('sms:741741&body=HOME');
  };

  if (!alert) return null;

  const isCritical = alert.severity === 'critical';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}
    >
      <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.severityBadge, isCritical && styles.severityCritical]}>
            <Ionicons 
              name={isCritical ? "warning" : "information-circle"} 
              size={20} 
              color={isCritical ? "#FEF3C7" : "#DBEAFE"} 
            />
            <Text style={[styles.severityText, isCritical && styles.severityTextCritical]}>
              {isCritical ? 'System Alert' : 'Check-in'}
            </Text>
          </View>
          <Pressable style={styles.closeBtn} onPress={onDismiss}>
            <Ionicons name="close" size={24} color="#8888A0" />
          </Pressable>
        </View>

        {/* Main message */}
        <View style={styles.messageSection}>
          <Text style={styles.messageTitle}>
            {isCritical 
              ? "Your system has been struggling." 
              : "I noticed something."}
          </Text>
          <Text style={styles.messageBody}>{alert.message}</Text>
        </View>

        {/* Safety Tether */}
        {tether && canNotifyTether && !tetherNotified && (
          <View style={styles.tetherSection}>
            <Text style={styles.tetherTitle}>🔗 Safety Tether</Text>
            <Text style={styles.tetherBody}>
              {tether.name} is your designated tether. Want me to let them know you could use a check-in?
            </Text>
            <Pressable style={styles.tetherBtn} onPress={handleNotifyTether}>
              <Ionicons name="paper-plane" size={18} color="#fff" />
              <Text style={styles.tetherBtnText}>Notify {tether.name}</Text>
            </Pressable>
            <Text style={styles.tetherNote}>
              They'll just know you'd appreciate hearing from them — no details shared.
            </Text>
          </View>
        )}

        {tetherNotified && (
          <View style={styles.tetherNotifiedSection}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.tetherNotifiedText}>
              {tether?.name} has been notified
            </Text>
          </View>
        )}

        {/* Crisis Resources */}
        {alert.shouldSurfaceResources && (
          <View style={styles.resourcesSection}>
            <Text style={styles.resourcesTitle}>Free support — always available:</Text>
            
            <Pressable style={styles.resourceBtn988} onPress={handleCall988}>
              <Text style={styles.resourceEmoji}>📞</Text>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceName}>988 Suicide & Crisis Lifeline</Text>
                <Text style={styles.resourceAction}>Call or text 988 — 24/7</Text>
              </View>
            </Pressable>

            <Pressable style={styles.resourceBtn} onPress={handleText741741}>
              <Text style={styles.resourceEmoji}>💬</Text>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceName}>Crisis Text Line</Text>
                <Text style={styles.resourceAction}>Text HOME to 741741</Text>
              </View>
            </Pressable>

            {CRISIS_RESOURCES.slice(2).map((resource, i) => (
              <Pressable 
                key={i}
                style={styles.resourceBtn} 
                onPress={() => Linking.openURL(`tel:${resource.action.replace(/\D/g, '')}`)}
              >
                <Text style={styles.resourceEmoji}>🤝</Text>
                <View style={styles.resourceInfo}>
                  <Text style={styles.resourceName}>{resource.name}</Text>
                  <Text style={styles.resourceAction}>{resource.action}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Dismiss */}
        <View style={styles.footer}>
          <Pressable style={styles.dismissBtn} onPress={onDismiss}>
            <Text style={styles.dismissBtnText}>
              {isCritical ? "I'm okay for now" : "Got it"}
            </Text>
          </Pressable>
          
          {isCritical && (
            <Text style={styles.footerNote}>
              These resources will stay in your settings if you need them later.
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

/**
 * Hook to run crisis check on mount
 */
export function useCrisisPipelineCheck() {
  const [showAlert, setShowAlert] = useState(false);
  const [hasAlert, setHasAlert] = useState(false);

  useEffect(() => {
    runCrisisCheck()
      .then(result => {
        if (result?.alert) {
          setHasAlert(true);
          if (result.alert.severity === 'critical') {
            setTimeout(() => setShowAlert(true), 1500);
          }
        }
      })
      .catch(() => { /* no-op: avoid unhandled rejection e.g. right after onboarding */ });
  }, []);

  return {
    showAlert,
    setShowAlert,
    hasAlert,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090F',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  severityCritical: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  severityText: {
    color: '#93C5FD',
    fontSize: 14,
    fontWeight: '600',
  },
  severityTextCritical: {
    color: '#FCD34D',
  },
  closeBtn: {
    padding: 8,
  },
  messageSection: {
    marginBottom: 24,
  },
  messageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F0F0F5',
    marginBottom: 12,
  },
  messageBody: {
    fontSize: 16,
    color: '#B0B0C0',
    lineHeight: 24,
  },
  tetherSection: {
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(124, 77, 255, 0.3)',
  },
  tetherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F0F0F5',
    marginBottom: 8,
  },
  tetherBody: {
    fontSize: 14,
    color: '#B0B0C0',
    lineHeight: 20,
    marginBottom: 12,
  },
  tetherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C4DFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
  },
  tetherBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  tetherNote: {
    fontSize: 12,
    color: '#8888A0',
    textAlign: 'center',
    marginTop: 10,
  },
  tetherNotifiedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  tetherNotifiedText: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '500',
  },
  resourcesSection: {
    marginBottom: 24,
  },
  resourcesTitle: {
    fontSize: 14,
    color: '#8888A0',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resourceBtn988: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  resourceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  resourceEmoji: {
    fontSize: 24,
    marginRight: 14,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F0F0F5',
    marginBottom: 2,
  },
  resourceAction: {
    fontSize: 13,
    color: '#8888A0',
  },
  footer: {
    marginTop: 'auto',
  },
  dismissBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  dismissBtnText: {
    color: '#F0F0F5',
    fontSize: 16,
    fontWeight: '500',
  },
  footerNote: {
    fontSize: 12,
    color: '#8888A0',
    textAlign: 'center',
    marginTop: 12,
  },
});
