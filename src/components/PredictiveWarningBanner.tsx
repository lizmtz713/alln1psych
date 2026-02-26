/**
 * Predictive Warning Banner
 * Shows trajectory-based alerts at the top of the cockpit
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { type PredictiveWarning } from '../services/predictiveWarnings';
import * as Haptics from 'expo-haptics';

interface Props {
  warning: PredictiveWarning;
  onDismiss?: () => void;
}

export default function PredictiveWarningBanner({ warning, onDismiss }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = React.useState(false);

  const urgencyConfig = {
    advisory: {
      bg: '#2E7D32',
      icon: 'information-circle' as const,
      iconColor: '#4CAF50',
    },
    caution: {
      bg: '#E65100',
      icon: 'alert-circle' as const,
      iconColor: '#FF9800',
    },
    warning: {
      bg: '#C62828',
      icon: 'warning' as const,
      iconColor: '#F44336',
    },
  };

  const config = urgencyConfig[warning.urgency];

  const handleTool = () => {
    if (!warning.suggestedTool) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const toolRoutes: Record<string, string> = {
      'quick-reset': '/(modals)/quick-reset',
      'replay': '/(modals)/replay',
      'relate': '/(modals)/relate',
      'journal': '/(modals)/new-journal',
    };
    
    const route = toolRoutes[warning.suggestedTool];
    if (route) {
      router.push(route as any);
    }
  };

  const handleToggleExpand = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: config.bg + '22', borderColor: config.bg }]}
      onPress={handleToggleExpand}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Ionicons name={config.icon} size={24} color={config.iconColor} />
        <View style={styles.headerText}>
          <Text style={styles.title}>
            {warning.urgency === 'warning' ? '⚠️ Trajectory Alert' : 
             warning.urgency === 'caution' ? '📉 Heads Up' : '📊 Watching'}
          </Text>
          <Text style={styles.gauge}>{warning.gauge.charAt(0).toUpperCase() + warning.gauge.slice(1)}</Text>
        </View>
        <View style={styles.prediction}>
          <Text style={styles.predictionValue}>{warning.currentValue}%</Text>
          <Ionicons name="arrow-forward" size={12} color="#888" />
          <Text style={[styles.predictionValue, { color: config.iconColor }]}>{warning.predictedValue}%</Text>
        </View>
      </View>

      {expanded && (
        <View style={styles.expanded}>
          <Text style={styles.message}>{warning.message}</Text>
          <Text style={styles.suggestion}>{warning.suggestion}</Text>
          
          {warning.suggestedTool && (
            <TouchableOpacity style={styles.actionButton} onPress={handleTool}>
              <Ionicons name="flash" size={16} color="#FFF" />
              <Text style={styles.actionText}>
                {warning.suggestedTool === 'quick-reset' ? 'Quick Reset' : 
                 warning.suggestedTool === 'replay' ? 'Process It' :
                 'Open Tool'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.expandHint}>
        <Ionicons 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={16} 
          color="#666" 
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  gauge: {
    fontSize: 12,
    color: '#888',
  },
  prediction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  predictionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  expanded: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  message: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
    marginBottom: 8,
  },
  suggestion: {
    fontSize: 13,
    color: '#AAA',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C4DFF',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  expandHint: {
    alignItems: 'center',
    marginTop: 4,
  },
});
